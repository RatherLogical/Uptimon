"use strict";

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
            document.getElementById("liveUpdateText").innerHTML =
                "Live Update Enabled";
        }, 5000);
    } else {
        document.getElementById("liveUpdateText").innerHTML = text;
    }
}
