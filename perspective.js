var VSHADER_SOURCE =
'attribute vec4 a_position;\n'+
'uniform mat4 u_transform;\n'+
'uniform mat4 u_view;\n'+
'uniform mat4 u_proj;\n'+
'varying vec4 frag_color;\n'+
'void main() {\n' +
' gl_Position =  u_proj*u_view*u_transform*a_position;\n' + // Coordinates
'frag_color = vec4(a_position.xy + 0.5, a_position.z + 2.5 ,a_position.w);\n' +
'frag_color = a_position + 0.5;\n' +

' gl_PointSize = 10.0;\n' + // Set the point size
'}\n';

// Fragment shader program
var FSHADER_SOURCE =
'precision mediump float;\n'+
'varying vec4 frag_color;\n'+
'void main() {\n' +
' gl_FragColor = frag_color;\n' + // Set the color
'}\n';

var VSHADER_SOURCE_STROKE =
'attribute vec4 a_position;\n'+
'uniform mat4 u_transform;\n'+
'uniform mat4 u_view;\n'+
'uniform mat4 u_proj;\n'+

'void main() {\n' +
' gl_Position =  u_proj*u_view*u_transform*a_position;\n' + // Coordinates
'}\n';

// Fragment shader program
var FSHADER_SOURCE_STROKE =
'precision mediump float;\n'+

'void main() {\n' +
' gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n' + // Set the color
'}\n';


import { matrix_product, rotation_matrix, translate_matrix, scale_matrix, camera_to_world,orthogonal_view,perspective,cameraViewMatrix, matrix_display } from "./matrices.js";

function createProgram(canvasContext, vertexShaderSource, fragmentShaderSource){
    var vertexShader = canvasContext.createShader(canvasContext.VERTEX_SHADER)
    var fragmentShader = canvasContext.createShader(canvasContext.FRAGMENT_SHADER)

    canvasContext.shaderSource(vertexShader, vertexShaderSource)
    canvasContext.shaderSource(fragmentShader, fragmentShaderSource)

    canvasContext.compileShader(vertexShader)
    if( !canvasContext.getShaderParameter( vertexShader, canvasContext.COMPILE_STATUS ) ){
        console.error("Error", canvasContext.getShaderInfoLog(vertexShader))
    }

	canvasContext.compileShader(fragmentShader)
	if( !canvasContext.getShaderParameter( fragmentShader, canvasContext.COMPILE_STATUS ) ){
		console.error("Error", canvasContext.getShaderInfoLog(fragmentShader))
	}

	var program = canvasContext.createProgram()

	canvasContext.attachShader(program,vertexShader)
	canvasContext.attachShader(program,fragmentShader)

	canvasContext.linkProgram(program)

	if(!canvasContext.getProgramParameter(program, canvasContext.LINK_STATUS)){
		console.error("error linking program",canvasContext.getProgramInfoLog(program))
	}

	return program

}
let vertex_data_size = 4



var position_list = [
    -0.5, 0.5, 0.5, 1.0,         -0.5, -0.5, 0.5, 1.0,         0.5, 0.5, 0.5, 1.0,  //Face 1 1
    0.5, 0.5, 0.5, 1.0,         -0.5, -0.5, 0.5, 1.0,         0.5, -0.5, 0.5, 1.0, //Face 1 2

    0.5, 0.5, 0.5, 1.0,         0.5, -0.5, 0.5, 1.0,     0.5, 0.5, -0.5, 1.0, //Face 2 1
    0.5, -0.5, 0.5, 1.0,         0.5, -0.5, -0.5, 1.0,     0.5, 0.5, -0.5, 1.0, // Face 2 2

    -0.5, 0.5, 0.5, 1.0,         -0.5, 0.5, -0.5, 1.0,     -0.5, -0.5, -0.5, 1.0, //Face 3 1
    -0.5, 0.5, 0.5, 1.0,         -0.5, -0.5, -0.5, 1.0,     -0.5, -0.5, 0.5, 1.0, //Face 3 2

    -0.5, 0.5, 0.5, 1.0,         0.5, 0.5, -0.5, 1.0,     -0.5, 0.5, -0.5, 1.0, // Face 4 1
    -0.5, 0.5, 0.5, 1.0,         0.5, 0.5, 0.5, 1.0,     0.5, 0.5, -0.5, 1.0, // Face 4 2

    -0.5, -0.5, 0.5, 1.0,         -0.5, -0.5, -0.5, 1.0,     0.5, -0.5, 0.5, 1.0, // Face 5 1
    0.5, -0.5, 0.5, 1.0,         -0.5, -0.5, -0.5, 1.0,     0.5, -0.5, -0.5, 1.0, //Face 5 2

    -0.5, -0.5, -0.5, 1.0,         -0.5, 0.5, -0.5, 1.0,     0.5, -0.5, -0.5, 1.0, // Face 6 1
    0.5, -0.5, -0.5, 1.0,         -0.5, 0.5, -0.5, 1.0,     0.5, 0.5, -0.5, 1.0,   // Face 6 2

]


