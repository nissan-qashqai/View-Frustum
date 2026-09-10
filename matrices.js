
// Transpose(B) X Transpose(A) = Transpose( A X B )
export function matrix_product(first, second){
    var size_1 = Math.sqrt(first.length)
    var size_2 = Math.sqrt(second.length)
    if(size_1 != size_2){
        return [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0,
        ]
    }
    var product_matrix = []
    for(let s = 0; s< size_1**2; s++){
        product_matrix.push(0)
    }

    for(let r = 0; r < size_1; r++){
        for(let c = 0; c< size_1; c++){
            let result = 0
            for(let l = 0; l< size_1; l++){
                let from_first = first[r*size_1 + l]
                let from_second = second[l*size_1+ c]
                result +=  from_first* from_second
                
            }
            // result = parseFloat(result)
            product_matrix[r*size_1+c] = result
        }
    }

    return product_matrix

}

export function scale_matrix(sx,sy,sz){
    sx = parseFloat(sx)
    sy = parseFloat(sy)
    sz = parseFloat(sz)

    return [
        sx, 0.0, 0.0, 0.0,
        0.0, sy, 0.0, 0.0,
        0.0, 0.0, sz, 0.0,
        0.0, 0.0, 0.0, 1.0,
    ]
}

export function translate_matrix(tx,ty,tz){
    tx = parseFloat(tx)
    ty = parseFloat(ty)
    tz = parseFloat(tz)

    return [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        tx, ty, tz, 1.0
    ]

}

export function rotation_matrix(rotationAxis, radian){
    var s = Math.sin(radian)
    var c = Math.cos(radian)

    


    if(rotationAxis == "Z"){
        return [
            c,   s,   0.0, 0.0,
            -s,  c,   0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0,
            //Transpose of z-axis rotation matrix
        ]

    }
    else if (rotationAxis == "X"){
        return [
            1.0, 0.0, 0.0, 0.0,
            0.0, c, s, 0.0,
            0.0, -s, c, 0.0,
            0.0, 0.0, 0.0, 1.0,
        ]
    }
    else if (rotationAxis == "Y"){
        return [
            c,   0.0, -s,  0.0,
            0.0, 1.0, 0.0, 0.0,
            s,   0.0, c,   0.0,
            0.0, 0.0, 0.0, 1.0,
        ]
    }
    

    return [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0,
    ]
}



export function perspective(vertical_fov,aspect_ratio,near,far){
    var half_angle_ratio = Math.tan(vertical_fov/2)
    var x_clip_coef = 1/(aspect_ratio*half_angle_ratio)
    var y_clip_coef = 1/half_angle_ratio
    var z_normalization_coef_1 = (near + far )/ (near-far)
    var z_normalization_coef_2 = 2*near*far/ (near-far)


    return [
        x_clip_coef, 0.0, 0.0, 0.0,
        0.0, y_clip_coef, 0.0, 0.0,
        0.0, 0.0, z_normalization_coef_1, -1.0,
        0.0, 0.0, z_normalization_coef_2, 0.0
    ]
    
}

export function orthogonal_view(vertical_fov,aspect_ratio,near,far){
    var half_angle_ratio = Math.tan(vertical_fov/2)
    var x_clip_coef = 1/( aspect_ratio*half_angle_ratio*Math.abs(near) )
    var y_clip_coef = 1/( half_angle_ratio*Math.abs(near) )
    var z_normalization_coef_1 = 2/ (near-far)
    var z_normalization_coef_2 = (near+far)/ (near-far)


    return [
        x_clip_coef, 0.0, 0.0, 0.0,
        0.0, y_clip_coef, 0.0, 0.0,
        0.0, 0.0, z_normalization_coef_1, 0.0,
        0.0, 0.0, z_normalization_coef_2, 1.0
    ]
    
}

