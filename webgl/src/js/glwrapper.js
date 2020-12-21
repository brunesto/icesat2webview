import { mat4, mat3, str, quat, vec4 } from 'gl-matrix';
import { vec2string,mat2string } from "./global.js";


export class GlWrapper {
    /**
     * initialize the WebGl object
     */
    constructor() {
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


    /**
     * draw a bunch of BaseObj 
     */
    drawScene(camera,baseObjs) {
        console.log("drawScene")

         // 1) reset GL drawing
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things

        // Clear the canvas before we start drawing on it.

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // 2) compute the projectionMatrix and viewMatrix

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

        // steps taken from mat.fromRotationTranslation, except that the last step is reverse order
        var dest = mat4.create();
        mat4.translate(dest, mat4.create(), camera.position);
        let quatMat = mat4.create();
        mat4.fromQuat(quatMat, camera.orientation);
        mat4.multiply(viewMatrix, quatMat, dest);

        // 3) now draw all objects
        for (var step2 of baseObjs)
            step2.draw2(projectionMatrix, viewMatrix)


        // some debug info
        this.lastRenderInfo=    
            "\n projectionMatrix:" + mat2string(projectionMatrix) +
            "\n viewMatrix:" + mat2string(viewMatrix) 
    }
}