var color_list = [
    0.0, 1.0, 0.0, 1.0,     0.0, 1.0, 0.0, 1.0,     0.0, 1.0, 0.0, 1.0, // Face 1
    0.0, 1.0, 0.0, 1.0,     0.0, 1.0, 0.0, 1.0,     0.0, 1.0, 0.0, 1.0,   

    1.0, 0.0, 0.0, 1.0,     1.0, 0.0, 0.0, 1.0,     1.0, 0.0, 0.0, 1.0, // Face 2
    1.0, 0.0, 0.0, 1.0,     1.0, 0.0, 0.0, 1.0,     1.0, 0.0, 0.0, 1.0,

    1.0, 0.5, 0.0, 1.0,     1.0, 0.5, 0.0, 1.0,     1.0, 0.5, 0.0, 1.0, // Face 3
    1.0, 0.5, 0.0, 1.0,     1.0, 0.5, 0.0, 1.0,     1.0, 0.5, 0.0, 1.0,

    0.5, 0.5, 0.5, 1.0,     0.5, 0.5, 0.5, 1.0,     0.5, 0.5, 0.5, 1.0, // Face 4
    0.5, 0.5, 0.5, 1.0,     0.5, 0.5, 0.5, 1.0,     0.5, 0.5, 0.5, 1.0,  
    
    1.0, 1.0, 0.0, 1.0,     1.0, 1.0, 0.0, 1.0,     1.0, 1.0, 0.0, 1.0, // Face 5
    1.0, 1.0, 0.0, 1.0,     1.0, 1.0, 0.0, 1.0,     1.0, 1.0, 0.0, 1.0,

    0.0, 0.0, 1.0, 1.0,     0.0, 0.0, 1.0, 1.0,     0.0, 0.0, 1.0, 1.0, // Face 6
    0.0, 0.0, 1.0, 1.0,     0.0, 0.0, 1.0, 1.0,     0.0, 0.0, 1.0, 1.0,


]


let vertex_count = position_list.length/vertex_data_size


var canvas = document.querySelector("#canvas_perspective")
var canvas2 = document.querySelector("#canvas_ortho")

var canvas_width = canvas.width 
var canvas_height = canvas.height

const aspect_ratio = canvas_width/canvas_height

var vertical_fov = Math.PI/3
var near = 1
var far = 4
var perspective_matrix = perspective(vertical_fov,aspect_ratio,near,far)

var n_w = near*Math.tan(vertical_fov/2)*aspect_ratio
var n_h = near*Math.tan(vertical_fov/2)

var f_w = far*Math.tan(vertical_fov/2)*aspect_ratio
var f_h = far*Math.tan(vertical_fov/2)

