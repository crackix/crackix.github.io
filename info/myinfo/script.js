/**
  Pop Particles 
  Just playing around with some function expression
  and declarations to make a particle display. 
  
  Are JS classes bad, does this work just as well?
  Tried to not use 'this' and breakdown functions.
  
  click to add new pop's into the mix
*/

let surface;
let animation;
let points = [];
let frame = 0;

const setViewport = element => {
  const canvasElement = element;
  const dc = document.documentElement;
  const width = ~~(dc.clientWidth, window.innerWidth || 0);
  const height = ~~(dc.clientHeight, window.innerHeight || 0);
  canvasElement.width = width;
  canvasElement.height = height;
};

const createCanvas = name => {
  const canvasElement = document.createElement("canvas");
  canvasElement.id = name;
  setViewport(canvasElement);
  document.body.appendChild(canvasElement);
  surface = canvasElement.getContext("2d");
  surface.scale(1, 1);
  return canvasElement;
};

const resetCanvas = () => {
  setViewport(canvas);
};

const canvas = createCanvas("canvas");
window.addEventListener("resize", resetCanvas);

const getRandomPoint = radius => {
  const angle = Math.random() * Math.PI * 2;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    angle };

};

const compare = (a, b) => {
  if (a.angle < b.angle) return -1;
  if (a.angle > b.angle) return 1;
  return 0;
};

const createPop = config => {
  const radius = config.size.end;
  const baseAmount = 15;
  const amt = ~~(Math.random() * baseAmount) + 45;
  const pointArray = [];
  for (let i = 0; i < amt; i++) {
    const rndPoint = getRandomPoint(radius);
    const arcPoint = {
      x: config.x + rndPoint.x,
      y: config.y + rndPoint.y,
      angle: rndPoint.angle };

    pointArray.push(arcPoint);
  }
  pointArray.sort(compare).forEach(point => {
    const ofs = 0.1; //Math.random() * 0.08 + 0.1;
    const pointx = {
      x: point.x,
      y: point.y,
      vx: (point.x - config.x) * ofs + config.vx,
      vy: (point.y - config.y) * ofs + config.vy,
      size: {
        start: config.size.start / 2 + Math.random() * 3,
        end: 0 } };


    points.push(pointx);
  });
};

const makePoint = event => {
  const x = event ? event.pageX : canvas.width / 2;
  const y = event ? event.pageY : canvas.height / 2;
  const baseSpeed = Math.random() * 2;
  const point = {
    x,
    y,
    vx: Math.random() * baseSpeed - baseSpeed / 2,
    vy: Math.random() * baseSpeed - baseSpeed / 2,
    size: {
      start: 5,
      end: 8 + Math.random() * 5 } };


  createPop(point);
};

canvas.addEventListener("click", makePoint);

const draw = point => {
  surface.beginPath();
  surface.fillStyle = "#fff"; //`hsl(${point.hue}, 100%, 50%)`;
  surface.arc(point.x, point.y, point.size.start, 0, 2 * Math.PI, false);
  surface.fill();
};

const renderLoop = () => {
  surface.fillStyle = "rgba(25,25,25,.08)";
  surface.fillRect(0, 0, canvas.width, canvas.height);
  const tempX = 4;
  surface.drawImage(
  canvas,
  tempX / 2,
  tempX / 2,
  canvas.width - tempX,
  canvas.height - tempX);


  for (let x = 0; x < points.length; x++) {
    const point = points[x];
    if (point.died || point.x < -20 || point.x > canvas.width + 20)
    points.splice(x, 1);
    draw(point);

    // vector warp patterns - swap one of the 3
    // point.x += point.vx * Math.sin(point.y * 0.025);
    // point.y += point.vy * Math.cos(point.x * 0.025);

    // default just pop and bounce
    // point.x += point.vx;
    // point.y += point.vy;

    // default pattern and trails
    point.x += point.vx;
    point.x -= Math.sin(point.y * 0.025);
    point.y += point.vy;
    point.y -= Math.cos(point.x * 0.025);

    point.vy += 0.02;

    if (point.y > canvas.height - point.size.start) point.vy *= -1;
    if (point.x < 0 || point.x > canvas.width) point.vx *= -1;

    point.size.start =
    point.size.start - (point.size.start - point.size.end) * 0.005;

    if (point.size.start < point.size.end + 0.05) point.died = true;
  }

  frame++;
  animation = window.requestAnimationFrame(renderLoop);
  if (Math.random() * 300 > 290) {
    makePoint({
      pageX: Math.random() * canvas.width,
      pageY: Math.random() * canvas.height });

  }
};

document.addEventListener("DOMContentLoaded", event => {
  window.requestAnimationFrame(renderLoop);
});

var words = document.getElementsByClassName('word');
var wordArray = [];
var currentWord = 0;

words[currentWord].style.opacity = 1;
for (var i = 0; i < words.length; i++) {
  splitLetters(words[i]);
}

function changeWord() {
  var cw = wordArray[currentWord];
  var nw = currentWord == words.length-1 ? wordArray[0] : wordArray[currentWord+1];
  for (var i = 0; i < cw.length; i++) {
    animateLetterOut(cw, i);
  }
  
  for (var i = 0; i < nw.length; i++) {
    nw[i].className = 'letter behind';
    nw[0].parentElement.style.opacity = 1;
    animateLetterIn(nw, i);
  }
  
  currentWord = (currentWord == wordArray.length-1) ? 0 : currentWord+1;
}

function animateLetterOut(cw, i) {
  setTimeout(function() {
		cw[i].className = 'letter out';
  }, i*80);
}

function animateLetterIn(nw, i) {
  setTimeout(function() {
		nw[i].className = 'letter in';
  }, 340+(i*80));
}

function splitLetters(word) {
  var content = word.innerHTML;
  word.innerHTML = '';
  var letters = [];
  for (var i = 0; i < content.length; i++) {
    var letter = document.createElement('span');
    letter.className = 'letter';
    letter.innerHTML = content.charAt(i);
    word.appendChild(letter);
    letters.push(letter);
  }
  
  wordArray.push(letters);
}

changeWord();
setInterval(changeWord, 4000);