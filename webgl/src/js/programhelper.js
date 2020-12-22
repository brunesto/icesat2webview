export function createPositionAndIndexBuffers(params) {
    // -- 1 params.positions
    // dump...
    console.log("createPositionAndIndexBuffers  ") // + params.positions.length);
    if (logFlag)
        for (var i = 0; i < params.positions.length; i += 3)
            console.log("[" + i / 3 + ",...]=" + params.positions[i] + "," + params.positions[i + 1] + "," + params.positions[i + 2]);

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
        for (var i = 0; i < params.indices.length; i += 3)
            console.log("[" + i + ",...]=" + params.indices[i] + "," + params.indices[i + 1] + "," + params.indices[i + 2]);

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

    console.log("params.vertexNormals: " + params.vertexNormals.length);
    if (logFlag)
        for (var i = 0; i < params.vertexNormals.length; i += 3)
            console.log("params.vertexNormals: [" + i + ",...]=" + params.vertexNormals[i] + "," + params.vertexNormals[i + 1] + "," + params.vertexNormals[i + 2]);


    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(params.vertexNormals), gl.STATIC_DRAW);

    return {
        normals: normalBuffer,
    }
}
export function createTextureCoordsBuffers(params) {
    // 4 texture coords
    console.log("createTextureCoordsBuffers() " + params.textureCoordinates.length);
    if (logFlag)
        for (var i = 0; i < params.textureCoordinates.length; i += 2)
            console.log("params.textureCoordinates: [" + i + ",...]=" + params.textureCoordinates[i] + "," + params.textureCoordinates[i + 1]);

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(params.textureCoordinates), gl.STATIC_DRAW);
    return {
        textureCoord: textureCoordBuffer,
        textures: params.textureCoordinates.length,
    }
}

