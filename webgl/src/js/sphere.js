// build a sphere (or a part of it) from rectangles, called tiles


import { mat4, mat3 } from 'gl-matrix';
import { initShaderProgram, loadTexture, gridTexture } from './webglutil.js';
import { computeVertexNormals } from './normals.js'
import { BaseObj } from './baseobj.js'
import { degrees2radians } from './global.js'
import { latlon23d } from "./latlon23d.js";



class BaseTileConverter {

    constructor(maxSize){
        this.maxSize=maxSize 
    }

    init(bbox) {
        //
        this.tilesBbox = this.bbox2tiles(bbox)
        console.log("tilesBbox:", JSON.stringify(this.tilesBbox))

        this.tilesBboxSize = this.tiles(this.tilesBbox)
        console.log("tilesBboxSize :", this.tilesBboxSize)

        if (this.maxSize){
            while (this.tilesBboxSize.x>this.maxSize.x){

                this.tilesBbox.min[0]++
                this.tilesBbox.max[0]--
                this.tilesBboxSize.x-=2
            }
            while (this.tilesBboxSize.y>this.maxSize.y){

                this.tilesBbox.min[1]++
                this.tilesBbox.max[1]--
                this.tilesBboxSize.y-=2
            }
            console.log("tilesBbox:", JSON.stringify(this.tilesBbox))
            console.log("tilesBboxSize :", this.tilesBboxSize)
                // AINT working for lat
                // const maxDLon=this.tile2lon(this.maxSize.x)-this.tile2lon(-180) 
                // const dLon=this.tile2lon(this.tilesBboxSize.x)-this.tile2lon(-180)             
                // const reduceLon=(dLon-maxDLon)/2
                // this.init({
                //     min:[bbox.min[0],bbox.min[1]+reduceLon],
                //     max:[bbox.max[0],bbox.max[1]-reduceLon],
                //     }
                // )

            // }
        }

    }
    lon2tile(lon) {}

    lat2tile(lat) {}

    tile2lon(x) {}
        
    tile2lat(y) {}
        

    bbox2tiles(bbox) {
        const tileBBoxMin = [this.lon2tile(bbox.min[1]), this.lat2tile(bbox.min[0])]
        const tileBBoxMax = [this.lon2tile(bbox.max[1]), this.lat2tile(bbox.max[0])]

        const tileMin = [
            Math.min(tileBBoxMin[0], tileBBoxMax[0]),
            Math.min(tileBBoxMin[1], tileBBoxMax[1])
        ]
        const tileMax = [
            1 + Math.max(tileBBoxMin[0], tileBBoxMax[0]),
            1 + Math.max(tileBBoxMin[1], tileBBoxMax[1])
        ]
        return { min: tileMin, max: tileMax }
    }
    tiles(tilesBbox) {
        return {
            x: tilesBbox.max[0] - tilesBbox.min[0],
            y: tilesBbox.max[1] - tilesBbox.min[1]
        }

    }
}
/**
 * directly convert coordinates (lat,lon) into tiles
 */
export class CoordsTilesConverter extends BaseTileConverter {
    constructor(granularity ,maxSize){
        super(maxSize)
        this.granularity = granularity;
    }

    init(bbox) {
        super.init(bbox)



        //CCconsole.log(" n :", n )
        // this.texture = gridTexture(this.tilesBboxSize.x ,this.tilesBboxSize.y , { text: (x, y) => this.tileLabel(x, y),cross:true }); //
        this.texture = gridTexture(this.tilesBboxSize.x, this.tilesBboxSize.y, { text: (x, y) => this.tileLabel(this.tilesBbox.min[0] + x, this.tilesBbox.min[1] + y), cross: true }); //

        //    loadTexture('/public/0.jpeg');
    }
    tile2lon(x) {
        return x * this.granularity - 180
    }
    tile2lat(y) {
        return y * this.granularity - 90
    }

    lon2tile(lon) {
        return Math.floor((lon + 180) / this.granularity)
    }

