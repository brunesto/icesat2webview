import { GlWrapper, GlDrawable } from "./glwrapper.js";
import { Dragger } from './dragger.js';
import { vec2string, mat2string,quat2EulerAngles } from "./global.js";
import { rgb2id } from "./programpiu4id.js"
import { mat4, mat3, str, quat, vec4 } from 'gl-matrix';
import { ProgramPIU4Id } from "./programpiu4id.js";


export class ModelBinder {
    constructor(mesh, getModelMatrix, renderProgram) {
        this.mesh = mesh
        this.getModelMatrix = getModelMatrix
        this.renderProgram = renderProgram

    }
    forRender() {
        const thisModelBinder = this
        const renderProgramBuffer = this.renderProgram.initBuffers(this.mesh.getParams())

        const retVal = new GlDrawable(this.mesh.name + "." + this.renderProgram.name);
        retVal.draw2 = (id, projectionMatrix, viewMatrix) => {
            this.renderProgram.draw2(id, renderProgramBuffer, projectionMatrix, viewMatrix, thisModelBinder.getModelMatrix())
        }

        return retVal;
    }
    forMousePick() {
        const thisModelBinder = this
        const pickProgram = new ProgramPIU4Id(this.mesh.name)

        const pickProgramBuffer = pickProgram.initBuffers(this.mesh.getParams())

        const retVal = new GlDrawable(this.mesh.name + "." + pickProgram.name);
        retVal.draw2 = (id, projectionMatrix, viewMatrix) => {
            pickProgram.draw2(id, pickProgramBuffer, projectionMatrix, viewMatrix, thisModelBinder.getModelMatrix())
        }
        return retVal
    }
}



/**
 * the main UI.
 * 
 * setup WebGl on a given canvas.
 * register key + mouse events (using dragger.js) to update camera
 * 
 * 
 */
export class WglUI {


    constructor(canvasElementId, camera, binders) {
        this.camera = camera
        this.binders = binders

        this.glWrapper = new GlWrapper(canvasElementId)
        this.canvas = this.glWrapper.canvas // keep a ref 

        this.initUI()
    }


    bindModel(binder) {
        console.log("binder:" + binder)
        this.drawables4Render.push(binder.forRender())
        this.drawables4MousePick.push(binder.forMousePick())
    }
    maybeBindModels() {
            if (!this.modelBounds) {
                this.modelBounds = true
                this.drawables4Render = []
                this.drawables4MousePick = []
                console.log("binders:" + this.binders.length)
                for (var binder of this.binders) {
                    this.bindModel(binder)
                }
            }
        }
        // TODO: many optimizations here
        // https://webglfundamentals.org/webgl/lessons/webgl-picking.html
    drawMousePick(x, y) {
        console.log("drawMousePick " + x + "," + y)
        this.maybeBindModels()
        this.glWrapper.drawScene(this.camera, this.drawables4MousePick);



        const data = new Uint8Array(4);
        gl.readPixels(
            x, // x
            gl.canvas.height - y, // y
            1, // width
            1, // height
            gl.RGBA, // format
            gl.UNSIGNED_BYTE, // type
            data); // typed array to hold result
        var rgb = [data[0], data[1], data[2]];
        // Note: the rgb here is in 0/255 range
        console.log("rgb:" + rgb)
        const id = rgb2id(rgb) - 1
        console.log("id:" + id)
            // immediately replace the view
        this.drawRenderScene()

        // if (id==-1)    
        //     return null
        // this.drawables4MousePick[id].
        return id

    }


    drawRenderScene() {

        console.log("drawRenderScene")
        this.maybeBindModels()
        this.glWrapper.drawScene(this.camera, this.drawables4Render);
        this.camera.computeCoords();
        $('#info').html("<pre>" +
            "\n position:" + vec2string(this.camera.position) +
            "\n orientation:" + vec2string(quat2EulerAngles(this.camera.orientation)) +
            
            "\n center earth " + this.camera.distanceFromEarthCenter.toFixed(2) + "m" +
            "\n coords: " + this.camera.lat.toFixed(6) + "," + this.camera.lon.toFixed(6) + " amsl:" + this.camera.distanceFromEarthSurface +
            this.glWrapper.lastRenderInfo +

            "</pre>")

        const projectionMatrix = this.glWrapper.getProjectionMatrix()
        const viewMatrix = this.glWrapper.getViewMatrix(this.camera)
            // const vpMatrix = mat4.create();

        //  mat4.multiply(vpMatrix, projectionMatrix, viewMatrix);


        const overlays = document.getElementById('glOverlays');

        // clear children
        var cNode = overlays.cloneNode(false);
        overlays.parentNode.replaceChild(cNode, overlays);



        for (var i in this.binders) {

            const binder = this.binders[i]
            console.log("binder[" + i + "]")

            const modelMatrix = binder.getModelMatrix()
            const xy = this.world2canvas(modelMatrix, viewMatrix, projectionMatrix)
            if (xy != null) {
                var overlay = document.createElement("div");

                overlay.innerHTML = "#" + i + ":" + binder.mesh.name
                overlay.style.left = xy.x + "px";
                overlay.style.top = xy.y + "px";
                cNode.appendChild(overlay)
            }

        }
    }


    // GOTCHA position is not enouggh.. the model matrix is required
    world2canvas(modelMatrix, viewMatrix, projectionMatrix) {
        // https://webglfundamentals.org/webgl/lessons/webgl-text-html.html
        // We just got through computing a matrix to draw our
        // F in 3D.

        // compute a clip space position
        // using the matrix we computed for the F
        const clipspace = vec4.create()

        // duplicate in programHelper
        const modelViewMatrix = mat4.create();
        mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
        const mvpMatrix = mat4.create();
        mat4.multiply(mvpMatrix, projectionMatrix, modelViewMatrix);

        vec4.transformMat4(clipspace, [0.5, 0.5, 0.5, 1], mvpMatrix);

        // divide X and Y by W just like the GPU does.
        clipspace[0] /= clipspace[3];
        clipspace[1] /= clipspace[3];

        // convert from clipspace to pixels
        var pixelX = (clipspace[0] * 0.5 + 0.5) * gl.canvas.width;
        var pixelY = (clipspace[1] * -0.5 + 0.5) * gl.canvas.height;

        if (pixelX < 0 || pixelX > gl.canvas.width)
            return null
        if (pixelY < 0 || pixelY > gl.canvas.height)
            return null

        // position the div
        // div.style.left = Math.floor(pixelX) + "px";
        //div.style.top = Math.floor(pixelY) + "px";
        //textNode.nodeValue = clock.toFixed(2);
        return { x: Math.floor(pixelX), y: Math.floor(pixelY) }
    }

    redraw() {
        // _.throttle(redrawNow,150) TODO!
        this.redrawNow()
    }


    redrawNow() {
        this.drawRenderScene()
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


        // handle mouse
        this.canvas.addEventListener("mousewheel", e => {

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
                e.preventDefault()
            }
        })

        // dragging is delegated to Dragger
        new Dragger(this.canvas, {
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
                },
                click: e => {
                    console.log("click!")
                    this.drawMousePick(e.clientX, e.clientY)









                }

            })
            // handle keyboard

        this.canvas.addEventListener('keydown', (e) => {
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

        this.canvas.focus()
    }
}