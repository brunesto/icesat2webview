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
 attribute vec3 aVertexNormal;
 uniform mat4 uMvpMatrix;

 varying lowp vec3 vColor;

 void main(void) {
    gl_Position = uMvpMatrix  * aVertexPosition;

    // Apply lighting effect

    highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

    highp float directional = max(dot(aVertexNormal, directionalVector), 0.0);
    highp vec3 lighting = ambientLight + (directionalLightColor * directional);

    vColor = aVertexColor*lighting;   
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
                vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
                mvpMatrix: gl.getUniformLocation(shaderProgram, 'uMvpMatrix'),

            }
        };


    }

    

    //
    // Initialize the buffers we'll need. 
    //
    initBuffers(params) {
        this.buffers = {...createPositionAndIndexBuffers(params),
            ...createColorBuffer(params),
            ...createNormalBuffers(params),
            // ...createTextureCoordsBuffers(params),
        }
    }






    draw2(id, projectionMatrix, viewMatrix) {
        // Tell WebGL to use our program when drawing
        //console.log(name + "."+id+": draw2()");
        gl.useProgram(this.programInfo.program);


        bufferLocationSetup(this.buffers.position, this.programInfo.locations.vertexPosition)
        bufferLocationSetup(this.buffers.color,this.programInfo.locations.vertexColor)
        bufferLocationSetup(this.buffers.normals,this.programInfo.locations.vertexNormal)
        matrixSetup(this.getModelMatrix(), viewMatrix, projectionMatrix, this.programInfo.locations.mvpMatrix)
         

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