    lat2tile(lat) {
        return Math.floor((lat + 90) / this.granularity)
    }

    // tiles() {
    //     return {
    //         x: Math.round(360 / this.granularity),
    //         y: Math.round(180 / this.granularity)
    //     }
    // }

    isReversedTextures() {
        return false
    }

    tileLabel(x, y) {
        const centerLat = (this.tile2lat(y) + this.tile2lat(y + 1)) / 2
        const centerLon = (this.tile2lon(x) + this.tile2lon(x + 1)) / 2
        return centerLat + "," + centerLon

    }
}

/**
 * uses tiles ala OSM @see https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
 * 
 * this is interesting for texturing
 * 
 */
export class SlippyTilesConverter extends BaseTileConverter {
    constructor(z,maxSize) {
        super(maxSize)
        this.z = z;
       
    }

    init(bbox) {
        super.init(bbox)


        //    loadTexture('/public/0.jpeg');

        // longitude per tile
        const lonPerTile = 360 / this.tilesBboxSize.x
            //  const latPerTile = 180 / n

        // remove 1 'peeling' from earth so that it is not overlapping
        // this is only required when displaying the full globe
        //var bbox = { min: [-85, -180], max: [90, 180 - lonPerTile] }
        // var bbox = { min: [-85, 0], max: [90, 60 ] }
        //   var bbox = { min: [-80, -180], max: [80, 180 ] }


        // const tileBBoxMin = [this.lon2tile(bbox.min[1]), this.lat2tile(bbox.min[0])]
        // const tileBBoxMax = [this.lon2tile(bbox.max[1]), this.lat2tile(bbox.max[0])]

        // const tileMin = [Math.min(tileBBoxMin[0], tileBBoxMax[0]), Math.min(tileBBoxMin[1], tileBBoxMax[1])]
        // const tileMax = [Math.max(tileBBoxMin[0], tileBBoxMax[0]), Math.max(tileBBoxMin[1], tileBBoxMax[1])]
        //  this.tilesBbox = this.bbox2tiles(bbox)
        //const thisConverter=this
        this.texture = gridTexture(this.tilesBboxSize.x, this.tilesBboxSize.y, { text: (x, y) => this.tileLabel(this.tilesBbox.min[0] + x, this.tilesBbox.min[1] + y) }); //

    }






    tile2lon(x) {
        return (x / Math.pow(2, this.z) * 360 - 180);
    }
    tile2lat(y) {

        const tiles = Math.pow(2, this.z)
        var n = Math.PI - 2 * Math.PI * y / tiles;
        return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
    }

    lon2tile(lon) { return (Math.floor((lon + 180) / 360 * Math.pow(2, this.z))); }

    lat2tile(lat) {
        if (lat <= -90) // -85.0511) // 85.0511287798066
            return Math.pow(2, this.z);
        else if (lat >= 90) //85.0511)
            return 0;
        else
            return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, this.z)));
    }

    // // TODO not working!
    // tiles() {
    //     // zoom level
    //     //const this.z = 4

    //     // number of tiles accross a x or y
    //     const n = Math.pow(2, this.z)
    //         //CCconsole.log(" this.z:" + this.z + " n:" + n)
    //     return { x: n, y: n }
    // }
    isReversedTextures() {
        return true
    }
    tileLabel(x, y) {
        // const z=4
        // return this.tile2lat(y,z)+","+this.tile2lon(x,z)
        return x + "," + y

    }
}
/**
 * build a mesh for a Sphere (or part of it)
 * the mesh is build using pairs of triangle whose coordinates match osm slippy tiles
 */
export class Sphere extends BaseObj {


    constructor(name, tileConverter, bbox) {
        super(name)
            //CCconsole.log(" bbox:", bbox)


        // this.tileConverter=new SlippyTilesConverter(bbox,4)
        this.tileConverter = tileConverter //new CoordsTilesConverter( 10)
        this.tileConverter.init(bbox)



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
        //CCconsole.log(" latlon23d(" + lat + "," + lon + ") = " + retVal)
        return retVal
    }
*/

