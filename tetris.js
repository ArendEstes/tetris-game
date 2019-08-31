const  canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

// audio
const beep = new Audio("./audio/beep.mp3");
const clear = new Audio("./audio/clear.mp3")
const lose = new Audio("./audio/lose.mp3")

// increases size of peices within canvas to make total scale of canvas W 12 H 20
context.scale(20, 20);

const arena = createMatrix(12, 20);
let level= 1;
const player = {
    matrix: createPiece(randomPiece()),
    pos: {x: arena[0].length /2 - 2 / 2, y: 0},
    score: 0
}

// clears completed lines
function arenaSweep(){
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; y--){
        for (let x = 0; x < arena[y].length; x++){
            if (arena[y][x] === 0){
                continue outer;
            }
        }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y++;
    player.score += rowCount * 10;
    rowCount *= 2;
    clear.play();
    }
    highScoreCheck();
    updateHighScore();
}

//detects if current piece overlaps edge or other piece
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

// color key for pieces
function colorPiece(value){
    let color;
    switch (value) {
        case 1:
          color = "#390099";
          break;
        case 2:
           color = "#9E0059";
          break;
        case 3:
          color = "#FF0054";
          break;
        case 4:
          color = "#FF5400";
          break;
        case 5:
          color = "#ffff00";
          break;
        case 6:
          color = "#1aff1a";
          break;
        case 7:
          color = "#00e6e6";
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

// high score
let highScore;
if(localStorage.length === 0){
    highScore = 0;
}
else {
    highScore = JSON.parse(localStorage.getItem("highScore"));
}

function highScoreCheck(){
    if(player.score > highScore){
        highScore = player.score;
        localStorage.setItem("highScore", JSON.stringify(highScore));
    }
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
        arenaSweep();
        updateScore();
    }
    beep.play();
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
    if ( collide(arena, player) ){
        clearInterval(levelSpeed);
        levelSpeed = setInterval(() => {
            dropInterval -= 100;
            level++;
            updateLevel();
        }, 60000);
        dropInterval = 1000;
        level = 1;
        updateLevel();
        arena.forEach(row=> row.fill(0));
        lose.play();
        player.score = 0;
        updateScore();
    }
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
let levelSpeed = setInterval(() => {
    dropInterval -= 100;
    level ++;
    updateLevel();
}, 60000);

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

// display high score
function updateHighScore(){
    document.getElementById("highScore").innerHTML = `high score<br>${highScore}`;
}

// displays level
function updateLevel(){
    document.getElementById("level").innerHTML = `level<br>${level}`;
}

// displays score
function updateScore(){
    document.getElementById("score").innerHTML = `score<br>${player.score}`;
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

updateHighScore();
updateLevel();
updateScore();
update();