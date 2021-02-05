// Import JS
import ApexCharts from "apexcharts";
import { LTTB } from "downsample";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import {
    toTitleCase,
    getAPI_Data,
    showLoader,
    hideLoader,
    updateBottomStatus,
} from "./js/utils";

if (__MODE__ === "development") {
    require("./config.js");
}

import { sha256 } from "js-sha256";

// Import styles
import "./css/index.sass";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");

// Declare globals
let apiURL = global.uptimon_config.api_base_url,
    apiPath = global.uptimon_config.api_base_path,
    verbosity = global.uptimon_config.verbose_logging,
    dataPoints = global.uptimon_config.shown_data_points,
    onlineColorA = global.uptimon_config.online_primary_color,
    onlineColorB = global.uptimon_config.online_secondary_color,
    offlineColorA = global.uptimon_config.offline_primary_color,
    offlineColorB = global.uptimon_config.offline_secondary_color,
    notAvailableColor = global.uptimon_config.not_available_color,
    service_statuses;

let activeCharts = Array();

window.addEventListener("load", function () {
    initialize();
});

async function initialize() {
    updateCSS();
    getServices("initialize");
    if (uptimon_config.live_update) {
        setInterval(async function () {
            await getServices("update");
        }, uptimon_config.live_update_interval);
    }
}

// Make CSS reflect the colors set in the config.js file
function updateCSS() {
    let root = document.documentElement;

    root.style.setProperty("--online_primary_color", onlineColorA);
    root.style.setProperty("--online_secondary_color", onlineColorB);
    root.style.setProperty("--offline_primary_color", offlineColorA);
    root.style.setProperty("--offline_secondary_color", offlineColorB);
    root.style.setProperty("--not_available_color", notAvailableColor);
}

function drawResponseTimesChart(safeName, responseTimes, serviceStatus) {
    return new Promise((resolve) => {
        let activeChartsExists = false;
        activeCharts.forEach(function (item) {
            if (item.safeName === safeName) {
                item.chart.destroy();
                item.chart = null;
                activeChartsExists = true;
            }
        });

        // Declare local vars
        let chartPrimaryColor, chartSecondaryColor;

        if (serviceStatus === "ONLINE") {
            chartPrimaryColor = onlineColorA;
            chartSecondaryColor = onlineColorB;
        } else if (serviceStatus === "OFFLINE") {
            chartPrimaryColor = offlineColorA;
            chartSecondaryColor = offlineColorB;
        } else if (serviceStatus === "N/A") {
            chartPrimaryColor = notAvailableColor;
            chartSecondaryColor = notAvailableColor;
        }

        // Configure The Chart
        var options = {
            series: [
                {
                    name: "Response Time",
                    data: responseTimes,
                },
            ],
            noData: {
                text: "No Data Available",
                align: "center",
                verticalAlign: "middle",
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: "#ffffff",
                    fontSize: "24px",
                    fontFamily: "Ubuntu",
                },
            },
            chart: {
                height: 380,
                type: "area",
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
                dropShadow: {
                    enabled: true,
                    top: 0,
                    left: 0,
                    blur: 3,
                    opacity: 0.2,
                },
            },
            grid: {
                show: false,
                padding: {
                    left: -10,
                    right: 0,
                    top: 60,
                    bottom: 29,
                },
            },
            legend: {
                show: false,
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: "smooth",
                lineCap: "butt",
                colors: [chartPrimaryColor],
            },
            tooltip: {
                enabled: true,
                theme: "dark",
                marker: {
                    show: false,
                },
                x: {
                    formatter: function (value) {
                        return new Date(value).toLocaleString();
                    },
                },
                y: {
                    formatter: function (value) {
                        return `${value} ms`;
                    },
                },
            },
            markers: {
                colors: ["#333333"],
                strokeColors: "#fff",
                strokeWidth: 0,
                strokeOpacity: 0.9,
                strokeDashArray: 0,
                fillOpacity: 1,
                discrete: [],
                shape: "circle",
                radius: 5,
                offsetX: 0,
                offsetY: 0,
                onClick: undefined,
                onDblClick: undefined,
                showNullDataPoints: true,
                hover: {
                    size: undefined,
                    sizeOffset: 3,
                },
            },
            xaxis: {
                type: "datetime",
                labels: {
                    show: false,
                },
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
                crosshairs: {
                    show: false,
                },
                tooltip: {
                    enabled: false,
                },
            },
            yaxis: {
                labels: {
                    show: false,
                },
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
                crosshairs: {
                    show: false,
                },
                tooltip: {
                    enabled: false,
                },
            },
            fill: {
                colors: [chartSecondaryColor],
                type: "solid",
            },
        };

        let chart = new ApexCharts(
            document.getElementById(`${safeName}_chart`),
            options
        );
        chart.render();

        if (activeChartsExists) {
            activeCharts.forEach(function (item) {
                if (item.safeName === safeName) {
                    item.chart = chart;
                }
            });
        } else {
            activeCharts.push({ safeName, chart });
        }

        resolve("done");
    });
}

