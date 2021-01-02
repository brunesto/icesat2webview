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
import { WglUI,ModelBinder } from "./js/wglui.js";
import { latlon23d } from "./js/latlon23d.js";

global.logFlag = false

function addMarker(lat,lon,h){
    const cm2 = mat4.create()
    mat4.identity(cm2);
    const xyz2=latlon23d(lat,lon,h)
    console.log(""+lat+","+lon,xyz2)
    mat4.translate(cm2, mat4.create(), xyz2);
    mat4.scale(cm2, cm2, [100, 100, 100]);    
    const cubeObj2 = new Reflector(lat+","+lon)
    return new ModelBinder(cubeObj2, () => cm2,new ProgramPIU())

}

$(document).ready(function() {
    console.log('process.env.NODE_ENV:' + (process.env.NODE_ENV))

    const xyz=latlon23d(50,14,25000*1000)
    const xyz2=latlon23d(50,0,25000*1000)
    const xyz3=latlon23d(0,14,25000*1000)
    console.log('xyz :' ,xyz)
    console.log('xyz2:' ,xyz2)
    console.log('xyz3:' ,xyz3)


    // var camera = new Camera([xyz[0], xyz[2], -25000]) //-6472)
    var camera = new Camera([0,0, -15000]) //-6472)
    const step2s = []
    var wglui = new WglUI("glCanvas", camera, step2s)


    // for (var i = 0; i < 10; i++) {
    //     const cubeObj = new Reflector("reflector" + i, )
    //     const cm = mat4.create()
    //     mat4.identity(cm);
    //     mat4.translate(cm, mat4.create(), [100, 1000 + i * 100, 1000 + i * 1000]);
    //     mat4.scale(cm, cm, [200, 200, 200]);
    //     step2s.push(new ModelBinder(cubeObj, () => cm,new ProgramPIU()))
    // }

    
    // const cm = mat4.create()
    // mat4.identity(cm);
    // mat4.scale(cm, cm, [100, 100, 100]);
    // const cubeObj = new Reflector("center" , )
    // step2s.push(new ModelBinder(cubeObj, () => cm,new ProgramPIU()))

    for(var i=-60;i<60;i+=10)
        step2s.push(addMarker(i,0,0))
    step2s.push(addMarker(50,14,1000*1000,step2s))
    step2s.push(addMarker(20,0,1000*1000,step2s))
   



    const cm2 = mat4.create()
    mat4.identity(cm2);
  
    
    // mat4.translate(cm2, mat4.create(), [3000,3000,5000]);
    // mat4.scale(cm2, cm2, [100, 100, 100]);    
    // const cubeObj2 = new Reflector("harcoded")
    // step2s.push(new ModelBinder(cubeObj2, () => cm2,new ProgramPIU()))




    const sm = mat4.create()
    mat4.scale(sm, sm, [1, 1, 1]);
    const sphereObj = new Sphere("sphere1")
    step2s.push(new ModelBinder(sphereObj, () => sm,new ProgramPINT()))



    wglui.redraw()


})