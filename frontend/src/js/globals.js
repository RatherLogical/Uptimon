"use strict";

if (__MODE__ === "development") {
    require("../config.js");
}

export let globals = {
    apiURL: global.uptimon_config.api_base_url,
    apiPath: global.uptimon_config.api_base_path,
    verbosity: global.uptimon_config.verbose_logging,
    dataPoints: global.uptimon_config.chart.shown_data_points,
    dataPeriod: global.uptimon_config.chart.default_data_period,
    enableTooltips: global.uptimon_config.enable_tooltips,
    pageTitle: global.uptimon_config.page_title,
    pageDescription: global.uptimon_config.page_description,
    pageBackground: global.uptimon_config.colors.page_background,
    pageFont: global.uptimon_config.colors.page_font,
    serviceInfoBackground: global.uptimon_config.colors.service_info_background,
    serviceInfoAccent: global.uptimon_config.colors.service_info_accent,
    chartBackground: global.uptimon_config.colors.chart_background,
    onlineA: global.uptimon_config.colors.online_primary,
    onlineB: global.uptimon_config.colors.online_secondary,
    offlineA: global.uptimon_config.colors.offline_primary,
    offlineB: global.uptimon_config.colors.offline_secondary,
    notAvailable: global.uptimon_config.colors.not_available,
    GA_Enabled: global.uptimon_config.analytics.GA_enabled,
    GA_MeasurementID: global.uptimon_config.analytics.GA_measurement_id,
    liveUpdate: global.uptimon_config.liveUpdate.enabled,
    liveUpdateInterval: global.uptimon_config.liveUpdate.interval,
};
