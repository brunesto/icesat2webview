

import { GlWrapper } from "./glwrapper.js";
import { Dragger } from './dragger.js';
 
import { vec2string, mat2string } from "./global.js";

/**
 * the main UI.
 * 
 * setup WebGl on a given canvas.
 * register key + mouse events (using dragger.js) to update camera
 * 
 * 
 */
export class WglUI {
    

    constructor(camera,step2s) {
        this.camera=camera
        this.step2s=step2s
        this.glWrapper=new GlWrapper()       
        this.initUI()
    }
   

    drawScene() {
        console.log("drawScene")
        this.glWrapper.drawScene(this.camera,this.step2s);
        this.camera.computeCoords();
        $('#info').html("<pre>" +
            "\n position:" + vec2string(this.camera.position) +
            "\n center earth " + this.camera.distanceFromEarthCenter.toFixed(2) + "m" +
            "\n coords: " + this.camera.lat.toFixed(6) + "," + this.camera.lon.toFixed(6) + " amsl:" + this.camera.distanceFromEarthSurface +
           this.glWrapper.lastRenderInfo+
          
            "</pre>")
    }

    redraw() {
        // _.throttle(redrawNow,150) TODO!
        this.redrawNow()
    }


    redrawNow() {
       this.drawScene()
    }

    stepify(v, s) {
        console.log("stepify:", v, s)
        if (v > 0)
            return s
        if (v < 0)
            return -s
        return 0
    }


    /**
     * Setup the mouse and keyboard handle.
     * When shift key is pressed, the camera will rotate, otherwise the camera will move.
     * The speed of movement depends on the distance to earth surface
     */
    initUI() {

       this.redraw()

       // handle mouse
        canvas.addEventListener("mousewheel", e => {

            console.log("mouseWheel", e)
            if (e.wheelDelta != 0) {

                if (e.shiftKey) {
                    const euler = [0, 0, this.stepify(e.wheelDelta, 1)]
                    this.camera.rotate(euler)
                } else {


                    // input vector z= zoom difference
                    var v = [0, 0, 0, 0]
                    const step = this.camera.distanceFromEarthSurface / 20;
                    v[2] = this.stepify(e.wheelDelta, step)
                    this.camera.move(v)
                }



                this.redraw()
            }
        })

        // dragging is delegated to Dragger
        new Dragger(canvas, {
            moved: s => {



                console.log("deltaLast:", s.deltaLast)
                if (s.shiftKey) {
                    const euler = [this.stepify(s.deltaLast[1], 1), this.stepify(s.deltaLast[0], 1), 0]
                    this.camera.rotate(euler)
                } else {
                    const step = this.camera.distanceFromEarthSurface / 100;
                    var v = [this.stepify(s.deltaLast[0], step), this.stepify(s.deltaLast[1], -step), 0, 0]
                    this.camera.move(v)
                }
                this.redraw()
            }

        })
        // handle keyboard

        canvas.addEventListener('keydown', (e)=> {
            console.log('key', e);
            const v = [0, 0, 0, 0]

            if (e.shiftKey) {
                const step = 3

                if (e.key == 'ArrowUp')
                    v[0] = step
                else if (e.key == 'ArrowDown')
                    v[0] = -step
                else if (e.key == 'ArrowRight')
                    v[1] = +step
                else if (e.key == 'ArrowLeft')
                    v[1] = -step
                else if (e.key == 'PageUp')
                    v[2] = step
                else if (e.key == 'PageDown')
                    v[2] = -step
                else
                    return
                this.camera.rotate(v)
                this.redraw()
            } else {
                const step = this.camera.distanceFromEarthSurface / 50
                if (e.key == 'ArrowUp')
                    v[1] = -step
                else if (e.key == 'ArrowDown')
                    v[1] = +step
                else if (e.key == 'ArrowRight')
                    v[0] = -step
                else if (e.key == 'ArrowLeft')
                    v[0] = step
                else if (e.key == 'PageUp')
                    v[2] = step
                else if (e.key == 'PageDown')
                    v[2] = -step
                else
                    return
                    this.camera.move(v)
                this.redraw()
            }

        }, false);

        canvas.focus()
    }
}