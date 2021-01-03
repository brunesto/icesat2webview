// build a sphere (or a part of it) from rectangles, called tiles


import { mat4, mat3 } from 'gl-matrix';
import { initShaderProgram, loadTexture, gridTexture } from './webglutil.js';
import { computeVertexNormals } from './normals.js'
import { BaseObj } from './baseobj.js'
import { degrees2radians } from './global.js'
import { latlon23d } from "./latlon23d.js";

/**
 * directly convert coordinates (lat,lon) into tiles
 */
class CoordsTilesConverter {
    constructor(granularity) {
        this.granularity = granularity;
    }
    tile2lon(x) {
        return x * this.granularity -180
    }
    tile2lat(y) {
        return y * this.granularity -90
    }

    lon2tile(lon) {
        return (lon +180)/ this.granularity
    }

    lat2tile(lat) {
        return (lat+90 )/ this.granularity
    }

    tiles() {
        return {
            x: Math.round(360 / this.granularity),
            y: Math.round(180 / this.granularity)
        }
    }

    isReversedTextures() {
        return false
    }

    tileLabel(x,y){
        const centerLat=(this.tile2lat(y)+this.tile2lat(y+1))/2
        const centerLon=(this.tile2lon(x)+this.tile2lon(x+1))/2
        return centerLat+","+centerLon

    }
}

/**
 * uses tiles ala OSM @see https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
 * 
 * this is interesting for texturing
 * 
 */
class SlippyTilesConverter {
    constructor(z) {
        this.z = z;
    }
    
    tile2lon(x) {
        return (x / Math.pow(2, this.z) * 360 - 180);
    }
    tile2lat(y) {

        const tiles = Math.pow(2, this.z)
        var n = Math.PI - 2 * Math.PI * y / tiles;
        return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
    }

    lon2tile(lon) { return (Math.floor((lon + 180) / 360 * Math.pow(2,  this.z))); }

    lat2tile(lat) {
        if (lat <= -90) // -85.0511) // 85.0511287798066
            return Math.pow(2,  this.z) ;
        else if (lat >= 90) //85.0511)
            return 0;
        else
            return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2,  this.z)));
    }

    // TODO not working!
    tiles() {
        // zoom level
        //const this.z = 4

        // number of tiles accross a x or y
        const n = Math.pow(2, this.z)
        console.log(" this.z:" + this.z + " n:" + n)
        return { x: n, y: n }
    }
    isReversedTextures() {
        return true
    }
    tileLabel(x,y){
        // const z=4
        // return this.tile2lat(y,z)+","+this.tile2lon(x,z)
        return x+","+y

    }
}
/**
 * build a mesh for a Sphere (or part of it)
 * the mesh is build using pairs of triangle whose coordinates match osm slippy tiles
 */
export class Sphere extends BaseObj {


    constructor(name) {
        super(name)
           this.tileConverter=new SlippyTilesConverter(4)
        // this.tileConverter = new CoordsTilesConverter(10)
    }


    /**
     * convert a tile to its north west 3d point
     */
    tile23d(x, y) {

            var lat;
            var lon;
            // const n = Math.pow(2)
            // if (y < 0) {
            //     lat = 90
            //     lon = 0
            // } else if (y >= n) {
            //     lat = -90
            //     lon = 0
            // } else {
            lat = this.tileConverter.tile2lat(y)
            lon = this.tileConverter.tile2lon(x)

            // }
            return latlon23d(lat, lon, 0)
        }
        /**
         * 
         * given latitude + longitude
         * return a 3d coordinates
         * 
         * https://math.libretexts.org/Bookshelves/Calculus/Book%3A_Calculus_(OpenStax)/12%3A_Vectors_in_Space/12.7%3A_Cylindrical_and_Spherical_Coordinates
         * section: 
         */
        /* latlon23d(lat, lon) {
        // TODO

        // latitude from the north pole 
        const lat0 = 90 - lat


        const φ = degrees2radians(lat0)
        const θ = degrees2radians(lon)
        const ρ = 6378;
        const x = ρ * Math.sin(φ) * Math.cos(θ)
        const z = ρ * Math.sin(φ) * Math.sin(θ)
        const y = ρ * Math.cos(φ)

        const retVal = [x, y]
        console.log(" latlon23d(" + lat + "," + lon + ") = " + retVal)
        return retVal
    }
*/

