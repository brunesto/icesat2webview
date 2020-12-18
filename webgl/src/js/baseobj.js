import { mat4, mat3 } from 'gl-matrix';
import { loadTexture, gridTexture } from './webglutil.js';


export class BaseProgram {
    constructor(name) {
        this.name = name
    }
    draw2(projectionMatrix, viewMatrix) {}
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
            console.log(name + ": init() not implemented")
        }
        /**
         * returns a Drawable
         */
    getDrawable(program, getProgramParams) {
        console.log(name + ": getDrawable() program:" + program.name)

        const thisBaseObj = this
        const retVal = new Drawable()
        retVal.name = thisBaseObj.name + "+" + program.name
        retVal.init = function() {
            console.log(name + ": init()")
            thisBaseObj.ensureInit()
            program.init(getProgramParams(thisBaseObj))
        }
        retVal.dispose = function() {
            console.log(name + ": dispose()")
            program.dispose()
        }
        retVal.draw2 = function(projectionMatrix, viewMatrix) {
            console.log(name + ": draw2()")
            program.draw2(projectionMatrix, viewMatrix, thisBaseObj.modelMatrix)
        }
        return retVal
    }



//draw2(projectionMatrix, viewMatrix) {}
}



