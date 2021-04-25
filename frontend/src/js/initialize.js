"use strict";

import { globals } from "./globals";

import { getServices, allowPeriodChange, periodChangeAllowed } from "../index";

export async function initialize() {
    updateCSS();
    // Set the page title in both the browser and the HTML
    document.getElementById("pageTitle").innerText = `${globals.pageTitle}`;
    document.getElementById(
        "pageDescriptionTitle"
    ).innerText = `${globals.pageTitle}`;
    // Set the page description
    document.getElementById(
        "pageDescription"
    ).innerText = `${globals.pageDescription}`;
    // Determine whether to load Google Analytics
    if (globals.GA_Enabled) {
        var script = document.createElement("script");
        script.onload = function () {
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                dataLayer.push(arguments);
            }
            gtag("js", new Date());

            gtag("config", `${globals.GA_MeasurementID}`);
            if (globals.verbosity) {
                console.log("Google Analytics Loaded");
            }
        };
        script.src = `https://www.googletagmanager.com/gtag/js?id=UA-${globals.GA_MeasurementID}`;

        document.head.appendChild(script); //or something of the likes
    }
    await getServices("initialize");
    if (globals.liveUpdate) {
        document.getElementById("bottomStatusBar").style.display = "";
        setInterval(async function () {
            if (periodChangeAllowed) {
                allowPeriodChange(false);
                await getServices("update");
                allowPeriodChange(true);
            }
        }, globals.liveUpdateInterval);
    } else {
        document.getElementById("bottomStatusBar").style.display = "none";
    }
}

// Make CSS reflect the colors set in the config.js file
export function updateCSS() {
    let root = document.documentElement;

    root.style.setProperty("--page_background", globals.pageBackground);
    root.style.setProperty("--page_font", globals.pageFont);
    root.style.setProperty(
        "--service_info_background",
        globals.serviceInfoBackground
    );
    root.style.setProperty("--service_info_accent", globals.serviceInfoAccent);
    root.style.setProperty("--chart_background", globals.chartBackground);
    root.style.setProperty("--online_primary", globals.onlineA);
    root.style.setProperty("--online_secondary", globals.onlineB);
    root.style.setProperty("--offline_primary", globals.offlineA);
    root.style.setProperty("--offline_secondary", globals.offlineB);
    root.style.setProperty("--not_available", globals.notAvailable);
}
