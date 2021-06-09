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
    setOverallServiceStatus,
} from "./js/utils";

import { initialize } from "./js/initialize";

import { sha256 } from "js-sha256";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");

import tippy from "tippy.js";

tippy.setDefaultProps({ theme: "material" });

// Import styles
import "./css/index.sass";

import { globals } from "./js/globals";

let activeCharts = Array(),
    service_statuses,
    defaultDataPeriod = globals.dataPeriod,
    dataPeriod = null;

export let periodChangeAllowed = true;

// Run the initialization function whe the "load event is fired"
window.addEventListener("load", function () {
    initialize();
});

export function allowPeriodChange(set) {
    if (set) {
        periodChangeAllowed = true;
    } else {
        periodChangeAllowed = false;
    }
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
        let chartPrimary, chartSecondary;

        if (serviceStatus === "ONLINE") {
            chartPrimary = globals.onlineA;
            chartSecondary = globals.onlineB;
        } else if (serviceStatus === "OFFLINE") {
            chartPrimary = globals.offlineA;
            chartSecondary = globals.offlineB;
        } else if (serviceStatus === "N/A") {
            chartPrimary = globals.notAvailable;
            chartSecondary = globals.notAvailable;
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
                fontFamily: "Ubuntu",
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
                animations: {
                    enabled: false,
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
                colors: [chartPrimary],
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
                        if (value > 0) {
                            return `${value} ms`;
                        } else {
                            return "Offline";
                        }
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
                colors: [chartSecondary],
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

export function getServices(type) {
    return new Promise(async (resolve) => {
        if (type === "initialize") {
            service_statuses = Array();
            dataPeriod = defaultDataPeriod;
        }

        // Get All Services
        let services = await getAPI_Data(
            `${globals.apiURL}/${globals.apiPath}/list-services/`
        );
        // Convert stringified JSON to parsed JSON
        services = JSON.parse(services);

        // Perform Action on Each Service
        for (let i = 0; i < services.length; i++) {
            const item = services[i];

            // Generate A Safe Name For This Service
            const safeName = sha256(item.target);

            if (type === "initialize") {
                showLoader(`Loading Service ${i + 1} of ${services.length}`);
            } else if (type === "update") {
                updateBottomStatus(
                    `Updating Service ${i + 1} of ${services.length}`
                );

                dataPeriod = document.getElementById(
                    `${safeName}_timePeriod`
                ).value;
            }

            // Get the Online/Offline status of the service
            let status = await getAPI_Data(
                `${globals.apiURL}/${globals.apiPath}/service-status/?target=${item.target}`
            );

            // Get Last Checked
            let lastChecked = await getAPI_Data(
                `${globals.apiURL}/${globals.apiPath}/last-checked/?target=${item.target}`
            );

            if (!isNaN(lastChecked)) {
                lastChecked = new Date(Number(lastChecked));
                lastChecked = toTitleCase(timeAgo.format(lastChecked));
            }

            // Get Uptime
            let uptime = await getAPI_Data(
                `${globals.apiURL}/${globals.apiPath}/uptime/?target=${item.target}&period=${dataPeriod}`
            );

            // Get Response Times For Service And Downsample The Data
            let respTimes = await getAPI_Data(
                `${globals.apiURL}/${globals.apiPath}/response-time/?target=${item.target}&period=${dataPeriod}`
            );

            // Convert The Stringified JSON to parsed JSON
            if (respTimes !== "N/A") {
                respTimes = JSON.parse(respTimes);

                let chartWidth;
                // Set up The Amount of Data Points to Show
                if (globals.dataPoints > respTimes.length) {
                    // If There Are Less Data Points in The Database Than The User Configured
                    chartWidth = respTimes.length;
                } else {
                    // Otherwise Use The User Specified Data Point Amount
                    chartWidth = globals.dataPoints;
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

            // Get AVG Response Time
            let avgRespTime = await getAPI_Data(
                `${globals.apiURL}/${globals.apiPath}/response-time/average/?target=${item.target}&period=${dataPeriod}`
            );

            // Get SSL status
            let sslStatus = await getAPI_Data(
                `${globals.apiURL}/${globals.apiPath}/ssl-status/?target=${item.target}`
            );

            if (globals.verbosity) {
                console.log("Title:", item.title);
                console.log("Data Period:", dataPeriod);
                console.log("Safe Name:", safeName);
                console.log("Target:", item.target);
                console.log("SSL Status:", sslStatus);
                console.log("Status:", status);
                console.log("Response Times:", respTimes);
                console.log("Average Response Time:", avgRespTime);
                console.log("Uptime:", uptime);
                console.log("Last Checked:", lastChecked);
                console.log("-----------------------------");
            }

            if (type === "initialize") {
                // Create an Item in The Array For Each Service With All Necessary Data
                service_statuses.push({
                    title: item.title,
                    safeName: safeName,
                    dataPeriod: dataPeriod,
                    target: item.target,
                    sslStatus: sslStatus,
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
                        (item.dataPeriod = dataPeriod),
                            (item.sslStatus = sslStatus);
                        item.status = status;
                        item.respTimes = respTimes;
                        item.avgRespTime = avgRespTime;
                        item.uptime = uptime;
                        item.lastChecked = lastChecked;
                    }
                }
            }
        }

        let overallStatus = await getAPI_Data(
            `${globals.apiURL}/${globals.apiPath}/overall-status/`
        );

        if (overallStatus !== "N/A") {
            overallStatus = JSON.parse(overallStatus);

            let allServicesOnline = true,
                allServicesOffline = true,
                anyServiceMixed = false;

            overallStatus.forEach(function (item) {
                if (item === "N/A") {
                    anyServiceMixed = true;
                }

                if (item !== "ONLINE") {
                    allServicesOnline = false;
                }

                if (item !== "OFFLINE") {
                    allServicesOffline = false;
                }
            });

            if (anyServiceMixed) {
                setOverallServiceStatus("partial_outage", globals.verbosity);
            } else {
                if (allServicesOnline) {
                    setOverallServiceStatus(
                        "all_operational",
                        globals.verbosity
                    );
                } else if (allServicesOffline) {
                    setOverallServiceStatus("total_outage", globals.verbosity);
                } else if (!allServicesOnline && !allServicesOffline) {
                    setOverallServiceStatus(
                        "partial_outage",
                        globals.verbosity
                    );
                }
            }
        } else {
            setOverallServiceStatus("total_outage");
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
                item.target,
                item.safeName,
                item.dataPeriod,
                item.sslStatus,
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

        // Add event listeners to time period selection box
        for (let i = 0; i < service_statuses.length; i++) {
            const item = service_statuses[i];

            document
                .getElementById(`${item.safeName}_timePeriod`)
                .addEventListener("change", async function () {
                    if (periodChangeAllowed) {
                        allowPeriodChange(false);
                        await getServices("update");
                        allowPeriodChange(true);
                    }
                });
        }

        // Add tooltips
        if (globals.enableTooltips) {
            tippy("[data-tippy-content]");
        }

        resolve("done");
    });
}

function updateServices() {
    return new Promise(async (resolve) => {
        // Update The Markup of Each Service
        for (let i = 0; i < service_statuses.length; i++) {
            const item = service_statuses[i];

            if (item.sslStatus === "VALID") {
                removeSSL_StatusClasses(`${item.safeName}_sslStatus`);
                document
                    .getElementById(`${item.safeName}_sslStatus`)
                    .classList.add("sslValid");
                document.getElementById(
                    `${item.safeName}_sslStatus`
                ).innerHTML = '<i class="fad fa-lock"></i>';
            } else if (item.sslStatus === "INVALID") {
                removeSSL_StatusClasses(`${item.safeName}_sslStatus`);
                document
                    .getElementById(`${item.safeName}_sslStatus`)
                    .classList.add("sslInvalid");
                document.getElementById(
                    `${item.safeName}_sslStatus`
                ).innerHTML = '<i class="fad fa-lock-open"></i>';
            } else if (item.sslStatus === "N/A") {
                removeSSL_StatusClasses(`${item.safeName}_sslStatus`);
                document
                    .getElementById(`${item.safeName}_sslStatus`)
                    .classList.add("sslNA");
                document.getElementById(
                    `${item.safeName}_sslStatus`
                ).innerHTML = '<i class="fad fa-lock-open"></i>';
            }

            let statusClass, statusText;
            if (item.status === "ONLINE") {
                statusClass = "serviceOnline";
                statusText = "ONLINE";

                // Update Online/Offline Status
                removeStatusClasses(`${item.safeName}_status`);
                addStatusClass("online", `${item.safeName}_status`);

                // Update Below Chart
                removeStatusClasses(`${item.safeName}_belowChart`);
                addStatusClass("online", `${item.safeName}_belowChart`);
            } else if (item.status === "OFFLINE") {
                statusClass = "serviceOffline";
                statusText = "OFFLINE";

                // Update Online/Offline Status
                removeStatusClasses(`${item.safeName}_status`);
                addStatusClass("offline", `${item.safeName}_status`);

                // Update Below Chart
                removeStatusClasses(`${item.safeName}_belowChart`);
                addStatusClass("offline", `${item.safeName}_belowChart`);
            } else if (item.status === "N/A") {
                statusClass = "serviceNotAvailable";
                statusText = "N/A";

                // Update Online/Offline Status
                removeStatusClasses(`${item.safeName}_status`);
                addStatusClass("n/a", `${item.safeName}_status`);

                // Update Below Chart
                removeStatusClasses(`${item.safeName}_belowChart`);
                addStatusClass("n/a", `${item.safeName}_belowChart`);
            }

            // Update This Service's Markup
            document.getElementById(`${item.safeName}_avgRespTime`).innerHTML =
                item.avgRespTime; // Update Average Response Time
            document.getElementById(`${item.safeName}_uptime`).innerHTML =
                item.uptime; // Update Uptime
            document.getElementById(`${item.safeName}_status`).innerHTML =
                statusText; // Update Online/Offline Status
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

    // Remove status classes
    function removeStatusClasses(id) {
        document.getElementById(id).classList.remove("serviceOnline");
        document.getElementById(id).classList.remove("serviceOffline");
        document.getElementById(id).classList.remove("serviceNotAvailable");
    }

    // Add status class
    function addStatusClass(type, id) {
        if (type === "online") {
            document.getElementById(id).classList.add("serviceOnline");
        } else if (type === "offline") {
            document.getElementById(id).classList.add("serviceOffline");
        } else if (type === "n/a") {
            document.getElementById(id).classList.add("serviceNotAvailable");
        }
    }

    // Remove SSL Status classes
    function removeSSL_StatusClasses(id) {
        document.getElementById(id).classList.remove("sslValid");
        document.getElementById(id).classList.remove("sslInvalid");
        document.getElementById(id).classList.remove("sslNA");
    }
}

function generateServiceHTML(
    title,
    target,
    safeName,
    dataPeriod,
    sslStatus,
    status,
    avgRespTime,
    uptime,
    lastChecked
) {
    return new Promise((resolve) => {
        let thirty_mins = "",
            one_hour = "",
            six_hours = "",
            twelve_hours = "",
            one_day = "",
            three_days = "",
            seven_days = "",
            fourteen_days = "",
            one_month = "",
            three_months = "",
            all = "";
        if (dataPeriod === "-30_mins") {
            thirty_mins = "selected";
        } else if (dataPeriod === "-1_hour") {
            one_hour = "selected";
        } else if (dataPeriod === "-6_hours") {
            six_hours = "selected";
        } else if (dataPeriod === "-12_hours") {
            twelve_hours = "selected";
        } else if (dataPeriod === "-1_day") {
            one_day = "selected";
        } else if (dataPeriod === "-3_days") {
            three_days = "selected";
        } else if (dataPeriod === "-7_days") {
            seven_days = "selected";
        } else if (dataPeriod === "-14_days") {
            fourteen_days = "selected";
        } else if (dataPeriod === "-1_month") {
            one_month = "selected";
        } else if (dataPeriod === "-3_months") {
            three_months = "selected";
        } else if (dataPeriod === "all") {
            all = "selected";
        }

        let sslStatusClass, sslStatusIcon, sslStatusText;
        if (sslStatus === "VALID") {
            sslStatusClass = "sslValid";
            sslStatusIcon = '<i class="fad fa-lock"></i>';
            sslStatusText =
                "This service has a valid SSL Certificate and was served over HTTPS.";
        } else if (sslStatus === "INVALID") {
            sslStatusClass = "sslInvalid";
            sslStatusIcon = '<i class="fad fa-lock-open"></i>';
            sslStatusText = "This service has an invalid SSL Certificate.";
        } else if (sslStatus === "N/A") {
            sslStatusClass = "sslNA";
            sslStatusIcon = '<i class="fad fa-lock-open"></i>';
            sslStatusText = "This service does not support SSL.";
        }

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
                    <div class="sslStatus ${sslStatusClass}" id="${safeName}_sslStatus" data-tippy-content="${sslStatusText}">${sslStatusIcon}</div>
                    <div class="aboveChartInnerItem serviceName" data-tippy-content="${target}">${title}</div>
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
                <div class="belowChartOuter timePeriodOuter">
                    <select class="custom-select" id="${safeName}_timePeriod">
                        <option class="custom-select-option" ${thirty_mins} value="-30_mins">30 Minutes</option>
                        <option class="custom-select-option" ${one_hour} value="-1_hour">1 Hour</option>
                        <option class="custom-select-option" ${six_hours} value="-6_hours">6 Hours</option>
                        <option class="custom-select-option" ${twelve_hours} value="-12_hours">12 Hours</option>
                        <option class="custom-select-option" ${one_day} value="-1_day">1 Day</option>
                        <option class="custom-select-option" ${three_days} value="-3_days">3 Days</option>
                        <option class="custom-select-option" ${seven_days} value="-7_days">7 Days</option>
                        <option class="custom-select-option" ${fourteen_days} value="-14_days">14 Days</option>
                        <option class="custom-select-option" ${one_month} value="-1_month">1 Month</option>
                        <option class="custom-select-option" ${three_months} value="-3_months">3 Months</option>
                        <option class="custom-select-option" ${all} value="all">All Records</option>
                    </select>
                </div>
            </div>
        </div>`;

        resolve("done");
    });
}
