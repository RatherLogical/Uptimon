window.uptimeter_config = {
    api_base_url: "https://status.dzltest.com", // The URL of the uptimeter backend installation (no trailing slash).
    api_base_path: "api", // The base path of the backend installation's api directory (no leading or trailing slash).
    live_update: true, // Whether or not the status page should automatically check for new data.
    live_update_interval: 60000, // How often the status page should check for new data.
    shown_data_points: 25, // The amount of data points to show on the chart (if the database contains more data points than the value of 'shown_data_points' the data will be decimated to accurately display relative highs and lows.).
    online_primary_color: "#47d337", // Main color used when a service is online.
    online_secondary_color: "#3ab42d", // Accent color used when a service is online.
    offline_primary_color: "#eb1c22", // Main color used when a service is offline.
    offline_secondary_color: "#ff252c", // Accent color used when a service is offline.
    not_available_color: "#666666", // Color used when a service does not have sufficient data to be fully portrayed.
    verbose_logging: true, // Whether or not to create highly detailed browser console logs.
};
