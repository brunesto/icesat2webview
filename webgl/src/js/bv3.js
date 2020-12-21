/*
 * vector3 handling
 * used mostly for vertex normals computation
 * TODO:  overlaps with mat-gl
 */
const bv3 = {

    str: (a) => {
        return "" + a[0] + "," + a[1] + "," + a[2]
    },


    // aka magnitude
    length: (a) => {
        const l2 = a[0] * a[0] + a[1] * a[1] + a[2] * a[2]
        const retVal = Math.sqrt(l2)
        return retVal
    },

    // https://www.youtube.com/watch?v=ZTywc8v9uU8&feature=emb_logo
    normalize: (v) => {
        const l = bv3.length(v)
        const retVal = bv3.scalarmul(v, 1 / l)
        return retVal
    },


    scalarmul: (v, s) => {
        return [v[0] * s, v[1] * s, v[2] * s]
    },

    // https://en.wikipedia.org/wiki/Cross_product#Computing_the_cross_product
    cross: (a, b) => {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ]
    },

    normal: (a, b) => {
        return bv3.normalize(bv3.cross(a, b))
    },

    // a minus b
    minus: (a, b) => {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
    },

    // a plus b
    plus: (a, b) => {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
    },
}
export { bv3 }