export function cameraViewMatrix(normal = {x:0, y:0, z:-1},tempUp = {x:0, y:1, z:0}, cameraCoord = {x:0, y:0, z:0}){
    var mag_normal = Math.sqrt(normal.x**2 + normal.y**2 + normal.z**2 )
    
    normal = {
        x: parseFloat(normal.x/mag_normal),
        y: parseFloat(normal.y/mag_normal),
        z: parseFloat(normal.z/mag_normal),
    }

    var right = {
        x: normal.y * tempUp.z - normal.z * tempUp.y,
        y: normal.z * tempUp.x - normal.x * tempUp.z,
        z: normal.x * tempUp.y - normal.y * tempUp.x
    }

    var mag_right = Math.sqrt(right.x**2 + right.y**2 + right.z**2)

    right = {
        x: parseFloat(right.x/mag_right),
        y: parseFloat(right.y/mag_right),
        z: parseFloat(right.z/mag_right)
    }

  
    var up = {
        x: right.y * normal.z - right.z * normal.y,
        y: right.z * normal.x - right.x * normal.z,
        z: right.x * normal.y - right.y * normal.x
    }

    var mag_up = Math.sqrt(up.x**2 + up.y**2 + up.z**2)

    up = {
        x: parseFloat(up.x/mag_up),
        y: parseFloat(up.y/mag_up),
        z: parseFloat(up.z/mag_up)
    }

    var tx = -1 * (cameraCoord.x * right.x + cameraCoord.y * right.y + cameraCoord.z * right.z)
    var ty = -1 * (cameraCoord.x * up.x + cameraCoord.y * up.y + cameraCoord.z * up.z)
    var tz =  (cameraCoord.x * normal.x + cameraCoord.y * normal.y + cameraCoord.z * normal.z)
    

    return [
        right.x, up.x, -normal.x, 0.0,
        right.y, up.y, -normal.y, 0.0,
        right.z, up.z, -normal.z, 0.0,
        tx,      ty,    tz,       1.0
    ]


}

export function camera_to_world(normal = {x:0, y:0, z:-1},tempUp = {x:0, y:1, z:0}, cameraCoord = {x:0, y:0, z:0}){
    var mag_normal = Math.sqrt(normal.x**2 + normal.y**2 + normal.z**2 )
    
    normal = {
        x: parseFloat(normal.x/mag_normal),
        y: parseFloat(normal.y/mag_normal),
        z: parseFloat(normal.z/mag_normal),
    }

    var right = {
        x: normal.y * tempUp.z - normal.z * tempUp.y,
        y: normal.z * tempUp.x - normal.x * tempUp.z,
        z: normal.x * tempUp.y - normal.y * tempUp.x
    }

    var mag_right = Math.sqrt(right.x**2 + right.y**2 + right.z**2)

    right = {
        x: parseFloat(right.x/mag_right),
        y: parseFloat(right.y/mag_right),
        z: parseFloat(right.z/mag_right)
    }

  
    var up = {
        x: right.y * normal.z - right.z * normal.y,
        y: right.z * normal.x - right.x * normal.z,
        z: right.x * normal.y - right.y * normal.x
    }

    var mag_up = Math.sqrt(up.x**2 + up.y**2 + up.z**2)

    up = {
        x: parseFloat(up.x/mag_up),
        y: parseFloat(up.y/mag_up),
        z: parseFloat(up.z/mag_up)
    }


    

    return [
        right.x, right.y, right.z, 0.0,
        up.x, up.y, up.z, 0.0,
        -normal.x, -normal.y, -normal.z, 0.0,
        cameraCoord.x,      cameraCoord.y,    cameraCoord.z,       1.0
    ]


}




//-----------------------------------------------
//To see result
export function matrix_display(matrix){
    let size = Math.sqrt(matrix.length)

    for(let r = 0; r < size; r++){
        var res = ""
        for(let c = 0; c<size; c ++){
            res = res + matrix[r*size + c] + " "
        }
        console.log(res)
        console.log("")
    }
}

