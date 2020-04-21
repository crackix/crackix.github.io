 (function () {
  'use strict';
  window.addEventListener('load', function () {
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

    // canvas 
    var ctx = canvas.getContext('2d');
    var X = canvas.width = window.innerWidth;
    var Y = canvas.height = window.innerHeight;
    var mouseX = X / 2;
    var mouseY = Y / 2;

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
      Moon
    ********************/
    
   var moonNum = 1;
   var moons = [];
   var radius = X / 2;

   if (X < 768) {
     radius = X / 2;
   }

   function Moon(ctx, x, y) {
     this.ctx = ctx;
     this.init(x, y);
   }

   Moon.prototype.init = function(x, y) {
     this.x = x;
     this.y = y;
     this.c = '255, 255, 255';
     this.r = radius;
   };
   
   Moon.prototype.resize = function() {
     this.x = X / 2;
     this.y = Y / 2;
     this.r = radius;
   };

   Moon.prototype.render = function() {
     this.draw();
   };
   
   Moon.prototype.draw = function() {
     ctx.save();
     ctx.beginPath();
     ctx.globalAlpha = 0;
     var col = this.c;
     var g = ctx.createRadialGradient(this.x, this.y, this.r, X / 2 - this.r, Y / 2, 0);
     g.addColorStop(0, "rgba(" + col + ", " + (1 * 1) + ")");
     g.addColorStop(0.5, "rgba(" + col + ", " + (1 * 0.2) + ")");
     g.addColorStop(1, "rgba(" + col + ", " + (1 * 0) + ")");
     ctx.fillStyle = g;
     ctx.arc(this.x, this.y, this.r, Math.PI * 2, false);
     ctx.fill();
     ctx.restore();
   };

   for (var i = 0; i < moonNum; i++) {
     var moon = new Moon(ctx, 0, 0);
     moons.push(moon);
   }


    /********************
      Particle
    ********************/
    
    var particleNum = 2000;
    var particles = [];
    var maxParticles = 1;

    var colors = ['rgb(0, 25, 51)', 'rgb(0, 0, 51)', 'rgb(25, 0, 51)', 'rgb(51, 0, 25)'];

    if (X < 768) {
      particleNum = 1000;
    }

    function Particle(ctx, x, y, r) {
      this.ctx = ctx;
      this.init(x, y, r);
    }

    Particle.prototype.init = function (x, y, r) {
      this.x = x;
      this.y = y;
      this.r = r;
      this.s = 0.1;
      this.ga = rand(0, 1) + 0.1;
      this.v = {
        x: 0,
        y: 0
      };
      /*
      this.c = {
        r: rand(0, 255),
        g: rand(0, 255),
        b: rand(0, 255)
      };
      */
      this.c = colors[rand(0, colors.length - 1)];
    };

    Particle.prototype.closest = function(i){
      var x = this.x - mouseX;
      var y = this.y - mouseY;
      var d = x * x + y * y;
      var newDist = Math.sqrt(d);
      this.v.x = x / newDist * (1 + this.s);
      this.v.y = y / newDist * (1 + this.s);
      this.r += 0.05;
      this.x += this.v.x;
      this.y += this.v.y;
      if (Math.abs(this.x - mouseX) < 10 && Math.abs(this.y - mouseY) < 10) {
        this.x = rand(0, X);
        this.y = rand(0, Y);
        this.s = 0.1;
        this.r = 1;
      }
      if (this.x < 0 || this.x > X) {
        this.x = rand(0, X);
        this.s = 0.1;
        this.r = 1;
      }
      if (this.y < 0 || this.y > Y) {
        this.y = rand(0, Y);
        this.s = 0.1;
        this.r = 1;
      }
    };

    Particle.prototype.updateParams = function() {
      this.s += .095;
    };

    Particle.prototype.resize = function() {
      this.x = rand(0, X);
      this.y = rand(0, Y);
    };
    
    Particle.prototype.draw = function() {
      var ctx = this.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.globalAlpha = this.ga;
      ctx.fillStyle = this.c;
      ctx.globalCompositeOperation = 'lighter';
      //ctx.fillStyle = 'rgb(' + this.c.r + ', ' + this.c.g + ', ' + this.c.b + ')';
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.restore();
    };

    Particle.prototype.render = function (i) {
      this.closest(i);
      this.updateParams();
      this.draw();
    };

    for (var i = 0; i < particleNum; i++) {
      var particle = new Particle(ctx, rand(0, X), rand(0, Y), 1);
      particles.push(particle);
    }
    
    /********************
      Text
    ********************/
    
    var text = '';

    function drawText() {
      ctx.save();
      ctx.fillStyle = 'rgb(0, 137, 190)';
      ctx.font = '16px "sans-serif"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, X / 2, Y / 2);
    }

    /********************
      Render
    ********************/
    
    function render() {
      ctx.clearRect(0, 0, X, Y);
      moons[0].render();
      drawText();
      for (var i = 0; i < particles.length; i++) {
        particles[i].render(i);
      }
      requestAnimationFrame(render);
    }

    render();

    /********************
      Event
    ********************/
    
    function onResize() {
      X = canvas.width = window.innerWidth;
      Y = canvas.height = window.innerHeight;
      moons[0].render();
      for (var i = 0; i < particles.length; i++) {
        particles[i].resize();
      }
    }

    window.addEventListener('resize', function() {
      onResize();
    });

    var clearId;

    window.addEventListener('mousedown', function() {
      clearId = setInterval(function() {
        for (var i = 0; i < particles.length; i++) {
          particles[i].s += 1;
          particles[i].r += 2;
        }
        text = '';
        moons[0].r += 0.5;
      }, 20);
    });

    window.addEventListener('mouseup', function() {
      clearInterval(clearId);
      text = '';
    });

    window.addEventListener('mousemove', function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    window.addEventListener('touchstart', function(e) {
      var touch = event.targetTouches[0];
      mouseX = touch.pageX;
      mouseY = touch.pageY;
      clearId = setInterval(function() {
        for (var i = 0; i < particles.length; i++) {
          particles[i].s += 1;
          particles[i].r += 3;
        }
        text = '';
        moons[0].r += 0.5;
      }, 20);
    }, false);

    window.addEventListener('touchend', function(e) {
      clearInterval(clearId);
      text = '';
    });

  });
  
})();


    /********************
      Explosive buttons
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