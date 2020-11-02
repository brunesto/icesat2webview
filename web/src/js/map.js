
import 'leaflet/dist/leaflet.css'
import 'leaflet.pancontrol/src/L.Control.Pan.css'
// CAPTCHA : import leaflet is not required as it is transitively loaded from leaflet.pancontrol
import 'leaflet.pancontrol'
import 'leaflet-minimap'
import 'leaflet-minimap/dist/Control.MiniMap.min.css';


import '../styles/map.css'

/*
// according to https://github.com/btpschroeder/leaflet-webpack/blob/master/src/index.js
// This code is needed to properly load the images in the Leaflet CSS 
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
*/








export var myMap;
export var myRenderer;
export var myMarkersGroup;
var marker;


function updatePos(lat, lon) {
    console.log("updatePos(" + lat + " , " + lon + ")")
    if (marker != undefined)
        myMap.removeLayer(marker)
    marker = L.marker([lat, lon]);
    marker.addTo(myMap)
    myMap.setView([lat, lon], 18)
}

function showHideMarkerGroup() {
    if (myMap.getZoom() < TILE_SHOW_FROM_ZL) {
        alertInfo("&#9888; Zoom in to display data")
        myMap.removeLayer(myMarkersGroup);
    } else {
        mediator. alertInfo("")
        myMap.addLayer(myMarkersGroup);
    }
}





        // https://www.w3schools.com/html/html5_geolocation.asp

        function getLocation() {
            try {
                if (navigator.geolocation) {

                    $("#coordsWarn").hide();


                } else {
                    $("#coordsWarn").show();
                }
            } catch (e) {
                console.error(e);
            }

        }

        



        function showPosition(position) {
            console.log("showPosition(" + new Date().toLocaleTimeString() + ")")
            updatePos(position.coords.latitude, position.coords.longitude);
        }



export function initMap(config) {
    myMap = L.map('map', { fadeAnimation: false }).setView([50, 14], 13);

    myRenderer = L.canvas({ padding: 0.5 });


    L.control.scale().addTo(myMap);
    L.control.pan().addTo(myMap);

    // add the OpenStreetMap tiles
    const osmUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    const osmAttribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    var osmTileLayer = L.tileLayer(osmUrl, {
        maxZoom: 19,
        attribution: osmAttribution
    })




    var mapBoxTileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYnJ1bmVzdG8iLCJhIjoiY2lvNGowMmx4MDAycXZ5a3A0aXdqZTZjbCJ9.0kHXvJmsETs_QzfXfQv9mw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1
    })
    mapBoxTileLayer.addTo(myMap)


    var mapLink =
        '<a href="http://www.esri.com/">Esri</a>';
    var wholink =
        'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    var esriTileLayer = L.tileLayer(
        'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; ' + mapLink + ', ' + wholink,
            maxZoom: 18,
        })


    //var esriTileLayer=L.tileLayer.provider('Stamen.Watercolor')               
    var switchBtn = L.control.layers({ "mapbox": mapBoxTileLayer, "satellite": esriTileLayer, "osm": osmTileLayer })
    switchBtn.addTo(myMap);

    myMarkersGroup = new L.FeatureGroup();
    myMap.addLayer(myMarkersGroup);

    myMap.on('zoomend', function() { showHideMarkerGroup() })
    myMap.on('moveend', config.maybeLoadTiles) // CAPTCHA do not call, just pass ref


    var osm2 = new L.TileLayer(osmUrl, {minZoom: 0, maxZoom: 13, attribution: osmAttribution});
    var miniMap = new L.Control.MiniMap(osm2).addTo(myMap);

   // maybeLoadTiles()
    showHideMarkerGroup()

    $("#locateBtn").click(function () { getLocation(); });
    $("#polygonBtn").click(function () { savePoly(); });
    $("#gotoCoordsBtn").click(function () { gotoCoords(); });
}


function gotoCoords() {
    var latLon = prompt("go to lat,lon? (e.g 50.1,14.2)", "");

    if (latLon != null) {
        var tokens = latLon.split(",")
        if (tokens.length == 1)
            tokens = latLon.split(";")



        updatePos(tokens[0], tokens[1]);
    }
}
function savePoly() {

    var bb = myMap.getBounds();


    var r =
        '{"type": "Feature","geometry": { "type": "Polygon", "coordinates": [[' +
        "\n[" + bb.getNorthEast().lng + "," + bb.getNorthEast().lat + "]," +
        "\n[" + bb.getSouthWest().lng + "," + bb.getNorthEast().lat + "]," +
        "\n[" + bb.getSouthWest().lng + "," + bb.getSouthWest().lat + "]," +
        "\n[" + bb.getNorthEast().lng + "," + bb.getSouthWest().lat + "]," +
        "\n[" + bb.getNorthEast().lng + "," + bb.getNorthEast().lat + "]" +
        '\n]]}, "properties": {}}';


    var blob = new Blob([r], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "ice2web.poly.json");


}