function getServices(type) {
    return new Promise(async (resolve) => {
        if (type === "initialize") {
            service_statuses = Array();
        }

        // Get All Services
        let services = await getAPI_Data(`${apiURL}/${apiPath}/list-services/`);
        // Convert stringified JSON to parsed JSON
        services = JSON.parse(services);

        // Perform Action on Each Service
        for (let i = 0; i < services.length; i++) {
            if (type === "initialize") {
                showLoader(`Loading Service ${i + 1} of ${services.length}`);
            } else if (type === "update") {
                updateBottomStatus(
                    `Updating Service ${i + 1} of ${services.length}`
                );
            }

            const item = services[i];

            // Generate A Safe Name For This Service
            const safeName = sha256(item.target);

            // Get the Online/Offline status of the service
            let status = await getAPI_Data(
                `${apiURL}/${apiPath}/service-status/?target=${item.target}`
            );

            // Get Last Checked
            let lastChecked = await getAPI_Data(
                `${apiURL}/${apiPath}/last-checked/?target=${item.target}`
            );

            if (lastChecked !== "N/A") {
                lastChecked = new Date(Number(lastChecked));
                lastChecked = toTitleCase(timeAgo.format(lastChecked));
            }

            // Get Uptime
            let uptime = await getAPI_Data(
                `${apiURL}/${apiPath}/uptime/24h/?target=${item.target}`
            );

            // Get AVG Response Time
            let avgRespTime = await getAPI_Data(
                `${apiURL}/${apiPath}/response-time/24h/average/?target=${item.target}`
            );

            // Get Response Times For Service And Downsample The Data
            let respTimes = await getAPI_Data(
                `${apiURL}/${apiPath}/response-time/24h/?target=${item.target}`
            );

            // Convert The Stringified JSON to parsed JSON
            if (respTimes !== "N/A") {
                respTimes = JSON.parse(respTimes);

                let chartWidth;
                // Set up The Amount of Data Points to Show
                if (dataPoints > respTimes.length) {
                    // If There Are Less Data Points in The Database Than The User Configured
                    chartWidth = respTimes.length;
                } else {
                    // Otherwise Use The User Specified Data Point Amount
                    chartWidth = uptimon_config.shown_data_points;
                }
                // Downsample The Data
                respTimes = LTTB(respTimes, chartWidth);
                // Parse The Remaining Items After Downsampling The Data
                respTimes.forEach(function (item) {
                    item[0] = new Date(item[0]);
                });
            } else {
                respTimes = [];
            }

            if (verbosity) {
                console.log("Title:", item.title);
                console.log("Safe Name", safeName);
                console.log("Target", item.target);
                console.log("Status", status);
                console.log("Response Times", respTimes);
                console.log("Average Response Time", avgRespTime);
                console.log("Uptime", uptime);
                console.log("Last Checked", lastChecked);
                console.log("-----------------------------");
            }

            if (type === "initialize") {
                // Create an Item in The Array For Each Service With All Necessary Data
                service_statuses.push({
                    title: item.title,
                    safeName: safeName,
                    target: item.target,
                    status: status,
                    respTimes: respTimes,
                    avgRespTime: avgRespTime,
                    uptime: uptime,
                    lastChecked: lastChecked,
                });
            } else if (type === "update") {
                // Update Each Service
                for (let i = 0; i < service_statuses.length; i++) {
                    const item = service_statuses[i];

                    // Ensure We Are Updating The Correct Service
                    if (item.safeName === safeName) {
                        item.status = status;
                        item.respTimes = respTimes;
                        item.avgRespTime = avgRespTime;
                        item.uptime = uptime;
                        item.lastChecked = lastChecked;
                    }
                }
            }
        }

        if (type === "initialize") {
            await initializeServices();
        } else if (type === "update") {
            await updateServices();
        }

        hideLoader();
        resolve("done");
    });
}

function initializeServices() {
    return new Promise(async (resolve) => {
        // Create The Markup For Each Service
        for (let i = 0; i < service_statuses.length; i++) {
            const item = service_statuses[i];

            showLoader(
                `Creating Service ${i + 1} of ${service_statuses.length}`
            );

            await generateServiceHTML(
                item.title,
                item.safeName,
                item.status,
                item.avgRespTime,
                item.uptime,
                item.lastChecked
            );
        }

        // Render The Chart For Each Service
        for (let i = 0; i < service_statuses.length; i++) {
            const item = service_statuses[i];

            showLoader(
                `Rendering Chart ${i + 1} of ${service_statuses.length}`
            );

            await drawResponseTimesChart(
                item.safeName,
                item.respTimes,
                item.status
            );
        }

        resolve("done");
    });
}

