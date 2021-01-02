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
import {latlon23d} from './js/latlon23d.js'
global.logFlag = true



$(document).ready(function() {
    console.log('process.env.NODE_ENV:' + (process.env.NODE_ENV))



    const xyz=latlon23d(50,14,2500)

    var camera = new Camera([xyz[0],xyz[2],xyz[1]]) //-6472)
    const step2s = []
    var wglui = new WglUI("glCanvas", camera, step2s)


    for (var i = 0; i < 10; i++) {
        const cubeObj = new Reflector("reflector" + i, )
        const cm = mat4.create()
        mat4.identity(cm);
        mat4.translate(cm, mat4.create(), [100, 1000 + i * 100, 1000 + i * 1000]);
        mat4.scale(cm, cm, [200, 200, 200]);
        step2s.push(new ModelBinder(cubeObj, () => cm,new ProgramPIU()))
    }

    const sm = mat4.create()
    mat4.scale(sm, sm, [0.1, 0.1, 0.1]);
    const sphereObj = new Sphere("sphere1")
    step2s.push(new ModelBinder(sphereObj, () => sm,new ProgramPINT()))



    wglui.redraw()


})