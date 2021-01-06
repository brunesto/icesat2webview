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
        //CCconsole.log("" + name + "@" + (i / step) + "[" + i + ",...]=" + acc);

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


global.DEGREES_TO_RADIANS = (Math.PI / 180)
export function degrees2radians(degrees) {
    return degrees * DEGREES_TO_RADIANS;
}



export function latLonToEcef(lat, lon, alt) {
    const clat = Math.cos(lat * DEGREES_TO_RADIANS);
    const slat = Math.sin(lat * DEGREES_TO_RADIANS);
    const clon = Math.cos(lon * DEGREES_TO_RADIANS);
    const slon = Math.sin(lon * DEGREES_TO_RADIANS);

    const N = WGS84_A / Math.sqrt(1.0 - WGS84_E * WGS84_E * slat * slat);

    return {
        x: (N + alt) * clat * clon,
        y: (N + alt) * clat * slon,
        z: (N * (1.0 - WGS84_E * WGS84_E) + alt) * slat
    }

}
// Coverts ECEF to ENU coordinates centered at given lat, lon

export function ecefToEnu(lat, lon, x, y, z, xr, yr, zr) {
    clat = Math.cos(lat * DEGREES_TO_RADIANS);
    slat = Math.sin(lat * DEGREES_TO_RADIANS);
    clon = Math.cos(lon * DEGREES_TO_RADIANS);
    slon = Math.sin(lon * DEGREES_TO_RADIANS);
    dx = x - xr;
    dy = y - yr;
    dz = z - zr;

    return {
        e: -slon * dx + clon * dy,
        n: -slat * clon * dx - slat * slon * dy + clat * dz,
        u: clat * clon * dx + clat * slon * dy + slat * dz
    }
}

function copysign(x, y) {
    a = Math.abs(x)
    if (y > 0)
        return a
    else
        return -a

}


// https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles

export function quat2EulerAngles(q) {

    //CCconsole.log("quat2EulerAngles",q)
    // roll (x-axis rotation)
    const sinr_cosp = 2 * (q[3] * q[0] + q[1] * q[2]);
    const cosr_cosp = 1 - 2 * (q[0] * q[0] + q[1] * q[1]);
    const roll =Math.atan2(sinr_cosp, cosr_cosp);

    // pitch (y-axis rotation)
    const sinp = 2 * (q[3] * q[1] - q[2] * q[0]);
    var pitch;
    if (Math.abs(sinp) >= 1)

        pitch = copysign(M_PI / 2, sinp); // use 90 degrees if out of range
    else
        pitch = Math.asin(sinp);

    // yaw (z-axis rotation)
    const siny_cosp = 2 * (q[3] * q[2] + q[0] * q[1]);
    const cosy_cosp = 1 - 2 * (q[1] * q[1] + q[2] * q[2]);
    const yaw = Math.atan2(siny_cosp, cosy_cosp);

    return [yaw,roll,pitch]
    //     yaw: yaw,
    //     roll: roll,
    //     pitch: pitch
    // }
}