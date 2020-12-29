/**
 * Usual WebGl helpers
 */

import { isPowerOf2,padLeft } from "./global.js";


//
// Initialize a shader program, so WebGL knows how to draw our data
//
export function initShaderProgram(vsSource, fsSource) {
    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
export function loadShader(type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const lines = source.split(/\r?\n/);
        for(var y=0;y<lines.length;y++){
            console.log(padLeft(y+1)+":"+lines[y])
        }
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}


export function gridTexture(x, y,options) {
    if (options===undefined)
        options={checkboard:true,label:true}

    const canvas = document.createElement("CANVAS");
    canvas.width = 1024;
    canvas.height = 1024;
    const cw = canvas.width / x
    const ch = canvas.height / y
    var ctx = canvas.getContext("2d");
    ctx.font = "10px Mono";
    for (var j = 0; j < y; j++) {
        for (var i = 0; i < x; i++) {
            // pixel position
            const px=cw * i;
            const py=ch * j;

            const colorIdx=((j%2)+i)%2
            const color=colorIdx==0? "#eee": "#333"            
            if (options.checkboard){
                ctx.fillStyle=color
                ctx.fillRect(px,py, cw, ch);
            }

            if (options.outline){
                ctx.strokeStyle= color
                ctx.strokeRect(px,py, cw, ch);
            }

            // label
            if (options.label){
                ctx.fillStyle="#0F0"
                ctx.strokeStyle="yellow"
                const text=i+","+j;
                const textWidth=ctx.measureText(text).width          
                ctx.fillText(text, px+cw/2-textWidth/2, py+ch/2-10);
            }

            if (options.cross){
                ctx.beginPath();
                ctx.moveTo( px,py)
                ctx.lineTo(px+cw,py+ch);
                ctx.moveTo( px+cw,py)
                ctx.lineTo(px,py+ch);
                ctx.stroke();
            }
        }
    }

    


    const imgUrl=canvas.toDataURL()

    return loadTexture(imgUrl)
}



function canvas2texture(image, texture) {

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;


    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D);
    } else {
        // No, it's not a power of 2. Turn off mips and set
        // wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
}

// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
export function loadTexture(url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be downloaded over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    const image = new Image();
    image.onload = function() {
        canvas2texture(image, texture)
    };
    image.src = url;

    return texture;
}