var camera_vertices = [
    -0.2, 0.2, 0.2, 1.0,        0.2, 0.2, 0.2, 1.0,
    -0.2, 0.2, 0.2, 1.0,        -0.2, -0.2, 0.2, 1.0,
    -0.2, -0.2, 0.2, 1.0,        0.2, -0.2, 0.2, 1.0,
    0.2, -0.2, 0.2, 1.0,        0.2, 0.2, 0.2, 1.0,

    -0.2, 0.2, -0.2, 1.0,        0.2, 0.2, -0.2, 1.0,
    -0.2, 0.2, -0.2, 1.0,        -0.2, -0.2, -0.2, 1.0,
    -0.2, -0.2, -0.2, 1.0,        0.2, -0.2, -0.2, 1.0,
    0.2, -0.2, -0.2, 1.0,        0.2, 0.2, -0.2, 1.0,

    -0.2, 0.2, 0.2, 1.0,        -0.2, 0.2, -0.2, 1.0,
    0.2, 0.2, 0.2, 1.0,         0.2, 0.2, -0.2, 1.0,
    -0.2, -0.2, 0.2, 1.0,       -0.2, -0.2, -0.2, 1.0,
    0.2, -0.2, 0.2, 1.0,        0.2, -0.2, -0.2, 1.0,

    
    n_w, n_h, -near, 1.0,       -n_w, n_h, -near, 1.0,
    -n_w, n_h, -near, 1.0,       -n_w, -n_h, -near, 1.0,
    -n_w, -n_h, -near, 1.0,       n_w, -n_h, -near, 1.0,
    n_w, -n_h, -near, 1.0,       n_w, n_h, -near, 1.0,

    f_w, f_h, -far, 1.0,       -f_w, f_h, -far, 1.0,
    -f_w, f_h, -far, 1.0,       -f_w, -f_h, -far, 1.0,
    -f_w, -f_h, -far, 1.0,       f_w, -f_h, -far, 1.0,
    f_w, -f_h, -far, 1.0,       f_w, f_h, -far, 1.0,

    n_w, n_h, -near, 1.0,       f_w, f_h, -far, 1.0,
    -n_w, n_h, -near, 1.0,       -f_w, f_h, -far, 1.0,
    -n_w, -n_h, -near, 1.0,      -f_w, -f_h, -far, 1.0,
    n_w, -n_h, -near, 1.0,       f_w, -f_h, -far, 1.0,

]

var camera_vertices_count = camera_vertices.length/vertex_data_size

var cameraPosX =0
var cameraPosY =0
var cameraNormalX = 0
var cameraNormalZ = -1
var cameraNormalY = 0

var cameraMatrix = cameraViewMatrix( {x:0, y:0, z:-1},{x:0, y:1, z:0}, {x:0, y:0, z:0})
var gl = canvas.getContext("webgl")
if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    
}
var program = createProgram(gl,VSHADER_SOURCE,FSHADER_SOURCE)
gl.useProgram(program)




function load_canvas_1(){
    var vertex_buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position_list),gl.STATIC_DRAW)

    var a_position_attrib_location = gl.getAttribLocation(program, "a_position")

    gl.vertexAttribPointer(
        a_position_attrib_location,
        4,
        gl.FLOAT,
        gl.FALSE,
        4*Float32Array.BYTES_PER_ELEMENT,
        0
    )
    gl.enableVertexAttribArray(a_position_attrib_location)
}
load_canvas_1()

//Loading canvas_ortho

var gl2 = canvas2.getContext("webgl")
if (!gl2) {
    console.log('Failed to get the rendering context for WebGL');
    
}
var program2 = createProgram(gl2,VSHADER_SOURCE,FSHADER_SOURCE)
gl2.useProgram(program2)

gl2.clearColor(0.8,0.6,0.8,1.0)
gl2.clear(gl.COLOR_BUFFER_BIT)
gl2.clear(gl.DEPTH_BUFFER_BIT);

gl2.enable(gl.CULL_FACE)

gl2.enable(gl.DEPTH_TEST)

function load_canvas_2(){
    var vertex_buffer = gl2.createBuffer()
    gl2.bindBuffer(gl2.ARRAY_BUFFER, vertex_buffer)
    gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array(position_list),gl2.STATIC_DRAW)

    var a_position_attrib_location = gl2.getAttribLocation(program2, "a_position")

    gl2.vertexAttribPointer(
        a_position_attrib_location,
        4,
        gl2.FLOAT,
        gl2.FALSE,
        4*Float32Array.BYTES_PER_ELEMENT,
        0
    )
    gl2.enableVertexAttribArray(a_position_attrib_location)

}

