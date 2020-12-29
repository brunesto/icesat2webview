import { mat4 } from 'gl-matrix';
import { initShaderProgram } from './webglutil.js';
import { Drawable } from './baseobj.js';
import { bv3 } from './bv3.js';
import {createPositionAndIndexBuffers,createNormalBuffers,createTextureCoordsBuffers,
    bufferLocationSetup,bufferTextureCoordinatesLocationSetup,matrixSetup} from "./programhelper.js"
/**
 * A base class with uniform color 
 */



export class ProgramPIU extends Drawable {


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

       

        this.buffers ={...createPositionAndIndexBuffers(params),
          color:params.color
        }
    }

    




    draw2(id,projectionMatrix, viewMatrix) {
        this.drawWithColor(this.buffers.color,projectionMatrix, viewMatrix)
    }
    drawWithColor(color,projectionMatrix, viewMatrix) {
    
        // Tell WebGL to use our program when drawing
        console.log(name + "."+this.id+": draw2()");
        gl.useProgram(this.programInfo.program);
        bufferLocationSetup(this.buffers.position,this.programInfo.locations.vertexPosition)
        matrixSetup(this.getModelMatrix(),viewMatrix,projectionMatrix,this.programInfo.locations.mvpMatrix)
        gl.uniform3fv( this.programInfo.locations.color, color)
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
