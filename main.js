const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
// canvas.style.cursor = "url('../img/cursor.png') auto, default";

const collisonCanvas = document.getElementById("collisonCanvas");
const collisonCtx = collisonCanvas.getContext("2d");
collisonCanvas.height = window.innerHeight;
collisonCanvas.width = window.innerWidth;

let timeToNextRaven = 0;
let ravenInterval = 700;
let lastTime = 0;
let score = 0;
ctx.font = "30px Impact";
let GameOver = false;

let gagak = [];
class Gagak {
  constructor() {
    this.spriteWidth = 271;
    this.spriteHeight = 194;
    this.sizeModif = Math.random() * 0.6 + 0.4;
    this.width = this.spriteWidth * this.sizeModif;
    this.height = this.spriteHeight * this.sizeModif;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.directionX = Math.random() * 5 + 3;
    this.directionY = Math.random() * 5 - 2.5;
    this.markedForDelete = false;
    this.image = new Image();
    this.image.src = "img/raven.png";
    this.frame = 0;
    this.maxFrame = 4;
    this.timeSinceFlap = 0;
    this.flapInterval = Math.random() * 50 + 50;
    this.randomColors = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ];
    this.color =
      "rgb(" +
      this.randomColors[0] +
      "," +
      this.randomColors[1] +
      "," +
      this.randomColors[2] +
      ")";
    this.hasTrail = Math.random() > 0.5;
  }
  update(deltaTime) {
    if (this.y < 0 || this.y > canvas.height - this.height) {
      this.directionY = this.directionY * -1;
    }
    this.x -= this.directionX;
    this.y += this.directionY;
    if (this.x < 0 - this.width) {
      this.markedForDelete = true;
    }
    this.timeSinceFlap += deltaTime;
    if (this.timeSinceFlap > this.flapInterval) {
      if (this.frame > this.maxFrame) {
        this.frame = 0;
      } else {
        this.frame++;
      }
      this.timeSinceFlap = 0;
      if (this.hasTrail) {
        for (let i = 0; i < 5; i++) {
          particle.push(new Particle(this.x, this.y, this.width, this.color));
        }
      }
    }
    if (this.x < 0 - this.width) {
      GameOver = true;
    }
  }
  draw() {
    collisonCtx.fillStyle = this.color;
    collisonCtx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}
let ledakan = [];
class Ledakan {
  constructor(x, y, size) {
    this.image = new Image();
    this.image.src = "img/boom.png";
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.size = size;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.audio = new Audio();
    this.audio.src = "sound/boom.wav";
    this.timeSinceLastFrame = 0;
    this.frameInterval = 200;
    this.markedForDelete = false;
  }
  update(deltaTime) {
    if (this.frame === 0) {
      this.audio.play();
    }
    this.timeSinceLastFrame += deltaTime;
    if (this.timeSinceLastFrame > this.frameInterval) {
      this.frame++;
      if (this.frame > 5) {
        this.markedForDelete = true;
      }
    }
  }
  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.size,
      this.size
    );
  }
}
let particle = [];
class Particle {
  constructor(x, y, size, color) {
    this.size = size;
    this.x = x + this.size / 2 + Math.random() * 40 - 25;
    this.y = y + this.size / 3 + Math.random() * 40 - 25;
    this.radius = (Math.random() * this.size) / 10;
    this.Maxradius = Math.random() * 20 + 35;
    this.markedForDelete = false;
    this.speedX = Math.random() * 1 + 0.5;
    this.color = color;
  }
  update() {
    this.x += this.speedX;
    this.radius += 0.3;
    if (this.radius > this.Maxradius - 5) this.markedForDelete = true;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = 1 - this.radius / this.Maxradius;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
function drawScore() {
  const fontSize = canvas.width * 0.2;
  console.log("size" + fontSize);
  ctx.font = "${fontSize}px Impact";
  ctx.fillStyle = "black";
  ctx.fillText("Score : " + score, 52, 72);
  ctx.fillStyle = "white";
  ctx.fillText("Score : " + score, 55, 75);
}
function drawGameOver() {
  const fontSize = canvas.width * 0.5;
  ctx.font = "34px Impact";
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.fillText(
    "Game Over , Score Kamu : " + score,
    canvas.width / 2 + 3,
    canvas.height / 2
  );
  ctx.fillStyle = "white";
  ctx.fillText(
    "Game Over , Score Kamu : " + score,
    canvas.width / 2 + 5,
    canvas.height / 2 + 5
  );
  //mulai ulang
  ctx.font = "${fontSize}px Impact";
  ctx.fillStyle = "black";
  ctx.fillText(
    "Klik untuk Mulai Ulang",
    canvas.width / 2 + 1,
    canvas.height / 2 + 80
  );
  ctx.fillStyle = "white";
  ctx.fillText(
    "Klik untuk Mulai Ulang",
    canvas.width / 2 + 5,
    canvas.height / 2 + 83
  );
}
function note() {
  // const fontSize1 = canvas.width * 0.025;
  // ctx.font = '${fontSize1}px Impact';
  // console.log('size ' + fontSize1)
  // console.log('size ' + ctx.font)
  // const marginBottom = canvas.height * 0.5;
  // const textY = canvas.width * 0.5;
  // const textX = canvas.height - marginBottom;
  ctx.fillStyle = "black";
  ctx.fillText("Note : Jangan Biarkan Gagak Nakal itu Lolos!!", 50, 655);
  ctx.fillStyle = "white";
  ctx.fillText("Note : Jangan Biarkan Gagak Nakal itu Lolos!!", 50, 650);
}

window.addEventListener("click", function (e) {
  const detectPixelColor = collisonCtx.getImageData(e.x, e.y, 1, 1);
  // console.log(detectPixelColor);
  const pc = detectPixelColor.data;
  gagak.forEach((object) => {
    if (
      object.randomColors[0] === pc[0] &&
      object.randomColors[1] === pc[1] &&
      object.randomColors[2] === pc[2]
    ) {
      //deteksi hapus
      object.markedForDelete = true;
      score++;
      ledakan.push(new Ledakan(object.x, object.y, object.width));
      console.log(ledakan);
    }
    if (GameOver) {
      location.reload();
    }
    // else {
    //     object.markedForDelete = false;
    //     score -= 1;
    //     console.log('test')
    // }
    // if(!object.randomColors[0] === pc[0] && !object.randomColors[1] === pc[1] && !object.randomColors[2] === pc[2]) {
    //     object.markedForDelete = false;
    //     score-= 1;
    // }
  });
});

function animate(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  collisonCtx.clearRect(0, 0, canvas.width, canvas.height);
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  timeToNextRaven += deltaTime;
  if (timeToNextRaven > ravenInterval) {
    gagak.push(new Gagak());
    timeToNextRaven = 0;
    gagak.sort(function (a, b) {
      return a.width - b.width;
    });
  }
  drawScore();
  note();
  [...particle, ...gagak, ...ledakan].forEach((object) =>
    object.update(deltaTime)
  );
  [...particle, ...gagak, ...ledakan].forEach((object) => object.draw());
  gagak = gagak.filter((object) => !object.markedForDelete);
  ledakan = ledakan.filter((object) => !object.markedForDelete);
  particle = particle.filter((object) => !object.markedForDelete);
  if (!GameOver) requestAnimationFrame(animate);
  else drawGameOver();
}
animate(0);
