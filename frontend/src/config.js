window.uptimon_config = {
    api_base_url: "https://status.uptimon.com", // The URL of the Uptimon backend installation (no trailing slash).
    page_title: "Uptimon Status", // The title of the page
    page_description:
        "On this site, you'll find status reports about Uptimon's products and services. Log into your account on the Uptimon administration interface to subscribe to email notifications about status reports which affect specific products.", // The description shown at the top of the page.
    api_base_path: "api", // The base path of the backend installation's api directory (no leading or trailing slash).
    live_update: true, // Whether or not the status page should automatically check for new data.
    live_update_interval: 60000, // How often the status page should check for new data (in milliseconds).
    shown_data_points: 25, // The amount of data points to show on the chart (if the database contains more data points than the value of 'shown_data_points' the data will be decimated to accurately display relative highs and lows.).
    page_background_color: "#212121", // The background color of the status page.
    page_font_color: "#ffffff", // The font color of the status page.
    service_info_background_color: "#212121", // The color of the service info background.
    service_info_accent_color: "#333333", // The accent color of the service info.
    chart_background_color: "#333333", // Background color of charts.
    online_primary_color: "#47d337", // Main color used when a service is online.
    online_secondary_color: "#3ab42d", // Accent color used when a service is online.
    offline_primary_color: "#eb1c22", // Main color used when a service is offline.
    offline_secondary_color: "#ff252c", // Accent color used when a service is offline.
    not_available_color: "#666666", // Color used when a service does not have sufficient data to be fully portrayed.
    verbose_logging: true, // Whether or not to create highly detailed browser console logs.
};
