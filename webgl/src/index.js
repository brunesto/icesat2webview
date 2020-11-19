import './styles/body.css';
import { mat4, mat3 } from 'gl-matrix';
import { Dragger } from './js/dragger.js';

import { Step2 } from './js/step2.js';
import { Sphere } from './js/sphere.js';



const step2s=[]
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
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = 45 * Math.PI / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);






    var viewMatrix1 = mat4.create();
    mat4.translate(viewMatrix1, // destination matrix
        mat4.create(), // matrix to translate
        camera.pos); // amount to translate

    var viewMatrix = mat4.create();
    mat4.multiply(viewMatrix, viewMatrix1, camera.rotationMatrix)


    for(var step2 of step2s)
      step2.draw2(projectionMatrix, viewMatrix)
}
initGl()
step2s.push(new Sphere())
//step2s.push(new Step2())


function redraw() {
    // _.throttle(redrawNow,150)
    redrawNow()
    $('#info').html("camera.pos:" + camera.pos + " camera.r:" + camera.rotationMatrix)
}


var camera = {
    pos: [0.0, 0.0, 0.0],
    rotationMatrix: mat4.create()

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
            camera.pos[2] -= e.wheelDelta < 0 ? 0.1 : -0.1
            redraw()
        }
    })

    new Dragger(canvas, {
        moved: s => {
            console.log("deltaLast:", s.deltaLast)
            if (s.ctrlKey || s.shiftKey) {
                var newRotationMatrix1 = mat4.create();
                mat4.rotateY(newRotationMatrix1, camera.rotationMatrix, s.deltaLast[0] / 100.0)
                var newRotationMatrix2 = mat4.create();
                mat4.rotateX(newRotationMatrix2, newRotationMatrix1, s.deltaLast[1] / 100.0)
                camera.rotationMatrix = newRotationMatrix2


            } else {
                camera.pos[0] += s.deltaLast[0] / 100.0
                camera.pos[1] -= s.deltaLast[1] / 100.0
            }
            redraw()
        }

    })
});