import { mat4 } from 'gl-matrix';
import { initShaderProgram } from './webglutil.js';
import { Drawable } from './baseobj.js';
import { bv3 } from './bv3.js';
import {
    createPositionAndIndexBuffers,
    createNormalBuffers,
    createTextureCoordsBuffers,
    createColorBuffer,
    bufferLocationSetup,
    bufferTextureCoordinatesLocationSetup,
    matrixSetup
} from "./programhelper.js"

/**
 * Position Index Color Normals
 * 
 */



export class ProgramPICN extends Drawable {


    // Vertex shader program
    vsSource = `
 attribute vec4 aVertexPosition;
 attribute vec3 aVertexColor;
 uniform mat4 uMvpMatrix;

 varying lowp vec3 vColor;
 void main(void) {
    gl_Position = uMvpMatrix  * aVertexPosition;
    vColor = aVertexColor;   
 }
`;

    // Fragment shader program
    fsSource = `
   varying lowp vec3 vColor;
  

   void main(void) {       
       gl_FragColor =vec4(vColor,1);   
   }
 `;
    programInfo = null;
    buffers = null;
    constructor(name, getModelMatrix) {
        super(name + "+" + "U");
        this.getModelMatrix = getModelMatrix;


        var shaderProgram = initShaderProgram(this.vsSource, this.fsSource);
        this.programInfo = {
            program: shaderProgram,

            locations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
                mvpMatrix: gl.getUniformLocation(shaderProgram, 'uMvpMatrix'),

            }
        };


    }

    

    //
    // Initialize the buffers we'll need. 
    //
    initBuffers(params) {



        // Now set up the colors for the faces. We'll use solid colors
        // for each face.

        // Convert the array of colors into a table for all the vertices.



      
            /*
                    const colorBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);
            */


        // // Now set up the colors for the faces. We'll use solid colors
        // // for each face.

        // const faceColors = [
        //     [1.0, 1.0, 1.0, 1.0], // Front face: white
        //     [1.0, 0.0, 0.0, 1.0], // Back face: red
        //     [0.0, 1.0, 0.0, 1.0], // Top face: green
        //     [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
        //     [1.0, 1.0, 0.0, 1.0], // Right face: yellow
        //     [1.0, 0.0, 1.0, 1.0], // Left face: purple
        // ];

        // // Convert the array of colors into a table for all the vertices.

        // var colors = [];

        // for (var j = 0; j < faceColors.length; ++j) {
        //     const c = faceColors[j];

        //     // Repeat each color four times for the four vertices of the face
        //     colors = colors.concat(c, c, c, c);
        // }

        // this.logBufferArray("colors", colors, 4)



      




        this.buffers = {...createPositionAndIndexBuffers(params),
            ...createColorBuffer(params),
            // ...createNormalBuffers(params),
            // ...createTextureCoordsBuffers(params),
        }
    }






    draw2(id, projectionMatrix, viewMatrix) {
        // Tell WebGL to use our program when drawing
        //console.log(name + "."+id+": draw2()");
        gl.useProgram(this.programInfo.program);


        bufferLocationSetup(this.buffers.position, this.programInfo.locations.vertexPosition)

        bufferLocationSetup(this.buffers.color,this.programInfo.locations.vertexColor)


        matrixSetup(this.getModelMatrix(), viewMatrix, projectionMatrix, this.programInfo.locations.mvpMatrix)
            // // Tell WebGL how to pull out the colors from the color buffer
            // // into the vertexColor attribute.
            // {
            //     const numComponents = 3;
            //     const type = gl.FLOAT;
            //     const normalize = false;
            //     const stride = 0;
            //     const offset = 0;
            //     gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
            //     gl.vertexAttribPointer(
            //         this.programInfo.locations.vertexColor,
            //         numComponents,
            //         type,
            //         normalize,
            //         stride,
            //         offset);
            //     gl.enableVertexAttribArray(
            //         this.programInfo.locations.vertexColor);
            // }

        // draw
        {
            const trianglesCount = this.buffers.indicesSize;
            //console.debug("drawElements " + trianglesCount);
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, trianglesCount, type, offset);
        }


    }

    dispose() {
        console.log(name + ": dispose()");
        // TODO!!!
    }
}

/**
 * convert an id to rgb [0..255]
 */
export function id2rgb(i) {

    if (i > 0xffffff || i < 0) // 0xffffff=16777215
        throw "id out of range: " + i
    const b = (i & 0x000000FF) >> 0;
    const g = (i & 0x0000FF00) >> 8;
    const r = (i & 0x00FF0000) >> 16;



    return [r, g, b]
}

/**
 * convert a rgb [0..255] back to id
 */
export function rgb2id(rgb) {

    const r = rgb[0];
    const g = rgb[1];
    const b = rgb[2];

    const id = r * 256 * 256 + g * 256 + b;
    return id;
}