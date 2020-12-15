import './styles/body.css';
import { mat4, mat3, str, quat, vec4 } from 'gl-matrix';
import { Dragger } from './js/dragger.js';

import { Step1Cube } from './js/step1-cube.js';
import { Step3Texture } from './js/step3-texture.js';
import { Sphere } from './js/sphere.js';
import { Step2Normals } from './js/step2-normals.js';
import { GeoHelper } from './js/geohelper.js';
import { ProgramPINT } from './js/baseobj';

global.logFlag = true


function padLeft(r, length, pad) {
    while (r.length < length) r = pad + r;
    return r;
}

function f2string(n) {
    return padLeft(n.toFixed(3), 10, " ");
}

function isSquare(n) {
    const rs = Math.sqrt(n)
    return (rs * rs == n)
}

function vec2string(a, formatter) {
    if (formatter == undefined)
        formatter = f2string
    var retVal = ""

    for (var i = 0; i < a.length; i++)
        retVal += formatter(a[i]) + ", "
    return retVal

}

function mat2string(a, formatter) {
    console.log("dedieu...")
    if (formatter == undefined)
        formatter = f2string
    var retVal = ""

    if (isSquare(a.length)) {
        const l = Math.sqrt(a.length)
        retVal += "\n"
        for (var j = 0; j < l; j++) {
            for (var i = 0; i < l; i++)
                retVal += formatter(a[i + j * l]) + ", "


            retVal += "\n"
        }
    } else {
        retVal = vec2string(a, formatter)
    }
    return retVal
}

const step2s = []
    //
    // start here
    //
function initGl() {
    global.canvas = $("#glCanvas")[0];
    // Initialize the GL context
    global.gl = canvas.getContext("webgl");

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
}



function drawScene(camera) {
    console.log("drawScene")
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.001 km == 1m
    // and 100 000 km units away from the camera (i.e. 1/4 of the distance to the moon)

    const fieldOfView = 45 * Math.PI / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.001;
    const zFar = 100 * 1000;
    const projectionMatrix = mat4.create();

    // note: gl-matrix convention is first argument is target
    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);




    var viewMatrix = mat4.create();

    //    mat4.fromRotationTranslation(viewMatrix,  camera.q,  camera.pos)

    // steps taken from mat.fromRotationTranslation, except that the last step is reverse order
    var dest = mat4.create();
    mat4.translate(dest, mat4.create(), camera.pos);
    let quatMat = mat4.create();
    mat4.fromQuat(quatMat, camera.q);
    mat4.multiply(viewMatrix, quatMat, dest);

    //    viewMatrix = dest;


    //var lookDirection=GH.plus(camera.pos,camera.front)
    //mat4.lookAt( viewMatrix, camera.pos, lookDirection, camera.up );



    camera.computeCoords();






    $('#info').html("<pre>" +
        "\n position:" + vec2string(camera.pos) +
        "\n center earth " + camera.distanceFromEarthCenter.toFixed(2) + "m" +
        "\n coords: " + camera.lat.toFixed(6) + "," + camera.lon.toFixed(6) + " amsl:" + camera.distanceFromEarthSurface +

        "\n projectionMatrix:" + mat2string(projectionMatrix) +
        "\n viewMatrix:" + mat2string(viewMatrix) +
        "</pre>")

    // var viewMatrix1 = mat4.create();
    // mat4.translate(viewMatrix1, // destination matrix
    //     mat4.create(), // matrix to translate
    //     camera.pos); // amount to translate
    // console.log("camera.pos:" + camera.pos, "vs " + mat2string(viewMatrix1))
    // var viewMatrix = mat4.create();
    // mat4.multiply(viewMatrix, viewMatrix1, camera.rotationMatrix)


    for (var step2 of step2s)
        step2.draw2(projectionMatrix, viewMatrix)
}
initGl()

const sphereObj=new Sphere("sphere1")
const pp=new ProgramPINT(sphereObj.name,()=>sphereObj.modelMatrix)
pp.initBuffers(sphereObj.getParams())

step2s.push(pp)
    //step2s.push(new Step1Cube())
    //step2s.push(new Step2Normals())
//step2s.push(new Step3Texture())


function redraw() {
    // _.throttle(redrawNow,150)
    redrawNow()
}


class Camera {
    pos = [0.0, 0.0, 0, 0]
    q = quat.create()

