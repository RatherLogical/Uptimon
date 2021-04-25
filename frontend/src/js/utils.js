"use strict";

import { periodChangeAllowed } from "../index";

export function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

export function getAPI_Data(url) {
    return new Promise((resolve) => {
        var xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                resolve(this.responseText);
            }
        });

        xhr.open("GET", url);
        xhr.timeout = 5000;
        xhr.addEventListener("ontimeout", function (e) {
            console.log(`Request timed out: ${e}`);
        });

        xhr.send();
    });
}

export function showLoader(text, setVisibility = true) {
    if (setVisibility) {
        document.getElementById("loader").style.display = "";
    }
    document.getElementById("loader").innerHTML = text;
}

export function hideLoader() {
    document.getElementById("loader").style.display = "none";
}

export function updateBottomStatus(text, complete = false) {
    if (complete) {
        document.getElementById("liveUpdateText").innerHTML = "Update Complete";
        setTimeout(function () {
            if (periodChangeAllowed) {
                document.getElementById("liveUpdateText").innerHTML =
                    "Live Update Enabled";
            }
        }, 5000);
    } else {
        document.getElementById("liveUpdateText").innerHTML = text;
    }
}

export function setOverallServiceStatus(type, verbosity) {
    if (type === "all_operational") {
        // Set icon
        document.getElementById("overallStatusIcon").innerHTML =
            '<i class="far fa-check"></i>';
        // Set icon class
        removeAllClasses();
        document
            .getElementById("overallStatusIcon")
            .classList.add("allOperational");
        // Set text
        document.getElementById("overallStatusText").innerHTML =
            "<p>All systems operational.</p>";
        // Log data
        if (verbosity) {
            console.log("Overall Status: All online");
        }
    } else if (type === "partial_outage") {
        // Set icon
        document.getElementById("overallStatusIcon").innerHTML =
            '<i class="fad fa-exclamation"></i>';
        // Set icon class
        removeAllClasses();
        document
            .getElementById("overallStatusIcon")
            .classList.add("partialOutage");
        // Set text
        document.getElementById("overallStatusText").innerHTML =
            "<p>Partial outage.</p>";
        // Log data
        if (verbosity) {
            console.log("Overall Status: Partial outage");
        }
    } else if (type === "total_outage") {
        // Set icon
        document.getElementById("overallStatusIcon").innerHTML =
            '<i class="far fa-times"></i>';
        // Set icon class
        removeAllClasses();
        document
            .getElementById("overallStatusIcon")
            .classList.add("totalOutage");
        // Set text
        document.getElementById("overallStatusText").innerHTML =
            "<p>Total outage.</p>";
        // Log data
        if (verbosity) {
            console.log("Overall Status: All offline");
        }
    }

    function removeAllClasses() {
        document
            .getElementById("overallStatusIcon")
            .classList.remove("allOperational");
        document
            .getElementById("overallStatusIcon")
            .classList.remove("partialOutage");
        document
            .getElementById("overallStatusIcon")
            .classList.remove("totalOutage");
    }
}
