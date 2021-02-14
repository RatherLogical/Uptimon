'use strict';

// 1. Check that all required fields are completed
// 2. Check that the connection details are valid
// 3. Set the contents of the config file

let timezone = document.getElementById('timezone'); // America/New_York
let db_host = document.getElementById('db_host'); // 95.217.176.126
let db_name = document.getElementById('db_name'); // status
let db_user = document.getElementById('db_user'); // status
let db_pass = document.getElementById('db_pass'); // c45996dca8b8188c05e9221560c617fceb2adfe5fb230377eb2d37e4526781e5
let admin_email = document.getElementById('admin_email');
let admin_pass = document.getElementById('admin_pass');

const XHR_TIMEOUT = 5000;

document.getElementById('installUptimon').addEventListener('click', function() {
    // Ensure the message content will be hidden
    document.getElementById('message').style.display = 'none';
    checkRequiredFields();
}, false);

// Ensure all fields are completed properly
function checkRequiredFields() {
    let allClear = true;

    if (document.getElementById('timezone').value === "") {
        timezone.value = 'America/New_York';
    }

    if (document.getElementById('db_host').value === "") {
        db_host.value = '127.0.0.1';
    }

    if (document.getElementById('db_name').value === "") {
        db_name.value = 'uptimon';
    }

    if (document.getElementById('db_user').value === "") {
        db_user.value = 'uptimon';
    }

    if (document.getElementById('db_pass').value === "") {
        allClear = false;
    }

    if (document.getElementById('admin_email').value === "") {
        allClear = false;
    }

    if (document.getElementById('admin_pass').value === "") {
        allClear = false;
    }

    if (allClear) {
        checkDbConn(db_host.value, db_user.value, db_pass.value, db_name.value);
    } else {
        showMessage('failure', 'Please ensure all required fields are complete.');
    }
}

function checkDbConn(db_host, db_user, db_pass, db_name) {
    var xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", async function() {
        if(this.readyState === 4) {
            let JSON_resp  = JSON.parse(this.responseText);
            if (JSON_resp.message === 'db_conn_good') {
                showMessage(JSON_resp.status, 'Installing Uptimon! Please Wait...');
                if (await validateEmail(admin_email.value)) {
                    await createConfigFile(timezone.value, db_host, db_name, db_user, db_pass, admin_email.value, admin_pass.value);
                }
            } else if (JSON_resp.status !== 'success') {
                showMessage(JSON_resp.status, JSON_resp.message);
            }
        }
    });

    xhr.open("POST", `/setup/backend/setup.php?type=connCheck&db_host=${db_host}&db_user=${db_user}&db_pass=${db_pass}&db_name=${db_name}`);
    xhr.timeout = XHR_TIMEOUT;
    xhr.addEventListener("ontimeout", function(e) {
        console.log(e);
    });

    xhr.send();
}

function validateEmail(admin_email) {
    return new Promise((resolve) => {
        let xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            let JSON_resp  = JSON.parse(this.responseText);

            if (JSON_resp.status === 'success') {
                resolve(true);
            } else {
                showMessage(JSON_resp.status, JSON_resp.message);
                resolve(false);
            }
        }
        });

        xhr.open("POST", `/setup/backend/setup.php?type=validateEmail&admin_email=${admin_email}`);
        xhr.timeout = XHR_TIMEOUT;
        xhr.addEventListener("ontimeout", function(e) {
            console.log(e);
        });

        xhr.send();
    });
}

function createConfigFile(timezone, db_host, db_name, db_user, db_pass, admin_email, admin_pass) {
    return new Promise((resolve) => {
        var xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
                editConfig(this.responseText);
            }
        });

        xhr.open("GET", `/setup/frontend/static/config.json?cachebuster=${cacheBuster()}`);
        xhr.timeout = XHR_TIMEOUT;
        xhr.addEventListener("ontimeout", function(e) {
            console.log(e);
        });

        xhr.send();

        function editConfig(configData) {
            configData = JSON.parse(configData);

            // Set config values based on user input
            configData.timezone = timezone;
            configData.database_host = db_host;
            configData.database_name = db_name;
            configData.database_user = db_user;
            configData.database_pass = db_pass;
            configData.admin_email = admin_email;
            configData.admin_password = admin_pass;

            // Stringify the JSON config object
            configData = JSON.stringify(configData);

            // Send base64 encoded data
            sendConfig(btoa(configData));
        }

        function sendConfig(configData) {
            var xhr = new XMLHttpRequest();

            xhr.addEventListener("readystatechange", function() {
              if(this.readyState === 4) {
                let JSON_resp = JSON.parse(this.responseText);
                showMessage(JSON_resp.status, JSON_resp.message);
                resolve('done');
              }
            });

            xhr.open("POST", `/setup/backend/setup.php?type=createConfig&config_data=${configData}`);
            xhr.timeout = XHR_TIMEOUT;
            xhr.addEventListener("ontimeout", function(e) {
               console.log(e);
            });

            xhr.send();
        }
    });
}

function showMessage(type, message) {
    // Visually set the type of the message
    if (type === 'success') {
        document.getElementById('message').classList.remove('messageError');
        document.getElementById('message').classList.remove('messageDefault');
        document.getElementById('message').classList.add('messageSuccess');
    } else if (type === 'failure') {
        document.getElementById('message').classList.remove('messageSuccess');
        document.getElementById('message').classList.remove('messageDefault');
        document.getElementById('message').classList.add('messageError');
    } else {
        document.getElementById('message').classList.remove('messageSuccess');
        document.getElementById('message').classList.remove('messageError');
        document.getElementById('message').classList.add('messageDefault');
    }

    // Set the content of the message
    document.getElementById('message').innerHTML = message;
    // Show the message
    document.getElementById('message').style.display = '';
}

function cacheBuster() {
    return new Date().getTime();
}