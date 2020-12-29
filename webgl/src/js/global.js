// -- Strings ---------------------------------------------

export function padLeft(r, length, pad) {
    if (length == undefined)
        length = 3
    if (pad == undefined)
        pad = ' '
    r = String(r)
    while (r.length < length) r = pad + r;
    return r;
}

/**
 * float to string 
 */
export function f2string(n) {
    return padLeft(n.toFixed(3), 10, " ");
}


export function vec2string(a, formatter) {
    if (formatter == undefined)
        formatter = f2string
    var retVal = ""

    for (var i = 0; i < a.length; i++)
        retVal += formatter(a[i]) + ", "
    return retVal

}

/**
 * dump a matrix to string
 */
export function mat2string(a, formatter) {

    if (formatter == undefined)
        formatter = f2string
    var retVal = ""

    if (isSquare(a.length)) {
        const l = Math.sqrt(a.length)
        retVal += "\n"
        for (var j = 0; j < l; j++) {
            for (var i = 0; i < l; i++)
                retVal += formatter(a[i + j * l]) + ", "


            retVal += "\n"
        }
    } else {
        retVal = vec2string(a, formatter)
    }
    return retVal
}


export function logBufferArray(name, colors, step) {
    for (var i = 0; i < colors.length; i += step) {
        var acc = ""
        for (var s = 0; s < step; s++) {
            acc += colors[i + s] + ","
        }
        console.log("" + name + "@" + (i / step) + "[" + i + ",...]=" + acc);

    }
}

// -- Math ------------------------------------------------
export function isSquare(n) {
    const rs = Math.sqrt(n)
    return (rs * rs == n)
}



export function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}


export function radians2degrees(radians) {
    var pi = Math.PI;
    return radians * (180 / pi);
}



export function degrees2radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}