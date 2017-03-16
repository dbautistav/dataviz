"use strict";

var leafletUtils = {
    drawMap: function () {},
    setDatasets: function () {},
    setHtmlElId: function () {},
    setMapboxTilesUrl: function () {},
    setMapInitialView: function () {},
    setMapLayersConfig: function () {},
    setMappingsConfig: function () {},
    setTimeseriesConfig: function () {}
};

(function () {
    var boundaries = null;
    var cohorts = null;
    var cohortValues = null;
    var datasets = null;
    var disableHoverFlag = false;
    var info = null;
    var legend = null;
    var map = null;
    var mapHtmlElId = null;
    var mapHtmlElIdAsCssSelector = null;
    var mapLayersConfig = null;
    var mappingsConfig = null;
    var popup = null;
    var tilesUrl = null;
    var tsConfig = null;
    var zoom = null;

    var configAttr = {
        cohorts: {
            colors: {
                interval_1: "[q0-q1)",
                interval_2: "[q1-q2)",
                interval_3: "[q2-q3)",
                interval_4: "[q3-q4)",
                interval_5: "[q4-q5]",
                interval_nd: "no_data"
            },
            interval_values: {
                q0: "q0",
                q1: "q1",
                q2: "q2",
                q3: "q3",
                q4: "q4",
                q5: "q5"
            }
        }
    };

    var baseStyleConfig = {
        fillOpacity: 0.7,
        weight: 1
    };

    var LOGGER = (!!utils && !!utils.LOGGER)
        ? utils.LOGGER
        : {
            debug: noop,
            error: noop,
            info: noop,
            warn: noop
        };
    var chartHtmlElIdAsCssSelector = "#chartPoints";

    //  Invoke main function!
    activate();

    //  Defines main function.
    function activate() {
        leafletUtils.drawMap = drawMapHandler;
        leafletUtils.setDatasets = setDatasets;
        leafletUtils.setHtmlElId = setHtmlElId;
        leafletUtils.setMapboxTilesUrl = setMapboxTilesUrl;
        leafletUtils.setMapInitialView = setMapInitialView;
        leafletUtils.setMapLayersConfig = setMapLayersConfig;
        leafletUtils.setMappingsConfig = setMappingsConfig;
        leafletUtils.setTimeseriesConfig = setTimeseriesConfig;
    }

    //  "Exported" orchestrator function definition
    function drawMapHandler() {
        LOGGER.debug("==============================================================================");
        LOGGER.debug("datasets", datasets);
        LOGGER.debug("mapLayersConfig", mapLayersConfig);
        LOGGER.debug("mappingsConfig", mappingsConfig);
        LOGGER.debug("tsConfig", tsConfig);
        LOGGER.debug("==============================================================================");

        setupLeafletMap();
        showDataAndExtrasOnLeafletMap();
    }

    //  Helper functions
    function getColor(d) {
        if (cohorts === null) {
            return;
        }

        var colorsAttr = configAttr.cohorts.colors;
        var intervalsAttr = configAttr.cohorts.interval_values;
        var rawInterval = cohorts.interval_values;

        var color = cohorts.colors[colorsAttr.interval_nd];
        var value = parseFloat(d);

        if (d != undefined && d != null && typeof value == "number") {
            if (rawInterval[intervalsAttr.q0] <= value && value < rawInterval[intervalsAttr.q1]) {
                color = cohorts.colors[colorsAttr.interval_1];

            } else if (rawInterval[intervalsAttr.q1] <= value && value < rawInterval[intervalsAttr.q2]) {
                color = cohorts.colors[colorsAttr.interval_2];

            } else if (rawInterval[intervalsAttr.q2] <= value && value < rawInterval[intervalsAttr.q3]) {
                color = cohorts.colors[colorsAttr.interval_3];

            } else if (rawInterval[intervalsAttr.q3] <= value && value < rawInterval[intervalsAttr.q4]) {
                color = cohorts.colors[colorsAttr.interval_4];

            } else if (rawInterval[intervalsAttr.q4] <= value && value <= rawInterval[intervalsAttr.q5]) {
                color = cohorts.colors[colorsAttr.interval_5];

            }
        }

        return color;
    }

    //  Setters
    function setDatasets(data) {
        if (!data) {
            return;
        }

        datasets = data;
    }

    function setHtmlElId(htmlElId) {
        mapHtmlElId = htmlElId;
        mapHtmlElIdAsCssSelector = "#" + mapHtmlElId;
    }

    function setMapboxTilesUrl(mapboxTilesUrl) {
        tilesUrl = mapboxTilesUrl;
    }

    function setMapInitialView(initialBoundaries, initialZoom) {
        boundaries = initialBoundaries;
        zoom = initialZoom;
    }

    function setMapLayersConfig(config) {
        mapLayersConfig = config;
        if (!!mapLayersConfig && !!mapLayersConfig.polygons_map &&
            !!mapLayersConfig.polygons_map.cohorts) {

            cohorts = mapLayersConfig.polygons_map.cohorts;

            var rawInterval = cohorts.interval_values;
            var intervalsAttr = configAttr.cohorts.interval_values;

            if (!!rawInterval) {
                cohortValues = [
                    rawInterval[intervalsAttr.q0],
                    rawInterval[intervalsAttr.q1],
                    rawInterval[intervalsAttr.q2],
                    rawInterval[intervalsAttr.q3],
                    rawInterval[intervalsAttr.q4],
                    rawInterval[intervalsAttr.q5]
                ];
            }

        }
    }

    function setMappingsConfig(config) {
        mappingsConfig = config;
    }

    function setTimeseriesConfig(config) {
        tsConfig = config;
    }

    //  Setup leaflet components
    function setupLeafletControl() {
        if (info !== null) {
            return;
        }

        info = L.control();

        info.onAdd = function () {
            this._div = L.DomUtil.create("div", "info");
            return this._div;
        };

        info.update = function (props) {
            $(this._div).show();

            var tsPanelConfig = tsConfig.panel;

            if (!!props) {
                this._div.innerHTML =
                    "<h5 class='title-pop'>" +
                    "<span>" + tsPanelConfig.header.label + "</span>" + props[tsPanelConfig.header.key] +
                    "</h5><hr>" +
                    "<h5 class='value-panel'>" +
                    "<span>" + props[tsPanelConfig.title.key] + "</span>" + tsPanelConfig.title.label +
                    "</h5>" +
                    "<div id='chartPoints' style='margin-left: -25px;'></div>";

            } else {
                this._div.innerHTML = $(this._div).hide();
            }

            // timeseries chart
            if (!!props && !!props.dataset && (props.dataset.length > 1) && !!tsConfig) {
                var x = ["x"];
                var lb = [tsConfig.axis.y.label];

                props.dataset.forEach(function (el) {
                    x.push(el[tsConfig.axis.x.key]);
                    lb.push(el[tsConfig.axis.y.key]);
                });

                var chart = c3.generate({
                    axis: {
                        x: {
                            // label: {
                            //     position: "outer-center",
                            //     text: tsConfig.axis.x.label
                            // },
                            tick: {
                                count: 2,
                                format: "%Y"
                            },
                            type: "timeseries"
                        },
                        y: {
                            // label: {
                            //     position: "outer-middle",
                            //     text: tsConfig.axis.y.label
                            // }
                        }
                    },
                    bindto: chartHtmlElIdAsCssSelector,
                    data: {
                        columns: [x, lb],
                        names: {
                            x: tsConfig.axis.y.label
                        },
                        x: "x"
                    },
                    grid: {
                        y: {
                            show: true
                        }
                    },
                    legend: {
                        show: false
                    },
                    padding: {
                        right: 15
                    },
                    size: {
                        height: 200,
                        width: 250
                    }
                });
            }
        };

        info.addTo(map);
    }

    function setupLeafletLegendAndPopup() {
        if (popup !== null || legend !== null || cohorts === null) {
            return;
        }

        popup = L.popup();

        legend = L.control({position: "bottomleft"});

        legend.onAdd = function () {
            var div = L.DomUtil.create("div", "info legend");

            for (var i = 0; i < cohortValues.length - 1; i++) {
                div.innerHTML +=
                    "<i style='background:" + getColor(cohortValues[i]) + "'></i> " +
                    cohortValues[i] + "&ndash;" + cohortValues[i + 1] + "<br>";
            }
            div.innerHTML += "<i style='background:" + getColor(null) + "'></i> ND <br>";

            return div;
        };

        legend.addTo(map);
    }

    function setupLeafletMap() {
        if (map !== null) {
            return;
        }

        if (mapHtmlElId === null) {
            console.error(
                "ERROR!",
                "Falta definir un identificador del DOM donde se pintará el mapa."
            );
            return;
        }

        map = L.map(mapHtmlElId).setView(boundaries, zoom);

        L.tileLayer(tilesUrl, {
            // id: "mapbox.clear",
            // maxZoom: 5,
            // minZoom: 5,
            name: "name_es"
        }).addTo(map);

        // Disable drag and zoom handlers.
        map.keyboard.disable();
        map.touchZoom.disable();
        // map.doubleClickZoom.disable();
        // map.dragging.disable();
        // map.scrollWheelZoom.disable();
    }

    //  Show data into visualizations
    function showDataAndExtrasOnLeafletMap() {
        if (!datasets || (!!datasets && !(datasets.polygons_map || datasets.points_map))) {
            return;
        }

        var geojson;
        var onEachFeature;

        activate();

        function activate() {
            geojson = null;

            if (!!datasets.polygons_map) {
                onEachFeature = onEachFeatureProvider("polygons");
                geojson = L.geoJson(datasets.polygons_map, {
                    onEachFeature: onEachFeature,
                    style: style
                }).addTo(map);
            }

            if (!!datasets.points_map) {
                onEachFeature = onEachFeatureProvider("points");
                var currentGeoJson = L.geoJson(datasets.points_map, {
                    onEachFeature: onEachFeature,
                    pointToLayer: pointToLayer
                    // , style: style
                }).addTo(map);

                if (geojson === null) {
                    geojson = currentGeoJson;
                }
            }

            if (geojson === null) {
                console.warn("No hubo datos para mostrar.");
                return;
            }

            setupLeafletControl();

            setupLeafletLegendAndPopup();

            map.on("click", onMapClick);
        }

        function onMapClick() {
            disableHoverFlag = false;
            $(mapHtmlElIdAsCssSelector + " .leaflet-right .leaflet-control")
                .css("border", "none");
        }

        function pointToLayer(feature, latlng) {
            return L.circleMarker(latlng, {
                color: "#8d8d8d",
                fillColor: "#fff",
                fillOpacity: 1,
                opacity: 1,
                radius: 5,
                weight: 1
            });
        }

        function showPopUpProvider(featureType) {
            return function (e) {
                var dataPop = e.target.feature.properties;
                var htmlFragment = "";
                var layerKey;
                var popUpConfig;

                if (featureType === "polygons") {
                    layerKey = featureType + "_map";
                    popUpConfig = mapLayersConfig[layerKey].pop_up;

                    htmlFragment = "<h5 class='title-pop'>" +
                        "<span>" + popUpConfig.header.label + "</span>" + dataPop[popUpConfig.header.key] +
                        "</h5><hr>" +
                        "<h5>" +
                        popUpConfig.title.label + " <b>" + dataPop[popUpConfig.title.key] + "</b>" +
                        "</h5>";

                } else if (featureType === "points") {
                    layerKey = featureType + "_map";
                    popUpConfig = mapLayersConfig[layerKey].pop_up;

                    var node = document.createElement("div");
                    node.appendChild(JsonHuman.format(dataPop));

                    htmlFragment = "<h5 class='title-pop'>" +
                        "<span>" + popUpConfig.header.label + "</span>" + dataPop[popUpConfig.header.key] +
                        "</h5><hr>" +
                        "<div style='height:100px; overflow:auto'>" + node.innerHTML + "</div>";

                }

                popup
                    .setLatLng(e.latlng)
                    .setContent(htmlFragment)
                    .openOn(map);

                if (disableHoverFlag) {
                    $(mapHtmlElIdAsCssSelector + " .leaflet-right .leaflet-control")
                        .css("border", "none");

                } else {
                    $(mapHtmlElIdAsCssSelector + " .leaflet-right .leaflet-control")
                        .css("border-left", "1px solid #4d92df");
                    $(".leaflet-control-attribution").css("border", "none");
                }

                disableHoverFlag = !disableHoverFlag;
            };
        }

        function highlightFeatureProvider(featureType) {
            return function (e) {
                if (!disableHoverFlag) {
                    var layer = e.target;
                    if (typeof layer.setStyle == "function") {
                        if (featureType !== "points") {
                            var shapeColor = mapLayersConfig.polygons_map.shapes.highlight.color;
                            layer.setStyle($.extend({}, baseStyleConfig, {
                                color: shapeColor,
                                dashArray: ""
                            }));

                            var tsDatasets = datasets.timeseries.dataset;
                            var mapKey = mappingsConfig.map_layer.key;
                            var tsKey = mappingsConfig.ts.key;
                            var currentFeatureProps = layer.feature.properties;
                            var props;

                            for (var i = 0; i < tsDatasets.length; i++) {
                                if (tsDatasets[i][tsKey] === currentFeatureProps[mapKey]) {
                                    props = tsDatasets[i];
                                    break;
                                }
                            }

                            info.update(props);
                        }
                    }
                }
            };
        }

        function onEachFeatureProvider(featureType) {
            var showPopUp = showPopUpProvider(featureType);
            var mouseout = (featureType === "points")
                ? noop
                : resetHighlight;
            var highlightFeature = highlightFeatureProvider(featureType);

            return function (feature, layer) {
                layer.on({
                    click: showPopUp,
                    mouseout: mouseout,
                    mouseover: highlightFeature
                });
            };
        }

        function resetHighlight(e) {
            geojson.resetStyle(e.target);
        }

        function style(feature) {
            var titleKey = mapLayersConfig.polygons_map.pop_up.title.key;
            var fillColor = getColor(feature.properties[titleKey]);
            var shapeColor = mapLayersConfig.polygons_map.shapes.normal.color;

            return $.extend({}, baseStyleConfig, {
                color: shapeColor,
                dashArray: "1",
                fillColor: fillColor,
                opacity: 1
            });
        }
    }
})();

//  no operation
function noop() {}
