import './styles/body.css';

import { Sphere } from './js/sphere.js';
import { Cube } from './js/cube.js';
import { ProgramPINT } from "./js/programpint.js";
import { ProgramPIU } from "./js/programpiu.js";
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
    constructor(mesh,getModelMatrix){        
        this.mesh=mesh
        this.getModelMatrix=getModelMatrix
        
    }
    forRender(){
        const pp = new ProgramPINT(this.mesh.name,this.getModelMatrix)// () => this.mesh.modelMatrix)
        pp.initBuffers(this.mesh.getParams())
        return pp
    }
    forMousePick(){
        const pp = new ProgramPIU(this.mesh.name,this.getModelMatrix)// () => this.mesh.modelMatrix)
        pp.initBuffers(this.mesh.getParams())
        return pp
    }
}


$(document).ready(function() {
    console.log('process.env.NODE_ENV:' + (process.env.NODE_ENV))
    var camera = new Camera(-25000)//-6472)
    const step2s = []
    var wglui = new WglUI("glCanvas",camera, step2s)


    for (var i=0;i<10;i++){
    const cubeObj = new Cube("cube"+i,)
    const cm=mat4.create()
    // mat4.scale(cm, mat4.create(), )
    mat4.identity(cm);
     mat4.translate(cm,mat4.create(), [100,1000+i*100,1000+i*1000]); 
    //  let quatMat = mat4.create(); 
    //  quat4.toMat4(quat, quatMat); 
    //  mat4.multiply(dest, quatMat); 
     mat4.scale(cm,cm,[200, 200, 200]);
     //cubeObj.modelMatrix=cm
  
    // const pp = new ProgramPINT(cubeObj.name, () => cubeObj.modelMatrix)
    // pp.initBuffers(cubeObj.getParams())
    step2s.push(new ModelBinder(cubeObj,()=>cm))
    }

    const sm=mat4.create()
    mat4.scale(sm,sm,[0.1,0.1, 0.1]);
     const sphereObj=new Sphere("sphere1")
// mat4.scale(sphereObj.modelMatrix,mat4.create(),[1,1,1])
step2s.push(new ModelBinder(sphereObj,()=>sm))
// const pp=new ProgramU(sphereObj.name,()=>sphereObj.modelMatrix)
// pp.initBuffers(sphereObj.getParams())



    wglui.redraw()


})