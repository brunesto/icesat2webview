import './styles/body.css';

import { Sphere,CoordsTilesConverter,SlippyTilesConverter  } from './js/sphere.js';
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
import { radians2degrees } from './js/global';

global.logFlag = true

function addMarker(lat,lon,h){
    const cm2 = mat4.create()
    mat4.identity(cm2);
    const xyz2=latlon23d(lat,lon,h)
    //CCconsole.log(""+lat+","+lon,xyz2)
    mat4.translate(cm2, mat4.create(), xyz2);
    mat4.scale(cm2, cm2, [100, 100, 100]);    
    const cubeObj2 = new Reflector(lat+","+lon)
    return new ModelBinder(cubeObj2, () => cm2,new ProgramPIU())

}

$(document).ready(function() {
    //CCconsole.log('process.env.NODE_ENV:' + (process.env.NODE_ENV))

    // position the camera
    const xyz=latlon23d(0,0,9000*1000)
    //CCconsole.log('xyz:' ,xyz)

    // TODO:  camera negative due to camera.lookAt not working properly otherwise ???
    var camera = new Camera([-xyz[0], -xyz[1], -xyz[2]]) //-6472)

    // oriente the camera towards earth
     camera.lookat([0,0,0]);
    // var camera = new Camera([0,0, -15000]) //-6472)
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

    for(var i=-60;i<=60;i+=20)
        step2s.push(addMarker(i,0,0))


    for(var i=-60;i<=60;i+=20)
        step2s.push(addMarker(0,i,0))

    step2s.push(addMarker(50,14,1000*1000,step2s))
    step2s.push(addMarker(20,0,1000*1000,step2s))
   



    const cm2 = mat4.create()
    mat4.identity(cm2);
  
    
    // mat4.translate(cm2, mat4.create(), [3000,3000,5000]);
    // mat4.scale(cm2, cm2, [100, 100, 100]);    
    // const cubeObj2 = new Reflector("harcoded")
    // step2s.push(new ModelBinder(cubeObj2, () => cm2,new ProgramPIU()))


    wglui.onDistance2surfaceChange=()=>{


        // TODO:
        // 1 only the relevant area of earth should be added
        // 2 the precision should increase according to log2 amsl (~=  zoom level)
        // 3 texture...
        // 4 how to smoothly transition from ECEF to ENU?
        

        wglui.removeBinder("gaia")

     

        // camera.distanceFromEarthSurface
        const distanceL2f = Math.floor(Math.log2(camera.distanceFromEarthSurface/1000))

        // this has a nice simple explanation
        // https://sites.math.washington.edu/~conroy/m120-general/horizon.pdf

        const R=6378
        var a=radians2degrees(Math.acos(R/camera.distanceFromEarthCenter))
        
        
a=a/10

        var bbox={
            min:[Math.max(-80,camera.lat-a),Math.max(-180,camera.lon-a*2)],
            max:[Math.min(80,camera.lat+a),Math.min(180,camera.lon+a*2)]
        }
        // bbox = { min: [-2.5, -10.5], max: [2.5, 10.5 ] }
        console.log("a:"+a)
        console.log("bbox:"+JSON.stringify(bbox))

        const sm = mat4.create()
        mat4.scale(sm, sm, [1, 1, 1]);
        //  const sphereObj = new Sphere("gaia",new CoordsTilesConverter(10),bbox)
        const sphereObj = new Sphere("gaia",new SlippyTilesConverter(6),bbox)
        wglui.addBinder(new ModelBinder(sphereObj, () => sm,new ProgramPINT()))
    
    }

    


    wglui.redraw()


})