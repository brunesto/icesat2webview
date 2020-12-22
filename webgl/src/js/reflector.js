/**
 * a simple reflector
 */

import { BaseObj } from './baseobj.js'
import { initShaderProgram, loadTexture, gridTexture } from './webglutil.js';
import {computeVertexNormals} from './normals.js'
export class reflector extends BaseObj {
    getParams() {



        // Now create an array of positions for the square.

        const positions = [
            // vertical
            0, -1.0, -1.0,
            0, -1.0, 1.0,
            0, 1.0, 1.0,
            0, 1.0, -1.0,
            
            // horizontal

             -1.0,0, -1.0,
             -1.0,0, 1.0,
             1.0,0, 1.0,
             1.0,0, -1.0,
        ];





        // -- indices ------------------------------------------------


        // This array defines each face as two triangles, using the
        // indices into the vertex array to specify each triangle's
        // position.

        const indices = [
            0, 1, 2, 2, 3, 0, // vertical
            4, 5, 6, 6, 7, 4, // hz            
        ];



        //-- normals  ---------------------------------------


        const vertexNormals =
            computeVertexNormals(positions, indices)


        // -- texture coords -------------------------------------------






        // let the super class do the WebGl fun
        const retVal = {
            positions: positions,
            indices: indices,
            vertexNormals: vertexNormals,            
        }

        console.log("reflector done", retVal)
        return retVal

    }

    constructor(name) {
        super(name)


    }













}