load_canvas_2()

var program_stroke = createProgram(gl2, VSHADER_SOURCE_STROKE,FSHADER_SOURCE_STROKE)


function load_stroke(){
    var vertex_buffer = gl2.createBuffer()
    gl2.bindBuffer(gl2.ARRAY_BUFFER, vertex_buffer)
    gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array(camera_vertices),gl2.STATIC_DRAW)

    var a_position_attrib_location2 = gl2.getAttribLocation(program_stroke, "a_position")


    gl2.vertexAttribPointer(
        a_position_attrib_location2,
        4,
        gl2.FLOAT,
        gl2.FALSE,
        4*Float32Array.BYTES_PER_ELEMENT,
        0
    )
    gl2.enableVertexAttribArray(a_position_attrib_location2)

}
// load_stroke()







//Rendering Section

var u_transform_location = gl.getUniformLocation(program,"u_transform")
var u_view_location = gl.getUniformLocation(program,"u_view")
var u_proj_location = gl.getUniformLocation(program,"u_proj")

var u_transform_location2 = gl2.getUniformLocation(program2,"u_transform")
var u_view_location2 = gl2.getUniformLocation(program2,"u_view")
var u_proj_location2 = gl2.getUniformLocation(program2,"u_proj")

var u_transform_location_s = gl2.getUniformLocation(program_stroke,"u_transform")
var u_view_location_s = gl2.getUniformLocation(program_stroke,"u_view")
var u_proj_location_s = gl2.getUniformLocation(program_stroke,"u_proj")





