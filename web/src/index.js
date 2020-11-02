import './styles/body.css';
import {initMap,myMap,myRenderer,myMarkersGroup} from './js/map.js';
import {maybeLoadTiles} from './js/tiles.js';

// icesat data tile level - this cannot be changed without recompiling the data
global.TILE_DEF_ZL = 11

    // tiles will be loaded from zoomlevel
    global.TILE_LOAD_FROM_ZL = 9
    // tiles will be shown from zoomlevel
    global.TILE_SHOW_FROM_ZL = 9

jQuery.fn.display = function (b) {
  if (b)
      return this.show();
  else
      return this.hide();
};

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
global.mediator=mediator


$(document).ready(function () {
  console.log("initMap=",initMap)
  initMap({maybeLoadTiles:()=>{
    console.log("yay")
    maybeLoadTiles(myMap,myRenderer,myMarkersGroup)
  }

  });

});






