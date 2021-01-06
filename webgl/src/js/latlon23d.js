/**
 * convert Geodetic coordinates to 3d world. either ECEF or ENU
 * 
 * 
 */


import { degrees2radians } from './global.js'
import { GeodeticToEcef, GeodeticToEnu } from './gpsutils.js'

global.latlonlocal = null;//{ lat: 50, lon: 14, h: 230 }


export function setGeodeticRef(ref) {
    global.latlonlocal = ref
}
export function useEnu() {
    return global.latlonlocal != null
}

export function latlon23d(lat, lon, h) {

    //
    if (useEnu()) {
        const xyz = GeodeticToEnu(lat, lon, h,
            latlonlocal.lat,latlonlocal.lon,latlonlocal.h)
        return [xyz.xEast , xyz.zUp , -xyz.yNorth ]
    } else {

        // no idea why ... :(
        lon=-lon+90
        const xyz = GeodeticToEcef(lat, lon, h)

        // const old=latlon23dOLD(lat, lon,h)
        // return old;

        // console.log("coords:"+lat+","+lon)
        // console.log("xyz:",xyz)
        // console.log("old:",old)

        return [xyz.x / 1000.0, xyz.z / 1000.0, xyz.y / 1000.0]
    }
}


/**
 * 
 * given latitude + longitude
 * return a 3d coordinates
 * 
 * https://math.libretexts.org/Bookshelves/Calculus/Book%3A_Calculus_(OpenStax)/12%3A_Vectors_in_Space/12.7%3A_Cylindrical_and_Spherical_Coordinates
 * section: 
 */
export function latlon23dOLD(lat, lon,h) {
    // TODO

    // latitude from the north pole 
    const lat0 = 90 - lat
    const lon0 = lon//-lon+80

    const φ = degrees2radians(lat0)
    const θ = degrees2radians(lon0)
    const ρ = 6378+h/1000;
    const x = ρ * Math.sin(φ) * Math.cos(θ)
    const y = ρ * Math.sin(φ) * Math.sin(θ)
    const z = ρ * Math.cos(φ)

    const retVal = [x, y, z]
    console.log(" latlon23d(" + lat + "," + lon + ") = " + retVal)
    return retVal
}