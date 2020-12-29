/**
 * A simple object in the shape of a radar reflector, i.e. 3 planes . should be visible from all angles
 * 
 * TODO: the gain of using this vs cubes is minimal....so probably better to use cubes instead?
 */

import { BaseObj } from './baseobj.js'
import { initShaderProgram, loadTexture, gridTexture } from './webglutil.js';
import { computeVertexNormals } from './normals.js'
export class Reflector extends BaseObj {
    getParams() {



        // Now create an array of positions for the square.

        const positions = [
            // vert
            0, -1.0, -1.0,
            0, -1.0, 1.0,
            0, 1.0, 1.0,
            0, 1.0, -1.0,

            // hz

            -1.0, 0, -1.0, -1.0, 0, 1.0,
            1.0, 0, 1.0,
            1.0, 0, -1.0,



            // facing
            -1.0, -1.0, 0, -1.0, 1.0, 0,
            1.0, 1.0, 0,
            1.0, -1.0, 0,
        ];





        // -- indices ------------------------------------------------


        // This array defines each face as two triangles, using the
        // indices into the vertex array to specify each triangle's
        // position.

        const indices = [
            0, 1, 2, 2, 3, 0, // vt
            2, 1, 0, 0, 3, 2, // vt
            4, 5, 6, 6, 7, 4, // hz    
            6, 5, 4, 4, 7, 6, // hz    
            8, 9, 10, 10, 11, 8, // face
            10, 9, 8, 8, 11, 10, // face
                     
        ];



        //-- normals  ---------------------------------------


        const vertexNormals =
            computeVertexNormals(positions, indices)


        const triangleColors = [
            [0.0, 1.0, 0.0], //  green
            [0.0, 1.0, 0.0], //  green
            [0.0, 1.0, 0.0], //  green
            [0.0, 1.0, 0.0], //  green
            [1.0, 0.0, 0.0], //  red
            [1.0, 0.0, 0.0], //  red
            [1.0, 0.0, 0.0], //  red
            [1.0, 0.0, 0.0], //  red
            [0.0, 0.0, 1.0], //  blue
            [0.0, 0.0, 1.0], //  blue
            [0.0, 0.0, 1.0], //  blue
            [0.0, 0.0, 1.0], //  blue

        ];





        // let the super class do the WebGl fun
        const retVal = {
            positions: positions,
            indices: indices,
            vertexNormals: vertexNormals,
            triangleColors: triangleColors,
            color: [1.0, 1.0, 0.0],
        }

        console.log("reflector done", retVal)
        return retVal

    }

    constructor(name) {
        super(name)


    }













}