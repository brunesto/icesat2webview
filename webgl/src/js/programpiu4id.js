import { mat4 } from 'gl-matrix';
import { initShaderProgram } from './webglutil.js';
// import { BaseProgram } from './baseobj.js';
import { bv3 } from './bv3.js';
import { ProgramPIU } from './programpiu.js';
/**
 * Render objects using a special color for each object as ID
 * This is used for http://www.opengl-tutorial.org/miscellaneous/clicking-on-objects/picking-with-an-opengl-hack/
 */

export class ProgramPIU4Id extends ProgramPIU {

    constructor(name, getModelMatrix) {
        super(name, getModelMatrix);
    }

    draw2(id, buffers,projectionMatrix, viewMatrix,modelMatrix) {
        const sid = (id + 1)
            ////CCconsole.log("id+1:"+sid)
        const rgb = id2rgb(sid)
            ////CCconsole.log("rgb:"+rgb)
        const rgb1 = bv3.scalarmul(rgb, 1 / 255.0)
            ////CCconsole.log("rgb1:"+rgb1)
            //gl.uniform3fv( this.programInfo.locations.color, rgb1)//new Float32Array([0.349,0.241,0.912]) )
        this.drawWithColor(rgb1,buffers, projectionMatrix, viewMatrix,modelMatrix)
    }

    dispose() {
        //CCconsole.log(name + ": dispose()");
        // TODO!!!
    }
}

/**
 * convert an id to rgb [0..255]
 */
export function id2rgb(i) {

    if (i > 0xffffff || i < 0) // 0xffffff=16777215
        throw "id out of range: " + i
    const b = (i & 0x000000FF) >> 0;
    const g = (i & 0x0000FF00) >> 8;
    const r = (i & 0x00FF0000) >> 16;



    return [r, g, b]
}

/**
 * convert a rgb [0..255] back to id
 */
export function rgb2id(rgb) {

    const r = rgb[0];
    const g = rgb[1];
    const b = rgb[2];

    const id = r * 256 * 256 + g * 256 + b;
    return id;
}