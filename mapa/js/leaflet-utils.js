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
        // LOGGER.debug("==============================================================================");
        // LOGGER.debug("datasets", datasets);
        // LOGGER.debug("mapLayersConfig", mapLayersConfig);
        // LOGGER.debug("mappingsConfig", mappingsConfig);
        // LOGGER.debug("tsConfig", tsConfig);
        // LOGGER.debug("==============================================================================");

        setupLeafletMap();
        showDataAndExtrasOnLeafletMap();
    }

    //  Helper functions
    function getColor(d) {
        //  TODO: extract this intervals and values to 'config.json' since it's highly coupled!
        return d > 50 ? "#008261" :
            d > 40 ? "#049873" :
                d > 30 ? "#00af83" :
                    d > 20 ? "#00CC99" :
                        "#17f5bd";
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
                    "<h5>" +
                    tsPanelConfig.title.label + "<b>" + props[tsPanelConfig.title.key] + "</b>" +
                    "</h5><hr>" +
                    "<div id='chartPoints' style='margin-left: -25px;'></div>";

            } else {
                this._div.innerHTML = $(this._div).hide();
            }

            // timeseries chart
            if (!!props) {
                var x = ["x"];
                var lb = [tsConfig.axis.y.label];

                props.dataset.forEach(function (el) {
                    x.push(el[tsConfig.axis.x.key]);
                    lb.push(el[tsConfig.axis.y.key]);
                });

                var chart = c3.generate({
                    axis: {
                        x: {
                            label: {
                                position: "outer-center",
                                text: tsConfig.axis.x.label
                            },
                            tick: {
                                format: "%Y"
                            },
                            type: "timeseries"
                        },
                        y: {
                            label: {
                                position: "outer-middle",
                                text: tsConfig.axis.y.label
                            }
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
        if (popup !== null || legend !== null) {
            return;
        }

        popup = L.popup();

        legend = L.control({position: "bottomleft"});

        legend.onAdd = function () {
            var div = L.DomUtil.create("div", "info legend");
            //  TODO: extract this to 'config.json' since it's highly coupled!
            var grades = [0, 10, 20, 30, 40, 50];

            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    "<i style='background:" + getColor(grades[i] + 1) + "'></i> " +
                    grades[i] + (
                        (grades[i + 1])
                            ? "&ndash;" + grades[i + 1] + "<br>"
                            : "+"
                    );
            }

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

        var geojson = null;
        var onEachFeature;

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
                style: style
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

        function onMapClick() {
            disableHoverFlag = false;
            $(mapHtmlElIdAsCssSelector + " .leaflet-right .leaflet-control").css("border", "none");
        }

        function showPopUpProvider(featureType) {
            return function (e) {
                var dataPop = e.target.feature.properties;
                var htmlFragment = "";
                var popUpConfig;

                if (featureType === "polygons" || featureType === "points") {
                    var layerKey = featureType + "_map";
                    popUpConfig = mapLayersConfig[layerKey].pop_up;

                    htmlFragment = "<h5 class='title-pop'>" +
                        "<span>" + popUpConfig.header.label + "</span>" + dataPop[popUpConfig.header.key] +
                        "</h5><hr>" +
                        "<h5>" +
                        popUpConfig.title.label + " <b>" + dataPop[popUpConfig.title.key] + "</b>" +
                        "</h5>";
                }

                popup
                    .setLatLng(e.latlng)
                    .setContent(htmlFragment)
                    .openOn(map);

                if (disableHoverFlag) {
                    $(mapHtmlElIdAsCssSelector + " .leaflet-right .leaflet-control")
                        .css("border", "none");

                } else {
                    //  TODO: extract this to 'config.json' since it's highly coupled!
                    $(mapHtmlElIdAsCssSelector + " .leaflet-right .leaflet-control")
                        .css("border-left", "1px solid #4D92DF");
                    $(".leaflet-control-attribution").css("border", "none");
                }

                disableHoverFlag = !disableHoverFlag;
            };
        }

        function highlightFeature(e) {
            if (!disableHoverFlag) {
                var layer = e.target;
                if (typeof layer.setStyle == "function") {
                    //  TODO: extract this to 'config.json' since it's highly coupled!
                    layer.setStyle({
                        color: "#336699",
                        dashArray: "",
                        fillOpacity: 0.6,
                        weight: 1
                    });

                    if (!L.Browser.ie && !L.Browser.opera) {
                        layer.bringToFront();
                    }

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

        function onEachFeatureProvider(featureType) {
            var showPopUp = showPopUpProvider(featureType);

            return function (feature, layer) {
                layer.on({
                    click: showPopUp,
                    mouseout: resetHighlight,
                    mouseover: highlightFeature
                });
            };
        }

        function resetHighlight(e) {
            geojson.resetStyle(e.target);
        }

        function style(feature) {
            var titleKey = mapLayersConfig.polygons_map.pop_up.title.key;
            //  TODO: extract this to 'config.json' since it's highly coupled!
            return {
                color: "#FFFFFF",
                dashArray: "1",
                fillColor: getColor(feature.properties[titleKey]),
                fillOpacity: 0.7,
                opacity: 1,
                weight: 1
            };
        }
    }
})();

//  no operation
function noop() {}
