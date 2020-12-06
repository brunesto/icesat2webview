/**
 * in this class,
 * - indices are non overlapping triangles (i.e. an index[i] is only used in the ith/3 triangle )
 * - positions are flat array of floats, used to store 3d positions after another
 *
 */
export class GeoHelper {


    radians2degrees(radians) {
        var pi = Math.PI;
        return radians * (180 / pi);
    }



    degrees2radians(degrees) {
        var pi = Math.PI;
        return degrees * (pi / 180);
    }




    str(a) {
        return "" + a[0] + "," + a[1] + "," + a[2]
    }


    // aka magnitude
    length(a) {
        const l2 = a[0] * a[0] + a[1] * a[1] + a[2] * a[2]
        const retVal = Math.sqrt(l2)
        return retVal
    }

    // https://www.youtube.com/watch?v=ZTywc8v9uU8&feature=emb_logo
    normalize(v) {
        const l = this.length(v)
        const retVal = this.scalarmul(v, 1 / l)
        return retVal
    }


    scalarmul(v, s) {
        return [v[0] * s, v[1] * s, v[2] * s]
    }

    // https://en.wikipedia.org/wiki/Cross_product#Computing_the_cross_product
    cross(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ]
    }

    normal(a, b) {
        return this.normalize(this.cross(a, b))
    }

    // a minus b
    minus(a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
    }

    // a plus b
    plus(a, b) {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
    }

    // given a flat array of coordinates representing 3d positions,
    // return the 3 coordinates for the nth position
    getPosition(positions, n) {
        const p = n * 3
        return [positions[p], positions[p + 1], positions[p + 2]]
    }


    // return the three vertices of triangle at index i
    getTriangleVertices(positions, indices, i) {
        const v0 = this.getPosition(positions, indices[i])
        const v1 = this.getPosition(positions, indices[i + 1])
        const v2 = this.getPosition(positions, indices[i + 2])
        return [v0, v1, v2]
    }

    computeVertexNormals(positions, indices) {
            const triangleNormals = this.computeTriangleNormals(positions, indices)
            const vertices = positions.length / 3;

            // acc sum of triangles' normals to which a verted belongs to
            const vertexAcc = Array.from({ length: vertices }, () => [0, 0, 0])

            // hits === how many triangles a vertex belongs too
            const vertexHits = Array.from({ length: vertices }, () => 0)

            // console.log("indices:"+ indices.length)
            // console.log("positions:"+ positions.length+" vertices:"+vertices)

            for (var i = 0; i < indices.length; i++) {

                // console.log("i:"+i)
                // triangle index
                var t = Math.floor(i / 3)
                    // vertex index
                var v = indices[i]

                vertexHits[v]++;
                vertexAcc[v] = this.plus(vertexAcc[v], triangleNormals[t])

            }


            const vertexNormals = []
            for (var v = 0; v < vertexAcc.length; v++) {

                const normalized = this.scalarmul(vertexAcc[v], 1 / vertexHits[v])
                vertexNormals.push(normalized[0])
                vertexNormals.push(normalized[1])
                vertexNormals.push(normalized[2])
            }
            // for (var i=0;i<vertexNormals.length;i+=3)
            //     console.log("vertexNormals @"+i +":"+ vertexNormals[i]+","+ vertexNormals[i+1]+","+ vertexNormals[i+2])

            return vertexNormals


        }
        //
        // returns an array of array of floats i.e. triangles[3d[float]]
    computeTriangleNormals(positions, indices) {

        const retVal = []
        console.log("computeVertexNormals ")
            //  console.log("positions:", positions)
            //        console.log("indices:", indices)
        for (var i = 0; i < indices.length; i += 3) {
            //          console.log("triangle " + (i / 3) + "@" + i)
            const vs = this.getTriangleVertices(positions, indices, i)
            const edges = [
                this.minus(vs[1], vs[0]),
                this.minus(vs[2], vs[1]),
                this.minus(vs[0], vs[2])
            ]
            const normal1 = this.normal(edges[0], edges[1])
                //        console.log("normal1:", normal1)
            retVal.push(normal1)

            // // check that the 2 other normals are the same!
            // const normal2 = this.normal(edges[1], edges[2])
            // const normal3 =this. normal(edges[2], edges[0])
            // console.log("normal2:",normal2)
            // console.log("normal3:",normal3)

        }

        return retVal
    }



}

global.GH = new GeoHelper();