import './styles/body.css';
import { mat4, mat3, str,quat } from 'gl-matrix';
import { Dragger } from './js/dragger.js';

import { Step1Cube } from './js/step1-cube.js';
import { Step3Texture } from './js/step3-texture.js';
import { Sphere } from './js/sphere.js';
import { Step2Normals } from './js/step2-normals.js';
import { GeoHelper }  from './js/geohelper.js';

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
                retVal += formatter(a[i + j * 4]) + ", "


            retVal += "\n"
        }
    } else {
        retVal = "" + a
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
    mat4.fromRotationTranslation(viewMatrix,  camera.q,  camera.pos)

    //var lookDirection=GH.plus(camera.pos,camera.front)
    //mat4.lookAt( viewMatrix, camera.pos, lookDirection, camera.up );

    $('#info').html("<pre>"+
    "\n projectionMatrix:" +mat2string(projectionMatrix) +
    "\n viewMatrix:" +mat2string(viewMatrix) +
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

// step2s.push(new Sphere())
    //step2s.push(new Step1Cube())
    //step2s.push(new Step2Normals())
    step2s.push(new Step3Texture())


function redraw() {
    // _.throttle(redrawNow,150)
    redrawNow()
}


var camera = {
    // llz: [0, 0, -10000],
    pos: [0.0, 0.0, -10, 0],
    //[0.08,-0.5400000000000003,4.799999999999999],
    // rotationMatrix: mat4.create(),
    front:[0,0,1],
    up:[0,1,0],
    q:quat.create()

}

function redrawNow() {
    drawScene(camera)
}

$(document).ready(function() {
    console.log('process.env.NODE_ENV:' + (process.env.NODE_ENV))



    redraw()
    canvas.addEventListener("mousewheel", e => {

        console.log("mouseWheel", e)
        if (e.wheelDelta != 0) {
            const step = camera.pos[2] / 100;
            camera.pos[2] += e.wheelDelta < 0 ? step : -step
            redraw()
        }
    })

    new Dragger(canvas, {
        moved: s => {



            console.log("deltaLast:", s.deltaLast)
            if (s.ctrlKey || s.shiftKey) {

                const q=quat.create()
                quat.fromEuler(q,s.deltaLast[1] / 3.0,s.deltaLast[0 ] / 3.0,0)

                camera.q=quat.normalize(quat.create(),quat.mul(quat.create(),q,camera.q))

                

                // var newRotationMatrix1 = mat4.create();
                // mat4.rotateY(newRotationMatrix1, )
                // var newRotationMatrix2 = mat4.create();
                // mat4.rotateX(newRotationMatrix2, newRotationMatrix1, )
                // camera.rotationMatrix = newRotationMatrix2


            } else {
                const step = camera.pos[2] / 100;
                
                if (s.deltaLast[0] != 0)
                    camera.pos[0] -= s.deltaLast[0] < 0 ? step : -step
                if (s.deltaLast[1] != 0)
                    camera.pos[1] += s.deltaLast[1] < 0 ? step : -step
            }
            redraw()
        }

    })
});