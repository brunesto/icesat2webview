import { mat4, mat3 } from 'gl-matrix';
import { initShaderProgram, loadTexture, gridTexture } from './webglutil.js';


export class BaseProgram {
    constructor(name) {
        this.name = name
    }
    draw2(projectionMatrix, viewMatrix) {}
}

export class BaseObj {
    inited = false
    constructor(name) {
        this.name = name
        this.modelMatrix = mat4.create();
    }
    ensureInit() {
        if (!this.inited) {
            this.doInit()
            this.inited = true
        }
    }


    doInit() {
            console.log(name + ": init() not implemented")
        }
        /**
         * returns a Drawable
         */
    getDrawable(program, getProgramParams) {
        console.log(name + ": getDrawable() program:" + program.name)

        const thisBaseObj = this
        const retVal = new Drawable()
        retVal.name = thisBaseObj.name + "+" + program.name
        retVal.init = function() {
            console.log(name + ": init()")
            thisBaseObj.ensureInit()
            program.init(getProgramParams(thisBaseObj))
        }
        retVal.dispose = function() {
            console.log(name + ": dispose()")
            program.dispose()
        }
        retVal.draw2 = function(projectionMatrix, viewMatrix) {
            console.log(name + ": draw2()")
            program.draw2(projectionMatrix, viewMatrix, thisBaseObj.modelMatrix)
        }
        return retVal
    }



//draw2(projectionMatrix, viewMatrix) {}
}



/**
 * A base class with 
 * -positions & indices
 * -normals
 * -texture
 */
export class ProgramPINT extends BaseProgram {

    
    // Vertex shader program

    vsSource = `
 attribute vec4 aVertexPosition;
 //attribute vec4 aVertexColor;
 attribute vec3 aVertexNormal;
 attribute vec2 aTextureCoord;


 uniform mat4 uNormalMatrix;
 uniform mat4 uModelMatrix;
 uniform mat4 uViewMatrix;
 uniform mat4 uProjectionMatrix;

 varying highp vec3 vLighting;
 varying highp vec2 vTextureCoord;
 //varying lowp vec4 vColor;
 void main(void) {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
  // vColor = aVertexColor;
   vTextureCoord = aTextureCoord;
   // Apply lighting effect

   highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
   highp vec3 directionalLightColor = vec3(1, 1, 1);
   highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

   highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

   highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
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
    programInfo = null
    buffers = null
    constructor(name,getModelMatrix){
        super(name+"+"+"PINT")
        this.getModelMatrix=getModelMatrix
        

        var shaderProgram = initShaderProgram(this.vsSource, this.fsSource);
        this.programInfo = {
            program: shaderProgram,

            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                // vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
                vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
                textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),

            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
                modelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
                normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
                uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
            }
        }



        // Here's where we call the routine that builds all the
        // objects we'll be drawing.



    }



    //
    // Initialize the buffers we'll need. 
    //

    initBuffers(params){ // positions, indices, vertexNormals, textureCoordinates) {

        // -- 1 params.positions
        // dump...
        console.log("params.positions: " + params.positions.length)
        if (logFlag)
            for (var i = 0; i < params.positions.length; i += 3)
                console.log("[" + i / 3 + ",...]=" + params.positions[i] + "," + params.positions[i + 1] + "," + params.positions[i + 2])

        // Create a buffer for the cube's vertex params.positions.
        const positionBuffer = gl.createBuffer();

        // Select the positionBuffer as the one to apply buffer
        // operations to from here out.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Now pass the list of params.positions into WebGL to build the
        // shape. We do this by creating a Float32Array from the
        // JavaScript array, then use it to fill the current buffer.
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(params.positions), gl.STATIC_DRAW);


        // -- 2 params.indices  
        console.log("params.indices: " + params.indices.length)
        if (logFlag)
            for (var i = 0; i < params.indices.length; i += 3)
                console.log("[" + i + ",...]=" + params.indices[i] + "," + params.indices[i + 1] + "," + params.indices[i + 2])

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(params.indices), gl.STATIC_DRAW);

        //-- 3 normals
        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(params.vertexNormals), gl.STATIC_DRAW);

        // 4 texture coords
        console.log("params.textureCoordinates: " + params.textureCoordinates.length)
        if (logFlag)
            for (var i = 0; i < params.textureCoordinates.length; i += 2)
                console.log("params.textureCoordinates: [" + i + ",...]=" + params.textureCoordinates[i] + "," + params.textureCoordinates[i + 1])

        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(params.textureCoordinates), gl.STATIC_DRAW);

        this.buffers = {
            positionSize: params.positions.length,
            position: positionBuffer,
            // color: colorBuffer,
            // colorSize: colors.length,
            indices: indexBuffer,
            indicesSize: params.indices.length,
            normals: normalBuffer,
            textureCoord: textureCoordBuffer,
            textures: params.textureCoordinates.length,
        };
        this.texture=params.texture; // TODO: need to understand more
    }




    draw2(projectionMatrix, viewMatrix) {
        // Tell WebGL to use our program when drawing
        console.log(name + ": draw2()")
        gl.useProgram(this.programInfo.program);

        const modelMatrix=this.getModelMatrix()
        const modelViewMatrix = mat4.create();
        mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);



        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute
        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
            gl.vertexAttribPointer(
                this.programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                this.programInfo.attribLocations.vertexPosition);
        }



        // Tell WebGL how to pull out the normals from
        // the normal buffer into the vertexNormal attribute.
        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normals);
            gl.vertexAttribPointer(
                this.programInfo.attribLocations.vertexNormal,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                this.programInfo.attribLocations.vertexNormal);
        }

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);



        // Set the shader uniforms
        gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);

        gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.viewMatrix,
            false,
            viewMatrix);

        gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.modelMatrix,
            false,
            modelMatrix);


        // Generate and deliver to the shader a normal matrix, 
        // which is used to transform the normals when dealing with the current orientation of the cube
        //  in relation to the light source
        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, modelViewMatrix);
        mat4.transpose(normalMatrix, normalMatrix);


        gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.normalMatrix,
            false,
            normalMatrix);


        // tell webgl how to pull out the texture coordinates from buffer
        {
            const num = 2; // every coordinate composed of 2 values
            const type = gl.FLOAT; // the data in the buffer is 32 bit float
            const normalize = false; // don't normalize
            const stride = 0; // how many bytes to get from one set to the next
            const offset = 0; // how many bytes inside the buffer to start from
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.textureCoord);
            gl.vertexAttribPointer(this.programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);
            gl.enableVertexAttribArray(this.programInfo.attribLocations.textureCoord);
        }

        // Tell WebGL we want to affect texture unit 0
        {
            gl.activeTexture(gl.TEXTURE0);

            // Bind the texture to texture unit 0
            gl.bindTexture(gl.TEXTURE_2D, this.texture);

            // Tell the shader we bound the texture to texture unit 0
            gl.uniform1i(this.programInfo.uniformLocations.uSampler, 0);
        }


        // draw
        {
            const trianglesCount = this.buffers.indicesSize;
            console.debug("drawElements " + trianglesCount)
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, trianglesCount, type, offset);
        }


    }

    dispose() {
        console.log(name + ": dispose()")
            // TODO!!!
    }
}