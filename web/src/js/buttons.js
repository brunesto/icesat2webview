import '../styles/buttons.css'

const layerNames = ["map", "aerial","light", "dark"]
var currentLayerIdx = -1


export function initButtons(myMap, updatePos, switchLayer) {
    $("#btnBar").show()
    
    $("#locateBtn").click(function() { getLocation(myMap, updatePos); });
    
    $("#polygonBtn").display(DEV)
    $("#polygonBtn").click(function() { savePoly(myMap); });
    
    $("#gotoCoordsBtn").click(function() { gotoCoords(myMap, updatePos); });
    $("#switchLayerBtn").click(function() { switchToNextLayer(switchLayer); });

    switchToNextLayer(switchLayer)

}

function getNextLayerIdx() {
    var nextLayer = currentLayerIdx + 1
    if (nextLayer >= layerNames.length)
        nextLayer = 0
    return nextLayer
}

function switchToNextLayer(switchLayer) {
    currentLayerIdx = getNextLayerIdx()
    switchLayer(layerNames[currentLayerIdx])
    $("#switchLayerBtn").removeClass("nextIs-" + layerNames[currentLayerIdx]);
    $("#switchLayerBtn").addClass("nextIs-" + layerNames[getNextLayerIdx()]);

}


function gotoCoords(myMap, updatePos) {
    var current = myMap.getCenter()

    var latLon = prompt("go to lat,lon ?", current == undefined ? "" : (current.lat + "," + current.lng));

    if (latLon != null) {
        var tokens = latLon.split(",")
        if (tokens.length == 1)
            tokens = latLon.split(";")



        updatePos(tokens[0], tokens[1]);
    }
}


function savePoly(myMap) {
    var bb = myMap.getBounds();
    alert("" + bb.getSouthWest().lng.round(4) + "," + bb.getSouthWest().lat.round(4) + "," + bb.getNorthEast().lng.round(4) + "," + bb.getNorthEast().lat.round(4));

    /* 


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

     */
}





// https://www.w3schools.com/html/html5_geolocation.asp

function getLocation(myMap, updatePos) {
    try {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                console.log("geolocation " + new Date().toLocaleTimeString() + "")
                updatePos(position.coords.latitude, position.coords.longitude,18,true);
            }, (error) => {
                console.log('getCurrentPosition Error code: ' + error.code);
                // error.code can be:
                //   0: unknown error
                //   1: permission denied
                //   2: position unavailable (error response from locaton provider)
                //   3: timed out
            });
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    } catch (e) {
        console.error(e);
    }

}




