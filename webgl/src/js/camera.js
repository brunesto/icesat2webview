import { mat4, mat3, str, quat, vec4 } from 'gl-matrix';
import { vec2string,mat2string } from "./global.js";


export class Camera {
    pos = [0.0, 0.0, 0, 0]
    q = quat.create()

    constructor(z) {
        this.pos[2] = z
    }

    computeCoords() {
        this.distanceFromEarthCenter = GH.length(this.pos)
        this.distanceFromEarthSurface = this.distanceFromEarthCenter - 6378

        this.lat = GH.radians2degrees(Math.asin(-this.pos[1] / this.distanceFromEarthCenter))


        const posAtEquator = [this.pos[0], 0, this.pos[2]]


        const distanceFromEarthCenterAtEquator = GH.length(posAtEquator)
        const l90 = GH.radians2degrees(Math.asin(-this.pos[0] / distanceFromEarthCenterAtEquator))


        if (this.pos[0] > 0 != this.pos[2] > 0) {
            if (this.pos[0] > 0) {
                console.log("c1")
                this.lon = l90;
            } else {
                console.log("c2")
                this.lon = 180 - l90;
            }
        } else {
            if (this.pos[0] > 0) {
                console.log("c3")
                this.lon = -180 - l90;
            } else {
                console.log("c4")
                this.lon = l90;
            }
        }

 
    }



    movescreen2world(v) {

        // inverse camera rotation
        var iq = quat.create()
        quat.invert(iq, this.q)
        let iqm = mat4.create();
        mat4.fromQuat(iqm, iq);




        var dest = vec4.create()
        vec4.transformMat4(dest, v, iqm);
        console.log("movescreen2world " + vec2string(v) + " ->" + vec2string(dest))

        // modify camera position by inversely rotated z
        this.pos[0] += dest[0]
        this.pos[1] += dest[1]
        this.pos[2] += dest[2]
    }


    rotatescreen2world(euler) {
        const q = quat.create()
        quat.fromEuler(q, euler[0], euler[1], euler[2], 0)
        this.q = quat.normalize(quat.create(), quat.mul(quat.create(), q, this.q))
    }
}