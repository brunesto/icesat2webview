// port of https://gist.github.com/govert/1b373696c9a27ff4c72a

// WGS-84 geodetic constants
const a = 6378137.0; // WGS-84 Earth semimajor axis (m)

const b = 6356752.314245; // Derived Earth semiminor axis (m)
const f = (a - b) / a; // Ellipsoid Flatness
const f_inv = 1.0 / f; // Inverse flattening

//const f_inv = 298.257223563; // WGS-84 Flattening Factor of the Earth 
//const b = a - a / f_inv;
//const f = 1.0 / f_inv;

const a_sq = a * a;
const b_sq = b * b;
const e_sq = f * (2 - f); // Square of Eccentricity

// Converts WGS-84 Geodetic point (lat, lon, h) to the 
// Earth-Centered Earth-Fixed (ECEF) coordinates (x, y, z).
export function GeodeticToEcef(lat, lon, h) {
    // Convert to radians in notation consistent with the paper:
    var lambda = DegreesToRadians(lat);
    var phi = DegreesToRadians(lon);
    var s = Math.sin(lambda);
    var N = a / Math.sqrt(1 - e_sq * s * s);

    var sin_lambda = Math.sin(lambda);
    var cos_lambda = Math.cos(lambda);
    var cos_phi = Math.cos(phi);
    var sin_phi = Math.sin(phi);

    return {
        x: (h + N) * cos_lambda * cos_phi,
        y: (h + N) * cos_lambda * sin_phi,
        z: (h + (1 - e_sq) * N) * sin_lambda
    }
}

// Converts the Earth-Centered Earth-Fixed (ECEF) coordinates (x, y, z) to 
// (WGS-84) Geodetic point (lat, lon, h).
export function EcefToGeodetic(x, y, z,
    lat, lon, h) {
    var eps = e_sq / (1.0 - e_sq);
    var p = Math.sqrt(x * x + y * y);
    var q = Math.atan2((z * a), (p * b));
    var sin_q = Math.sin(q);
    var cos_q = Math.cos(q);
    var sin_q_3 = sin_q * sin_q * sin_q;
    var cos_q_3 = cos_q * cos_q * cos_q;
    var phi = Math.atan2((z + eps * b * sin_q_3), (p - e_sq * a * cos_q_3));
    var lambda = Math.atan2(y, x);
    var v = a / Math.sqrt(1.0 - e_sq * Math.sin(phi) * Math.sin(phi));
    return {
        h: (p / Math.cos(phi)) - v,

        lat: RadiansToDegrees(phi),
        lon: RadiansToDegrees(lambda)
    }

}

// Converts the Earth-Centered Earth-Fixed (ECEF) coordinates (x, y, z) to 
// East-North-Up coordinates in a Local Tangent Plane that is centered at the 
// (WGS-84) Geodetic point (lat0, lon0, h0).
export function EcefToEnu(x, y, z,
    lat0, lon0, h0,
    xEast, yNorth, zUp) {
    // Convert to radians in notation consistent with the paper:
    var lambda = DegreesToRadians(lat0);
    var phi = DegreesToRadians(lon0);
    var s = Math.sin(lambda);
    var N = a / Math.sqrt(1 - e_sq * s * s);

    var sin_lambda = Math.sin(lambda);
    var cos_lambda = Math.cos(lambda);
    var cos_phi = Math.cos(phi);
    var sin_phi = Math.sin(phi);

    const x0 = (h0 + N) * cos_lambda * cos_phi;
    const y0 = (h0 + N) * cos_lambda * sin_phi;
    const z0 = (h0 + (1 - e_sq) * N) * sin_lambda;

    
    const xd = x - x0;
    const yd = y - y0;
    const zd = z - z0;

    // This is the matrix multiplication
    return {
        xEast: -sin_phi * xd + cos_phi * yd,
        yNorth: -cos_phi * sin_lambda * xd - sin_lambda * sin_phi * yd + cos_lambda * zd,
        zUp: cos_lambda * cos_phi * xd + cos_lambda * sin_phi * yd + sin_lambda * zd
    }
}

