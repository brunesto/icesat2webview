import { mat4, mat3 } from 'gl-matrix';
import { initShaderProgram, loadTexture } from './webglutil.js';

export class Sphere {


    vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main(void) {
      gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
    }
  `;

    // Fragment shader
    fsSource = `
    //uniform lowp vec4 uColor;

    void main(void) {
      vec3 colorA = vec3(0.149,0.141,0.912);
      gl_FragColor =vec4(colorA,1.0);
    }
  `;


    constructor() {
        var shaderProgram = initShaderProgram(this.vsSource, this.fsSource);
        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                //aVertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
              
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
                modelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix') ,              
                // color: gl.getUniformLocation(shaderProgram, 'uColor')                
            },
        }
        console.log("programInfo:", this.programInfo)

        

        this.buffers = this.initBuffers()
    }


    /**
     * 
     * given latitude + longitude
     * return a 3d coordinates
     */
    latlon23d(lat, lon) {
        // TODO
        return [lon/180, lat/90, 0]
    }

    initBuffers() {


        // Now create an array of positions for the square.


        var positions = [];

        var bbox = { min: [49, 12], max: [50, 13] }

        for (var lon = bbox.min[1]; lon <= bbox.max[1]; lon++) {
            for (var lat = bbox.min[0]; lat <= bbox.max[0]; lat++) {
                positions.push(this.latlon23d(lat, lon))
            }
        }
        for(var i in positions)
            console.log("#i"+positions[i])




             positions = [
                // Front face
                -1.0, -1.0, 1.0,
                1.0, -1.0, 1.0,
                1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
    
                // Back face
                -1.0, -1.0, -1.0, -1.0, 1.0, -1.0,
                1.0, 1.0, -1.0,
                1.0, -1.0, -1.0,
    
                // Top face
                -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
                1.0, 1.0, 1.0,
                1.0, 1.0, -1.0,
    
                // Bottom face
                -1.0, -1.0, -1.0,
                1.0, -1.0, -1.0,
                1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
    
                // Right face
                1.0, -1.0, -1.0,
                1.0, 1.0, -1.0,
                1.0, 1.0, 1.0,
                1.0, -1.0, 1.0,
    
                // Left face
                -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
            ];

        // Create a buffer for the square's positions.

        const positionBuffer = gl.createBuffer();

        // Select the positionBuffer as the one to apply buffer
        // operations to from here out.

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Now pass the list of positions into WebGL to build the
        // shape. We do this by creating a Float32Array from the
        // JavaScript array, then use it to fill the current buffer.

        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(positions),
            gl.STATIC_DRAW);


        // indices
        var indices = []
       

        // This array defines each face as two triangles, using the
        // indices into the vertex array to specify each triangle's
        // position.    
        var lonSize=bbox.max[1] - bbox.min[1]
        var latSize=bbox.max[0] - bbox.min[0]
        console.log("lonSize:"+lonSize)
        console.log("latSize:"+latSize)
        for (var dlat = 0; dlat <latSize ; dlat++) {
            for (var dlon = 0; dlon < lonSize; dlon++) {
                indices.push((dlon)+(dlat)*(latSize+1))
                indices.push((dlon+1)+(dlat)*(latSize+1))
                indices.push((dlon)+(dlat+1)*(latSize+1))
                indices.push((dlon+1)+(dlat)*(latSize+1))
                indices.push((dlon)+(dlat+1)*(latSize+1))
                indices.push((dlon+1)+(dlat+1)*(latSize+1))
            }
        }
        for(var i=0;i<indices.length;i+=3)
            console.log("#i "+indices[i]+","+indices[i+1]+","+indices[i+2])



            indices = [
                0, 1, 2, 0, 2, 3, // front
                4, 5, 6, 4, 6, 7, // back
                8, 9, 10, 8, 10, 11, // top
                12, 13, 14, 12, 14, 15, // bottom
                16, 17, 18, 16, 18, 19, // right
                20, 21, 22, 20, 22, 23, // left
            ];


        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        // Now send the element array to GL

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices), gl.STATIC_DRAW);


            return {            
                position: positionBuffer,
                indices: indexBuffer                
            };
    }






    draw2(projectionMatrix, viewMatrix) {
        // Tell WebGL to use our program when drawing

        gl.useProgram(this.programInfo.program);

        // Set the drawing position to the "identity" point, which is
        // the center of the scene.
        const modelMatrix = mat4.create();

        // Now move the drawing position a bit to where we want to
        // start drawing the square.

        mat4.translate(modelMatrix, // destination matrix
            modelMatrix, // matrix to translate
            [-0.0, 0.0, -6.0]); // amount to translate

        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute.
        {
            const numComponents = 3; // pull out 2 values per iteration
            const type = gl.FLOAT; // the data in the buffer is 32bit floats
            const normalize = false; // don't normalize
            const stride = 0; // how many bytes to get from one set of values to the next
            // 0 = use type and numComponents above
            const offset = 0; // how many bytes inside the buffer to start from
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





/*
  const modelViewMatrix = mat4.create();
  mat4.multiply(modelViewMatrix, viewMatrix,modelMatrix);


  // Finally, we need to update the code that builds the uniform matrices to generate and deliver to the shader a normal matrix, 
  // which is used to transform the normals when dealing with the current orientation of the cube in relation to the light source
  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

*/

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

            // gl.uniform4fv(
            //     this.programInfo.uniformLocations.color,
              
            //     [1, 1, 1,1]);
    



        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);



        {
            const vertexCount = this.buffers.indices.length/3;
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }
    }
}