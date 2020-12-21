import { mat4 } from 'gl-matrix';
import { initShaderProgram } from './webglutil.js';
import { BaseProgram } from './baseobj';

/**
 * A base class with uniform color 
 * This is used for http://www.opengl-tutorial.org/miscellaneous/clicking-on-objects/picking-with-an-opengl-hack/
 * 
 */



export class ProgramU extends BaseProgram {


    // Vertex shader program
    vsSource = `
 attribute vec4 aVertexPosition;
 uniform vec3 uColor;
 uniform mat4 uMvpMatrix;

 varying lowp vec3 vColor;
 void main(void) {
    gl_Position = uMvpMatrix  * aVertexPosition;
    vColor = uColor;   
 }
`;

    // Fragment shader program
    fsSource = `
    varying lowp vec3 vColor;
  

   void main(void) {       
    //lowp vec3 colorA = vec3(0.149,0.141,0.912);
       //gl_FragColor = vec4(colorA,1);
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
                color: gl.getUniformLocation(shaderProgram, 'uColor'),
                mvpMatrix: gl.getUniformLocation(shaderProgram, 'uMvpMatrix'),

            }
        };


    }



    //
    // Initialize the buffers we'll need. 
    //
    initBuffers(params) {
        // -- 1 params.positions
        // dump...
        console.log("params.positions: " + params.positions.length);
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

        this.buffers = {
            positionSize: params.positions.length,
            position: positionBuffer,
      
            indices: indexBuffer,
            indicesSize: params.indices.length,
      
        };
    }

    id2color(i){

        if (i>0xffffff || i<0) // 0xffffff=16777215
        throw "id out of range: "+i
        const b = (i & 0x000000FF) >>  0;
        const g = (i & 0x0000FF00) >>  8;
        const r = (i & 0x00FF0000) >> 16;

        

        return [r/255.0,g/255.0,b/255.0]
    }
    color2id(rgb){
        
        const r=rgb[0] * 255; 
        const g=rgb[1] * 255; 
        const b=rgb[2] * 255; 

        const id = r*256*256+g*256+b;
        return id;
    }





    draw2(projectionMatrix, viewMatrix) {
        // Tell WebGL to use our program when drawing
        console.log(name + ": draw2()");
        gl.useProgram(this.programInfo.program);




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
                this.programInfo.locations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                this.programInfo.locations.vertexPosition);
        }



      



        const modelMatrix = this.getModelMatrix();
        const modelViewMatrix = mat4.create();
        mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
        const mvpMatrix = mat4.create();
        mat4.multiply(mvpMatrix, projectionMatrix, modelViewMatrix);

        gl.uniformMatrix4fv(
            this.programInfo.locations.mvpMatrix,
            false,
            mvpMatrix);

        const rgb=this.id2color(0xffffff)
        console.log("color2id:"+this.color2id(rgb))
        gl.uniform3fv( this.programInfo.locations.color, rgb)//new Float32Array([0.349,0.241,0.912]) )

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