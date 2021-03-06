import {bv3} from './bv3.js';
import { mat4, mat3, str, quat, vec4 } from 'gl-matrix';
import { vec2string,mat2string,radians2degrees } from "./global.js";



/**
 * This class takes care of rotating and moving the camera in a natural way 
 * e.g. 
  * press the right key->the scene will move to the right (right in world)
 * you rotate 90 degree, press right key, the scene will move to the right (up in world)
 */
export class Camera {

    /**
     * position
     */
    //position = [0.0, 0.0, 0, 0]
    /**
     * quaternion is used of orientation
     */
    orientation = quat.create()

    constructor(z) {
        this.position=[...z,0]
    }

    /**
     * compute the lat,lon as well as (distanceFromEarthSurface) amsl and distanceFromEarthCenter
     * NOTE that for distanceFromEarthSurface earth is considered a sphere, not an elipsoid
     */
    computeCoords() {
        this.distanceFromEarthCenter = bv3.length(this.position)
        this.distanceFromEarthSurface = this.distanceFromEarthCenter - 6378

        this.lat = radians2degrees(Math.asin(-this.position[1] / this.distanceFromEarthCenter))


        const posAtEquator = [this.position[0], 0, this.position[2]]


        const distanceFromEarthCenterAtEquator = bv3.length(posAtEquator)
        const l90 = radians2degrees(Math.asin(-this.position[0] / distanceFromEarthCenterAtEquator))


        if (this.position[0] > 0 != this.position[2] > 0) {
            if (this.position[0] > 0) {
                //CCconsole.log("c1")
                this.lon = l90;
            } else {
                //CCconsole.log("c2")
                this.lon = 180 - l90;
            }
        } else {
            if (this.position[0] > 0) {
                //CCconsole.log("c3")
                this.lon = -180 - l90;
            } else {
                //CCconsole.log("c4")
                this.lon = l90;
            }
        }

 
    }


    /**
     * move the camera. 
     * @param v: translation vector, in screen space  
     */
    move(v) {

        // inverse camera rotation
        var iq = quat.create()
        quat.invert(iq, this.orientation)
        let iqm = mat4.create();
        mat4.fromQuat(iqm, iq);




        var dest = vec4.create()
        vec4.transformMat4(dest, v, iqm);
        //CCconsole.log("movescreen2world " + vec2string(v) + " ->" + vec2string(dest))

        // modify camera position by inversely rotated z
        this.position[0] += dest[0]
        this.position[1] += dest[1]
        this.position[2] += dest[2]
    }


    /**
     * rotate the camera
     * 
     * @param euler : euler angles, using screen space
     */
    rotate(euler) {

        // very lean computation with quaternions :)
        const orientation = quat.create()
        quat.fromEuler(orientation, euler[0], euler[1], euler[2], 0)
        this.orientation = quat.normalize(quat.create(), quat.mul(quat.create(), orientation, this.orientation))
    }

    lookat(center){
        //CCconsole.log("lookAt",center)
        const m4out = mat4.create()
        const up=[0,1,0]
        mat4.lookAt(m4out,
            [-this.position[0],-this.position[1],-this.position[2]],
            center,up)

        const m3out = mat3.create()
        mat3.fromMat4(m3out,m4out)
        

        const qout=quat.create()
        quat.fromMat3(qout,m3out)

        // var iq = quat.create()
        // quat.invert(iq,qout)

        quat.normalize(this.orientation,qout)
    }
}