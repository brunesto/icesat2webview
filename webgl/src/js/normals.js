/**
 * compute vertices normals
 * 
 * 
 * in this file,
 * - indices are non overlapping triangles (i.e. an index[i] is only used in the ith/3 triangle )
 * - positions are flat array of floats, used to store 3d positions after another
 */

import {bv3} from './bv3.js';


// given a flat array of coordinates representing 3d positions,
// return the 3 coordinates for the nth position
function getPosition(positions, n) {
    const p = n * 3
    return [positions[p], positions[p + 1], positions[p + 2]]
}


// return the three vertices of triangle at index i
function getTriangleVertices(positions, indices, i) {
    const v0 = getPosition(positions, indices[i])
    const v1 = getPosition(positions, indices[i + 1])
    const v2 = getPosition(positions, indices[i + 2])
    return [v0, v1, v2]
}


//
// returns an array of array of floats i.e. triangles[3d[float]]
function computeTriangleNormals(positions, indices) {

    const retVal = []
    //CCconsole.log("computeVertexNormals ")
        //  //CCconsole.log("positions:", positions)
        //        //CCconsole.log("indices:", indices)
    for (var i = 0; i < indices.length; i += 3) {
        //          //CCconsole.log("triangle " + (i / 3) + "@" + i)
        const vs = getTriangleVertices(positions, indices, i)
        const edges = [
            bv3.minus(vs[1], vs[0]),
            bv3.minus(vs[2], vs[1]),
            bv3.minus(vs[0], vs[2])
        ]
        const normal1 = bv3.normal(edges[0], edges[1])
            //        //CCconsole.log("normal1:", normal1)
        retVal.push(normal1)

        // // check that the 2 other normals are the same!
        // const normal2 = this.normal(edges[1], edges[2])
        // const normal3 =this. normal(edges[2], edges[0])
        // //CCconsole.log("normal2:",normal2)
        // //CCconsole.log("normal3:",normal3)

    }

    return retVal
}





export function computeVertexNormals(positions, indices) {
    const triangleNormals = computeTriangleNormals(positions, indices)
    const vertices = positions.length / 3;

    // acc sum of triangles' normals to which a verted belongs to
    const vertexAcc = Array.from({ length: vertices }, () => [0, 0, 0])

    // hits === how many triangles a vertex belongs too
    const vertexHits = Array.from({ length: vertices }, () => 0)

    // //CCconsole.log("indices:"+ indices.length)
    // //CCconsole.log("positions:"+ positions.length+" vertices:"+vertices)

    for (var i = 0; i < indices.length; i++) {

        // //CCconsole.log("i:"+i)
        // triangle index
        var t = Math.floor(i / 3)
            // vertex index
        var v = indices[i]

        vertexHits[v]++;
        vertexAcc[v] = bv3.plus(vertexAcc[v], triangleNormals[t])

    }


    const vertexNormals = []
    for (var v = 0; v < vertexAcc.length; v++) {

        const normalized = bv3.scalarmul(vertexAcc[v], 1 / vertexHits[v])
        vertexNormals.push(normalized[0])
        vertexNormals.push(normalized[1])
        vertexNormals.push(normalized[2])
    }
    // for (var i=0;i<vertexNormals.length;i+=3)
    //     //CCconsole.log("vertexNormals @"+i +":"+ vertexNormals[i]+","+ vertexNormals[i+1]+","+ vertexNormals[i+2])

    return vertexNormals


}