    constructor(z) {
        this.pos[2] = z
    }

    computeCoords() {
        this.distanceFromEarthCenter = GH.length(this.pos)
        this.distanceFromEarthSurface = this.distanceFromEarthCenter - 6378

        this.lat = GH.radians2degrees(Math.asin(-this.pos[1] / this.distanceFromEarthCenter))


        const posAtEquator = [this.pos[0], 0, this.pos[2]]


        const distanceFromEarthCenterAtEquator = GH.length(posAtEquator)
        const l90 = GH.radians2degrees(Math.asin(-this.pos[0] / distanceFromEarthCenterAtEquator))


        if (this.pos[0] > 0 != this.pos[2] > 0) {
            if (this.pos[0] > 0) {
                console.log("c1")
                this.lon = l90;
            } else {
                console.log("c2")
                this.lon = 180 - l90;
            }
        } else {
            if (this.pos[0] > 0) {
                console.log("c3")
                this.lon = -180 - l90;
            } else {
                console.log("c4")
                this.lon = l90;
            }
        }


    }

}

var camera = new Camera(-6472)


function redrawNow() {
    drawScene(camera)
}

function movescreen2world(v) {

    // inverse camera rotation
    var iq = quat.create()
    quat.invert(iq, camera.q)
    let iqm = mat4.create();
    mat4.fromQuat(iqm, iq);




    var dest = vec4.create()
    vec4.transformMat4(dest, v, iqm);
    console.log("movescreen2world " + vec2string(v) + " ->" + vec2string(dest))

    // modify camera position by inversely rotated z
    camera.pos[0] += dest[0]
    camera.pos[1] += dest[1]
    camera.pos[2] += dest[2]
}


function rotatescreen2world(euler) {
    const q = quat.create()
    quat.fromEuler(q, euler[0], euler[1], euler[2], 0)
    camera.q = quat.normalize(quat.create(), quat.mul(quat.create(), q, camera.q))
}

function stepify(v, s) {
    console.log("stepify:", v, s)
    if (v > 0)
        return s
    if (v < 0)
        return -s
    return 0
}

$(document).ready(function() {
    console.log('process.env.NODE_ENV:' + (process.env.NODE_ENV))



    redraw()
    canvas.addEventListener("mousewheel", e => {

        console.log("mouseWheel", e)
        if (e.wheelDelta != 0) {

            if (e.shiftKey) {
                const euler = [0, 0, stepify(e.wheelDelta, 1)]
                rotatescreen2world(euler)
            } else {


                // input vector z= zoom difference
                var v = [0, 0, 0, 0]
                const step = camera.distanceFromEarthSurface / 20;
                v[2] = stepify(e.wheelDelta, step)
                movescreen2world(v)
            }



            redraw()
        }
    })

    new Dragger(canvas, {
        moved: s => {



            console.log("deltaLast:", s.deltaLast)
            if (s.shiftKey) {


                const euler = [stepify(s.deltaLast[1], 1), stepify(s.deltaLast[0], 1), 0]
                rotatescreen2world(euler)

                // const q = quat.create()
                // quat.fromEuler(q, euler[0],euler[1],euler[2], 0)
                // camera.q = quat.normalize(quat.create(), quat.mul(quat.create(), q, camera.q))


                // var newRotationMatrix1 = mat4.create();
                // mat4.rotateY(newRotationMatrix1, )
                // var newRotationMatrix2 = mat4.create();
                // mat4.rotateX(newRotationMatrix2, newRotationMatrix1, )
                // camera.rotationMatrix = newRotationMatrix2


            } else {
                const step = camera.distanceFromEarthSurface / 100;
                var v = [stepify(s.deltaLast[0], step), stepify(s.deltaLast[1], -step), 0, 0]

                // if (s.deltaLast[0] != 0)
                //     v[0] = -s.deltaLast[0] < 0 ? step : -step
                // if (s.deltaLast[1] != 0)
                //     v[1] = s.deltaLast[1] < 0 ? step : -step

                movescreen2world(v)

            }
            redraw()
        }

    })


    canvas.addEventListener('keydown', function(e) {
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
            rotatescreen2world(v)
            redraw()
        } else {
            const step = camera.distanceFromEarthSurface / 50
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



                movescreen2world(v)
            redraw()
        }

    }, false);

    canvas.focus()
});