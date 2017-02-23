"use strict";

(function () {
    var configData = null;
    var disableHoverFlag = false;
    var geoData = null;
    var info = null;
    var legend = null;
    var map = null;
    var popup = null;
    var tilesUrl = null;

    var configUrl = "./partials/config.json";
    var featuresUrl = "./partials/simplifiedMxGeo.json";
    var chartHtmlElIdAsCssSelector = "#chartPoints";
    var mapHtmlElId = "mapMX";
    var mapHtmlElIdAsCssSelector = "#" + mapHtmlElId;

    //  kind of switch for logging
    var LOGGER;
    // //////  uncomment to log
    // LOGGER = console;
    // LOGGER.debug = console.log;
    //////  uncomment to avoid logging
    LOGGER = {
        debug: noop,
        error: noop,
        info: noop,
        warn: noop
    };

    //  Invoke main function!
    activate();

    //  Defines main function.
    function activate() {
        augmentJQueryPromiseMethods();
        fetchDataAndInitializeVariables()
            .then(drawMapHandler);  //  Do the magic!
    }

    function augmentJQueryPromiseMethods() {
        if ($.when.all === undefined) {
            $.when.all = function (promises) {
                var deferred = new $.Deferred();

                $.when.apply($, promises)
                    .then(
                        function resolve() {
                            deferred.resolve(Array.prototype.slice.call(arguments));
                        },
                        function reject() {
                            deferred.reject(Array.prototype.slice.call(arguments));
                        }
                    );

                return deferred;
            }
        }
    }

    function drawMapHandler() {
        setupLeafletMap(mapHtmlElId);
        showDataAndExtrasOnLeafletMap();
    }

    function fetchDataAndInitializeVariables() {
        var dataUrls = [configUrl, featuresUrl];
        var promises = fetchDataByUrlsArray(dataUrls);

        return $.when.all(promises)
            .then(function (resolvedData) {
                LOGGER.debug("resolvedData", resolvedData, resolvedData.length);

                var shouldPrintError = true;

                if (resolvedData.length === 2) {
                    var resolvedConfig = resolvedData[0];
                    var resolvedFeatures = resolvedData[1];

                    if (resolvedConfig[1] === "success" && resolvedFeatures[1] === "success") {
                        configData = resolvedConfig[0];
                        geoData = resolvedFeatures[0];

                        LOGGER.debug("configData", configData);
                        LOGGER.debug("geoData", geoData);

                        if (isValidConfigData(configData) && isValidGeoData(geoData)) {
                            shouldPrintError = false;

                            tilesUrl = "https://api.mapbox.com/styles/v1/" + configData.stylePath +
                                "/tiles/256/{z}/{x}/{y}?access_token=" + configData.accessToken;
                        }
                    }
                }

                if (shouldPrintError) {
                    console.error("Hubo un error.");
                }

                return shouldPrintError;
            });
    }

    function fetchDataByUrlsArray(urls) {
        return $.map(urls, fetchJsonDataByUrl);
    }

    function fetchJsonDataByUrl(url) {
        return $.ajax({
            contentType: "application/json; charset=utf-8",
            data: {},
            dataType: "json",
            url: url
        });
    }

    function getColor(d) {
        return d > 50 ? "#008261" :
            d > 40 ? "#049873" :
                d > 30 ? "#00af83" :
                    d > 20 ? "#00CC99" :
                        "#17f5bd";
    }

    function isValidConfigData(config) {
        if (!config["accessToken"]) {
            LOGGER.error("Error en la estructura del JSON: Se necesita especificar el 'access_token' de leaflet.");
            // alert("Error en la estructura del JSON: Se necesita especificar la etiqueta de información.");
            return false;
        }

        if (!config["stylePath"]) {
            LOGGER.error("Error en la estructura del JSON: Se necesita especificar el 'style_path' de leaflet.");
            // alert("Error en la estructura del JSON: Se necesita especificar la etiqueta de información.");
            return false;
        }

        if (!config["etiqueta_info"]) {
            LOGGER.error("Error en la estructura del JSON: Se necesita especificar la etiqueta de información.");
            // alert("Error en la estructura del JSON: Se necesita especificar la etiqueta de información.");
            return false;
        }

        if (!config["etiqueta_pop"]) {
            LOGGER.error("Error en la estructura del JSON: Se necesita especificar la etiqueta de popup.");
            // alert("Error en la estructura del JSON: Se necesita especificar la etiqueta de popup.");
            return false;
        }

        if (!config["ejex"]) {
            LOGGER.error("Error en la estructura del JSON: Se necesita especificar la leyenda del eje X para la gráfica de información.");
            // alert("Error en la estructura del JSON: Se necesita especificar la leyenda del eje X para la gráfica de información.");
            return false;
        }

        if (!config["ejey"]) {
            LOGGER.error("Error en la estructura del JSON: Se necesita especificar la leyenda del eje Y para la gráfica de información.");
            // alert("Error en la estructura del JSON: Se necesita especificar la leyenda del eje Y para la gráfica de información.");
            return false;
        }

        return true;
    }

    // Valida Json
    function isValidGeoData(json) {
        var json_fields = ["type", "geometry", "properties"];
        var json_types = {"type": "string", "geometry": "object", "properties": "object"};
        var valores = json["features"];

        for (var elemento in valores) {
            var llaves_elemento = Object.keys(valores[elemento]);
            for (var k in llaves_elemento) {
                var comparatorFn = compareValuesProvider(llaves_elemento[k]);

                if (!json_fields.some(comparatorFn)) {
                    LOGGER.error("Error en la estructura del JSON: Campo invalido: " + llaves_elemento[k]);
                    // alert("Error en la estructura del JSON: Campo invalido: " + llaves_elemento[k]);
                    return false;
                }

                if (typeof valores[elemento][llaves_elemento[k]] !== json_types[llaves_elemento[k]]) {
                    LOGGER.error(
                        "Error en la estructura del JSON: El campo " + llaves_elemento[k] +
                        " debe ser de tipo " + json_types[llaves_elemento[k]]
                    );
                    // alert(
                    //     "Error en la estructura del JSON: El campo " + llaves_elemento[k] +
                    //     " debe ser de tipo " + json_types[llaves_elemento[k]]
                    // );
                    return false;
                }
            }
        }

        return true;

        function compareValuesProvider(element) {
            return function (item) {
                return (item == element);
            };
        }
    }

    function noop() {}

    function onMapClick() {
        disableHoverFlag = false;
        $(mapHtmlElIdAsCssSelector + " .leaflet-right .leaflet-control").css("border", "none");
        info.update();
    }

    function setupLeafletControl() {
        if (info !== null) {
            return;
        }

        info = L.control();

        info.onAdd = function () {
            this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
            // this.update();
            return this._div;
        };

        info.update = function (props) {
            $(this._div).show();

            if (props) {
                this._div.innerHTML =
                    "<h5 class='title-pop'><span>Estado: </span>" + props.estado + "</h5><hr>" +
                    "<h5>" + configData.etiqueta_info + " <b>" + props.valor_info + " </b></h5><hr>" +
                    "<div id='chartPoints' style='margin-left: -25px;'></div>";

            } else {
                this._div.innerHTML = $(this._div).hide();
            }

            // timeseries Chart
            if (typeof props != "undefined") {
                var x = ["x"];
                var lb = [configData.ejey];
                props.grafica.forEach(function (el) {
                    x.push(el.tiempo + "-01-01");
                    lb.push(el.valor);
                });
                var chart = c3.generate({
                    axis: {
                        x: {
                            label: {
                                position: "outer-center",
                                text: configData.ejex
                            },
                            tick: {
                                format: "%Y"
                            },
                            type: "timeseries"
                        },
                        y: {
                            label: {
                                position: "outer-middle",
                                text: configData.ejey
                            }
                        }
                    },
                    bindto: chartHtmlElIdAsCssSelector,
                    data: {
                        columns: [x, lb],
                        names: {
                            x: configData.ejey
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
            }  // Fin timeseries Chart
        };  // Fin info Update

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

    function setupLeafletMap(htmlElId) {
        if (map !== null) {
            return;
        }

        map = L.map(htmlElId).setView([24, -95], 5);

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

    function showDataAndExtrasOnLeafletMap() {
        if (geoData === null) {
            LOGGER.debug("showDataAndExtrasOnLeafletMap()");
            return;
        }

        var geojson = L.geoJson(geoData, {
            onEachFeature: onEachFeature,
            style: style
        }).addTo(map);

        setupLeafletControl();

        setupLeafletLegendAndPopup();

        map.on("click", onMapClick);

        function disableHoverFn(e) {
            var dataPop = e.target.feature.properties;
            popup
                .setLatLng(e.latlng)
                .setContent(
                    "<h5 class='title-pop'><span>Estado: </span>" + dataPop.estado + "</h5><hr>" +
                    "<h5>" + configData.etiqueta_pop + " <b>" + dataPop.porcentaje_pop + "%</b></h5>"
                )
                .openOn(map);

            if (disableHoverFlag) {
                $(mapHtmlElIdAsCssSelector + " .leaflet-right .leaflet-control").css("border", "none");

            } else {
                $(mapHtmlElIdAsCssSelector + " .leaflet-right .leaflet-control").css("border-left", "1px solid #4D92DF");
                $(".leaflet-control-attribution").css("border", "none");
            }

            disableHoverFlag = !disableHoverFlag;
        }

        function highlightFeature(e) {
            if (!disableHoverFlag) {
                var layer = e.target;
                layer.setStyle({
                    color: "#336699",
                    dashArray: "",
                    fillOpacity: 0.6,
                    weight: 1
                });

                if (!L.Browser.ie && !L.Browser.opera) {
                    layer.bringToFront();
                }

                info.update(layer.feature.properties);
            }
        }

        function onEachFeature(feature, layer) {
            layer.on({
                click: disableHoverFn,
                mouseout: resetHighlight,
                mouseover: highlightFeature
            });
        }

        function resetHighlight(e) {
            geojson.resetStyle(e.target);
        }

        function style(feature) {
            return {
                color: "#FFFFFF",
                dashArray: "1",
                fillColor: getColor(feature.properties.porcentaje_pop),
                fillOpacity: 0.7,
                opacity: 1,
                weight: 1
            };
        }
    }
})();
