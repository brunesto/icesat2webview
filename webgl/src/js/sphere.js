import { mat4, mat3 } from 'gl-matrix';
import { initShaderProgram, loadTexture, gridTexture } from './webglutil.js';
import {computeVertexNormals} from './normals.js'
import { BaseObj } from './baseobj.js'
import { degrees2radians} from './global.js'
/**
 * build a mesh for a Sphere (or part of it)
 * the mesh is build using pairs of triangle whose coordinates match osm slippy tiles
 */
export class Sphere extends BaseObj {

    constructor(name){
        super(name)
    }
    // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
    tile2long(x, z) {
        return (x / Math.pow(2, z) * 360 - 180);
    }
    tile2lat(y, z) {

        const tiles = Math.pow(2, z)
        var n = Math.PI - 2 * Math.PI * y / tiles;
        return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
    }

    lon2tile(lon, zoom) { return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom))); }

    lat2tile(lat, zoom) {
        if (lat <= -90) // -85.0511) // 85.0511287798066
            return Math.pow(2, zoom) - 1;
        else if (lat >= 90) //85.0511)
            return 0;
        else
            return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
    }

    /**
     * convert a tile to its north west 3d point
     */
    tile23d(x, y, z) {
            var lat;
            var lon;
            // const n = Math.pow(2, z)
            // if (y < 0) {
            //     lat = 90
            //     lon = 0
            // } else if (y >= n) {
            //     lat = -90
            //     lon = 0
            // } else {
            lat = this.tile2lat(y, z)
            lon = this.tile2long(x, z)

            // }
            return this.latlon23d(lat, lon)
        }
        /**
         * 
         * given latitude + longitude
         * return a 3d coordinates
         * 
         * https://math.libretexts.org/Bookshelves/Calculus/Book%3A_Calculus_(OpenStax)/12%3A_Vectors_in_Space/12.7%3A_Cylindrical_and_Spherical_Coordinates
         * section: 
         */
    latlon23d(lat, lon) {
        // TODO

        // latitude from the north pole 
        const lat0 = 90 - lat


        const φ = degrees2radians(lat0)
        const θ = degrees2radians(lon)
        const ρ = 6378;
        const x = ρ * Math.sin(φ) * Math.cos(θ)
        const z = ρ * Math.sin(φ) * Math.sin(θ)
        const y = ρ * Math.cos(φ)

        const retVal = [x, y, z]
        console.log(" latlon23d(" + lat + "," + lon + ") = " + retVal)
        return retVal
    }


    //
    // initBuffers
    //
    getParams() {


        // zoom level
        const z = 4

        // number of tiles accross a x or y
        const n = Math.pow(2, z)
        console.log(" z:" + z + " n:" + n)

        const texture = gridTexture(n, n); //
        //    loadTexture('/public/0.jpeg');

        // longitude per tile
        const lonPerTile = 360 / n
            //  const latPerTile = 180 / n

        // remove 1 'peeling' from earth so that it is not overlapping
        // this is only required when displaying the full globe
        var bbox = { min: [-85, -180], max: [90, 180 - lonPerTile] }

        console.log(" bbox:", bbox)
        const tileMin = [this.lon2tile(bbox.min[1], z), this.lat2tile(bbox.max[0], z)]
        const tileMax = [this.lon2tile(bbox.max[1], z), this.lat2tile(bbox.min[0], z)]
        console.log("tileMin:", tileMin)
        console.log("tileMax:", tileMax)


        // 2.1 positions
        var positions = [];

        for (var y = tileMin[1]; y <= tileMax[1] + 1; y++) {
            for (var x = tileMin[0]; x <= tileMax[0] + 1; x++) {
                var latLng = this.tile23d(x, y, z);
                console.log("xy:" + x + "," + y + " lll:" + latLng)
                positions = positions.concat(latLng)
            }
        }


        console.log("positions: " + positions.length)

        // 2.2 indices

        var indices = []
        var xSize = tileMax[0] - tileMin[0] + 1
        var ySize = tileMax[1] - tileMin[1] + 1

        for (var y = 0; y < ySize; y++) {
            for (var x = 0; x < xSize; x++) {
                indices.push(x + (y) * (xSize + 1))
                indices.push(x + 1 + (y) * (xSize + 1))
                indices.push(x + (y + 1) * (xSize + 1))
                indices.push(x + 1 + (y) * (xSize + 1))
                indices.push(x + 1 + (y + 1) * (xSize + 1))
                indices.push(x + (y + 1) * (xSize + 1))
            }
        }




        console.log("indices: " + indices.length)

        // 2.3 normals
        const vertexNormals = computeVertexNormals(positions, indices)




        // 2.4 texture coords
        const textureCoordinates = []

        for (var y = tileMin[1]; y <= tileMax[1] + 1; y++) {
            for (var x = tileMin[0]; x <= tileMax[0] + 1; x++) {
                // var latLng = this.tile23d(x, y, z);
                textureCoordinates.push((tileMax[0] - x) / (xSize))
                textureCoordinates.push((y - tileMin[1]) / (ySize))
            }
        }

        // let the super class do the WebGl fun
        return {
            positions:positions,
            indices:indices,
            vertexNormals:vertexNormals, 
            textureCoordinates:textureCoordinates,
            texture:texture,
        color:[1.0,1.0,1.0]}

    }




    draw2(projectionMatrix, viewMatrix) {

        const modelMatrix = mat4.create();

        mat4.translate(modelMatrix, // destination matrix
            modelMatrix, // matrix to translate
            [0.0, 0.0, 0.0]); // amount to translate : earth is the center of (opengl) universe

        super.draw2(projectionMatrix, viewMatrix, modelMatrix)



    }
}