// Inverse of EcefToEnu. Converts East-North-Up coordinates (xEast, yNorth, zUp) in a
// Local Tangent Plane that is centered at the (WGS-84) Geodetic point (lat0, lon0, h0)
// to the Earth-Centered Earth-Fixed (ECEF) coordinates (x, y, z).
export function EnuToEcef(xEast, yNorth, zUp,
    lat0, lon0, h0) {
    // Convert to radians in notation consistent with the paper:
    const lambda = DegreesToRadians(lat0);
    const phi = DegreesToRadians(lon0);
    const s = Math.sin(lambda);
    const N = a / Math.sqrt(1 - e_sq * s * s);

    const sin_lambda = Math.sin(lambda);
    const cos_lambda = Math.cos(lambda);
    const cos_phi = Math.cos(phi);
    const sin_phi = Math.sin(phi);

    const x0 = (h0 + N) * cos_lambda * cos_phi;
    const y0 = (h0 + N) * cos_lambda * sin_phi;
    const z0 = (h0 + (1 - e_sq) * N) * sin_lambda;

    const  xd = -sin_phi * xEast - cos_phi * sin_lambda * yNorth + cos_lambda * cos_phi * zUp;
    const   yd = cos_phi * xEast - sin_lambda * sin_phi * yNorth + cos_lambda * sin_phi * zUp;
    const   zd = cos_lambda * yNorth + sin_lambda * zUp;

    return {
        x: xd + x0,
        y: yd + y0,
        z: zd + z0
    }
}

// Converts the geodetic WGS-84 coordinated (lat, lon, h) to 
// East-North-Up coordinates in a Local Tangent Plane that is centered at the 
// (WGS-84) Geodetic point (lat0, lon0, h0).
export function GeodeticToEnu(lat, lon, h,
    lat0, lon0, h0,
    xEast, yNorth, zUp) {
    x,
    y,
    z;
    const { x, y, z } = GeodeticToEcef(lat, lon, h)
    return EcefToEnu(x, y, z, lat0, lon0, h0);
}


// Just check that we get the same values as the paper for the main calculations.
export function Test() {
    var latLA = 34.00000048;
    var lonLA = -117.3335693;
    var hLA = 251.702;

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
    const { x:x0, y:y0, z:z0 } = GeodeticToEcef(latLA, lonLA, hLA);

    AssertClose(-2430601.8, x0);
    AssertClose(-4702442.7, y0);
    AssertClose(3546587.4, z0);

    // Checks to read the matrix entries, to compare to the paper
  

    // First column
    var x = x0 + 1;
    var y = y0;
    var z = z0;
    var { xEast, yNorth, zUp } = EcefToEnu(x, y, z, latLA, lonLA, hLA);
    AssertClose(0.88834836, xEast)
    AssertClose(0.25676467, yNorth)
    AssertClose(-0.38066927, zUp)

    x = x0;
    y = y0 + 1;
    z = z0;
    ({ xEast, yNorth, zUp } = EcefToEnu(x, y, z, latLA, lonLA, hLA));
    AssertClose(-0.45917011, xEast)
    AssertClose(0.49675810, yNorth)
    AssertClose(-0.73647416, zUp)

    x = x0;
    y = y0;
    z = z0 + 1;
    ({ xEast, yNorth, zUp } = EcefToEnu(x, y, z, latLA, lonLA, hLA));
    AssertClose(0.00000000, xEast)
    AssertClose(0.82903757, yNorth)
    AssertClose(0.55919291, zUp)

}

export function Test2() {
    var latLA = 34.00000048;
    var lonLA = -117.3335693;
    var hLA = 251.702;


    const { x:x0, y:y0, z:z0 } = GeodeticToEcef(latLA, lonLA, hLA);

    AssertClose(-2430601.8, x0)
    AssertClose(-4702442.7, y0)
    AssertClose(3546587.4, z0)

    const { xEast, yNorth, zUp } = EcefToEnu(x0, y0, z0, latLA, lonLA, hLA);

    AssertClose(0, xEast)
    AssertClose(0, yNorth)
    AssertClose(0, zUp)

    const { x:xTest, y:yTest, z:zTest } = EnuToEcef(xEast, yNorth, zUp, latLA, lonLA, hLA);
    const { lat:latTest, lon:lonTest, h:hTest } = EcefToGeodetic(xTest, yTest, zTest);

    AssertClose(latLA, latTest)
    AssertClose(lonLA, lonTest)
    AssertClose(hTest, hLA)

}

function AssertClose(x0, x1) {
    var d = x1 - x0;
    const v = (d * d) < 0.1;
    if (!v)
        throw "test failed " + x0 + " != " + x1
}



function DegreesToRadians(degrees) {
    return Math.PI / 180.0 * degrees;
}

function RadiansToDegrees(radians) {
    return 180.0 / Math.PI * radians;
}


Test();
Test2();