let rotateY_mouse = 0
let rotateX_mouse = 0
let isDragging = false
let previous_mouse_position = {x:0, y:0}
var cube_origin = {x:0.0, y:0.0, z:-2.0}
update()
function update(){
    var translateZ = parseFloat(document.getElementById("translateZ").value)
    var translateX = parseFloat(document.getElementById("translateX").value)
    var translateY = parseFloat(document.getElementById("translateY").value)
    var rotateZ = parseFloat(document.getElementById("rotateZ").value)
    var rotateX = parseFloat(document.getElementById("rotateX").value)
    var rotateY = parseFloat(document.getElementById("rotateY").value)

    vertical_fov = parseFloat( document.querySelector("#vfov").value )
    near = parseFloat(document.querySelector("#near").value)
    far = parseFloat(document.querySelector("#far").value)

    cameraPosX = parseFloat(document.getElementById("cameraX").value)
    cameraPosY = parseFloat(document.getElementById("cameraY").value)
    cameraNormalX = Math.sin(Math.atan(-cameraPosX/Math.abs(cube_origin.z) ) )
    cameraNormalY = Math.sin(Math.atan(-cameraPosY/Math.abs(cube_origin.z) ) )
    cameraNormalZ = -Math.cos(Math.atan(-cameraPosX/Math.abs(cube_origin.z) ) )

    cameraMatrix = cameraViewMatrix( {x:cameraNormalX, y:cameraNormalY, z:cameraNormalZ },{x:0, y:1, z:0}, {x:cameraPosX, y:cameraPosY, z:0})

    rotateY += rotateY_mouse 
    rotateX += rotateX_mouse 




    // var transform_mat = matrix_product( translate_matrix(translateX, translateY,0.0), rotation_matrix("Z", rotateZ)) // First translate, then rotate

    var transform_mat = matrix_product(rotation_matrix("Z", rotateZ),rotation_matrix("X",rotateX)) // First rotate, then translate
    transform_mat = matrix_product(transform_mat,rotation_matrix("Y",rotateY))
    transform_mat= matrix_product(transform_mat, translate_matrix(translateX, translateY,translateZ))
    // transform_mat = matrix_product(transform_mat,translate_matrix(-cube_origin.x,-cube_origin.y, -cube_origin.z)) // For center relative rotation


    transform_mat = matrix_product(transform_mat,translate_matrix(cube_origin.x,cube_origin.y, cube_origin.z))

    


    var view_matrix = cameraMatrix

    perspective_matrix = perspective(vertical_fov,aspect_ratio,near,far)
    var projection_matrix = perspective_matrix


    

    gl.uniformMatrix4fv(u_transform_location, false, transform_mat)//Load transfrom matrix
    gl.uniformMatrix4fv(u_view_location,false, view_matrix)
    gl.uniformMatrix4fv(u_proj_location,false, projection_matrix)

    


    gl.clearColor(0.2,0.3,0.8,0.5)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.clear(gl.DEPTH_BUFFER_BIT);

    // gl.enable(gl.CULL_FACE)

    gl.enable(gl.DEPTH_TEST)
    gl.drawArrays(gl.TRIANGLES,0,vertex_count)//Draw


    //Drawing second canvas

    view_matrix= cameraViewMatrix(
        
        {x: -1/Math.sqrt(3), y: -1/Math.sqrt(3), z: -1/Math.sqrt(3), },
        {x:0.0, y:1.0, z:0.0},
        {x:3.0, y:3.0, z:1.0},


    )

    
    gl2.clearColor(0.8,0.6,0.8,1.0)
    gl2.clear(gl.COLOR_BUFFER_BIT)
    gl2.clear(gl.DEPTH_BUFFER_BIT);

    gl2.enable(gl.CULL_FACE)

    gl2.enable(gl.DEPTH_TEST)
    gl2.useProgram(program2)
    load_canvas_2()

    projection_matrix = orthogonal_view(Math.PI*1.9/2,aspect_ratio,0.2,15)
    




    gl2.uniformMatrix4fv(u_transform_location2, false, transform_mat)//Load transfrom matrix
    gl2.uniformMatrix4fv(u_view_location2,false, view_matrix)
    gl2.uniformMatrix4fv(u_proj_location2,false, projection_matrix)


    gl2.drawArrays(gl.TRIANGLES,0,vertex_count)//Draw


    //Draw stroke camera

 n_w = near*Math.tan(vertical_fov/2)*aspect_ratio
 n_h = near*Math.tan(vertical_fov/2)

 f_w = far*Math.tan(vertical_fov/2)*aspect_ratio
 f_h = far*Math.tan(vertical_fov/2)

 camera_vertices = [
    -0.2, 0.2, 0.2, 1.0,        0.2, 0.2, 0.2, 1.0,
    -0.2, 0.2, 0.2, 1.0,        -0.2, -0.2, 0.2, 1.0,
    -0.2, -0.2, 0.2, 1.0,        0.2, -0.2, 0.2, 1.0,
    0.2, -0.2, 0.2, 1.0,        0.2, 0.2, 0.2, 1.0,

    -0.2, 0.2, -0.2, 1.0,        0.2, 0.2, -0.2, 1.0,
    -0.2, 0.2, -0.2, 1.0,        -0.2, -0.2, -0.2, 1.0,
    -0.2, -0.2, -0.2, 1.0,        0.2, -0.2, -0.2, 1.0,
    0.2, -0.2, -0.2, 1.0,        0.2, 0.2, -0.2, 1.0,

    -0.2, 0.2, 0.2, 1.0,        -0.2, 0.2, -0.2, 1.0,
    0.2, 0.2, 0.2, 1.0,         0.2, 0.2, -0.2, 1.0,
    -0.2, -0.2, 0.2, 1.0,       -0.2, -0.2, -0.2, 1.0,
    0.2, -0.2, 0.2, 1.0,        0.2, -0.2, -0.2, 1.0,

    
    n_w, n_h, -near, 1.0,       -n_w, n_h, -near, 1.0,
    -n_w, n_h, -near, 1.0,       -n_w, -n_h, -near, 1.0,
    -n_w, -n_h, -near, 1.0,       n_w, -n_h, -near, 1.0,
    n_w, -n_h, -near, 1.0,       n_w, n_h, -near, 1.0,

    f_w, f_h, -far, 1.0,       -f_w, f_h, -far, 1.0,
    -f_w, f_h, -far, 1.0,       -f_w, -f_h, -far, 1.0,
    -f_w, -f_h, -far, 1.0,       f_w, -f_h, -far, 1.0,
    f_w, -f_h, -far, 1.0,       f_w, f_h, -far, 1.0,

    n_w, n_h, -near, 1.0,       f_w, f_h, -far, 1.0,
    -n_w, n_h, -near, 1.0,       -f_w, f_h, -far, 1.0,
    -n_w, -n_h, -near, 1.0,      -f_w, -f_h, -far, 1.0,
    n_w, -n_h, -near, 1.0,       f_w, -f_h, -far, 1.0,

]
    gl2.useProgram(program_stroke)

    load_stroke()

    transform_mat = camera_to_world({x:cameraNormalX, y:cameraNormalY, z:cameraNormalZ},{x:0, y:1, z:0}, {x:cameraPosX, y:cameraPosY, z:0})

    gl2.uniformMatrix4fv(u_transform_location_s, false, transform_mat)//Load transfrom matrix
    gl2.uniformMatrix4fv(u_view_location_s,false, view_matrix)
    gl2.uniformMatrix4fv(u_proj_location_s,false, projection_matrix)


    gl2.drawArrays(gl.LINES,0,camera_vertices_count)//Draw




}

