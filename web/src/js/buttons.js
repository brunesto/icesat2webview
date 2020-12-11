import '../styles/buttons.css'




export class ButtonsMgr {
    layerNames = ["outdoors", "aerial", "light"] //, "dark"]
    currentLayerIdx = -1


    constructor(config) {
        this.config = config
        const thisButtonsMgr=this
        $("#btnBar").show()

        $("#locateBtn").click(function() { thisButtonsMgr.getLocation(); });

        $("#polygonBtn").display(DEV)
        $("#polygonBtn").click(function() { thisButtonsMgr.savePoly(); });

        $("#gotoCoordsBtn").click(function() { thisButtonsMgr.gotoCoords(); });
        $("#switchLayerBtn").click(function() { thisButtonsMgr.switchToNextLayer(); });

        $("#helpBtn").click(function() { window.open('site/help.html', 'is2help'); });
        $("#atl08Btn").click(function() { thisButtonsMgr.setDisplayAtl08(!thisButtonsMgr.config.mediator.displayAtl08); });



    }

    launch() {
        this.setDisplayAtl08(this.config.mediator.displayAtl08);
        this.switchToNextLayer()
    }

    getNextLayerIdx() {
        var nextLayer = this.currentLayerIdx + 1
        if (nextLayer >= this.layerNames.length)
            nextLayer = 0
        return nextLayer
    }

    switchToNextLayer() {
       this. currentLayerIdx = this.getNextLayerIdx()
        this.config.map.switchLayer(this.layerNames[this.currentLayerIdx])
        $("#switchLayerBtn").removeClass("nextIs-" + this.layerNames[this.currentLayerIdx]);
        $("#switchLayerBtn").addClass("nextIs-" + this.layerNames[this.getNextLayerIdx()]);

    } 

    setDisplayAtl08(v){
        this.config.mediator.displayAtl08=v
        $("#atl08Btn").setClass(this.config.mediator.displayAtl08,"toggle-button-on");
        this.config.tilesMgr.maybeLoadTiles()
    }

    gotoCoords() {
        var current = this.config.map.myMap.getCenter()

        var latLon = prompt("go to lat,lon ?", current == undefined ? "" : (current.lat + "," + current.lng));

        if (latLon != null) {
            var tokens = latLon.split(",")
            if (tokens.length == 1)
                tokens = latLon.split(";")



            this.config.map.updatePos(tokens[0], tokens[1]);
        }
    }


    savePoly() {
        var bb = this.config.map.myMap.getBounds();
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

    getLocation() {
        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    console.log("geolocation " + new Date().toLocaleTimeString() + "")
                    this.config.map.updatePos(position.coords.latitude, position.coords.longitude, 17, true);
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
}