import { GlWrapper } from "./glwrapper.js";
import { Dragger } from './dragger.js';
 
import { vec2string, mat2string } from "./global.js";


export class WglUI {
    //
    // start here
    //



    constructor(camera,step2s) {
        this.camera=camera
        this.step2s=step2s
        this.glWrapper=new GlWrapper()       
        this.initUI()
    }
   



    drawScene() {
        console.log("drawScene")
        this.glWrapper.drawScene(this.camera,this.step2s);
       //  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
       //  gl.clearDepth(1.0); // Clear everything
       //  gl.enable(gl.DEPTH_TEST); // Enable depth testing
       //  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

       //  // Clear the canvas before we start drawing on it.

       //  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

       //  // Create a perspective matrix, a special matrix that is
       //  // used to simulate the distortion of perspective in a this.camera.
       //  // Our field of view is 45 degrees, with a width/height
       //  // ratio that matches the display size of the canvas
       //  // and we only want to see objects between 0.001 km == 1m
       //  // and 100 000 km units away from the this.camera (i.e. 1/4 of the distance to the moon)

       //  const fieldOfView = 45 * Math.PI / 180; // in radians
       //  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
       //  const zNear = 0.001;
       //  const zFar = 100 * 1000;
       //  const projectionMatrix = mat4.create();

       //  // note: gl-matrix convention is first argument is target
       //  mat4.perspective(projectionMatrix,
       //      fieldOfView,
       //      aspect,
       //      zNear,
       //      zFar);




       //  var viewMatrix = mat4.create();

       //  //    mat4.fromRotationTranslation(viewMatrix,  this.camera.q,  this.camera.pos)

       //  // steps taken from mat.fromRotationTranslation, except that the last step is reverse order
       //  var dest = mat4.create();
       //  mat4.translate(dest, mat4.create(), this.camera.pos);
       //  let quatMat = mat4.create();
       //  mat4.fromQuat(quatMat, this.camera.q);
       //  mat4.multiply(viewMatrix, quatMat, dest);

       //  //    viewMatrix = dest;


       //  //var lookDirection=GH.plus(this.camera.pos,this.camera.front)
       //  //mat4.lookAt( viewMatrix, this.camera.pos, lookDirection, this.camera.up );



        this.camera.computeCoords();


        $('#info').html("<pre>" +
            "\n position:" + vec2string(this.camera.pos) +
            "\n center earth " + this.camera.distanceFromEarthCenter.toFixed(2) + "m" +
            "\n coords: " + this.camera.lat.toFixed(6) + "," + this.camera.lon.toFixed(6) + " amsl:" + this.camera.distanceFromEarthSurface +
           this.glWrapper.lastRenderInfo+
          
            "</pre>")

        // var viewMatrix1 = mat4.create();
        // mat4.translate(viewMatrix1, // destination matrix
        //     mat4.create(), // matrix to translate
        //     this.camera.pos); // amount to translate
        // console.log("this.camera.pos:" + this.camera.pos, "vs " + mat2string(viewMatrix1))
        // var viewMatrix = mat4.create();
        // mat4.multiply(viewMatrix, viewMatrix1, this.camera.rotationMatrix)


       //  for (var step2 of this.step2s)
       //      step2.draw2(projectionMatrix, viewMatrix)
    }




    redraw() {
        // _.throttle(redrawNow,150)
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



    initUI() {

       this.redraw()
        canvas.addEventListener("mousewheel", e => {

            console.log("mouseWheel", e)
            if (e.wheelDelta != 0) {

                if (e.shiftKey) {
                    const euler = [0, 0, this.stepify(e.wheelDelta, 1)]
                    this.camera.rotatescreen2world(euler)
                } else {


                    // input vector z= zoom difference
                    var v = [0, 0, 0, 0]
                    const step = this.camera.distanceFromEarthSurface / 20;
                    v[2] = this.stepify(e.wheelDelta, step)
                    this.camera.movescreen2world(v)
                }



                this.redraw()
            }
        })

        new Dragger(canvas, {
            moved: s => {



                console.log("deltaLast:", s.deltaLast)
                if (s.shiftKey) {


                    const euler = [this.stepify(s.deltaLast[1], 1), this.stepify(s.deltaLast[0], 1), 0]
                    this.camera.rotatescreen2world(euler)

                    // const q = quat.create()
                    // quat.fromEuler(q, euler[0],euler[1],euler[2], 0)
                    // this.camera.q = quat.normalize(quat.create(), quat.mul(quat.create(), q, this.camera.q))


                    // var newRotationMatrix1 = mat4.create();
                    // mat4.rotateY(newRotationMatrix1, )
                    // var newRotationMatrix2 = mat4.create();
                    // mat4.rotateX(newRotationMatrix2, newRotationMatrix1, )
                    // this.camera.rotationMatrix = newRotationMatrix2


                } else {
                    const step = this.camera.distanceFromEarthSurface / 100;
                    var v = [this.stepify(s.deltaLast[0], step), this.stepify(s.deltaLast[1], -step), 0, 0]

                    // if (s.deltaLast[0] != 0)
                    //     v[0] = -s.deltaLast[0] < 0 ? step : -step
                    // if (s.deltaLast[1] != 0)
                    //     v[1] = s.deltaLast[1] < 0 ? step : -step

                    this.camera.movescreen2world(v)

                }
                this.redraw()
            }

        })


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
                this.camera.rotatescreen2world(v)
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



                    this.camera.movescreen2world(v)
                this.redraw()
            }

        }, false);

        canvas.focus()
    }
}