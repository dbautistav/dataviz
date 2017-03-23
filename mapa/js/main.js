"use strict";

(function () {
    var configData = null;
    var hasTsViz = false;
    var tilesUrl = null;
    var hasMapViz = 0;

    var LOGGER = utils.LOGGER;

    //  Invoke main function when ready!
    document.addEventListener("DOMContentLoaded", activate);

    //  Defines main function.
    function activate() {
        dataUtils.fetchDataFromSpecPromise()
            .then(parseConfigAndPrepareDataRequests)
            .then(handleDataRequests)
            .then(function (responseObj) {
                if (!responseObj.error) {
                    configureLeaflet(responseObj);

                    //  Do the magic!
                    leafletUtils.drawMap();

                } else {
                    console.error(
                        "ERROR!",
                        "Revisa la configuración y la disponibilidad de los archivos de datos."
                    );
                }
            });
    }

    //  Configures leaflet-utils.
    function configureLeaflet(config) {
        // LOGGER.debug("config @configureLeaflet", config);

        var mapConfig;
        var mapLayersConfig;
        var mappingsConfig;
        var tsConfig;

        if (!!config && !!config.data) {
            var configData = config.data;

            mapConfig = (!!configData.map && !!configData.map.config)
                ? configData.map.config
                : {};

            tsConfig = (!!configData.timeseries && !!configData.timeseries.config)
                ? configData.timeseries.config
                : {};

            mappingsConfig = (!!configData.mappings)
                ? configData.mappings
                : {};

        } else {
            mapConfig = {};
            mappingsConfig = {};
            tsConfig = {};
        }

        //  Wire leaflet with mapbox tiles url.
        leafletUtils.setMapboxTilesUrl(mapConfig.mapbox.tilesUrl);

        //  Set initial view.
        leafletUtils.setMapInitialView(mapConfig.initial_boundaries, mapConfig.initial_zoom);

        //  Set DOM element to use with leaflet.
        leafletUtils.setHtmlElId(mapConfig.htmlElId);

        mapLayersConfig = getMapLayersConfig(config.data.map);
        //  Set map layers config.
        leafletUtils.setMapLayersConfig(mapLayersConfig);

        //  Set timeseries config.
        leafletUtils.setTimeseriesConfig(tsConfig);

        //  Set mappings config.
        leafletUtils.setMappingsConfig(mappingsConfig);

        var datasets = getDatasetsFromResponse(config.data);
        //  Set datasets to draw at map.
        leafletUtils.setDatasets(datasets);
    }

    function getDatasetsFromResponse(data) {
        var datasets = {};

        if (!!data) {
            if (!!data.map && !!data.map.layers) {
                if (!!data.map.layers.polygons_map && !!data.map.layers.polygons_map.dataset) {
                    datasets.polygons_map = data.map.layers.polygons_map.dataset;
                }

                if (!!data.map.layers.points_map && !!data.map.layers.points_map.dataset) {
                    datasets.points_map = data.map.layers.points_map.dataset;
                }
            }

            if (!!data.timeseries && !!data.timeseries.dataset && data.timeseries.dataset.length > 0) {
                datasets.timeseries = data.timeseries;
            }
        }

        return datasets;
    }

    function getMapLayersConfig(config) {
        var mapLayerConfig = {};

        if (!!config && !!config.layers) {
            if (!!config.layers.polygons_map) {
                mapLayerConfig.polygons_map = utils.copyJsObject(config.layers.polygons_map);
                delete mapLayerConfig.polygons_map.data_url;
                delete mapLayerConfig.polygons_map.dataset;
            }

            if (!!config.layers.points_map) {
                mapLayerConfig.points_map = utils.copyJsObject(config.layers.points_map);
                delete mapLayerConfig.points_map.data_url;
                delete mapLayerConfig.points_map.dataset;
            }
        }

        return mapLayerConfig;
    }

    //  Data-promise handler functions
    function handleDataRequests(resolvedData) {
        // LOGGER.debug("resolvedData", resolvedData, resolvedData.length);

        var shouldPrintError = true;

        if (!!resolvedData && resolvedData.length > 0) {
            var isSuccess = true;
            for (var i = 0; i < resolvedData.length; i++) {
                isSuccess &= (resolvedData[i][1] === "success");
            }

            if (isSuccess) {
                for (var j = 0; j < resolvedData.length; j++) {
                    //  FIXME: validate data structure!
                    if (hasMapViz && !configData.map.layers.polygons_map.dataset) {
                        configData.map.layers.polygons_map.dataset = resolvedData[j][0];

                    } else if (hasMapViz && !configData.map.layers.points_map.dataset) {
                        configData.map.layers.points_map.dataset = resolvedData[j][0];

                    } else if (hasTsViz && !configData.timeseries.dataset) {
                        configData.timeseries.dataset = resolvedData[j][0];
                    }
                }
                // LOGGER.debug("configData", configData);

                shouldPrintError = false;
            }
        }

        if (shouldPrintError) {
            console.error(
                "Hubo un error.",
                "Por favor revisa que los archivos de datos '.json' existan y se encuentren en la ruta configurada."
            );
        }

        var finalResponseObj = {
            data: configData,
            error: shouldPrintError
        };
        finalResponseObj.data.map.config.mapbox.tilesUrl = tilesUrl;
        // LOGGER.debug("finalResponseObj", finalResponseObj);

        return finalResponseObj;
    }

    function parseConfigAndPrepareDataRequests(resolvedConfig) {
        // LOGGER.debug("resolvedConfig", resolvedConfig);

        configData = resolvedConfig[0];
        LOGGER.debug("configData", configData);

        var isSuccess = ((resolvedConfig[1] === "success") && (isValidConfigData(configData)));

        if (isSuccess) {
            tilesUrl = getMapboxTilesUrl(configData.map.config.mapbox);

            var dataUrlArray = [];

            hasMapViz = (!!configData && !!configData.map && !!configData.map.layers);

            if (!!hasMapViz) {
                if (!!configData.map.layers.polygons_map) {
                    dataUrlArray.push(configData.map.layers.polygons_map.data_url);
                }

                if (!!configData.map.layers.points_map) {
                    dataUrlArray.push(configData.map.layers.points_map.data_url);
                }
            }

            hasTsViz = (!!configData && !!configData.timeseries);

            if (hasTsViz) {
                dataUrlArray.push(configData.timeseries.data_url);
            }

            return utils.fetchDataByUrlArrayPromise(dataUrlArray);
        }

        console.error("Hubo un error.", "Por favor revisa el archivo 'config.json'");
        return $.when(null);

        function getMapboxTilesUrl(mapboxConfig) {
            return "https://api.mapbox.com/styles/v1/" + mapboxConfig.stylePath +
                "/tiles/256/{z}/{x}/{y}?access_token=" + mapboxConfig.accessToken;
        }
    }

    //  Validation functions
    //    FIXME!!!    FIXME!!!    FIXME!!!    FIXME!!!    FIXME!!!
    function isValidConfigData(config) {
        // if (!config["mapbox"]) {
        //     console.error("Error en la estructura del JSON: Se necesita especificar la configuración de mapbox.");
        //     return false;
        // }
        //
        // if (!config.mapbox["accessToken"]) {
        //     console.error("Error en la estructura del JSON: Se necesita especificar el 'access_token' de leaflet.");
        //     return false;
        // }
        //
        // if (!config.mapbox["stylePath"]) {
        //     console.error("Error en la estructura del JSON: Se necesita especificar el 'style_path' de leaflet.");
        //     return false;
        // }
        //
        // // //      FIXME!!!      FIXME!!!      FIXME!!!      FIXME!!!      FIXME!!!      FIXME!!!      FIXME!!!
        // // //      FIXME!!!      FIXME!!!      FIXME!!!      FIXME!!!      FIXME!!!      FIXME!!!      FIXME!!!
        // // if (!config["etiqueta_info"]) {
        // //     console.error("Error en la estructura del JSON: Se necesita especificar la etiqueta de información.");
        // //     return false;
        // // }
        // //
        // // if (!config["etiqueta_pop"]) {
        // //     console.error("Error en la estructura del JSON: Se necesita especificar la etiqueta de popup.");
        // //     return false;
        // // }
        // //
        // // if (!config["ejex"]) {
        // //     console.error("Error en la estructura del JSON: Se necesita especificar la leyenda del eje X para la gráfica de información.");
        // //     return false;
        // // }
        // //
        // // if (!config["ejey"]) {
        // //     console.error("Error en la estructura del JSON: Se necesita especificar la leyenda del eje Y para la gráfica de información.");
        // //     return false;
        // // }
        // // //      FIXME!!!      FIXME!!!      FIXME!!!      FIXME!!!      FIXME!!!      FIXME!!!      FIXME!!!
        // // //      FIXME!!!      FIXME!!!      FIXME!!!      FIXME!!!      FIXME!!!      FIXME!!!      FIXME!!!

        return true;
    }

    //    FIXME!!!    FIXME!!!    FIXME!!!    FIXME!!!    FIXME!!!
    function isValidGeoData(json) {
        return true;  //    FIXME!!!    FIXME!!!    FIXME!!!    FIXME!!!    FIXME!!!

        var json_fields = ["type", "geometry", "properties"];
        var json_types = {"type": "string", "geometry": "object", "properties": "object"};
        var valores = json["features"];

        for (var elemento in valores) {
            if (valores.hasOwnProperty(elemento)) {
                var llaves_elemento = Object.keys(valores[elemento]);
                for (var k in llaves_elemento) {
                    var comparatorFn = compareValuesProvider(llaves_elemento[k]);

                    if (!json_fields.some(comparatorFn)) {
                        console.error("Error en la estructura del JSON: Campo invalido: " + llaves_elemento[k]);
                        return false;
                    }

                    if (typeof valores[elemento][llaves_elemento[k]] !== json_types[llaves_elemento[k]]) {
                        console.error(
                            "Error en la estructura del JSON: El campo " + llaves_elemento[k] +
                            " debe ser de tipo " + json_types[llaves_elemento[k]]
                        );
                        return false;
                    }
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

    //    FIXME!!!    FIXME!!!    FIXME!!!    FIXME!!!    FIXME!!!
    function isValidTsData(json) {
        // if (mapHtmlElId === null) {
        //     console.error("Falta definir el identificador donde se dibujará el mapa.");
        //     return;
        // }
        //
        // if (tilesUrl === null) {
        //     console.error("Falta definir la URL de tiles de mapbox.");
        //     return;
        // }
    }
})();
