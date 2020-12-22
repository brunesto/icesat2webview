import './styles/body.css';

import { Sphere } from './js/sphere.js';
import { Cube } from './js/cube.js';
import { ProgramPINT } from "./js/programpint.js";
import { ProgramU } from "./js/programu.js";
import { Camera } from "./js/camera.js";
import { mat4, mat3, str, quat, vec4 } from 'gl-matrix';
import { WglUI } from "./js/wglui.js";

global.logFlag = true



//initGl()

// const sphereObj=new Sphere("sphere1")
// mat4.scale(sphereObj.modelMatrix,mat4.create(),[1,1,1])
// const pp=new ProgramU(sphereObj.name,()=>sphereObj.modelMatrix)
// pp.initBuffers(sphereObj.getParams())


//step2s.push(new Step1Cube())
//step2s.push(new Step2Normals())
//step2s.push(new Step3Texture())


class ModelBinder{
    constructor(cubeObj){
        this.cubeObj=cubeObj
    }
    forRender(){
        const pp = new ProgramPINT(this.cubeObj.name, () => this.cubeObj.modelMatrix)
        pp.initBuffers(this.cubeObj.getParams())
        return pp
    }
    forMousePick(){
        const pp = new ProgramU(this.cubeObj.name, () => this.cubeObj.modelMatrix)
        pp.initBuffers(this.cubeObj.getParams())
        return pp
    }
}


$(document).ready(function() {
    console.log('process.env.NODE_ENV:' + (process.env.NODE_ENV))
    var camera = new Camera(-25000)//-6472)
    const step2s = []
    var wglui = new WglUI("glCanvas",camera, step2s)


    const cubeObj = new Cube("cube1")
    const cm=mat4.create()
    // mat4.scale(cm, mat4.create(), )
    mat4.identity(cm);
     mat4.translate(cm,mat4.create(), [1000,1000,-8000]); 
    //  let quatMat = mat4.create(); 
    //  quat4.toMat4(quat, quatMat); 
    //  mat4.multiply(dest, quatMat); 
     mat4.scale(cm,cm,[6000, 6000, 6000]);
     cubeObj.modelMatrix=cm
  
    // const pp = new ProgramPINT(cubeObj.name, () => cubeObj.modelMatrix)
    // pp.initBuffers(cubeObj.getParams())



    step2s.push(new ModelBinder(cubeObj))



     const sphereObj=new Sphere("sphere1")
// mat4.scale(sphereObj.modelMatrix,mat4.create(),[1,1,1])
step2s.push(new ModelBinder(sphereObj))
// const pp=new ProgramU(sphereObj.name,()=>sphereObj.modelMatrix)
// pp.initBuffers(sphereObj.getParams())



    wglui.redraw()


})