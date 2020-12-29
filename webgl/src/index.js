import './styles/body.css';

import { Sphere } from './js/sphere.js';
import { Cube } from './js/cube.js';
import { Reflector } from './js/reflector.js';


import { ProgramPINT } from "./js/programpint.js";
import { ProgramPIU } from "./js/programpiu.js";
import { ProgramPIU4Id } from "./js/programpiu4id.js";

import { ProgramPICN } from "./js/programpicn.js";

import { Camera } from "./js/camera.js";
import { mat4, mat3, str, quat, vec4 } from 'gl-matrix';
import { WglUI } from "./js/wglui.js";

global.logFlag = true




class ModelBinder {
    constructor(mesh, getModelMatrix) {
        this.mesh = mesh
        this.getModelMatrix = getModelMatrix

    }
    forRender() {
        const pp = new ProgramPIU(this.mesh.name, this.getModelMatrix) // () => this.mesh.modelMatrix)
        pp.initBuffers(this.mesh.getParams())
        return pp
    }
    forMousePick() {
        const pp = new ProgramPIU4Id(this.mesh.name, this.getModelMatrix) // () => this.mesh.modelMatrix)
        pp.initBuffers(this.mesh.getParams())
        return pp
    }
}


$(document).ready(function() {
    console.log('process.env.NODE_ENV:' + (process.env.NODE_ENV))
    var camera = new Camera(-25000) //-6472)
    const step2s = []
    var wglui = new WglUI("glCanvas", camera, step2s)


    for (var i = 0; i < 10; i++) {
        const cubeObj = new Reflector("reflector" + i, )
        const cm = mat4.create()
        mat4.identity(cm);
        mat4.translate(cm, mat4.create(), [100, 1000 + i * 100, 1000 + i * 1000]);
        mat4.scale(cm, cm, [200, 200, 200]);
        step2s.push(new ModelBinder(cubeObj, () => cm))
    }

    const sm = mat4.create()
    mat4.scale(sm, sm, [0.1, 0.1, 0.1]);
    const sphereObj = new Sphere("sphere1")
    step2s.push(new ModelBinder(sphereObj, () => sm))



    wglui.redraw()


})