    //
    // initBuffers
    //
    getParams() {
        // zoom level
        
        const n = this.tileConverter.tiles()
        console.log(" n :", n )

        const texture = gridTexture(n.x+1, n.y+1,{text:(x,y)=>this.tileConverter.tileLabel(x,y)}); //
        //    loadTexture('/public/0.jpeg');

        // longitude per tile
        const lonPerTile = 360 / n.x
            //  const latPerTile = 180 / n

        // remove 1 'peeling' from earth so that it is not overlapping
        // this is only required when displaying the full globe
        //var bbox = { min: [-85, -180], max: [90, 180 - lonPerTile] }
            // var bbox = { min: [-85, 0], max: [90, 60 ] }
            var bbox = { min: [-80, -180], max: [80, 180 ] }

        console.log(" bbox:", bbox)
        const tileBBoxMin = [this.tileConverter.lon2tile(bbox.min[1]), this.tileConverter.lat2tile(bbox.min[0])]
        const tileBBoxMax = [this.tileConverter.lon2tile(bbox.max[1]), this.tileConverter.lat2tile(bbox.max[0])]

        const tileMin = [Math.min(tileBBoxMin[0], tileBBoxMax[0]), Math.min(tileBBoxMin[1], tileBBoxMax[1])]
        const tileMax = [Math.max(tileBBoxMin[0], tileBBoxMax[0]), Math.max(tileBBoxMin[1], tileBBoxMax[1])]

        console.log("tileMin:", tileMin)
        console.log("tileMax:", tileMax)


        // 2.1 positions
        var positions = [];

        for (var y = tileMin[1]; y <= tileMax[1] + 1; y++) {
            for (var x = tileMin[0]; x <= tileMax[0] + 1; x++) {
                var latLng = this.tile23d(x, y);
                console.log("xy:" + x + "," + y + " lll:" + latLng)
                positions = positions.concat(latLng)
            }
        }


        console.log("positions: " + positions.length)

        // 2.2 indices

        var indices = []
        var xSize = tileMax[0] - tileMin[0] + 1
        var ySize = tileMax[1] - tileMin[1] + 1
        const rev = this.tileConverter.isReversedTextures()
        for (var y = 0; y < ySize; y++) {
            for (var x = 0; x < xSize; x++) {




                if (!rev) {
                    indices.push(x + 1 + (y) * (xSize + 1))
                    indices.push(x + 1 + (y + 1) * (xSize + 1))
                    indices.push(x + (y + 1) * (xSize + 1))

                    indices.push(x + (y) * (xSize + 1))
                    indices.push(x + 1 + (y) * (xSize + 1))
                    indices.push(x + (y + 1) * (xSize + 1))


                } else {
                    indices.push(x + (y + 1) * (xSize + 1))
                    indices.push(x + 1 + (y) * (xSize + 1))

                    indices.push(x + (y) * (xSize + 1))




                    indices.push(x + (y + 1) * (xSize + 1))
                    indices.push(x + 1 + (y + 1) * (xSize + 1))
                    indices.push(x + 1 + (y) * (xSize + 1))
                }


            }
        }




        console.log("indices: " + indices.length)

        // 2.3 normals
        const vertexNormals = computeVertexNormals(positions, indices)




        // 2.4 texture coords
        const textureCoordinates = []

        for (var y = tileMin[1]; y <= tileMax[1] + 1; y++) {
            for (var x = tileMin[0]; x <= tileMax[0] + 1; x++) {
                // var latLng = this.tile23d(x, y);
                if (rev) {
                    textureCoordinates.push((x - tileMin[0]) / (xSize))
                    textureCoordinates.push((y - tileMin[1]) / (ySize))
                } else {
                    textureCoordinates.push((x - tileMin[0]) / (xSize))
                    textureCoordinates.push((-y + tileMax[1]) / (ySize))
                }
            }
        }

        // let the super class do the WebGl fun
        return {
            positions: positions,
            indices: indices,
            vertexNormals: vertexNormals,
            textureCoordinates: textureCoordinates,
            texture: texture,
            color: [1.0, 1.0, 1.0]
        }

    }




    draw2(projectionMatrix, viewMatrix) {

        const modelMatrix = mat4.create();

        mat4.translate(modelMatrix, // destination matrix
            modelMatrix, // matrix to translate
            [0.0, 0.0, 0.0]); // amount to translate : earth is the center of (opengl) universe

        super.draw2(projectionMatrix, viewMatrix, modelMatrix)



    }
}