function updateServices() {
    return new Promise(async (resolve) => {
        // Update The Markup of Each Service
        for (let i = 0; i < service_statuses.length; i++) {
            const item = service_statuses[i];

            let statusClass, statusText;
            if (item.status === "ONLINE") {
                statusClass = "serviceOnline";
                statusText = "ONLINE";

                // Update Online/Offline Status
                document
                    .getElementById(`${item.safeName}_status`)
                    .classList.remove("serviceOffline");
                document
                    .getElementById(`${item.safeName}_status`)
                    .classList.remove("serviceNotAvailable");
                document
                    .getElementById(`${item.safeName}_status`)
                    .classList.add("serviceOnline");

                // Update Below Chart
                document
                    .getElementById(`${item.safeName}_belowChart`)
                    .classList.remove("serviceOffline");
                document
                    .getElementById(`${item.safeName}_belowChart`)
                    .classList.remove("serviceNotAvailable");
                document
                    .getElementById(`${item.safeName}_belowChart`)
                    .classList.add("serviceOnline");
            } else if (item.status === "OFFLINE") {
                statusClass = "serviceOffline";
                statusText = "OFFLINE";

                // Update Online/Offline Status
                document
                    .getElementById(`${item.safeName}_status`)
                    .classList.remove("serviceOnline");
                document
                    .getElementById(`${item.safeName}_status`)
                    .classList.remove("serviceNotAvailable");
                document
                    .getElementById(`${item.safeName}_status`)
                    .classList.add("serviceOffline");

                // Update Below Chart
                document
                    .getElementById(`${item.safeName}_belowChart`)
                    .classList.remove("serviceOnline");
                document
                    .getElementById(`${item.safeName}_belowChart`)
                    .classList.remove("serviceNotAvailable");
                document
                    .getElementById(`${item.safeName}_belowChart`)
                    .classList.add("serviceOffline");
            } else if (item.status === "N/A") {
                statusClass = "serviceNotAvailable";
                statusText = "N/A";

                // Update Online/Offline Status
                document
                    .getElementById(`${item.safeName}_status`)
                    .classList.remove("serviceOnline");
                document
                    .getElementById(`${item.safeName}_status`)
                    .classList.remove("serviceOffline");
                document
                    .getElementById(`${item.safeName}_status`)
                    .classList.add("serviceNotAvailable");

                // Update Below Chart
                document
                    .getElementById(`${item.safeName}_belowChart`)
                    .classList.remove("serviceOnline");
                document
                    .getElementById(`${item.safeName}_belowChart`)
                    .classList.remove("serviceOffline");
                document
                    .getElementById(`${item.safeName}_belowChart`)
                    .classList.add("serviceNotAvailable");
            }

            // Update This Service's Markup
            document.getElementById(`${item.safeName}_avgRespTime`).innerHTML =
                item.avgRespTime; // Update Average Response Time
            document.getElementById(`${item.safeName}_uptime`).innerHTML =
                item.uptime; // Update Uptime
            document.getElementById(
                `${item.safeName}_status`
            ).innerHTML = statusText; // Update Online/Offline Status
            document.getElementById(
                `${item.safeName}_lastChecked`
            ).innerHTML = `Last Checked: ${item.lastChecked}`; // Update Last Checked Time

            // Update This Service's Chart
            await drawResponseTimesChart(
                item.safeName,
                item.respTimes,
                item.status
            );
        }

        updateBottomStatus(null, true);
        resolve("done");
    });
}

function generateServiceHTML(
    title,
    safeName,
    status,
    avgRespTime,
    uptime,
    lastChecked
) {
    return new Promise((resolve) => {
        let statusClass, statusText;
        if (status === "ONLINE") {
            statusClass = "serviceOnline";
            statusText = "ONLINE";
        } else if (status === "OFFLINE") {
            statusClass = "serviceOffline";
            statusText = "OFFLINE";
        } else if (status === "N/A") {
            statusClass = "serviceNotAvailable";
            statusText = "N/A";
        }

        document.getElementById("pageContainer").innerHTML += `
        <div class="chartOuter" id="${safeName}">
            <div class="aboveChart">
                <div class="aboveChartOuter serviceNameOuter">
                    <div class="aboveChartInnerItem serviceName">${title}</div>
                </div>
                <div class="aboveChartOuter responseTimeOuter">
                    <div class="aboveChartInnerItem responseTimeNumber" id="${safeName}_avgRespTime">${avgRespTime}</div>
                    <div class="aboveChartInnerItem responseTimeText">Avg Response Time</div>
                </div>
                <div class="aboveChartOuter uptimeOuter">
                    <div class="aboveChartInnerItem uptimeNumber" id="${safeName}_uptime">${uptime}</div>
                    <div class="aboveChartInnerItem uptimeText">Uptime</div>
                </div>
                <div class="serviceStatusOuter">
                    <div class="serviceStatusText ${statusClass}" id="${safeName}_status">${statusText}</div>
                </div>
            </div>
            <div class="chartContainer" id="${safeName}_chart"></div>
            <div class="belowChart ${statusClass}" id="${safeName}_belowChart">
                <div class="belowChartOuter lastCheckedOuter">
                    <div class="lastCheckedText" id="${safeName}_lastChecked">Last Checked: ${lastChecked}</div>
                </div>
            </div>
        </div>`;

        resolve("done");
    });
}
