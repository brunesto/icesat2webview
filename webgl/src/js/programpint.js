import { mat4 } from 'gl-matrix';
import { initShaderProgram } from './webglutil.js';
import { Drawable } from './baseobj';
import {createPositionAndIndexBuffers,createNormalBuffers,createTextureCoordsBuffers,
    bufferLocationSetup,bufferTextureCoordinatesLocationSetup,matrixSetup} from "./programhelper.js"
/**
 * A base class with
 * -positions & indices
 * -normals
 * -texture
 */



export class ProgramPINT extends Drawable {


    // Vertex shader program
    vsSource = `
 attribute vec4 aVertexPosition;
 //attribute vec4 aVertexColor;
 attribute vec3 aVertexNormal;
 attribute vec2 aTextureCoord;


 //uniform mat4 uNormalMatrix;
//  uniform mat4 uModelMatrix;
//  uniform mat4 uViewMatrix;
//  uniform mat4 uProjectionMatrix;
 uniform mat4 uMvpMatrix;

 varying highp vec3 vLighting;
 varying highp vec2 vTextureCoord;
 //varying lowp vec4 vColor;
 void main(void) {
    // gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
    gl_Position = uMvpMatrix  * aVertexPosition;
  // vColor = aVertexColor;
   vTextureCoord = aTextureCoord;
   // Apply lighting effect

   highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
   highp vec3 directionalLightColor = vec3(1, 1, 1);
   highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

//    highp vec4 transformedNormal =vec4(aVertexNormal, 1.0);

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
    constructor(name, getModelMatrix) {
        super(name + "+" + "PINT");
        this.getModelMatrix = getModelMatrix;


        var shaderProgram = initShaderProgram(this.vsSource, this.fsSource);
        this.programInfo = {
            program: shaderProgram,

            locations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                // vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
                vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
                textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
            // },
            // uniformLocations: {
                // projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                // viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
                // modelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
               // normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
               mvpMatrix: gl.getUniformLocation(shaderProgram, 'uMvpMatrix'),
                uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
            }
        };



        // Here's where we call the routine that builds all the
        // objects we'll be drawing.
    }



    //
    // Initialize the buffers we'll need. 
    //
    initBuffers(params) {

        this.buffers ={...createPositionAndIndexBuffers(params),
            ...createNormalBuffers(params),
            ...createTextureCoordsBuffers(params),
        }
         //-- 3 normals

      
        // this.buffers = {...retVal,
        //     // positionSize: params.positions.length,
        //     // position: positionBuffer,
        //     // // color: colorBuffer,
        //     // // colorSize: colors.length,
        //     // indices: indexBuffer,
        //     // indicesSize: params.indices.length,
        //     // normals: normalBuffer,
        //     // textureCoord: textureCoordBuffer,
        //     // textures: params.textureCoordinates.length,
        // };
        this.texture = params.texture; // TODO: need to understand more
    }




    draw2(id,projectionMatrix, viewMatrix) {
        // Tell WebGL to use our program when drawing
        //console.log(name + ": draw2()");
        gl.useProgram(this.programInfo.program);

       
        bufferLocationSetup(this.buffers.position,this.programInfo.locations.vertexPosition)

        // // Tell WebGL how to pull out the positions from the position
        // // buffer into the vertexPosition attribute
        // {
        //     const numComponents = 3;
        //     const type = gl.FLOAT;
        //     const normalize = false;
        //     const stride = 0;
        //     const offset = 0;
        //     gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        //     gl.vertexAttribPointer(
        //         this.programInfo.locations.vertexPosition,
        //         numComponents,
        //         type,
        //         normalize,
        //         stride,
        //         offset);
        //     gl.enableVertexAttribArray(
        //         this.programInfo.locations.vertexPosition);
        // }

        bufferLocationSetup(this.buffers.normals,this.programInfo.locations.vertexNormal)

        // // Tell WebGL how to pull out the normals from
        // // the normal buffer into the vertexNormal attribute.
        // {
        //     const numComponents = 3;
        //     const type = gl.FLOAT;
        //     const normalize = false;
        //     const stride = 0;
        //     const offset = 0;
        //     gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normals);
        //     gl.vertexAttribPointer(
        //         this.programInfo.locations.vertexNormal,
        //         numComponents,
        //         type,
        //         normalize,
        //         stride,
        //         offset);
        //     gl.enableVertexAttribArray(
        //         this.programInfo.locations.vertexNormal);
        // }

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);



        // Set the shader uniforms
        // gl.uniformMatrix4fv(
        //     this.programInfo.locations.projectionMatrix,
        //     false,
        //     projectionMatrix);

        // gl.uniformMatrix4fv(
        //     this.programInfo.locations.viewMatrix,
        //     false,
        //     viewMatrix);

        // gl.uniformMatrix4fv(
        //     this.programInfo.locations.modelMatrix,
        //     false,
        //     modelMatrix);

        matrixSetup(this.getModelMatrix(),viewMatrix,projectionMatrix,this.programInfo.locations.mvpMatrix)
            
            // const modelMatrix = this.getModelMatrix();
            // const modelViewMatrix = mat4.create();
            // mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
            // const mvpMatrix = mat4.create();
            // mat4.multiply(mvpMatrix, projectionMatrix, modelViewMatrix);
    
//   gl.uniformMatrix4fv(
//             this.programInfo.locations.mvpMatrix,
//             false,
//             mvpMatrix);


        // // Generate and deliver to the shader a normal matrix, 
        // // which is used to transform the normals when dealing with the current orientation of the cube
        // //  in relation to the light source
        // var normalMatrix = mat4.create();
        // mat4.invert(normalMatrix, modelViewMatrix);
        // mat4.transpose(normalMatrix, normalMatrix);
        // // normalMatrix=modelViewMatrix

        // gl.uniformMatrix4fv(
        //     this.programInfo.locations.normalMatrix,
        //     false,
        //     normalMatrix);

        bufferTextureCoordinatesLocationSetup(this.buffers.textureCoord,this.programInfo.locations.textureCoord)
        // // tell webgl how to pull out the texture coordinates from buffer
        // {
        //     const num = 2; // every coordinate composed of 2 values
        //     const type = gl.FLOAT; // the data in the buffer is 32 bit float
        //     const normalize = false; // don't normalize
        //     const stride = 0; // how many bytes to get from one set to the next
        //     const offset = 0; // how many bytes inside the buffer to start from
        //     gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.textureCoord);
        //     gl.vertexAttribPointer(this.programInfo.locations.textureCoord, num, type, normalize, stride, offset);
        //     gl.enableVertexAttribArray(this.programInfo.locations.textureCoord);
        // }

        // Tell WebGL we want to affect texture unit 0
        {
            gl.activeTexture(gl.TEXTURE0);

            // Bind the texture to texture unit 0
            gl.bindTexture(gl.TEXTURE_2D, this.texture);

            // Tell the shader we bound the texture to texture unit 0
            gl.uniform1i(this.programInfo.locations.uSampler, 0);
        }


        // draw
        {
            const trianglesCount = this.buffers.indicesSize;
            console.debug("drawElements " + trianglesCount);
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