document.querySelector("#translateZ").addEventListener('input', (e)=>{
    document.querySelector("#translateZvalue").textContent = e.target.value
    update()
})

document.querySelector("#translateX").addEventListener('input', (e)=>{
    document.querySelector("#translateXvalue").textContent = e.target.value
    update()
})

document.querySelector("#translateY").addEventListener('input', (e)=>{
    document.querySelector("#translateYvalue").textContent = e.target.value
    update()
})

document.querySelector("#rotateZ").addEventListener('input', (e)=>{
    document.querySelector("#rotateZvalue").textContent = e.target.value
    
    update()
})

document.querySelector("#rotateX").addEventListener('input', (e)=>{
    document.querySelector("#rotateXvalue").textContent = e.target.value
    
    update()
})

document.querySelector("#rotateY").addEventListener('input', (e)=>{
    document.querySelector("#rotateYvalue").textContent = e.target.value
    
    update()
})

document.querySelector("#cameraX").addEventListener("input", (e)=>{
    document.querySelector("#cameraXvalue").textContent = e.target.value
    update()
})

document.querySelector("#cameraY").addEventListener("input", (e)=>{
    document.querySelector("#cameraYvalue").textContent = e.target.value
    update()
})

document.querySelector("#vfov").addEventListener("input", (e)=>{
    document.querySelector("#vfovValue").textContent = e.target.value
    update()
})

document.querySelector("#near").addEventListener("input", (e)=>{
    document.querySelector("#nearValue").textContent = e.target.value
    update()
})

document.querySelector("#far").addEventListener("input", (e)=>{
    document.querySelector("#farValue").textContent = e.target.value
    update()
})

canvas.addEventListener("mousedown",(e)=>{

    isDragging = true
    previous_mouse_position = {
        x: e.clientX,
        y: e.clientY
    }


})

document.addEventListener("mousemove",(e)=>{
    if(!isDragging){return}
    let deltaX = e.clientX - previous_mouse_position.x
    let deltaY = e.clientY - previous_mouse_position.y

 
    rotateY_mouse += deltaX * 0.0005
    rotateY_mouse = Math.max(-85, Math.min(85,rotateY_mouse ))

    rotateX_mouse += deltaY * 0.0005
    rotateX_mouse = Math.max(-85, Math.min(85,rotateX_mouse ))

    rotateY_mouse = rotateY_mouse%(2*Math.PI)
    rotateX_mouse = rotateX_mouse%(2*Math.PI)

    
    update()
})
document.addEventListener("mouseup",(e)=>{
    isDragging=false
})

document.addEventListener("mouseleave",(e)=>{
    isDragging=false
})