    //
    // initBuffers
    //
    getParams() {
        // zoom level



        const tilesBbox = this.tileConverter.tilesBbox
        const tilesBboxSize = this.tileConverter.tilesBboxSize
            //CCconsole.log("tilesBbox:", tilesBbox)



        // 2.1 positions
        var positions = [];
        for (var j = 0; j <= tilesBboxSize.y; j++) {
            const y = j + tilesBbox.min[1]
            for (var i = 0; i <= tilesBboxSize.x; i++) {
                // for (var y = tilesBbox.min[1]; y <= tilesBbox.max[1] ; y++) {
                //     for (var x = tilesBbox.min[0]; x <= tilesBbox.max[0] ; x++) {
                const x = i + tilesBbox.min[0]

                var lat = this.tileConverter.tile2lat(y)
                var lon = this.tileConverter.tile2lon(x)

                var pos = this.tile23d(x, y);
                //CCconsole.log("@" + positions.length + " xy:" + x + "," + y + " coords:" + lat + "," + lon + " 3d:" + pos)
                positions = positions.concat(pos)
            }
        }


        //CCconsole.log("positions: " + positions.length + " (/3=" + (positions.length / 3) + ")")

        // 2.2 indices

        var indices = []
            //var xSize = tilesBbox.max[0] - tilesBbox.min[0]
            //var ySize = tilesBbox.max[1] - tilesBbox.min[1]
        const rev = this.tileConverter.isReversedTextures()
            // for (var y = 0; y < ySize; y++) {
            //     for (var x = 0; x < xSize; x++) {

        for (var j = 0; j < tilesBboxSize.y; j++) {
            for (var i = 0; i < tilesBboxSize.x; i++) {



                if (!rev) {
                    indices.push(i + (j) * (tilesBboxSize.x + 1))
                    indices.push(i + 1 + (j) * (tilesBboxSize.x + 1))
                    indices.push(i + (j + 1) * (tilesBboxSize.x + 1))

                    indices.push(i + 1 + (j) * (tilesBboxSize.x + 1))
                    indices.push(i + 1 + (j + 1) * (tilesBboxSize.x + 1))
                    indices.push(i + (j + 1) * (tilesBboxSize.x + 1))


                } else {
                    indices.push(i + (j + 1) * (tilesBboxSize.x + 1))
                    indices.push(i + 1 + (j) * (tilesBboxSize.x + 1))

                    indices.push(i + (j) * (tilesBboxSize.x + 1))




                    indices.push(i + (j + 1) * (tilesBboxSize.x + 1))
                    indices.push(i + 1 + (j + 1) * (tilesBboxSize.x + 1))
                    indices.push(i + 1 + (j) * (tilesBboxSize.x + 1))
                }


            }
        }




       //CCconsole.log("indices: " + indices.length)

        // 2.3 normals
        const vertexNormals = computeVertexNormals(positions, indices)




        // 2.4 texture coords
        const textureCoordinates = []

        for (var j = 0; j <= tilesBboxSize.y; j++) {
            const y = j + tilesBbox.min[1]
            for (var i = 0; i <= tilesBboxSize.x; i++) {
                const x = i + tilesBbox.min[0]

                // var latLng = this.tile23d(x, y);
                if (rev) {
                    textureCoordinates.push((x - tilesBbox.min[0]) / (tilesBboxSize.x))
                    textureCoordinates.push((y - tilesBbox.min[1]) / (tilesBboxSize.y))
                } else {
                    textureCoordinates.push((x - tilesBbox.min[0]) / (tilesBboxSize.x))
                    textureCoordinates.push((-y + tilesBbox.max[1]) / (tilesBboxSize.y))
                }
            }
        }

        // let the super class do the WebGl fun
        return {
            positions: positions,
            indices: indices,
            vertexNormals: vertexNormals,
            textureCoordinates: textureCoordinates,
            texture: this.tileConverter.texture,
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