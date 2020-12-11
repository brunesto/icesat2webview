import './styles/body.css';
//import { initMap, myMap, myRenderer, myMarkersGroup, updatePos, switchLayer } from './js/map.js';
import { Map } from './js/map.js';
import { initButtons } from './js/buttons.js';
import { maybeLoadTiles, initTiles } from './js/tiles.js';

import urlParse from 'url-parse';



Number.prototype.round = function (places) {
    return +(Math.round(this + "e+" + places) + "e-" + places);
}



jQuery.fn.display = function (b) {
    if (b)
        return this.show();
    else
        return this.hide();
};

jQuery.fn.setClass = function(b,c) {
    if (b)
        return this.addClass(c);
    else
        return this.removeClass(c);
};



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

'use strict';

class Mediator {
    handleError(error) {
        console.error('Error: ', error);


    }
    alertInfo(msg) {
        $('#alertInfo').display(msg != "")
        $('#alertInfo').html(msg)
    }
}
var mediator = new Mediator();
global.mediator = mediator
var map=new Map()
const maybeReloadTiles= () => {
    // if (mediator.displayAtl08)
        maybeLoadTiles(map.myMap, map.myRenderer, map.myMarkersGroup)
}

$(document).ready(function () {
    console.log('(process.env.NODE_ENV:' + (process.env.NODE_ENV))
    // mediator.displayAtl08=false

    initTiles(() => {

       
        map.initMap({
            maybeLoadTiles:maybeReloadTiles
        });
        maybeLoadTiles(map.myMap, map.myRenderer, map.myMarkersGroup)

        initButtons(map)
    })
});