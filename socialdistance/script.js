(function() {
  'use strict';
  window.addEventListener('load', function() {
    var canvas = document.getElementById('canvas');

    if (!canvas || !canvas.getContext) {
      return false;
    }

    /********************
      Random Number
    ********************/

    function rand(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /********************
      Var
    ********************/

    var resetBtn = document.getElementById('resetBtn');
    var stayBtn = document.getElementById('stayBtn');
    var stay = false;
    var countSick = document.getElementById('countSick'); 
    // canvas 
    var ctx = canvas.getContext('2d');
    var X = canvas.width = window.innerWidth;
    var Y = canvas.height = window.innerHeight;
    
    var splitNum = 16;

    if (X < 768) {
      splitNum = 8;
    }

    var xSplit = X / splitNum;
    var ySplit = Y / splitNum;
    var sick = 1;
    var healthy = splitNum * splitNum - 1;

    /********************
      Animation
    ********************/

    window.requestAnimationFrame =
      window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(cb) {
        setTimeout(cb, 17);
      };

    /********************
      Circle
    ********************/
    
    // var
    var rowMax = splitNum;
    var colMax = splitNum;
    var circles = [];
    
    function Circle(ctx, x, y, c) {
      this.ctx = ctx;
      this.init(x, y, c);
    }

    Circle.prototype.init = function(x, y, c) {
      this.ctx = ctx;
      this.x = x;
      this.y = y;
      this.x1 = this.x;
      this.y1 = this.y;
      this.v = {
        x: rand(-1, 1),
        y: rand(-1, 1)
      };
      this.c = c;
      this.r = ySplit / 8;
      this.l = rand(5, 30);
    };

    Circle.prototype.draw = function() {
      var ctx = this.ctx;
      ctx.beginPath();
      ctx.fillStyle = this.c;
      ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
      ctx.closePath();
      ctx.fill();
    };

    Circle.prototype.updateParam = function() {
      this.l -= 0.1;
      if(this.l < 0 && stay === false) {
        this.v.x = rand(-1, 1);
        this.v.y = rand(-1, 1);
        this.l = rand(1, 10);
      }
    };

    Circle.prototype.stayHome = function() {
      this.v.x = 0;
      this.v.y = 0;
    };

    function countSickSick() {
      for (var i = 0; i < circles.length; i++) {
        if (circles[i].c == 'rgb(255, 57, 57)') {
          countSick.textContent = sick;
          countHealthy.textContent = healthy;
          sick++;
          healthy--;
        }
      }
    }

    Circle.prototype.resize = function() {
      this.x = rand(0, X);
      this.y = rand(0, Y);
    };

    Circle.prototype.coll = function(i) {
      var j = i;
      for (var i = 0; i < circles.length; i++) {
        if (j !== i) {
          var a;
          var b;
          var c;
          var thatR = circles[i].r;
          var thatC = circles[i].c;
          var sumRadius = this.r + thatR;
          a = this.x - circles[i].x;
          b = this.y - circles[i].y;
          c = a * a + b * b;
          if (c < sumRadius * sumRadius) {
            if (this.c !== thatC) {
              this.c = 'rgb(255, 57, 57)';
            }
            this.v.x *= -1;
            this.v.y *= -1;
          }
        }
      }
    };
    
    Circle.prototype.updatePosition = function() {
      this.x += this.v.x;
      this.y += this.v.y;
    };

    Circle.prototype.wrapPosition = function() {
      if (this.x - this.r < 0) {
        this.v.x *= -1;
      }
      if (this.x + this.r > X) {
        this.v.x *= -1;
      }
      if (this.y - this.r < 0) {
        this.v.y *= -1;
      }
      if (this.y + this.r > Y) {
        this.v.y *= -1;
      }
    };


    Circle.prototype.render = function(i) {
      if (stay === true) this.stayHome();
      this.updateParam();
      this.updatePosition();
      this.coll(i);
      this.wrapPosition();
      this.draw();
    };

    for (var i = 0; i < colMax; i++) {
      for (var j = 0; j < rowMax; j++) {
        var color;
        i === colMax / 2  && j === rowMax  / 2 ? color = 'rgb(255, 57, 57)' : color = 'rgb(193, 242, 95)';
        var circle = new Circle(ctx, xSplit * i + xSplit / 2, ySplit * j + ySplit / 2, color);
        circles.push(circle);
      }
    }

    /********************
      Render
    ********************/
    
    function render(i){
      ctx.clearRect(0, 0, X, Y);
      for (var i = 0; i < circles.length; i++) {
        circles[i].render(i);
      }
      countSickSick();
      sick = 1;
      healthy = splitNum * splitNum - 1;
      requestAnimationFrame(render);
    }

    render();

    /********************
      Event
    ********************/
    
    // resize
    function onResize() {
      X = canvas.width = window.innerWidth;
      Y = canvas.height = window.innerHeight;
      for (var i = 0; i < circles.length; i++) {
        circles[i].resize();
      }
    }
    
    window.addEventListener('resize', function() {
      onResize();
    });

    resetBtn.addEventListener('click', function() {
      circles = [];
      stay = false; 
      stayBtn.textContent = 'stay home';
      for (var i = 0; i < colMax; i++) {
        for (var j = 0; j < rowMax; j++) {
          var color;
          i === colMax / 2  && j === rowMax  / 2 ? color = 'rgb(255, 57, 57)' : color = 'rgb(193, 242, 95)';
          var circle = new Circle(ctx, xSplit * i + xSplit / 2, ySplit * j + ySplit / 2, color);
          circles.push(circle);
        }
      }
    }, false);

    stayBtn.addEventListener('click', function() {
      if (stay === true) {
        stay = false;
        stayBtn.textContent = 'stay home';
        for (var i = 0; i < circles.length; i++) {
          circles[i].v.x = rand(-1, 1);
          circles[i].v.y = rand(-1, 1);
        }
      } else {
        stay = true;
        stayBtn.textContent = 'go out';
      }
    }, false);

  }); 

})();




    /********************
      Explosive button
    ********************/

   document.addEventListener("DOMContentLoaded",() => {
    let button = new ExplosiveButton("button");
  });
  
  class ExplosiveButton {
    constructor(el) {
      this.element = document.querySelector(el);
      this.width = 0;
      this.height = 0;
      this.centerX = 0;
      this.centerY = 0;
      this.pieceWidth = 0;
      this.pieceHeight = 0;
      this.piecesX = 9;
      this.piecesY = 4;
      this.duration = 1000;
  
      this.updateDimensions();
      window.addEventListener("resize",this.updateDimensions.bind(this));
  
      if (document.body.animate)
        this.element.addEventListener("click",this.explode.bind(this,this.duration));
    }
    updateDimensions() {
      this.width = pxToEm(this.element.offsetWidth);
      this.height = pxToEm(this.element.offsetHeight);
      this.centerX = this.width / 2;
      this.centerY = this.height / 2;
      this.pieceWidth = this.width / this.piecesX;
      this.pieceHeight = this.height / this.piecesY;
    }
    explode(duration) {
      let explodingState = "exploding";
  
      if (!this.element.classList.contains(explodingState)) {
        this.element.classList.add(explodingState);
  
        this.createParticles("fire",25,duration);
        this.createParticles("debris",this.piecesX * this.piecesY,duration);
      }
    }
    createParticles(kind,count,duration) {
      for (let c = 0; c < count; ++c) {
        let r = randomFloat(0.25,0.5),
          diam = r * 2,
          xBound = this.centerX - r,
          yBound = this.centerY - r,
          easing = "cubic-bezier(0.15,0.5,0.5,0.85)";
  
        if (kind == "fire") {
          let x = this.centerX + randomFloat(-xBound,xBound),
            y = this.centerY + randomFloat(-yBound,yBound),
            a = calcAngle(this.centerX,this.centerY,x,y),
            dist = randomFloat(1,5);
  
          new FireParticle(this.element,x,y,diam,diam,a,dist,duration,easing);
  
        } else if (kind == "debris") {
          let x = (this.pieceWidth / 2) + this.pieceWidth * (c % this.piecesX),
            y = (this.pieceHeight / 2) + this.pieceHeight * Math.floor(c / this.piecesX),
            a = calcAngle(this.centerX,this.centerY,x,y),
            dist = randomFloat(4,7);
  
          new DebrisParticle(this.element,x,y,this.pieceWidth,this.pieceHeight,a,dist,duration,easing);
        }
      }
    }
  }
  class Particle {
    constructor(parent,x,y,w,h,angle,distance = 1,className2 = "") {
      let width = `${w}em`,
        height = `${h}em`,
        adjustedAngle = angle + Math.PI/2;
  
      this.div = document.createElement("div");
      this.div.className = "particle";
  
      if (className2)
        this.div.classList.add(className2);
  
      this.div.style.width = width;
      this.div.style.height = height;
  
      parent.appendChild(this.div);
  
      this.s = {
        x: x - w/2,
        y: y - h/2
      };
      this.d = {
        x: this.s.x + Math.sin(adjustedAngle) * distance,
        y: this.s.y - Math.cos(adjustedAngle) * distance
      };
    }
    runSequence(el,keyframesArray,duration = 1e3,easing = "linear",delay = 0) {
      let animation = el.animate(keyframesArray, {
          duration: duration,
          easing: easing,
          delay: delay
        }
      );
      animation.onfinish = () => {
        let parentCL = el.parentElement.classList;
  
        el.remove();
  
        if (!document.querySelector(".particle"))
          parentCL.remove(...parentCL);
      };
    }
  }
  class DebrisParticle extends Particle {
    constructor(parent,x,y,w,h,angle,distance,duration,easing) {
      super(parent,x,y,w,h,angle,distance,"particle--debris");
      
      let maxAngle = 1080,
        rotX = randomInt(0,maxAngle),
        rotY = randomInt(0,maxAngle),
        rotZ = randomInt(0,maxAngle);
  
      this.runSequence(this.div,[
        {
          opacity: 1,
          transform: `translate(${this.s.x}em,${this.s.y}em) rotateX(0) rotateY(0) rotateZ(0)`
        },
        {
          opacity: 1,
        },
        {
          opacity: 1,
        },
        {
          opacity: 1,
        },
        {
          opacity: 0,
          transform: `translate(${this.d.x}em,${this.d.y}em) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`
        }
      ],randomInt(duration/2,duration),easing);
    }
  }
  class FireParticle extends Particle {
    constructor(parent,x,y,w,h,angle,distance,duration,easing) {
      super(parent,x,y,w,h,angle,distance,"particle--fire");
  
      let sx = this.s.x,
        sy = this.s.y,
        dx = this.d.x,
        dy = this.d.y;
  
      this.runSequence(this.div,[
        {
          background: "hsl(60,100%,100%)",
          transform: `translate(${sx}em,${sy}em) scale(1)`
        },
        {
          background: "hsl(60,100%,80%)",
          transform: `translate(${sx + (dx - sx)*0.25}em,${sy + (dy - sy)*0.25}em) scale(4)`
        },
        {
          background: "hsl(40,100%,60%)",
          transform: `translate(${sx + (dx - sx)*0.5}em,${sy + (dy - sy)*0.5}em) scale(7)`
        },
        {
          background: "hsl(20,100%,40%)"
        },
        {
          background: "hsl(0,0%,20%)",
          transform: `translate(${dx}em,${dy}em) scale(0)`
        }
      ],randomInt(duration/2,duration),easing);
    }
  }
  function calcAngle(x1,y1,x2,y2) {
    let opposite = y2 - y1,
      adjacent = x2 - x1,
      angle = Math.atan(opposite / adjacent);
  
    if (adjacent < 0)
      angle += Math.PI;
  
    if (isNaN(angle))
      angle = 0;
  
    return angle;
  }
  function propertyUnitsStripped(el,property,unit) {
    let cs = window.getComputedStyle(el),
      valueRaw = cs.getPropertyValue(property),
      value = +valueRaw.substr(0,valueRaw.indexOf(unit));
  
    return value;
  }
  function pxToEm(px) {
    let el = document.querySelector(":root");
    return px / propertyUnitsStripped(el,"font-size","px");
  }
  function randomFloat(min,max) {
    return Math.random() * (max - min) + min;
  }
  function randomInt(min,max) {
    return Math.round(Math.random() * (max - min)) + min;
  }