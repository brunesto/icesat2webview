

export function padLeft(r, length, pad) {
    while (r.length < length) r = pad + r;
    return r;
}

export function f2string(n) {
    return padLeft(n.toFixed(3), 10, " ");
}

export function isSquare(n) {
    const rs = Math.sqrt(n)
    return (rs * rs == n)
}

export function vec2string(a, formatter) {
    if (formatter == undefined)
        formatter = f2string
    var retVal = ""

    for (var i = 0; i < a.length; i++)
        retVal += formatter(a[i]) + ", "
    return retVal

}

export function mat2string(a, formatter) {
    console.log("dedieu...")
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