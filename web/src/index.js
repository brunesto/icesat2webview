import './styles/body.css';
import './js/global.js';
//import { initMap, myMap, myRenderer, myMarkersGroup, updatePos, switchLayer } from './js/map.js';
import { Map } from './js/map.js';
import { ButtonsMgr } from './js/buttons.js';
// import { maybeLoadTiles, initTiles } from './js/tiles.js';
import { TilesMgr } from './js/tiles.js';

import urlParse from 'url-parse';
import * as rfc4648 from 'rfc4648';
// make it global, so it can be picked up by our module environment stub
window.rfc4648 = rfc4648


global.DEV = window.location.toString().indexOf("DEV=true") != -1
console.log("DEV:" + DEV)

if (DEV)
    $("#crossHair").show()

// icesat data tile level - this cannot be changed without recompiling the data
global.TILE_DEF_ZL = 11


// tiles will be loaded from zoomlevel
global.TILE_LOAD_FROM_ZL = DEV ? 9 : 12
    // tiles will be shown from zoomlevel
global.TILE_SHOW_FROM_ZL = DEV ? 9 : 12
    //var prefix = "https://d3863ripe95iiz.cloudfront.net/tiles/"
    //  global.TILES_ROOT="http://icesat2webview.s3-website.eu-central-1.amazonaws.com/tiles/"
global.TILES_ROOT = "tiles/"


/*
const origin = window.location.origin
console.log("origin=" + origin);
if (origin.startsWith) {
    if (origin.startsWith('file://') ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        origin.startsWith('https://localhost') ||
        origin.startsWith('https://127.0.0.1')) {
        // hack for local dev
        //global.TILES_ROOT = "https://icesat2webview.s3.eu-central-1.amazonaws.com/tiles/"
                             
    }
}
*/

'use strict';


global.handleError = (error) => {
    console.error('Error: ', error);
}



class Mediator {
    displayAtl08 = true


    alertInfo(msg) {
        $('#alertInfo').display(msg != "")
        $('#alertInfo').html(msg)
    }

    showHideMarkersGroup() {
        console.log("mediator:showHideMarkersGroup()")
        if (!this.displayAtl08) {
            this.alertInfo("")
            this.map.setAtl08LayerVisible(false)
        } else if (this.map.myMap.getZoom() < TILE_SHOW_FROM_ZL) {
            this.alertInfo("Zoom in to display <br/> Icesat2 data")
            this.map.setAtl08LayerVisible(false)
        } else {
            this.alertInfo("")
            this.map.setAtl08LayerVisible(true)
        }
    }



    launch() {
        console.log("mediator:launch()")
        this.tilesMgr.initTiles(() => {
            this.map.launch()
            this.buttonsMgr.launch()
                // tilesMgr.maybeLoadTiles()

        })
    }

}


const mediator = new Mediator()

mediator.map = new Map({
    alertInfo: alertInfo,
    mediator: mediator,
    maybeLoadTiles: () => { mediator.tilesMgr.maybeLoadTiles() }
});

mediator.tilesMgr = new TilesMgr({
    alertInfo: alertInfo,
    map: mediator.map
})
mediator.buttonsMgr = new ButtonsMgr({
    mediator: mediator,
    tilesMgr: mediator.tilesMgr,
    map: mediator.map
})

$(document).ready(function() {
    console.log('(process.env.NODE_ENV:' + (process.env.NODE_ENV))
        // mediator.displayAtl08=false

    mediator.launch()

});
