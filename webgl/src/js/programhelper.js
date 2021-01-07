import { mat4 } from 'gl-matrix';
import {logBufferArray,mat2string} from './global.js'

/**
 * bunch of functions to allocate and setup buffers
 * the index/position expected format is as defined in normal.js
 */
export function createPositionAndIndexBuffers(params) {
    // -- 1 params.positions
    // dump...
    console.log("createPositionAndIndexBuffers  ") // + params.positions.length);
    if (logFlag)
        for (var i = 0; i < params.positions.length; i += 3){
            //CCconsole.log("[" + i  + ",...]=" + params.positions[i] + "," + params.positions[i + 1] + "," + params.positions[i + 2]);
        }

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
    console.log("params.indices: " + params.indices.length);
    if (logFlag)
        for (var i = 0; i < params.indices.length; i += 3) {
            console.log("[" + i + ",...]=" + params.indices[i] + "," + params.indices[i + 1] + "," + params.indices[i + 2]);
        }

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(params.indices), gl.STATIC_DRAW);

    return {
        positionSize: params.positions.length,
        position: positionBuffer,
        // color: colorBuffer,
        // colorSize: colors.length,
        indices: indexBuffer,
        indicesSize: params.indices.length,
    }
}

export function createNormalBuffers(params) {

    //CCconsole.log("params.vertexNormals: " + params.vertexNormals.length);
    if (logFlag)
        for (var i = 0; i < params.vertexNormals.length; i += 3) {
            //CCconsole.log("params.vertexNormals: [" + i + ",...]=" + params.vertexNormals[i] + "," + params.vertexNormals[i + 1] + "," + params.vertexNormals[i + 2]);
        }


    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(params.vertexNormals), gl.STATIC_DRAW);

    return {
        normals: normalBuffer,
    }
}
export function createTextureCoordsBuffers(params) {
    // 4 texture coords
    //CCconsole.log("createTextureCoordsBuffers() " + params.textureCoordinates.length);
    if (logFlag)
        for (var i = 0; i < params.textureCoordinates.length; i += 2) {
            //CCconsole.log("params.textureCoordinates: [" + i + ",...]=" + params.textureCoordinates[i] + "," + params.textureCoordinates[i + 1]);
        }
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(params.textureCoordinates), gl.STATIC_DRAW);
    return {
        textureCoord: textureCoordBuffer,
        textures: params.textureCoordinates.length,
    }
}


/**
 * 
 * given indexed positions and triangle colors, create the vertex colors buffer
 */
export function createColorBuffer(params) {
    var vertexColors = [];
    const numTriangles = Math.trunc(params.indices.length / 3)
    //CCconsole.log("numTriangles:", numTriangles)
    for (var i = 0; i < numTriangles; i++) {
        for (var c = 0; c < 3; c++) {
            vertexColors.push(null);
        }
    }
    //CCconsole.log("vertexColors elems:", vertexColors.length)

    for (var i = 0; i < params.indices.length; i++) {
        // triangle color
        const triangleIdx = Math.trunc(i / 3)
        const triangleColor = params.triangleColors[triangleIdx]
        //CCconsole.log("index:" + i + " triangle:" + triangleIdx + " color:", triangleColor)

        const positionIndex = params.indices[i]
        //CCconsole.log("positionIndex:" + positionIndex)


        // copy the 3 color channels (rgb) for this position
        for (var c = 0; c < 3; c++) {
            const channelIdx = positionIndex * 3 + c
                //  check in case the color is already assigned that it is not changed
            const prev = vertexColors[channelIdx]
            if (prev != null) {
                if (prev != triangleColor[c]) {
                    // conflict in color assignement
                    throw ("error: index @" + positionIndex + " already had a different color assigned")
                }
            } else {
                vertexColors[channelIdx] = triangleColor[c]
            }
        }

    }
    logBufferArray("vertexColors", vertexColors, 4)

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    return {
        color:colorBuffer
    }
}


export function bufferLocationSetup(positionBuffer, vertexPositionLocation) {
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    ////CCconsole.log("bufferLocationSetup l: " + vertexPositionLocation)
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(
        vertexPositionLocation,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        vertexPositionLocation);
}
export function bufferTextureCoordinatesLocationSetup(textureCoordBuffer, textureCoordLocation)
// tell webgl how to pull out the texture coordinates from buffer
{
    ////CCconsole.log("bufferTextureCoordinatesLocationSetup l: " + textureCoordLocation)
    const num = 2; // every coordinate composed of 2 values
    const type = gl.FLOAT; // the data in the buffer is 32 bit float
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set to the next
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.vertexAttribPointer(textureCoordLocation, num, type, normalize, stride, offset);
    gl.enableVertexAttribArray(textureCoordLocation);
}

export function matrixSetup(modelMatrix,viewMatrix,projectionMatrix,mvpMatrixLocation) {
    // const modelMatrix = this.getModelMatrix();
    const modelViewMatrix = mat4.create();
    mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
    const mvpMatrix = mat4.create();
    mat4.multiply(mvpMatrix, projectionMatrix, modelViewMatrix);
    //CCconsole.log("mvp:",mat2string(mvpMatrix))
    gl.uniformMatrix4fv(
        mvpMatrixLocation,
        false,
        mvpMatrix);
}