import 'leaflet/dist/leaflet.css'
import 'leaflet.pancontrol/src/L.Control.Pan.css'
// CAPTCHA : import leaflet is not required as it is transitively loaded from leaflet.pancontrol
import 'leaflet.pancontrol'
import 'leaflet-minimap'
import 'leaflet-minimap/dist/Control.MiniMap.min.css';
import Cookies from 'js-cookie'

import '../styles/map.css'


// according to https://github.com/btpschroeder/leaflet-webpack/blob/master/src/index.js
// This code is needed to properly load the images in the Leaflet CSS 
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});









export var myMap;
export var myRenderer;
export var myMarkersGroup;
var marker;


export function updatePos(lat, lon, zoom, mark) {
    console.log("updatePos(" + lat + " , " + lon + "," + zoom + "," + mark + ")")
    if (mark) {
        if (marker != undefined)
            myMap.removeLayer(marker)
        marker = L.marker([lat, lon]);
        marker.addTo(myMap)
        marker.on("click", () => { myMap.removeLayer(marker) })
    }

    myMap.setView([lat, lon], zoom)

    persistCoords()


}

function showHideMarkerGroup() {
    if (myMap.getZoom() < TILE_SHOW_FROM_ZL) {
        mediator.alertInfo("Zoom in to display <br/> Icesat2 data")
        myMap.removeLayer(myMarkersGroup);
    } else {
        mediator.alertInfo("")
        myMap.addLayer(myMarkersGroup);
    }
}


var tileLayers = {}



export function initMap(config) {
    myMap = L.map('map', { fadeAnimation: false }).setView([50, 14], 13);

    myRenderer = L.canvas({ padding: 0.5 });


    L.control.scale().addTo(myMap);
    L.control.pan().addTo(myMap);

    // add the OpenStreetMap tiles
    const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    const osmAttribution = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    var osmTileLayer = L.tileLayer(osmUrl, {
        maxZoom: 19,
        attribution: osmAttribution
    })
    tileLayers["osm"] = osmTileLayer;

    var MAX_ZOOM=19

    var mapBoxTileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYnJ1bmVzdG8iLCJhIjoiY2lvNGowMmx4MDAycXZ5a3A0aXdqZTZjbCJ9.0kHXvJmsETs_QzfXfQv9mw', {
        
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/outdoors-v11',
        tileSize: 512,
        zoomOffset: -1,
        maxNativeZoom: 18,
        maxZoom: MAX_ZOOM
    })
    tileLayers["outdoors"] = mapBoxTileLayer;
    //  mapBoxTileLayer.addTo(myMap)


    var mapLink =
        '<a href="http://www.esri.com/">Esri</a>';
    var wholink =
        'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    var esriTileLayer = L.tileLayer(
        'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; ' + mapLink + ', ' + wholink,
            maxNativeZoom: 17,
            maxZoom: MAX_ZOOM
        })
    tileLayers["aerial"] = esriTileLayer;


    var CartoDB_LightMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxNativeZoom: 19,
        maxZoom: MAX_ZOOM
    });
    tileLayers["light"] = CartoDB_LightMatter;


    var CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxNativeZoom: 19,
        maxZoom: MAX_ZOOM
    });
    tileLayers["dark"] = CartoDB_DarkMatter;









    //var esriTileLayer=L.tileLayer.provider('Stamen.Watercolor')               
    //var switchBtn = L.control.layers({ "mapbox": mapBoxTileLayer, "satellite": esriTileLayer, "osm": osmTileLayer })
    //switchBtn.addTo(myMap);

    myMarkersGroup = new L.FeatureGroup();
    myMap.addLayer(myMarkersGroup);

    myMap.on('zoomend', function() {
        persistCoords();
        showHideMarkerGroup()
    })
    myMap.on('moveend', () => {

        persistCoords();
        config.maybeLoadTiles();
    })


    var osm2 = new L.TileLayer(osmUrl, { minZoom: 0, maxZoom: 13, attribution: osmAttribution });
    var miniMap = new L.Control.MiniMap(osm2).addTo(myMap);

    // maybeLoadTiles()
    showHideMarkerGroup()



    var prevLat = Cookies.get('lat')
    if (prevLat) {
        var prevLon = Cookies.get('lon')
        var prevZoom = Cookies.get('zoom')
        updatePos(prevLat, prevLon, prevZoom, false)
    }

}

function persistCoords() {
    var coords = myMap.getCenter()
    Cookies.set('lat', coords.lat);
    Cookies.set('lon', coords.lng);
    Cookies.set('zoom', myMap.getZoom());
}

var currentTileLayer = null
export function switchLayer(layerName) {
    console.log("switchLayer " + layerName)
    if (currentTileLayer != null)
        myMap.removeLayer(tileLayers[currentTileLayer]);

    if (layerName != null) {
        currentTileLayer = layerName
        myMap.addLayer(tileLayers[layerName]);
    }
}