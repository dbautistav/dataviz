var map;
var blockMap = false;

// Carga geoJson de Mexico
var mxData;
$.ajax({
    url: "partials/mxGeo.json",
    async: false,
    success: function (data) {
        if (validaJsonMap(data)) {
            mxData = data;
            mapaMX();
        }
    }
});

function mapaMX() {
    map = L.map("mapMX").setView([24, -95], 5);

    L.tileLayer("https://api.mapbox.com/styles/v1/esaugtz/cir59as9a000xbpnip07r0nmp/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXNhdWd0eiIsImEiOiJjaWo5a3Y0b20wMDM0dHdrbjlmcjgxdjE3In0.mHs9D2ahn4a1hB5K9GChsg", {
        // maxZoom: 5,
        // minZoom: 5,
        // id: "mapbox.clear",
        name: "name_es"
    }).addTo(map);

    if (map || blockMap === true) {
        // $("#mapMX").unblock();
    }

    // Disable drag and zoom handlers.
    // map.dragging.disable();
    map.touchZoom.disable();
    // map.doubleClickZoom.disable();
    // map.scrollWheelZoom.disable();
    map.keyboard.disable();

    function getColor(d) {
        return d > 50 ? "#008261" :
            d > 40 ? "#049873" :
                d > 30 ? "#00af83" :
                    d > 20 ? "#00CC99" :
                        "#17f5bd";
    }

    function style(feature) {
        return {
            fillColor: getColor(feature.properties.porcentaje_pop),
            weight: 1,
            opacity: 1,
            color: "#FFFFFF",
            dashArray: "1",
            fillOpacity: 0.7
        };
    }

    L.geoJson(mxData, {style: style}).addTo(map);

    var geojson;
    // ... our listeners
    geojson = L.geoJson(mxData, {style: style}).addTo(map);

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }

    var dsblHov = false;

    function disableHover(e) {
        var dataPop = e.target.feature.properties;
        popup
            .setLatLng(e.latlng)
            .setContent("<h5 class='title-pop'><span>Estado: </span>" + dataPop.estado + "</h5><hr><h5>" + mxData.etiqueta_pop + " <b>" + dataPop.porcentaje_pop + "%</b></h5>")
            .openOn(map);

        if (dsblHov == false) {
            dsblHov = true;
            $("#mapMX .leaflet-right .leaflet-control").css("border-left", "1px solid #4D92DF");
            $(".leaflet-control-attribution").css("border", "none");

        } else {
            dsblHov = false;
            $("#mapMX .leaflet-right .leaflet-control").css("border", "none");
        }
        // console.log(dsblHov);
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: disableHover
        });
    }

    geojson = L.geoJson(mxData, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);

    var info = L.control();
    info.onAdd = function (map) {
        this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
        // this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        $(this._div).show();

        if (props) {
            this._div.innerHTML =
                "<h5 class='title-pop'><span>Estado: </span>" + props.estado + "</h5><hr>" +
                "<h5>" + mxData.etiqueta_info + " <b>" + props.valor_info + " </b></h5><hr>" +
                "<div id='chartPoints' style='margin-left: -25px;'></div>";

        } else {
            this._div.innerHTML = $(this._div).hide();
        }

        // timeseries Chart
        if (typeof props != "undefined") {
            var x = ["x"];
            var lb = [mxData.ejey];
            props.grafica.forEach(function (el) {
                x.push(el.tiempo + "-01-01");
                lb.push(el.valor);
            });
            var chart = c3.generate({
                bindto: "#chartPoints",
                size: {
                    width: 250,
                    height: 200
                },
                padding: {
                    right: 15
                },
                data: {
                    x: "x",
                    columns: [x, lb],
                    names: {
                        x: mxData.ejey
                    }
                },
                axis: {
                    x: {
                        type: "timeseries",
                        tick: {
                            format: "%Y"
                        },
                        label: {
                            text: mxData.ejex,
                            position: "outer-center"
                        }
                    },
                    y: {
                        label: {
                            text: mxData.ejey,
                            position: "outer-middle"
                        }
                    }
                },
                legend: {
                    show: false
                }
            });
        }  // Fin timeseries Chart


    };  // Fin info Update

    info.addTo(map);

    function highlightFeature(e) {
        if (!dsblHov) {
            // console.info("false");
            var layer = e.target;
            layer.setStyle({
                weight: 1,
                color: "#336699",
                dashArray: "",
                fillOpacity: 0.6
            });

            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }

            info.update(layer.feature.properties);
        }
    }

    // var geojson;

    // Blur de poligono
    function resetHighlight(e) {
        geojson.resetStyle(e.target);
        // info.update();
    }

    function onMapClick(e) {
        dsblHov = false;
        $("#mapMX .leaflet-right .leaflet-control").css("border", "none");
        info.update();
    }

    map.on("click", onMapClick);

    var legend = L.control({position: "bottomleft"});
    legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "info legend");
        var grades = [0, 10, 20, 30, 40, 50];
        var labels = [""];
        var from, to;

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
    var popup = L.popup();
}


// Valida Json
function validaJsonMap(json) {
    var valores = json["features"];
    var json_fields = ["type", "geometry", "properties"];
    var json_types = {"type": "string", "geometry": "object", "properties": "object"};

    /*
        var valores1 = json["features"],
        valores = valores1["properties"],
        json_fields = ["estado", "grafica", "porcentaje_pop","valor_info"];
        json_types = {"estado": "string", "grafica": "array", "porcentaje_pop": "number", "valor_info": "string"};
    */

    if (!json["etiqueta_info"]) {
        alert("Error en la estructura del JSON: Se necesita especificar la etiqueta de información");
        return false;
    }

    if (!json["etiqueta_pop"]) {
        alert("Error en la estructura del JSON: Se necesita especificar la etiqueta de popup");
        return false;
    }

    if (!json["ejex"]) {
        alert("Error en la estructura del JSON: Se necesita especificar la leyenda del eje X para la gráfica de información");
        return false;
    }

    if (!json["ejey"]) {
        alert("Error en la estructura del JSON: Se necesita especificar la leyenda del eje Y para la gráfica de información");
        return false;
    }

    for (var elemento in valores) {
        var llaves_elemento = Object.keys(valores[elemento]);
        for (var k in llaves_elemento) {
            if (!json_fields.some(elem => elem == llaves_elemento[k])) {
                alert("Error en la estructura del JSON: Campo invalido: " + llaves_elemento[k]);
                return false;
            }

            if (typeof valores[elemento][llaves_elemento[k]] !== json_types[llaves_elemento[k]]) {
                alert("Error en la estructura del JSON: El campo " + llaves_elemento[k] + " debe ser de tipo " + json_types[llaves_elemento[k]]);
                return false;
            }
        }
    }

    return true;
}
