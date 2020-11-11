import './styles/body.css';
import { initMap, myMap, myRenderer, myMarkersGroup, updatePos, switchLayer } from './js/map.js';
import { initButtons } from './js/buttons.js';
import { maybeLoadTiles ,initTiles} from './js/tiles.js';

import urlParse from 'url-parse';



Number.prototype.round = function(places) {
    return +(Math.round(this + "e+" + places) + "e-" + places);
}



jQuery.fn.display = function(b) {
    if (b)
        return this.show();
    else
        return this.hide();
};



global.DEV=window.location.toString().indexOf("DEV=true")!=-1
console.log("DEV:"+DEV)

if(DEV)
  $("#crossHair").show()

// icesat data tile level - this cannot be changed without recompiling the data
global.TILE_DEF_ZL = 11


// tiles will be loaded from zoomlevel
global.TILE_LOAD_FROM_ZL = DEV?9:12
    // tiles will be shown from zoomlevel
global.TILE_SHOW_FROM_ZL = DEV?9:12
    //var prefix = "https://d3863ripe95iiz.cloudfront.net/tiles/"
    //  global.TILES_ROOT="http://icesat2webview.s3-website.eu-central-1.amazonaws.com/tiles/"
     global.TILES_ROOT="tiles/"

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


$(document).ready(function() {
    console.log('(process.env.NODE_ENV:' + (process.env.NODE_ENV))
    initTiles(()=>{
        initMap({
            maybeLoadTiles: () => {
                maybeLoadTiles(myMap, myRenderer, myMarkersGroup)
            }
        });
        maybeLoadTiles(myMap, myRenderer, myMarkersGroup)

        initButtons(myMap, updatePos, switchLayer)
    })
});