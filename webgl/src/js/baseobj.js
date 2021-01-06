import { mat4, mat3 } from 'gl-matrix';
import { loadTexture, gridTexture } from './webglutil.js';

/**
 * TODO the lifecycle/ boundaries of these classes are not yet well defined
 * 
 * Basically they are meant to merge a 3d object and a WebGl program
 */
 

export class BaseProgram {
    constructor(name) {
        this.name = name
    }
    initBuffers(params){}
    draw2(id,buffers,projectionMatrix, viewMatrix,modelMatrix) {}
}

export class BaseObj {
    inited = false
    constructor(name) {
        this.name = name
        this.modelMatrix = mat4.create();
    }
    ensureInit() {
        if (!this.inited) {
            this.doInit()
            this.inited = true
        }
    }


    doInit() {
            //CCconsole.log(name + ": init() not implemented")
        }
        /**
         * returns a Drawable
         */
    getDrawable(program, getProgramParams) {
        //CCconsole.log(name + ": getDrawable() program:" + program.name)

        const thisBaseObj = this
        const retVal = new Drawable(thisBaseObj.name + "+" + program.name)
        retVal.init = function() {
            //CCconsole.log(name + ": init()")
            thisBaseObj.ensureInit()
            program.init(getProgramParams(thisBaseObj))
        }
        retVal.dispose = function() {
            //CCconsole.log(name + ": dispose()")
            program.dispose()
        }
        retVal.draw2 = function(projectionMatrix, viewMatrix) {
            //CCconsole.log(name + ": draw2()")
            program.draw2(projectionMatrix, viewMatrix, thisBaseObj.modelMatrix)
        }
        return retVal
    }


}



