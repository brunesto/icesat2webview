 import pako from 'pako'
 //import * as egm96 from 'egm96-universal'
 import { TextDecoder } from "./textdecoder.js"
 
 
 //const egm96=require('https://unpkg.com/egm96-universal')


 // TODO use CircleMarker, it will be faster
 const CircleMarkerWithZoom = L.Circle.extend({

     _updateBounds () {

         L.Circle.prototype._updateBounds.call(this)
         if (this._radius < 5) {
             this._radius = 5
             this._radiusY = 5
         }
     },


 });

 export class TilesMgr {


     constructor(config) {
          this.config=config
         this.tilesServerBbox = null

         this.tiles = new Object();

         this.okTiles = new Object()


         this.okTiles['2207/1388'] = true;
         this.okTiles['2207/1389'] = true;
         this.okTiles['2207/1390'] = true;


         this.okTiles['2208/1388'] = true;
         this.okTiles['2208/1389'] = true;
         this.okTiles['2208/1390'] = true;



         this.channelColors = new Object();

         this.channelColors['1l'] = '#ffd92f';
         this.channelColors['2l'] = '#e78ac3';
         this.channelColors['3l'] = '#fc8d62';
         this.channelColors['1r'] = '#a6d854';
         this.channelColors['2r'] = '#8da0cb';
         this.channelColors['3r'] = '#66c2a5';



         this.channel2beam = {

             '3r': 1,
             '3l': 2,
             '2r': 3,
             '2l': 4,
             '1r': 5,
             '1l': 6
         }
     }

     addTileMarker(yx, nodata) {
         var bounds = [
             [this.tile2lat(yx[0], TILE_DEF_ZL), this.tile2long(yx[1], TILE_DEF_ZL)],
             [this.tile2lat(yx[0] + 1, TILE_DEF_ZL),this. tile2long(yx[1] + 1, TILE_DEF_ZL)]
         ]
         var center = [this.tile2lat(yx[0] + 0.5, TILE_DEF_ZL), this.tile2long(yx[1] + 0.5, TILE_DEF_ZL)]
         var tileMarker = L.rectangle(bounds, {
             renderer:this.config.map.myRenderer,
             color: 'white',
             fillColor: nodata ? 'white' : 'transparent',
             weight: 1,
             opacity: 1,
             fillOpacity: 0.6

         })

         //tileMarker.bindTooltip(yx[1]+"/"+yx[0], {permanent: true});

         tileMarker.addTo(this.config.map.myMarkersGroup);

         var label = nodata ? "no data for this area" : (yx[1] + "/" + yx[0])
         var myIcon = L.divIcon({ className: 'tilePath-' + (nodata ? "nodata" : "DEV"), html: label });
         L.marker(center, { icon: myIcon }).addTo(this.config.map.myMarkersGroup);


     }

     records2string(ds) {
         var info = "<table><tbody>"
             //info += '<table class="table"><th><td>src</td><td>elevation</td><td></td><td>canopy</td><td>channel</td><td>UTC</td></th><tbody>'
         for (var i in ds) {
             info += "\n" +this. record2string(ds[i])
         }
         info += "</tbody></table>"
         return info;
     }

     record2string(d) {

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

         var ms = (315964800 + 1198800000 + time)
         var date = new Date(1000 * ms)
             // //console.log("record2string:" + date)



         var egmInfo = 'egm96 not downloaded';//<span class="waiting"></span> downloading... (egm96)'
         if (window.egm96)
             egmInfo = window.egm96.ellipsoidToEgm96(lat, lon, amsl).round(1)+" m (egm96)" 


         var direction = d[8]
         var segmentCoords = this.getSegmentCoords(direction, latLng, 0.9);

         var minx = Math.min(segmentCoords[0][1], segmentCoords[1][1])
         var maxx = Math.max(segmentCoords[0][1], segmentCoords[1][1])
         var miny = Math.min(segmentCoords[0][0], segmentCoords[1][0])
         var maxy = Math.max(segmentCoords[0][0], segmentCoords[1][0])


         var r =
             '<tr><th>Track id:</th><td>' + rgt + "</td></tr>" +
             "<tr><th>Lat,Lon:</th><td>" + lat + "," + lon + "</td></tr>" +
             '<tr><th>Elevation:</th><td>' + amsl + " m (wgs84)" +
             '</br>' + egmInfo +
             "</td></tr>" +
             "<tr><th>Time:</th><td>" + date.toISOString() + "</td></tr>" +

             "<tr><th>Beam:</th><td>gt" + channel + " " + direction + "</td></tr>" +

             "<tr><th>h_canopy:</th><td>" + canopy + " m" + "</td></tr>" +
             "<tr><th></th><td><a target=\"atl08\" href=" +
             '"' +
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
             '"' +
             'rel="noreferrer noopener"' + // avoid js error when changing data in photon data
             ">ATL03 Photon Height</a></td></tr>" +

             "";
         return r
     }



     // get the segment delta lat/lon
     // direction:either 'n' or 's'
     // latLng:coords of the ATL08 point
     // ratio:proportional size of segment 1 =100%
     // NOTE: this is a hacky impl - will probably not work for high lats
     getSegmentDLatLon(direction, latLng, ratio) {
         var dlat = 0.00042 * ratio;
         var dlatlonratio = 0.0000649 / 0.00044
         if (direction == 's')
             dlatlonratio = -dlatlonratio
         var dlon = dlat * dlatlonratio;
         return [dlat, dlon]
     }

     getSegmentCoords(direction, latLng, ratio) {
         var dSegmentLatLng = this.getSegmentDLatLon(direction, latLng, ratio)
         var segmentCoords = [
             [latLng[0] + dSegmentLatLng[0], latLng[1] - dSegmentLatLng[1]],
             [latLng[0] - dSegmentLatLng[0], latLng[1] + dSegmentLatLng[1]]
         ];
         return segmentCoords;

     }

     addDataMarker(ds) {


         var latLng = [parseFloat(ds[0][4]), parseFloat(ds[0][5])]
         if (ds[0][3] == 24762270.185411237) {
             //console.log("more!" + ds);
         }


         //  //console.log("latLng:" + (d[2]))
         var channel = ds[0][1]

         var channelColor = this.channelColors[channel]
             //console.log("channel:" + channel + " channelColor:" + channelColor)

         if (channelColor == undefined)
             channelColor = "red"

         var direction = ds[0][8]
         var segmentCoords = this.getSegmentCoords(direction, latLng, 0.9);



         var polyline = L.polyline(segmentCoords, {
             color: channelColor,
             weight: 3
         });


         var circleMarker = new CircleMarkerWithZoom(latLng, {
             renderer:this.config.map.myRenderer,
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


         const thisMap=this
         // set popup info and add to map
         // polyline.bindPopup(info);

         var f = (e) => {
            L.DomEvent.stopPropagation(e);
            console.log("egm96:", window["egm96"])

             var popup = L.popup()
                 .setLatLng(latLng)
                 .setContent(this.records2string(ds))
                 .openOn(this.config.map.myMap);


            //  import ('egm96-universal').then((egm96) => {
            //      console.log("egm96-universal ready",egm96.ellipsoidToEgm96)
            //      popup.setContent(thisMap.records2string(ds, egm96.ellipsoidToEgm96))
            //  }).catch(error => 'An error occurred while loading the component')


             // if (popup.isOpen()){
             //popup.closePopup();

             //popup.openOn(this.config.map.myMap);
             //  }    

         }
         polyline.on('click', f)
         polyline.addTo(this.config.map.myMarkersGroup);
         circleMarker.on('click', f)
         circleMarker.addTo(this.config.map.myMarkersGroup);

     }



     filterTile(yx) {
         return true
             /*var key = yx[1] + "/" + yx[0]
             var r = okTiles[key] == true
             //console.log("filterTile " + yx + " is " + r)
             return r*/

     }

     loadTile(yx) {

         var path = TILES_ROOT + TILE_DEF_ZL + "/" + yx[1] + "/" + yx[0] + ".csv.gz"

         // path = "tiles/11/1101/678.csv.gz"
         //console.log("loadTile " + path);

         if (DEV) {
            this.addTileMarker(yx, false,this.config.map.myRenderer, this.config.map.myMarkersGroup)
         }


         if (this.filterTile(yx)) {






             var oReq = new XMLHttpRequest();
             oReq.open("GET", path, true);
             oReq.responseType = "arraybuffer";

             oReq.onload = (oEvent)=> {
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
                             this.processTile(gunziped.split("\n"))
                     } catch (error) {
                         console.log("" + path + " exception:", error)
                         this.tiles[yx] = 'e'
                     }
                     //var blob = new Blob([arrayBuffer], {type: "image/png"});
                     //var url = URL.createObjectURL(blob);
                     //someImageElement.src = url;

                     // whatever...
                     this.tiles[yx] = 'ok'
                 } else {
                    this.addTileMarker(yx, true,this.config.map.myRenderer, this.config.map.myMarkersGroup)
                 }
                 this.tiles[yx] = 'status ' + oReq.status
             };
             oReq.onerror = (oEvent) =>{
                 console.log("" + path + " req.onerror:", oEvent)
                 this.tiles[yx] = 'x'
             }
             oReq.send();










             /*

                             $.get(path,  (data) {
                                 //console.log("yx" + yx + " " + typeof data); // string
                                 //console.log(btoa(data))


                                 for (var i = 0; i < 32; i++)
                                     //console.log(data.get(i).toString(16))


                                 gunziped = pako.inflate(data, { raw: true });
                                 processTile(gunziped.split("\n"))

                             }).fail( (e) {
                                 //console.log("error", e);
                             })
             */
         }

     }



     processTile(lines) {
         console.log("processTile");

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
         console.log("add markers");
         for (latLng in coords2data) {
            this.addDataMarker(coords2data[latLng])
         }
         //console.log("done");
     }


     // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
     lon2tile(lon, zoom) { return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom))); }

     lat2tile(lat, zoom) { return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))); }

     // used by addTileMarker
     tile2long(x, z) {
             return (x / Math.pow(2, z) * 360 - 180);
         }
         // used by addTileMarker 
     tile2lat(y, z) {
         var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
         return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
     }


     maybeLoadTile(yx) {
         const loaded=(yx in this.tiles)
         console.log("maybeLoadTile " + yx[1] + "/" + yx[0]+" already loaded:"+loaded)
         if (!loaded) { // 1048576
            this.tiles[yx] = 'L'
             this. loadTile(yx)
         }
     }

     maybeLoadTiles() {
         console.log("maymaybeLoadTiles zl:" + this.config.map.myMap.getZoom(), this.config.map.myMap.getBounds().getSouthWest())
         if (this.config.map.myMap.getZoom() < TILE_LOAD_FROM_ZL)
             return

         var bbox = this.config.map.myMap.getBounds()

         var minty = this.lat2tile(bbox.getNorthEast().lat, TILE_DEF_ZL)
         var mintx = this.lon2tile(bbox.getSouthWest().lng, TILE_DEF_ZL)
         var maxty = this.lat2tile(bbox.getSouthWest().lat, TILE_DEF_ZL)
         var maxtx = this.lon2tile(bbox.getNorthEast().lng, TILE_DEF_ZL)

         for (var x = mintx; x <= maxtx; x++)
             for (var y = minty; y <= maxty; y++)
             this.maybeLoadTile([y, x])



     }


     //  bbox=__non_webpack_require__('tiles/bbox11.json');
     //  console.log("bbox"+bbox)

     initTiles(ready) {

        //  var oReq = new XMLHttpRequest();
        //  oReq.open("GET", global.TILES_ROOT + "bbox.json", true);
        //  oReq.onload = (oEvent) =>{
        //      if (oReq.status == 200 || oReq.status == 304) {
        //          this.tilesServerBbox = JSON.parse(this.responseText);
        //      }
        //      console.log("tilesServerBbox:", this.tilesServerBbox)
        //      ready();
        //  };
        //  oReq.onerror = (oEvent) =>{
        //      console.log("failed to get tilesServerBbox:", oEvent)
        //      ready();
        //  }
        //  oReq.send();


         ready();
     }
 }