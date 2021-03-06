window.uptimon_config = {
    api_base_url: "https://status-api.uptimon.com", // The URL of the Uptimon backend installation (no trailing slash).
    api_base_path: "api", // The base path of the backend installation's api directory (no leading or trailing slash).
    page_title: "Uptimon Status", // The title of the page
    page_description:
        "On this site, you'll find status reports about Uptimon's products and services. Log into your account on the Uptimon administration interface to subscribe to email notifications about status reports which affect specific products.", // The description shown at the top of the page.
    liveUpdate: {
        enabled: true, // Whether or not the status page should automatically check for new data.
        interval: 60000, // How often the status page should check for new data (in milliseconds).
    },
    chart: {
        shown_data_points: 25, // The amount of data points to show on the chart (if the database contains more data points than the value of 'shown_data_points' the data will be decimated to accurately display relative highs and lows.).
        default_data_period: "-1_month", // The time range of data to base shown service statistics off of. Possible values: "-30_mins", "-1_hour", "-6_hours", "-12_hours", "-1_day", "-3_days", "-7_days", "-14_days", "-1_month", "-3_months", "all"
    },
    enable_tooltips: true, // Whether or not to show tooltips when hovering over certain elements.
    colors: {
        page_background: "#212121", // The background color of the status page.
        page_font: "#ffffff", // The font color of the status page.
        service_info_background: "#212121", // The color of the service info background.
        service_info_accent: "#333333", // The accent color of the service info.
        chart_background: "#333333", // Background color of charts.
        online_primary: "#47d337", // Main color used when a service is online.
        online_secondary: "#3ab42d", // Accent color used when a service is online.
        offline_primary: "#eb1c22", // Main color used when a service is offline.
        offline_secondary: "#ff252c", // Accent color used when a service is offline.
        not_available: "#666666", // Color used when a service does not have sufficient data to be fully portrayed.
    },
    analytics: {
        // Google Analytics settings
        GA_enabled: true, // If disabled Google Analytics is not loaded at all.
        GA_measurement_id: "UA-194798997-1", // You must create a Universal Analytics property in order to use Google Analytics on your status page.
    },
    verbose_logging: true, // Whether or not to create highly detailed browser console logs.
};
