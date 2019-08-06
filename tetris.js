const  canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

// increases size of peices within canvas to make total scale of canvas W 12 H 20
context.scale(20, 20);


const player = {
    pos: {x: 5, y: 5},
    matrix: createPiece(randomPiece())
}

function collide(arena, player){
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; y++){
        for (let x = 0; x < m[y].length; x++){
            if (m[y][x] !==0 &&
                (arena[y+ o.y] &&
                arena[y + o.y][x + o.x]) !== 0){
                    return true;
                }
        }
    }
    return false;
}


function colorPiece(value){
    let color;
    switch (value) {
        case 1:
          color = "green";
          break;
        case 2:
           color = "blue";
          break;
        case 3:
          color = "pink";
          break;
        case 4:
          color = "purple";
          break;
        case 5:
          color = "red";
          break;
        case 6:
          color = "yellow";
          break;
        case 7:
          color = "orange";
    }
    return color;
}

// create matrix to represent complete arena
function createMatrix(w, h){
    const matrix = [];
    while (h--){
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

const arena = createMatrix(12, 20);

// matrix for each piece
function createPiece(type){
    if (type === "T"){
        return  [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0]
        ];
    } else if (type === "O"){
        return  [
            [2, 2],
            [2, 2]
        ];
    } else if (type === "L"){
        return  [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3]
        ];
    } else if (type === "J"){
        return  [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0]
        ];
    }  else if (type === "I"){
        return  [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0]
        ];
    } else if (type === "S"){
        return  [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0]
        ];
    } else if (type === "Z"){
        return  [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
        ];
    }
}

// black background and then uses drawMatrix to create current piece being dropped in animation
function draw(){
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x:0, y: 0});
    drawMatrix(player.matrix, player. pos);
}

// creat current piece used in draw function
function drawMatrix(matrix, offset){
    matrix.forEach((matrix, y)=>{
        matrix.forEach((value, x)=>{
            if ( value !== 0 ){
                context.fillStyle = colorPiece(value);
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        })
    })
}

// copies players piece into arena
function merge(arena, player){
    player.matrix.forEach((row, y)=>{
        row.forEach((value, x)=>{
            if(value !== 0){
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        })
    })
}




// helper function used to drop current piece in update and keyboard control
// also checks collide 
function playerDrop(){
    player.pos.y++;
    if (collide(arena, player)){
        player.pos.y--;
        merge(arena, player);
        playerReset();
    }
    dropCounter = 0;
}

// prevents moving laterally into objects with collide
function playerMove(dir){
    player.pos.x += dir;
    if (collide(arena, player)){
        player.pos.x -= dir;
    }
}

// creates new pieice after current piece is set
function playerReset(){
    player.matrix = createPiece(randomPiece()); 
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0); // |0 is floored
}


// usses collide to detect and correct collisions during rottion
function playerRotate(dir){
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)){
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

//returns random key for piece
function randomPiece(){
    const pieces = "ILJOTSZ";
    return pieces[pieces.length * Math.random() | 0];
}

// rotate pice
function rotate(matrix, dir){
    for (let y = 0; y < matrix.length; y++){
        for (let x = 0; x < y; x++){
            [
                matrix[x][y],
                matrix[y][x]
            ] = [
                matrix[y][x],
                matrix[x][y]
            ];
        }
    }
    if (dir > 0){
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

// time interval and starting values for animation
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

//animation uses time intervals of one second to drop current piece
function update(time = 0){
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;

    if (dropCounter > dropInterval){
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

// keyboard control
document.addEventListener("keydown", event=>{
    if (event.keyCode === 37){
        playerMove(-1);
    } else if (event.keyCode === 39){
        playerMove(1);
    } else if (event.keyCode === 40){
        playerDrop();
    } else if (event.keyCode === 81){
        playerRotate(-1);
    } else if (event.keyCode === 87 ||
               event.keyCode === 38){
        playerRotate(1);
    }
})

update();