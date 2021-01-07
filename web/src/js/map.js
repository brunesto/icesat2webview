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








/*
export var this.myMap;
export var this.myRenderer;
export varthis. myMarkersGroup;

*/

export class Map {


    currentTileLayer = null
    tileLayers = {}

    myMap = null
    myRenderer = null
    myMarkersGroup = null



    updatePos(lat, lon, zoom, marker) {
        if (zoom == null) //   The standard way to catch null and undefined simultaneously
            zoom = this.myMap.getZoom()
        console.log("updatePos(" + lat + " , " + lon + "," + zoom + "," + marker + ")")
        if (marker != null) {
            var popup = L.popup()
                .setLatLng([lat, lon])
                .setContent('<i class="material-icons">' + marker + '</i><br/>' + lat.toFixed(5) + ",<br/>" + lon.toFixed(5))
                .openOn(this.myMap);

            // if (this.marker != undefined)
            //     this.myMap.removeLayer(marker)
            // this.marker = L.marker([lat, lon]);
            // this.marker.addTo(this.myMap)
            // this.marker.on("click", () => { this.myMap.removeLayer(marker) })
        }

        this.myMap.setView([lat, lon], zoom)

        this.persistCoords()


    }

    setAtl08LayerVisible(b) {
        if (b)
            this.myMap.addLayer(this.myMarkersGroup);
        else
            this.myMap.removeLayer(this.myMarkersGroup);

    }
    popupString(lat, lon) {


        var info = "There is no ATL08 marker at this location<table><tbody>" +
            "<tr><th>Lat,Lon:</th><td>" + lat.toFixed(6) + "," + lon.toFixed(6) + "</td></tr>" +
            "</tbody></table>"
        return info;
    }


    constructor(config) {
        this.config = config
        const thisMap = this
        this.myMap = L.map('map', { fadeAnimation: false }).setView([50, 14], 13);

        this.myRenderer = L.canvas({ padding: 0.5 });


        L.control.scale().addTo(this.myMap);
        L.control.pan().addTo(this.myMap);

        // add the OpenStreetMap tiles
        const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        const osmAttribution = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        var osmTileLayer = L.tileLayer(osmUrl, {
            maxZoom: 19,
            attribution: osmAttribution
        })
        this.tileLayers["osm"] = osmTileLayer;

        var MAX_ZOOM = 19

        const mapBoxToken = 'pk.eyJ1IjoiYnJ1bmVzdG8iLCJhIjoiY2tpanlnNzZiMDRvNjJ5cGtuY3B5MXBmMiJ9.iQiEpqelaEus9zgHxe7xfQ'
        var mapBoxTileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapBoxToken, {

            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox/outdoors-v11',
            tileSize: 512,
            zoomOffset: -1,
            maxNativeZoom: 18,
            maxZoom: MAX_ZOOM
        })
        this.tileLayers["outdoors"] = mapBoxTileLayer;
        //  mapBoxTileLayer.addTo(this.myMap)


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
        this.tileLayers["aerial"] = esriTileLayer;


        var CartoDB_LightMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxNativeZoom: 19,
            maxZoom: MAX_ZOOM
        });
        this.tileLayers["light"] = CartoDB_LightMatter;


        var CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxNativeZoom: 19,
            maxZoom: MAX_ZOOM
        });
        this.tileLayers["dark"] = CartoDB_DarkMatter;

        if (DEV) {
            // https://gis.stackexchange.com/questions/149062/display-tile-grid-borders-with-leaflet-visual-debugging?newreg=06a9740ea5094fadb0ac8c73816dbc5d
            L.GridLayer.GridDebug = L.GridLayer.extend({
                createTile: function(coords) {
                    const tile = document.createElement('div');
                    tile.style.zIndex = -100;
                    tile.style.outline = '1px dashed lime';
                    tile.style.color = 'lime';
                    tile.style.fontWeight = 'bold';
                    tile.style.fontSize = '12pt';
                    tile.style.fontFamily = 'monospace';
                    tile.innerHTML = "&nbsp;@" + coords.z + " x:" + coords.x + " y:" + coords.y
                    return tile;
                },
            });
            const debugLayer = new L.GridLayer.GridDebug({});
            debugLayer.setZIndex(1000)
            this.myMap.addLayer(debugLayer)
        }

        //var esriTileLayer=L.tileLayer.provider('Stamen.Watercolor')               
        //var switchBtn = L.control.layers({ "mapbox": mapBoxTileLayer, "satellite": esriTileLayer, "osm": osmTileLayer })
        //switchBtn.addTo(this.myMap);

        this.myMarkersGroup = new L.LayerGroup();
        this.myMap.addLayer(this.myMarkersGroup);

        this.myMap.on('zoomend', function() {
            thisMap.persistCoords();
            thisMap.config.mediator.showHideMarkersGroup()
        })
        this.myMap.on('moveend', () => {
            console.log("map:moveend")
            thisMap.persistCoords();
            thisMap.config.maybeLoadTiles();
        })


        var osm2 = new L.TileLayer(osmUrl, { minZoom: 0, maxZoom: 13, attribution: osmAttribution });
        var miniMap = new L.Control.MiniMap(osm2).addTo(this.myMap);




        // this.myMap.on('click', function(e) {
        //     var latLng = e.latlng;
        //     console.log('map click',e)

        //     var popup = L.popup()
        //         .setLatLng(latLng)
        //         .setContent(thisMap.popupString(latLng.lat,latLng.lng))
        //         .openOn(thisMap.myMap);
        // });

    }

    launch() {




        var prevLat = Cookies.get('lat')
        if (prevLat) {
            var prevLon = Cookies.get('lon')
            var prevZoom = Cookies.get('zoom')
            this.updatePos(parseFloat(prevLat), parseFloat(prevLon), parseInt(prevZoom), null)
        }
    }

    persistCoords() {
        var coords = this.myMap.getCenter()
        Cookies.set('lat', coords.lat);
        Cookies.set('lon', coords.lng);
        Cookies.set('zoom', this.myMap.getZoom());
    }


    switchLayer(layerName) {
        console.log("switchLayer " + layerName)
        if (this.currentTileLayer != null)
            this.myMap.removeLayer(this.tileLayers[this.currentTileLayer]);

        if (layerName != null) {
            this.currentTileLayer = layerName
            this.myMap.addLayer(this.tileLayers[layerName]);
        }
    }
}