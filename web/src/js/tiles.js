 import pako from 'pako'
 //import * as egm96 from 'egm96-universal'
 import { TextDecoder } from "./textdecoder.js"


 // TODO use CircleMarker, it will be faster
 const CircleMarkerWithZoom = L.Circle.extend({

     _updateBounds: function() {
         L.Circle.prototype._updateBounds.call(this)
         if (this._radius < 5) {
             this._radius = 5
             this._radiusY = 5
         }
     },


 });



 function addTileMarker(yx, myRenderer, myMarkersGroup) {
     var bounds = [
         [tile2lat(yx[0], TILE_DEF_ZL), tile2long(yx[1], TILE_DEF_ZL)],
         [tile2lat(yx[0] + 1, TILE_DEF_ZL), tile2long(yx[1] + 1, TILE_DEF_ZL)]
     ]
     var tileMarker = L.rectangle(bounds, {
         renderer: myRenderer,
         color: 'blue',
         fillColor: 'transparent',
         weight: 1,
         opacity: 0.3

     })

     //tileMarker.bindTooltip(yx[1]+"/"+yx[0], {permanent: true});

     tileMarker.addTo(myMarkersGroup);

     var myIcon = L.divIcon({ className: 'tilePath', html: yx[1] + "/" + yx[0] });
     L.marker(bounds[0], { icon: myIcon }).addTo(myMarkersGroup);


 }

 function records2string(ds, useEgm96) {
     var info = "<table><tbody>"
         //info += '<table class="table"><th><td>src</td><td>elevation</td><td></td><td>canopy</td><td>channel</td><td>UTC</td></th><tbody>'
     for (var i in ds) {
         info += "\n" + record2string(ds[i], useEgm96)
     }
     info += "</tbody></table>"
     return info;
 }

 function record2string(d, ellipsoidToEgm96) {

     var src = d[0]
     var channel = d[1]
     var rgt = d[2]

     var time = parseFloat(d[3])
     var amsl = parseFloat(d[6]).toFixed(1)
     var canopy = parseFloat(d[7]).toFixed(1)
     var direction = d[8]

     var lat = parseFloat(d[4])
     var lon = parseFloat(d[5])
     var latLng = [lat, lon]

     var ms=(315964800 + 1198800000 + time)
     var date = new Date(1000 * ms)
         // //console.log("record2string:" + date)



     var egmInfo = "<span class=\"waiting\"></span>"
     if (ellipsoidToEgm96)
         egmInfo = ellipsoidToEgm96(lat, lon, amsl).round(1)


     var direction = d[8]
     var segmentCoords = getSegmentCoords(direction, latLng, 0.9);

     var minx = Math.min(segmentCoords[0][1], segmentCoords[1][1])
     var maxx = Math.max(segmentCoords[0][1], segmentCoords[1][1])
     var miny = Math.min(segmentCoords[0][0], segmentCoords[1][0])
     var maxy = Math.max(segmentCoords[0][0], segmentCoords[1][0])


     var r =
         '<tr><th>Track id:</th><td>' + rgt + "</td></tr>" +
         "<tr><th>Lat,Lon:</th><td>" + lat + "," + lon + "</td></tr>" +
         '<tr><th>Elevation:</th><td>' + amsl + " m (wgs84)" +
         '</br>' + egmInfo + " m (egm96)" +
         "</td></tr>" +
         "<tr><th>Time:</th><td>" + date.toISOString() + "</td></tr>" +

         "<tr><th>Beam:</th><td>gt" + channel + " " + direction + "</td></tr>" +

         "<tr><th>h_canopy:</th><td>" + canopy + " m" + "</td></tr>" +
         "<tr><th></th><td><a target=\"atl08\" href=" +
         '"'+
         'https://openaltimetry.org/data/icesat2/elevation' +
         '?minx=' + minx +
         '&miny=' + miny +
         '&maxx=' + maxx +
         '&maxy=' + maxy +
         '&zoom_level=16' +
         '&beams=1,2,3,4,5,6' +
         '&tracks=' + rgt +
         '&date=' + date.toISOString().substr(0, 10) +
         '&product=ATL08' +
         '&mapType=geographic' +
         '&tab=photon' +
         '"'+
         ">ATL03 Photon Height</a></td></tr>" +

         "";
     return r
 }

 var channelColors = new Object();

 channelColors['1l'] = '#ffd92f';
 channelColors['2l'] = '#e78ac3';
 channelColors['3l'] = '#fc8d62';
 channelColors['1r'] = '#a6d854';
 channelColors['2r'] = '#8da0cb';
 channelColors['3r'] = '#66c2a5';



 // get the segment delta lat/lon
 // direction:either 'n' or 's'
 // latLng:coords of the ATL08 point
 // ratio:proportional size of segment 1 =100%
 // NOTE: this is a hacky impl - will probably not work for high lats
 function getSegmentDLatLon(direction, latLng, ratio) {
     var dlat = 0.00042 * ratio;
     var dlatlonratio = 0.0000649 / 0.00044
     if (direction == 's')
         dlatlonratio = -dlatlonratio
     var dlon = dlat * dlatlonratio;
     return [dlat, dlon]
 }

 function getSegmentCoords(direction, latLng, ratio) {
     var dSegmentLatLng = getSegmentDLatLon(direction, latLng, ratio)
     var segmentCoords = [
         [latLng[0] + dSegmentLatLng[0], latLng[1] - dSegmentLatLng[1]],
         [latLng[0] - dSegmentLatLng[0], latLng[1] + dSegmentLatLng[1]]
     ];
     return segmentCoords;

 }

 function addDataMarker(ds, myMap, myRenderer, myMarkersGroup) {


     var latLng = [parseFloat(ds[0][4]), parseFloat(ds[0][5])]
     if (ds[0][3] == 24762270.185411237) {
         //console.log("more!" + ds);
     }


     //  //console.log("latLng:" + (d[2]))
     var channel = ds[0][1]

     var channelColor = channelColors[channel]
         //console.log("channel:" + channel + " channelColor:" + channelColor)

     if (channelColor == undefined)
         channelColor = "red"

     var direction = ds[0][8]
     var segmentCoords = getSegmentCoords(direction, latLng, 0.9);



     var polyline = L.polyline(segmentCoords, {
         color: channelColor,
         weight: 3
     });


     var circleMarker = new CircleMarkerWithZoom(latLng, {
         renderer: myRenderer,
         color: "black",
         fillColor: channelColor,
         radius: 10,
         weight: 1,
         opacity: 1,
         fillOpacity: 1,
     })

     circleMarker.getRadius = () => {
         return 20;
     }



     // set popup info and add to map
     // polyline.bindPopup(info);

     var f = () => {



         var popup = L.popup()
             .setLatLng(latLng)
             .setContent(records2string(ds, false))
             .openOn(myMap);


         import ('egm96-universal').then((egm96) => {
             popup.setContent(records2string(ds, egm96.ellipsoidToEgm96))
         }).catch(error => 'An error occurred while loading the component')


         // if (popup.isOpen()){
         //popup.closePopup();

         //popup.openOn(myMap);
         //  }    

     }
     polyline.on('click', f)
     polyline.addTo(myMarkersGroup);
     circleMarker.on('click', f)
     circleMarker.addTo(myMarkersGroup);

 }

 const okTiles = new Object()


 okTiles['2207/1388'] = true;
 okTiles['2207/1389'] = true;
 okTiles['2207/1390'] = true;


 okTiles['2208/1388'] = true;
 okTiles['2208/1389'] = true;
 okTiles['2208/1390'] = true;


 function filterTile(yx) {
     return true
         /*var key = yx[1] + "/" + yx[0]
         var r = okTiles[key] == true
         //console.log("filterTile " + yx + " is " + r)
         return r*/

 }

 function loadTile(yx, myMap, myRenderer, myMarkersGroup) {

     var path = TILES_ROOT + TILE_DEF_ZL + "/" + yx[1] + "/" + yx[0] + ".csv.gz"

     // path = "tiles/11/1101/678.csv.gz"
     //console.log("loadTile " + path);

     if (DEV) {
         addTileMarker(yx, myRenderer, myMarkersGroup)
     }


     if (filterTile(yx)) {






         var oReq = new XMLHttpRequest();
         oReq.open("GET", path, true);
         oReq.responseType = "arraybuffer";

         oReq.onload = function(oEvent) {
             console.log("got response " + oReq.status + " " + path)

             if (oReq.status == 200 || oReq.status == 304) {

                 try {
                     var arrayBuffer = oReq.response;

                     // if you want to access the bytes:
                     var byteArray = new Uint8Array(arrayBuffer);
                     var inflatedUint8array = pako.inflate(byteArray);
                     var gunziped = new TextDecoder().decode(inflatedUint8array)
                         //console.log("gunziped type",typeof gunziped)
                         //console.log("gunziped",gunziped)
                     processTile(gunziped.split("\n"), myMap, myRenderer, myMarkersGroup)
                 } catch (error) {
                     console.log("" + path + " exception:", error)
                     tiles[yx] = 'e'
                 }
                 //var blob = new Blob([arrayBuffer], {type: "image/png"});
                 //var url = URL.createObjectURL(blob);
                 //someImageElement.src = url;

                 // whatever...
                 tiles[yx] = 'ok'
             }
             tiles[yx] = 'status ' + oReq.status
         };
         oReq.onerror = function(oEvent) {
             console.log("" + path + " req.onerror:", oEvent)
             tiles[yx] = 'x'
         }
         oReq.send();










         /*

                         $.get(path, function (data) {
                             //console.log("yx" + yx + " " + typeof data); // string
                             //console.log(btoa(data))


                             for (var i = 0; i < 32; i++)
                                 //console.log(data.get(i).toString(16))


                             gunziped = pako.inflate(data, { raw: true });
                             processTile(gunziped.split("\n"))

                         }).fail(function (e) {
                             //console.log("error", e);
                         })
         */
     }

 }



 function processTile(lines, myMap, myRenderer, myMarkersGroup) {
     //console.log("regroup");

     var coords2data = new Object()
     for (var j = 0; j < lines.length; j++) {
         var line = lines[j]
         var d = line.split(";")
         var latLng = [parseFloat(d[4]), parseFloat(d[5])]
         if (d[3] == 24762270.185411237) {
             //console.log("more!" + coords2data[latLng] + " d:" + d);
         }
         if (!isNaN(latLng[0])) {
             if (!(latLng in coords2data)) {
                 coords2data["" + latLng] = []
             } else {
                 //console.log("...");
             }
             coords2data["" + latLng].push(d) // CAPTCHA
         }

     }
     //console.log("add markers");
     for (latLng in coords2data) {
         addDataMarker(coords2data[latLng], myMap, myRenderer, myMarkersGroup)
     }
     //console.log("done");
 }


 // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
 function lon2tile(lon, zoom) { return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom))); }

 function lat2tile(lat, zoom) { return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))); }

 // used by addTileMarker
 function tile2long(x, z) {
     return (x / Math.pow(2, z) * 360 - 180);
 }
 // used by addTileMarker 
 function tile2lat(y, z) {
     var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
     return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
 }

 var tiles = new Object();

 function maybeLoadTile(yx, myMap, myRenderer, myMarkersGroup) {
     //console.log("maybeLoadTile " + yx[1] + "/" + yx[0])
     if (!(yx in tiles)) { // 1048576
         tiles[yx] = 'L'
         loadTile(yx, myMap, myRenderer, myMarkersGroup)
     }
 }

 export function maybeLoadTiles(myMap, myRenderer, myMarkersGroup) {
     //console.log("maymaybeLoadTiles zl:" + myMap.getZoom(), myMap.getBounds().getSouthWest())
     if (myMap.getZoom() < TILE_LOAD_FROM_ZL)
         return

     var bbox = myMap.getBounds()

     var minty = lat2tile(bbox.getNorthEast().lat, TILE_DEF_ZL)
     var mintx = lon2tile(bbox.getSouthWest().lng, TILE_DEF_ZL)
     var maxty = lat2tile(bbox.getSouthWest().lat, TILE_DEF_ZL)
     var maxtx = lon2tile(bbox.getNorthEast().lng, TILE_DEF_ZL)

     for (var x = mintx; x <= maxtx; x++)
         for (var y = minty; y <= maxty; y++)
             maybeLoadTile([y, x], myMap, myRenderer, myMarkersGroup)



 }