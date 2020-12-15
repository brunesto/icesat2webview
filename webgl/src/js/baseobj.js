import { mat4, mat3 } from 'gl-matrix';
import { initShaderProgram, loadTexture, gridTexture } from './webglutil.js';



/**
 * A base class with 
 * -texture
 * -auto normals
 */
export class BaseObj {


    
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
    constructor() {
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
        this.buffers = this.initBuffers(gl);


    }

    

    















    //
    // initBuffers
    //
    // Initialize the buffers we'll need. For this demo, we just
    // have one object -- a simple three-dimensional cube.
    //
    initBuffers(positions,indices,textureCoordinates) {


        // // zoom level
        // const z = 4

        // // number of tiles accross a x or y
        // const n = Math.pow(2, z)
        // console.log(" z:"+ z+" n:"+n)

        //this.texture = gridTexture(n,n); //
        //    loadTexture('/public/0.jpeg');

    //     // longitude per tile
    //     const lonPerTile = 360 / n
    //   //  const latPerTile = 180 / n

    //     // remove 1 'peeling' from earth so that it is not overlapping
    //     // this is only required when displaying the full globe
    //     var bbox = { min: [-85, -180], max: [90, 180 - lonPerTile] }

    //     console.log(" bbox:",bbox)
    //     const tileMin = [this.lon2tile(bbox.min[1], z), this.lat2tile(bbox.max[0], z)]
    //     const tileMax = [this.lon2tile(bbox.max[1], z), this.lat2tile(bbox.min[0], z)]
    //     console.log("tileMin:", tileMin)
    //     console.log("tileMax:", tileMax)

    //     var positions = [];

    //     for (var y = tileMin[1]; y <= tileMax[1] + 1; y++) {
    //         for (var x = tileMin[0]; x <= tileMax[0] + 1; x++) {
    //             var latLng = this.tile23d(x, y, z);
    //             console.log("xy:" + x + "," + y + " lll:" + latLng)
    //             positions = positions.concat(latLng)
    //         }
    //     }


    //     // const coordsStep = 10;
    //     // var positions = [];
    //     // for (var lat = bbox.min[0]; lat <= bbox.max[0]; lat += coordsStep) {
    //     //     for (var lon = bbox.min[1]; lon <= bbox.max[1]; lon += coordsStep) {
    //     //         var latLng = this.latlon23d(lat, lon)
    //     //         positions = positions.concat(latLng)
    //     //     }
    //     // }



    //     console.log("positions: " + positions.length)

        if (logFlag)
            for (var i = 0; i < positions.length; i += 3)
                console.log("[" + i / 3 + ",...]=" + positions[i] + "," + positions[i + 1] + "," + positions[i + 2])

        // Create a buffer for the cube's vertex positions.

        const positionBuffer = gl.createBuffer();

        // Select the positionBuffer as the one to apply buffer
        // operations to from here out.

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Now create an array of positions for the cube.



        // Now pass the list of positions into WebGL to build the
        // shape. We do this by creating a Float32Array from the
        // JavaScript array, then use it to fill the current buffer.

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        // Build the element array buffer; this specifies the indices
        // into the vertex arrays for each face's vertices.

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        // This array defines each face as two triangles, using the
        // indices into the vertex array to specify each triangle's
        // position.



        // var indices = []
            // This array defines each face as two triangles, using the
            // indices into the vertex array to specify each triangle's
            // position.    
            // var lonSize = bbox.max[1] - bbox.min[1]
            // var latSize = bbox.max[0] - bbox.min[0]

        // var lonSteps = lonSize / coordsStep
        // var latSteps = latSize / coordsStep

        // console.log("lonSize:" + lonSize)
        // console.log("latSize:" + latSize)
        // console.log("lonSteps:" + lonSteps)
        // console.log("latSteps:" + latSteps)
        // for (var dlat = 0; dlat < latSteps; dlat++) {
        //     for (var dlon = 0; dlon < lonSteps; dlon++) {
        //         indices.push((dlon) + (dlat) * (lonSteps + 1))
        //         indices.push((dlon + 1) + (dlat) * (lonSteps + 1))
        //         indices.push((dlon) + (dlat + 1) * (lonSteps + 1))
        //         indices.push((dlon + 1) + (dlat) * (lonSteps + 1))
        //         indices.push((dlon + 1) + (dlat + 1) * (lonSteps + 1))
        //         indices.push((dlon) + (dlat + 1) * (lonSteps + 1))

        //     }
        // }

        // var xSize = tileMax[0] - tileMin[0] + 1
        // var ySize = tileMax[1] - tileMin[1] + 1

        // for (var y = 0; y < ySize; y++) {
        //     for (var x = 0; x < xSize; x++) {
        //         indices.push(x + (y) * (xSize + 1))
        //         indices.push(x + 1 + (y) * (xSize + 1))
        //         indices.push(x + (y + 1) * (xSize + 1))
        //         indices.push(x + 1 + (y) * (xSize + 1))
        //         indices.push(x + 1 + (y + 1) * (xSize + 1))
        //         indices.push(x + (y + 1) * (xSize + 1))
        //     }
        // }




        // console.log("indices: " + indices.length)

        if (logFlag)
            for (var i = 0; i < indices.length; i += 3)
                console.log("[" + i + ",...]=" + indices[i] + "," + indices[i + 1] + "," + indices[i + 2])

        // Now send the element array to GL

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices), gl.STATIC_DRAW);




        //-- normals  ---------------------------------------
        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

        const vertexNormals = GH.computeVertexNormals(positions, indices)

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);




        // -- texture coords -------------------------------------------



        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

        // const textureCoordinates = []

        // for (var y = tileMin[1]; y <= tileMax[1] + 1; y++) {
        //     for (var x = tileMin[0]; x <= tileMax[0] + 1; x++) {
        //        // var latLng = this.tile23d(x, y, z);
        //         textureCoordinates.push((tileMax[0]-x) / (xSize))
        //         textureCoordinates.push((y - tileMin[1]) / (ySize))
        //     }
        // }
        if (logFlag)
            for (var i = 0; i < textureCoordinates.length; i += 2)
                console.log("textureCoordinates: [" + i + ",...]=" + textureCoordinates[i] + "," + textureCoordinates[i + 1])

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
            gl.STATIC_DRAW);









        // // // Convert the array of colors into a table for all the vertices.

        // var colors = [];

        // for (var i = 0; i < positions.length; i++) {
        //     colors = colors.concat([Math.random(), Math.random(), Math.random(), 1.0]);

        // }



        // const colorBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);


        return {
            positionSize: positions.length,
            position: positionBuffer,
            // color: colorBuffer,
            // colorSize: colors.length,
            indices: indexBuffer,
            indicesSize: indices.length,
            normals: normalBuffer,
            textureCoord: textureCoordBuffer,
            textures: textureCoordinates.length,
        };
    }

   


    draw2(projectionMatrix, viewMatrix,modelMatrix) {
        // Tell WebGL to use our program when drawing

        gl.useProgram(this.programInfo.program);

        // Set the drawing position to the "identity" point, which is
        // the center of the scene.
        // const modelMatrix = mat4.create();

        // Now move the drawing position a bit to where we want to
        // start drawing the square.

        // mat4.translate(modelMatrix, // destination matrix
        //     modelMatrix, // matrix to translate
        //     [0.0, 0.0, 0.0]); // amount to translate : earth is the center of (opengl) universe


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

        // // Tell WebGL how to pull out the colors from the color buffer
        // // into the vertexColor attribute.
        // {
        //     const numComponents = 4;
        //     const type = gl.FLOAT;
        //     const normalize = false;
        //     const stride = 0;
        //     const offset = 0;
        //     gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
        //     gl.vertexAttribPointer(
        //         this.programInfo.attribLocations.vertexColor,
        //         numComponents,
        //         type,
        //         normalize,
        //         stride,
        //         offset);
        //     gl.enableVertexAttribArray(
        //         this.programInfo.attribLocations.vertexColor);
        // }

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

        // Tell WebGL to use our program when drawing

        gl.useProgram(this.programInfo.program);

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


        // Finally, we need to update the code that builds the uniform matrices to generate and deliver to the shader a normal matrix, 
        // which is used to transform the normals when dealing with the current orientation of the cube in relation to the light source
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


        {
            const trianglesCount = this.buffers.indicesSize;
            console.debug("drawElements " + trianglesCount)
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, trianglesCount, type, offset);
        }


    }
}