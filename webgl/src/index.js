import './styles/body.css';

import { Sphere } from './js/sphere.js';
import { Cube } from './js/cube.js';
import { ProgramPINT } from "./js/programpint.js";
import { ProgramU } from "./js/programu.js";
import { Camera } from "./js/camera.js";

import { mat4, mat3, str, quat, vec4 } from 'gl-matrix';
/*
import { Dragger } from './js/dragger.js';

import { Step1Cube } from './js/step1-cube.js';
import { Step3Texture } from './js/step3-texture.js';

import { Step2Normals } from './js/step2-normals.js';
import { GeoHelper } from './js/geohelper.js';
import { ProgramPINT } from "./js/programpint.js";
import { ProgramU } from "./js/programu.js";


import { vec2string, mat2string } from "./js/global.js";
*/
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




$(document).ready(function() {
    console.log('process.env.NODE_ENV:' + (process.env.NODE_ENV))
    var camera = new Camera(-25000)//-6472)
    const step2s = []
    var wglui = new WglUI(camera, step2s)


    const cubeObj = new Cube("cube1")
    mat4.scale(cubeObj.modelMatrix, mat4.create(), [6000, 6000, 6000])
    const pp = new ProgramPINT(cubeObj.name, () => cubeObj.modelMatrix)
    pp.initBuffers(cubeObj.getParams())



    step2s.push(pp)



})