uptimeter_config = {
    api_base_url: "https://status.dzlte.st", // The URL of the uptimeter backend installation (no trailing slash)
    live_update: true, // Whether or not the status page should automatically check for new data
    live_update_interval: 60000, // How often the status page should check for new data
    shown_data_points: 25, // The amount of data points to show on the chart (if the database contains more data points than the value of 'shown_data_points' the data will be decimated to accurately display relative highs and lows.)
    online_primary_color: "#47d337",
    online_secondary_color: "#3ab42d",
    offline_primary_color: "#eb1c22",
    offline_secondary_color: "#ff252c",
    verbose_logging: false, // Whether or not to create highly detailed logs
};

module.exports = { uptimeter_config: uptimeter_config };
