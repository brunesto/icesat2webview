import { mat4 } from 'gl-matrix';
import { initShaderProgram } from './webglutil.js';
import { BaseProgram } from './baseobj';
import {
    createPositionAndIndexBuffers,
    createNormalBuffers,
    createTextureCoordsBuffers,
    bufferLocationSetup,
    bufferTextureCoordinatesLocationSetup,
    matrixSetup
} from "./programhelper.js"

import {registerProgram} from './webglprogramcache.js'
/**
 * A program that will render using
 * -positions & indices
 * -normals
 * -texture
 */



export class ProgramPINT extends BaseProgram {


    // Vertex shader program
    vsSource = `
 attribute vec4 aVertexPosition;
 attribute vec3 aVertexNormal;
 attribute vec2 aTextureCoord;

 uniform mat4 uMvpMatrix;

 varying highp vec3 vLighting;
 varying highp vec2 vTextureCoord;
 //varying lowp vec4 vColor;
 void main(void) {
    gl_Position = uMvpMatrix  * aVertexPosition;
   vTextureCoord = aTextureCoord;
   // Apply lighting effect

   highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
   highp vec3 directionalLightColor = vec3(1, 1, 1);
   highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

   highp float directional = max(dot(aVertexNormal, directionalVector), 0.0);
   vLighting = ambientLight + (directionalLightColor * directional);

 }
`;

    // Fragment shader program
    fsSource = `
   varying highp vec2 vTextureCoord;
   varying highp vec3 vLighting;
   uniform sampler2D uSampler;

   void main(void) {
       highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
       gl_FragColor = vec4(texelColor.rgb*vLighting,1);
   }
 `;
    programInfo = null;
    buffers = null;
    constructor(name) {
        super(name + "+" + "PINT");
       


        var shaderProgram = initShaderProgram(this.vsSource, this.fsSource);
        this.programInfo = {
            program: shaderProgram,

            locations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
                textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
                mvpMatrix: gl.getUniformLocation(shaderProgram, 'uMvpMatrix'),
                uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
            }
        };
    

    }

    //
    // Initialize the buffers we'll need. 
    //
    initBuffers(params) {

        return {...createPositionAndIndexBuffers(params),
            ...createNormalBuffers(params),
            ...createTextureCoordsBuffers(params),
            texture : params.texture,
        }
    }




    draw2(id, buffers,projectionMatrix, viewMatrix,modelMatrix) {
        // Tell WebGL to use our program when drawing
        //CCconsole.log(this.name + ": draw2()");
        gl.useProgram(this.programInfo.program);
        bufferLocationSetup(buffers.position, this.programInfo.locations.vertexPosition)
        bufferLocationSetup(buffers.normals, this.programInfo.locations.vertexNormal)

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        matrixSetup(modelMatrix, viewMatrix, projectionMatrix, this.programInfo.locations.mvpMatrix)
        bufferTextureCoordinatesLocationSetup(buffers.textureCoord, this.programInfo.locations.textureCoord)

        // Tell WebGL we want to affect texture unit 0
        {
            gl.activeTexture(gl.TEXTURE0);

            // Bind the texture to texture unit 0
            gl.bindTexture(gl.TEXTURE_2D, buffers.texture);

            // Tell the shader we bound the texture to texture unit 0
            gl.uniform1i(this.programInfo.locations.uSampler, 0);
        }


        // draw
        {
            const trianglesCount = buffers.indicesSize;
            //console.debug("drawElements " + trianglesCount);
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, trianglesCount, type, offset);
        }
    }

    dispose() {
        //CCconsole.log(name + ": dispose()");
        // TODO!!!
    }
}

// registerProgram(new ProgramPINT())