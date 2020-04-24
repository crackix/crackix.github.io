// ------------------------
// -------- CLASS ---------
// ------------------------

class Ball {
	constructor(x, y, options) {
		this.type = {
			core: options.core,
			attacker: options.attacker,
			healer: options.healer
		};

		this.position = createVector(x, y);
		this.radius = options.radius || 20;
		this.color = options.color || this.selectColor(this.type);
		this.velocity = options.velocity || createVector(0, 0);
		this.acceleration = options.acceleration || createVector(0, 0);
		this.particlesArray = options.particlesArray;
		this.endLocation = options.endLocation || null;
		this.destroyed = false;
		this.powerUps = {
			shield: false
		};

		if (this.type.attacker) {
			this.totalLife = options.attackerLife || 5;
			this.strength = options.strength || 5;
		}
		if (this.type.healer) {
			this.totalLife = 10;
			this.strength = 10;
		}
		if (this.type.core) this.totalLife = 100;
	}

	show() {
		noStroke();
		fill(this.color);
		ellipse(this.position.x, this.position.y, this.radius);

		if (this.type.core) {
			noFill();
			stroke(this.color);
			strokeWeight(2);
			if (this.powerUps.shield)
				ellipse(this.position.x, this.position.y, this.radius + 10);
			if (this.destroyed) {
				this.radius = 0;
			}
		}
	}

	update() {
		let v = p5.Vector.sub(this.position, this.endLocation);

		if (!(this.velocity.equals(0, 0) || this.acceleration.equals(0, 0))) {
			this.position.add(this.velocity);
			this.velocity.sub(v);
			this.velocity.setMag(3);
		}

		if (this.type.core == true && this.destroyed == false) {
			if (this.totalLife > 100) this.totalLife = 100;
			this.breakIfLifeCompletes();
		}

		this.timer++;
	}

	collisionDetection(CORE, attackersArray) {
		for (let i = 0; i < attackersArray.length; i++) {
			let distBetweenPoints =
				dist(
					attackersArray[i].position.x,
					attackersArray[i].position.y,
					CORE.position.x,
					CORE.position.y
				) -
				this.radius * (this.powerUps.shield ? 2.32 : 2);
			if (distBetweenPoints < 0) {
				this.changeLifeValue(CORE);
				attackersArray[i].radius = 0;
				attackersArray.splice(i, 1);
				this.breakIntoParticles(this.particlesArray, this.position, {
					minRadius: 1,
					maxRadius: 3,
					maxVelocity: 8,
					maxParticles: 15,
					colorsArray: [this.color, CORE.color]
				});
				return true;
			}
		}
	}

	changeLifeValue() {
		if (core.totalLife > 0) {
			if (this.type.attacker && core.powerUps.shield == false) {
				core.totalLife -= this.strength;
			} else if (this.type.healer) {
				core.totalLife += this.strength;
			}
		}
	}

	breakIfLifeCompletes() {
		if (this.totalLife <= 0) {
			this.breakIntoParticles(this.particlesArray, this.position, {
				minRadius: 1,
				maxRadius: 4,
				maxVelocity: 20,
				colorsArray: totalCoins != 0 ? [this.color, "#ffff00"] : [this.color],
				maxParticles: 20,
				blast: false
			});
			this.destroyed = true;
		}
	}

	breakIntoParticles(particlesArray, location, options) {
		for (let i = 0; i < options.maxParticles; i++) {
			let randomRadius = random(options.minRadius, options.maxRadius);
			let randColor =
				options.colorsArray != undefined
					? options.colorsArray[floor(random(options.colorsArray.length))]
					: options.color;
			particlesArray.push(
				new Particle(location.x, location.y, {
					color: randColor,
					radius: randomRadius,
					maxVelocity: options.maxVelocity,
					blast: options.blast,
					gravity: options.gravity,
					timeToLive: options.timeToLive
				})
			);
		}
	}

	selectColor(object) {
		if (object.core == true) return "#fff";
		else if (object.attacker == true) return "#ff0000";
		else if (object.healer == true) return "#00ff00";
	}
}

// ---------------------- //
// ---------------------- //
// ---- Bullet Class ---- //
// ---------------------- //
// ---------------------- //

class Bullet extends Ball {
	constructor(x, y, options) {
		super(x, y, options);
		this.strength = options.strength || 5;
		this.bulletVelocity = 10;
		this.endLocationVector = options.endLocationVector;
	}

	show() {
		push();
		translate(this.position.x, this.position.y);
		rotate(this.endLocationVector.heading() - PI / 2);
		stroke(this.color);
		strokeWeight(this.radius);
		line(0, 0, 0, this.radius);
		pop();
	}

	update() {
		this.position.add(this.velocity);
		this.velocity.add(this.acceleration);
		this.velocity.limit(this.bulletVelocity);
	}

	collisionDetection(bulletsArray, attackersArray) {
		for (let i = 0; i < attackersArray.length; i++) {
			for (let j = 0; j < bulletsArray.length; j++) {
				let destroyed = false;
				let attackPower = attackersArray[i].strength;
				let distBetweenPoints =
					dist(
						attackersArray[i].position.x,
						attackersArray[i].position.y,
						bulletsArray[j].position.x,
						bulletsArray[j].position.y
					) -
					attackersArray[i].radius * 0.85;

				if (distBetweenPoints < 0) {
					this.changeLifeValue(attackersArray[i]);
					bulletsArray[j].radius = 0;
					bulletsArray.splice(j, 1);
					super.breakIntoParticles(this.particlesArray, this.position, {
						minRadius: 1,
						maxRadius: 2,
						maxVelocity: 5,
						maxParticles: 10,
						blast: false,
						timeToLive: 180,
						colorsArray: [this.color, attackersArray[i].color],
						gravity: p5.Vector.sub(attackersArray[i].position, core.position).setMag(
							0.65
						)
					});

					if (attackersArray[i].destroyed == false) {
						attackersArray[i].strength -= this.strength;
						if (attackersArray[i].strength == 0) attackersArray[i].destroyed = true;
					}

					if (attackersArray[i].destroyed == true) {
						destroyed = true;
						super.breakIntoParticles(
							this.particlesArray,
							attackersArray[i].position,
							{
								minRadius: 1,
								maxRadius: 3,
								maxVelocity: 8,
								maxParticles: 15,
								blast: true,
								timeToLive: 100,
								colorsArray: [attackersArray[i].color],
								gravity: createVector(0, 0)
							}
						);

						if (attackersArray[i].type.attacker) {
							let randomTotalCoins = floor(random(4, 8));
							for (let j = 0; j < randomTotalCoins; j++) {
								coinsArray.push(
									new Coin(attackersArray[i].position.x, attackersArray[i].position.y, {
										coinValue: isDoubleCoin
											? 2 * floor(random(2, 6))
											: floor(random(1, 3)),
										velocity: p5.Vector.random2D().setMag(attackersArray[i].radius / 2),
										acceleration: p5.Vector.random2D(),
										endLocation: core.position,
										color: "#ffff00",
										radius: random(2, 5)
									})
								);
							}
						}

						attackersArray.splice(i, 1);
					}
					return {
						destroyed: destroyed,
						attackPower: attackPower
					};
				}
			}
		}
		return false;
	}

	changeLifeValue(attacker) {
		if (attacker.totalLife > 0) {
			attacker.totalLife -= this.strength;
		}
		if (attacker.totalLife <= 0) {
			attacker.destroyed = true;
		}
	}

	removeIfOutOfBounds(array, index) {
		if (
			this.position.x + this.radius > width ||
			this.position.x - this.radius < 0 ||
			this.position.y + this.radius > height ||
			this.position.y - this.radius < 0
		) {
			array.splice(index, 1);
		}
	}
}

// ---------------------- //
// ---------------------- //
// ---- Coins Class ---- //
// ---------------------- //
// ---------------------- //

class Coin extends Ball {
	constructor(x, y, options) {
		super(x, y, options);
		this.coinValue = options.coinValue || 1;
	}

	changeTotalCoinsValue() {
		totalCoins += this.coinValue;
	}

	collisionDetection() {
		for (let i = 0; i < coinsArray.length; i++) {
			let distBetweenPoints =
				dist(
					coinsArray[i].position.x,
					coinsArray[i].position.y,
					core.position.x,
					core.position.y
				) - this.radius;
			if (distBetweenPoints < 0) {
				coinsArray[i].radius = 0;
				this.changeTotalCoinsValue();
				coinsArray.splice(i, 1);
			}
		}
	}
}

class Canon {
	constructor(x, y, options) {
		this.position = createVector(x, y);
		this.radius = options.radius;
		this.color = options.color;
		this.particlesArray = options.particlesArray;
		this.scaleY = 1;
		this.state = {
			shooting: true,
			reloading: false
		};
		this.powerUps = {
			machineGun: false,
			doubleCanon: false
		};
		this.canonWidth = 10;
		this.canonHeight = this.radius;
		this.angleToLook = createVector(0, 0);
	}

	show() {
		push();

		translate(this.position.x, this.position.y);
		rotate(this.angleToLook);
		scale(1, this.scaleY);

		noStroke();

		fill(this.color);
		rect(
			-this.canonWidth / 2,
			this.radius / 8,
			this.canonWidth,
			this.canonHeight
		);
		if (this.state.shooting) fill("#67f3da");
		if (this.state.reloading) fill("#ff0000");
		rect(
			-this.canonWidth / 2,
			this.radius,
			this.canonWidth,
			this.canonHeight / 8
		);

		if (this.powerUps.doubleCanon) {
			fill(this.color);
			rect(
				-this.canonWidth / 2,
				-this.radius / 8,
				this.canonWidth,
				-this.canonHeight
			);
			if (this.state.shooting) fill("#da46ff");
			if (this.state.reloading) fill("#ff0000");
			rect(
				-this.canonWidth / 2,
				-this.radius,
				this.canonWidth,
				-this.canonHeight / 8
			);
		}

		pop();
	}

	lookAt(x, y) {
		let location, vector, angle;
		location = createVector(x, y);
		vector = p5.Vector.sub(location, this.position);
		vector.setMag(this.radius);
		angle = vector.heading() - PI / 2;
		this.angleToLook = angle;
	}

	shoot(startPos, endPos, bulletsArray, options) {
		let v1 = p5.Vector.sub(endPos, this.position);
		let a1 = v1.heading() - PI / 2;
		bulletsArray.push(
			new Bullet(
				startPos.x + sin(-a1) * this.canonHeight,
				startPos.y + cos(a1) * this.canonHeight,
				{
					acceleration: v1,
					color: options.color,
					radius: options.radius,
					particlesArray: this.particlesArray,
					strength: this.powerUps.doubleCanon ? 100 : options.bulletStrength,
					endLocationVector: v1
				}
			)
		);
		if (this.powerUps.doubleCanon) {
			let v2 = p5.Vector.sub(this.position, endPos);
			let a2 = v2.heading() - PI / 2;
			bulletsArray.push(
				new Bullet(
					startPos.x + sin(-a2) * this.canonHeight,
					startPos.y + cos(a2) * this.canonHeight,
					{
						acceleration: v2,
						color: "#da46ff",
						radius: options.radius,
						particlesArray: this.particlesArray,
						strength: 100,
						endLocationVector: v2
					}
				)
			);
		}
		this.showRecoil();
	}

	showRecoil() {
		let tl = gsap.timeline();
		let duration = 0.05;
		tl.to(this, duration, { scaleY: 1.05 });
		tl.to(this, duration, { scaleY: 1 });
	}
}

class Particle {
	constructor(x, y, options) {
		this.position = createVector(x, y);
		this.velocity = createVector(
			random(-options.maxVelocity, options.maxVelocity),
			random(-options.maxVelocity, options.maxVelocity)
		);

		this.blast = options.blast || false;

		this.normalisedVelocity = p5.Vector.random2D().setMag(options.maxVelocity);
		this.anotherPosition = this.position.copy();

		this.radius = options.radius;
		this.color = options.color;
		this.timeToLive = options.timeToLive || 255;

		this.gravity = options.gravity || createVector(0, 0.25);
	}

	show() {
		noStroke();
		let c = color(this.color);
		c.setAlpha(this.timeToLive);
		fill(c);

		if (this.blast) {
			ellipse(this.anotherPosition.x, this.anotherPosition.y, this.radius);
		}
		ellipse(this.position.x, this.position.y, this.radius);
	}

	update() {
		this.position.add(this.velocity);
		this.velocity.add(this.gravity);

		this.anotherPosition.add(this.normalisedVelocity);

		this.timeToLive -= 1;
	}

	removeAfterLifeCompletes(array, index) {
		if (this.timeToLive == 0) {
			array.splice(index, 1);
		}
	}
}

// -----------------------
// -- CLASSES COMPLETES --
// ----- CODE STARTS -----
// -----------------------

console.clear();

// Object variables
let core, canon;

// array variables
let attackers, healers, particles, bullets, coinsArray;

// Boolean variables
let destroyedEveryone,
	gameStarted,
	gamePaused,
	isReloading,
	isPowerUpActive,
	checkDurationChanged,
	changedAttackerProps,
	isDoubleCoin;

// counter variables
let timer, spawnTimeRate, reloadTimer, machineGunShootTimer;

// number storing variables
let score,
	highScore,
	totalCoins,
	magazineSize,
	bulletsShot,
	reloadTime,
	reloadTimeFactor,
	attackerTotalLife,
	attackerStrength,
	bulletStrength,
	powerUpDuration,
	powerUpValue,
	powerUpMaxValue,
	powerUpIncrement,
	machineGunShootDelay,
	totalHealers,
	checkDuration,
	changeAttackerPropsAtScore;

// cost Variables
let magazineIncreaseCost,
	healingCost,
	powerUpDurationIncreaseCost,
	decreaseReloadingTimeCost;

// change amount variables
let healingAmount,
	magazineIncreaseAmount,
	powerUpDurationIncreaseAmount,
	decreaseReloadingTimeFactorBy;

// STATS variables
let totalAttackersKilled, totalTimeSurvived;
let gameStartTime, gameEndTime;

// canvas props
const canvasWidth = 600,
	canvasHeight = 600;

const gameTitle = document.getElementById("game-title");
const gameInfo = document.getElementById("game-info");

const magazineContainer = document.querySelector(".magazine");
const bulletIcons = magazineContainer.querySelectorAll("svg.bullet");
const pausedContainerEl = document.querySelector(".paused-container");
const statsContainerEl = document.querySelector(".stats-container");

// All the buttons
const startButton = document.querySelector("button.start");
const restartButton = document.querySelector("button.restart");
const reloadButton = magazineContainer.querySelector("button");
const pauseButton = document.querySelector("button.pause");
const resumeButton = document.querySelector("button.resume");
const audioToggleButton = document.querySelector(".audio-toggle");

const coreLifeEl = document.getElementById("core-life");
const scoreEl = document.querySelector(".score");
const highScoreEl = document.getElementById("highscore");
const coinsContainerEl = document.querySelector(".coins-container");

// Powerup related elements
const powerupProgressbarContainer = document.querySelector(
	".powerup-progress-bar"
);
const powerupProgressInfoEl = document.querySelector(".powerup-info");
const powerUpDurationContainerEl = powerupProgressInfoEl.querySelector(
	".powerup-duration-container"
);
const powerUpDurationEl = document.getElementById("powerup-duration-value");
const powerupValueEl = powerupProgressInfoEl.querySelector("#powerup-value");
const powerupMaxValueEl = powerupProgressInfoEl.querySelector(
	"#powerup-max-value"
);
const powerupContainer = document.querySelector(".powerup-container");
const progressEl = document.querySelector(".powerup-progress-bar .bar");

// powerup items Elements
const machinegunPowerUpEl = document.getElementById("machinegun-powerup");
const doubleCanonPowerUpEl = document.getElementById("doublecanon-powerup");
const shieldPowerUpEl = document.getElementById("shield-powerup");
const doubleCoinPowerUpEl = document.getElementById("double-coins-powerup");

// shop items Elements
const shopCointainer = document.querySelector(".shop-with-coins");
const healthKitShopItemEl = document.getElementById("health-kit");
const improveMagazineShopItemEl = document.getElementById("increase-magazine");
const fasterReloadShopItemEl = document.getElementById("faster-reload");
const increasePowerUpDurationShopItemEl = document.getElementById(
	"increase-powerup-duration"
);

function setup() {
	let canvas = createCanvas(canvasWidth, canvasHeight);
	canvas.parent("#canvas-container");
}

// initialize function
function init() {
	attackers = [];
	healers = [];
	particles = [];
	bullets = [];
	coinsArray = [];

	destroyedEveryone = false;
	gameStarted = false;
	gamePaused = false;
	isReloading = false;
	isPowerUpActive = false;
	checkDurationChanged = false;
	changedAttackerProps = false;
	isDoubleCoin = false;

	score = 0;
	highScore = localStorage.getItem("highScore");
	totalCoins = 0;
	totalHealers = 3;
	timer = 0;
	spawnTimeRate = 100;
	magazineSize = 10;
	bulletsShot = 0;
	reloadTimer = 0;
	reloadTimeFactor = 10;
	reloadTime = magazineSize * reloadTimeFactor;
	attackerTotalLife = 5;
	attackerStrength = 5;
	bulletStrength = 5;
	powerUpValue = 0;
	powerUpMaxValue = 200;
	powerUpIncrement = 10;
	powerUpDuration = 10000;
	machineGunShootDelay = 8;
	machineGunShootTimer = 0;
	checkDuration = 350;
	changeAttackerPropsAtScore = 75;

	// shop items cost
	magazineIncreaseCost = 150;
	healingCost = 300;
	powerUpDurationIncreaseCost = 250;
	decreaseReloadingTimeCost = 150;

	// Amount
	healingAmount = 50;
	magazineIncreaseAmount = 5;
	powerUpDurationIncreaseAmount = 5000;
	decreaseReloadingTimeFactorBy = 2;

	totalAttackersKilled = 0;
	totalTimeSurvived = 0;
	gameStartTime = Date.now();
	gameEndTime = null;

	core = new Ball(width / 2, height / 2, {
		core: true,
		radius: 60,
		particlesArray: particles
	});

	canon = new Canon(core.position.x, core.position.y, {
		radius: 40,
		color: core.color,
		particlesArray: particles
	});

	updateProgressInfo();
	showUI();
}

startButton.addEventListener("click", () => {
	init();
	gameStarted = true;
	gameTitle.classList.add("hide");
	gameInfo.classList.add("hide");
});

restartButton.addEventListener("click", () => {
	init();
	gameStarted = true;
	statsContainerEl.classList.add("hide");
	highScoreEl.classList.add("hide");
	document.getElementById("new-highscore-info").classList.add("hide");
});

pauseButton.addEventListener("mousedown", pauseGame);
resumeButton.addEventListener("mousedown", resumeGame);
reloadButton.addEventListener("mousedown", startReloadingCanon);

function mousePressed() {
	if (gameStarted && core.destroyed == false && !gamePaused) {
		let endPos = createVector(mouseX, mouseY);

		if (canon.state.shooting == true) {
			canon.shoot(core.position, endPos, bullets, {
				color: "#00ffff",
				radius: 5,
				bulletStrength: bulletStrength
			});
			if (!canon.powerUps.doubleCanon || !canon.powerUps.machineGun) bulletsShot++;
		}

		if (bulletsShot == magazineSize) startReloadingCanon();
	}
}

let pausedIconIndex = 0;
let iconIndex = 0;
function startReloadingCanon() {
	isReloading = true;
	canon.state.reloading = true;
	canon.state.shooting = false;
	if (!gamePaused) bulletsShot = 0;
	animateValue(
		magazineContainer.querySelector(".magazine--text").querySelector("#bullets"),
		0,
		magazineSize,
		reloadTimeFactor * 480
	);
}

function keyPressed(key) {
	if (key.key.toLowerCase() == "r" && bulletsShot != 0 && !gamePaused)
		startReloadingCanon();
}

function pauseGame() {
	gamePaused = true;
	pausedContainerEl.classList.remove("hide");
	if (gamePaused) {
		iconIndex = pausedIconIndex;
		pauseButton.classList.add("hide");
	} else if (gamePaused == false) {
		pauseButton.classList.remove("hide");
		if (canon.state.reloading) {
			animateValue(
				magazineContainer
					.querySelector(".magazine--text")
					.querySelector("#bullets"),
				magazineSize - bulletsShot,
				magazineSize,
				(magazineSize - bulletsShot) * 300
			);
		}
	}
}

function resumeGame() {
	setTimeout(() => {
		gamePaused = false;
	}, 100);
	pauseButton.classList.remove("hide");
	pausedContainerEl.classList.add("hide");
}

// draw loop
function draw() {
	background(0);
	if (gameStarted) {
		updateCoreLife(coreLifeEl, core.totalLife);
		updateScore(scoreEl, score);
		updateCoins(coinsContainerEl.querySelector("#total-coins"), totalCoins);
		if (!isReloading) updateMagazine();
		updateProgressBar(progressEl, powerUpValue, powerUpMaxValue);
		showAllShopItems();
		showAllItemsCost();
		totalCoins = max(0, totalCoins);
		if (!isPowerUpActive)
			powerUpDurationEl.innerHTML = `${powerUpDuration / 1000}s`;

		bullets.forEach((bullet, index) => {
			bullet.show();
			if (!gamePaused) bullet.update();
			let c1 = bullet.collisionDetection(bullets, attackers);
			let c2 = bullet.collisionDetection(bullets, healers);
			bullet.removeIfOutOfBounds(bullets, index);
			if (c1.destroyed) {
				score += attackerStrength;
				totalAttackersKilled++;
				if (!isPowerUpActive) powerUpValue += attackerStrength;
				powerUpValue =
					powerUpValue >= powerUpMaxValue ? powerUpMaxValue : powerUpValue;
			}
			if (c2.destroyed) score -= c2.attackPower;

			if (c1.destroyed || c2.destroyed) {
				if (!isPowerUpActive) updateProgressInfo();
				checkDurationChanged = false;
			}
			score = max(0, score);
		});

		particles.forEach((particle, index) => {
			particle.show();
			if (!gamePaused) particle.update();
			particle.removeAfterLifeCompletes(particles, index);
		});

		coinsArray.forEach((coin) => {
			coin.show();
			if (!gamePaused) coin.update();
			coin.collisionDetection();
		});

		attackers.forEach((attacker) => {
			attacker.show();
			if (!gamePaused) attacker.update();
			attacker.collisionDetection(core, attackers);
		});

		healers.forEach((healer) => {
			healer.show();
			if (!gamePaused) healer.update();
			healer.collisionDetection(core, healers);
		});

		if (!gamePaused) canon.lookAt(mouseX, mouseY);
		canon.show();

		core.show();
		if (!gamePaused) core.update();

		if (!isReloading) iconIndex = 0;

		if (canon.state.shooting == false && !gamePaused) {
			reloadButton.style.background = "#555";
			reloadButton.innerHTML = "reloading..";
			magazineContainer.querySelector("#key-info").classList.add("hide");
			bulletIcons[iconIndex].style.opacity = "1";
			if (
				iconIndex != bulletIcons.length - 1 &&
				reloadTimer != 0 &&
				reloadTimer % floor(reloadTime / 3) == 0
			)
				iconIndex++;

			if (reloadTimer != 0 && reloadTimer % reloadTime == 0) {
				canon.state.reloading = false;
				canon.state.shooting = true;
				bulletsShot = 0;
				reloadTimer = 0;
				isReloading = false;
				reloadButton.classList.add("hide");
			}
			reloadTimer++;
		} else if (canon.state.shooting && !gamePaused) {
			if (canon.powerUps.machineGun) {
				canon.state.shooting = true;
				if (
					machineGunShootTimer != 0 &&
					machineGunShootTimer % machineGunShootDelay == 0
				) {
					let endPos = createVector(mouseX, mouseY);
					canon.shoot(core.position, endPos, bullets, {
						color: "#67f3da",
						radius: 5,
						bulletStrength: bulletStrength
					});
				}
				machineGunShootTimer++;
			}
		}

		if (score != 0 && score % changeAttackerPropsAtScore == 0) {
			changedAttackerProps = true;
			if (changedAttackerProps) {
				attackerTotalLife += attackerTotalLife == 50 ? 0 : 5;
				attackerStrength += attackerStrength == 50 ? 0 : 5;
				changeAttackerPropsAtScore += 200;
				changedAttackerProps = false;
			}
		}

		if (timer != 0 && timer % checkDuration == 0 && !gamePaused) {
			if (attackers.length == 0) {
				pushIntoArray("attacker", attackers);
			}
		}

		if (timer != 0 && timer % checkDuration == 0 && !gamePaused) {
			if (checkDuration >= 25) {
				if (score >= 100 && score % 100 == 0 && checkDurationChanged == false) {
					checkDuration -= 25;
					spawnTimeRate -= spawnTimeRate >= 30 ? 10 : 0;
					checkDurationChanged = true;
				}
			}
		}

		if (core.destroyed && destroyedEveryone == false) {
			destroyEveryone();
			destroyedEveryone = true;
			gameEndTime = Date.now();
			showStats();
			restartButton.classList.remove("hide");
			statsContainerEl.classList.remove("hide");
		}

		if (timer != 0 && timer % spawnTimeRate == 0) {
			let randomRatio = random(1);
			if (randomRatio < 0.4) {
				if (core.totalLife < 30 && totalHealers != 0) {
					pushIntoArray("healer", healers);
					totalHealers--;
				}
			} else {
				pushIntoArray("attacker", attackers);
			}
		}

		if (!gamePaused) timer++;
	}
}

// push into array based on given type
function pushIntoArray(typeName, array) {
	if (core.destroyed == false) {
		let randomAngle = random(TWO_PI);
		let randomX = core.position.x + sin(randomAngle) * width;
		let randomY = core.position.y + cos(randomAngle) * height;
		array.push(
			new Ball(randomX, randomY, {
				attacker: typeName == "attacker",
				healer: typeName == "healer",
				velocity: p5.Vector.random2D(),
				acceleration: p5.Vector.random2D(),
				endLocation: core.position,
				particlesArray: particles,
				attackerLife: attackerTotalLife,
				strength: attackerStrength
			})
		);
	}
}

// updates score el
function updateScore(el, score) {
	el.innerHTML = `score : ${score}`;
}

// updates Coins el
function updateCoins(el, tCoins) {
	el.innerHTML = `${tCoins}`;
}

// updates core life el
function updateCoreLife(el, life) {
	el.innerHTML = `${life}`;
}

// updates progress info
function updateProgressInfo() {
	powerupValueEl.innerHTML = `${powerUpValue}`;
	powerupMaxValueEl.innerHTML = `${powerUpMaxValue}`;
}

// updates magazinesize text and icons
function updateMagazine() {
	magazineContainer
		.querySelector(".magazine--text")
		.querySelector("#bullets").innerHTML = `${magazineSize - bulletsShot}`;
	magazineContainer
		.querySelector(".magazine--text")
		.querySelector("#magazine-size").innerHTML = `${magazineSize}`;

	let totalBulletIcons = 3;
	let magazineRatio = floor(magazineSize / totalBulletIcons);
	let iconBreakpointList = returnBreakpointArray(
		magazineRatio,
		totalBulletIcons
	);
	let bulletsLeft = magazineSize - bulletsShot;

	if (bulletsLeft == iconBreakpointList[2])
		changeOpacity([bulletIcons[2]], "0.45");
	else if (bulletsLeft <= iconBreakpointList[1]) {
		reloadButton.style.background = "var(--red)";
		reloadButton.innerHTML = "reload";
		reloadButton.classList.remove("hide");
		magazineContainer.querySelector("#key-info").classList.remove("hide");
		changeOpacity([bulletIcons[1], bulletIcons[2]], "0.45");
	} else if (bulletsLeft == iconBreakpointList[0])
		changeOpacity([...bulletIcons], "0.45");

	function returnBreakpointArray(baseVal, n) {
		let list = [];
		let a = 0;
		for (let i = 0; i < n; i++) {
			list.push(a);
			a += baseVal;
		}
		return list;
	}

	function changeOpacity(els, opacityValue) {
		for (let i = 0; i < els.length; i++) {
			let el = els[i];
			el.style.opacity = opacityValue;
		}
	}
}

// shows the UI
function showUI() {
	startButton.classList.add("hide");
	restartButton.classList.add("hide");
	setTimeout(() => {
		coreLifeEl.classList.remove("hide");
		scoreEl.classList.remove("hide");
		coinsContainerEl.classList.remove("hide");
		powerupProgressbarContainer.classList.remove("hide");
		powerupProgressInfoEl.classList.remove("hide");
		magazineContainer.classList.remove("hide");
		shopCointainer.classList.remove("hide");
		pauseButton.classList.remove("hide");
		powerUpDurationContainerEl.classList.remove("hide");
	}, 100);
	magazineContainer.querySelector("#key-info").classList.add("hide");
	reloadButton.classList.add("hide");
	bulletIcons.forEach((icon) => {
		icon.style.opacity = "1";
	});
}

// hides the UI
function hideUI() {
	powerupContainer.classList.add("hide");
	powerupProgressbarContainer.classList.add("hide");
	powerupProgressInfoEl.classList.add("hide");
	magazineContainer.classList.add("hide");
	coreLifeEl.classList.add("hide");
	scoreEl.classList.add("hide");
	coinsContainerEl.classList.add("hide");
	shopCointainer.classList.add("hide");
	pauseButton.classList.add("hide");
}

// handles all the powerups
function handlePowerUps() {
	machinegunPowerUpEl.addEventListener("mousedown", activateMachineGun);
	doubleCanonPowerUpEl.addEventListener("mousedown", activateDoubleCanon);
	shieldPowerUpEl.addEventListener("mousedown", activateShield);
	doubleCoinPowerUpEl.addEventListener("mousedown", doubleCoinValue);

	function activateDoubleCanon() {
		canon.powerUps.doubleCanon = true;
		activatePowerup();
	}
	function activateMachineGun() {
		canon.powerUps.machineGun = true;
		activatePowerup();
	}
	function activateShield() {
		core.powerUps.shield = true;
		activatePowerup();
	}
	function doubleCoinValue() {
		isDoubleCoin = true;
		activatePowerup();
	}

	function deactivatePowerup() {
		isPowerUpActive = false;
		canon.powerUps.doubleCanon = false;
		canon.powerUps.machineGun = false;
		core.powerUps.shield = false;
		isDoubleCoin = false;
	}

	function activatePowerup() {
		isPowerUpActive = true;
		powerupContainer.classList.add("hide");
		powerupProgressbarContainer.classList.remove("hide");
		powerupProgressInfoEl.classList.remove("hide");
		countDownPowerUpProgress();
		setTimeout(deactivatePowerup, powerUpDuration);
	}
}
handlePowerUps();

// handles all the items that can be bought
function handleShopItems() {
	healthKitShopItemEl.addEventListener("mousedown", healCore);
	improveMagazineShopItemEl.addEventListener("mousedown", upgradeMagazine);
	fasterReloadShopItemEl.addEventListener("mousedown", decreaseReloadingTime);
	increasePowerUpDurationShopItemEl.addEventListener(
		"mousedown",
		increasePowerUpDuration
	);

	function healCore() {
		core.totalLife += healingAmount;
		totalCoins -= healingCost;
	}

	function upgradeMagazine() {
		magazineSize += magazineIncreaseAmount;
		totalCoins -= magazineIncreaseCost;
		magazineIncreaseCost += 150;
	}

	function decreaseReloadingTime() {
		reloadTimeFactor -= decreaseReloadingTimeFactorBy;
		totalCoins -= decreaseReloadingTimeCost;
		decreaseReloadingTimeCost += 150;
	}

	function increasePowerUpDuration() {
		powerUpDuration += powerUpDurationIncreaseAmount;
		totalCoins -= powerUpDurationIncreaseCost;
		powerUpDurationIncreaseCost += 150;
	}
}
handleShopItems();

// shows cost of am item
function showCost(el, cost) {
	el.querySelector(".item-cost").innerHTML = `${cost}`;
}

// shows shop item when have enough coins. Extra condition can also be provided
function showShopItemWhenAvailable(
	itemEl,
	cost,
	availableCoins,
	condition = true
) {
	if (availableCoins >= cost && condition) itemEl.classList.remove("disabled");
	else itemEl.classList.add("disabled");
}

// shows all the items cost
function showAllItemsCost() {
	showCost(healthKitShopItemEl, healingCost);
	showCost(improveMagazineShopItemEl, magazineIncreaseCost);
	showCost(fasterReloadShopItemEl, decreaseReloadingTimeCost);
	showCost(increasePowerUpDurationShopItemEl, powerUpDurationIncreaseCost);
}

// shows all the shop items when available
function showAllShopItems() {
	showShopItemWhenAvailable(
		healthKitShopItemEl,
		healingCost,
		totalCoins,
		core.totalLife <= 50
	);
	showShopItemWhenAvailable(
		improveMagazineShopItemEl,
		magazineIncreaseCost,
		totalCoins
	);
	showShopItemWhenAvailable(
		fasterReloadShopItemEl,
		decreaseReloadingTimeCost,
		totalCoins
	);
	showShopItemWhenAvailable(
		increasePowerUpDurationShopItemEl,
		powerUpDurationIncreaseCost,
		totalCoins
	);
}

// shows stats when game over
function showStats() {
	const totalScoreStatEl = document.getElementById("total-score-stat");
	const timeSurvidedStatEl = document.getElementById("time-survived-stat");
	const attackersKilledStatEl = document.getElementById("attackers-killed-stat");

	totalTimeSurvived = floor((gameEndTime - gameStartTime) / 1000);

	totalScoreStatEl.innerHTML = 0;
	attackersKilledStatEl.innerHTML = 0;
	timeSurvidedStatEl.innerHTML =
		totalTimeSurvived < 60
			? `${totalTimeSurvived} secs`
			: `${floor(totalTimeSurvived / 60)} mins ${totalTimeSurvived % 60} secs`;
	setTimeout(() => {
		animateValue(totalScoreStatEl, 0, returnTotalScore(), 200);
		animateValue(attackersKilledStatEl, 0, totalAttackersKilled, 200);
	}, 600);

	if ((score > highScore || highScore == null) && score != 0) {
		document.getElementById("new-highscore-info").classList.remove("hide");
		localStorage.setItem("highScore", `${returnTotalScore()}`);
	} else if (score < highScore) {
		highScoreEl.classList.remove("hide");
		highScoreEl.innerHTML = `highscore : ${highScore}`;
		// document.getElementById("new-highscore-info").classList.add("hide");
	}

	function returnTotalScore() {
		return ceil(score + totalAttackersKilled + score * (totalTimeSurvived / 100));
	}
}

// updates the progress bar
function updateProgressBar(el, currentValue, finalValue) {
	let progressPercentage = currentValue / finalValue;
	let parentWidth = el.parentElement.offsetWidth;
	if (progressPercentage <= 1) {
		let progressWidth = progressPercentage * parentWidth;
		el.style.width = `${progressWidth}px`;
		if (progressPercentage < 0.35) el.style.background = "var(--red)";
		else if (progressPercentage > 0.35 && progressPercentage < 0.75)
			el.style.background = "var(--yellow)";
		else el.style.background = "var(--green)";
	}
	if (progressPercentage == 1) {
		if (!isPowerUpActive && !core.destroyed) {
			progressPercentage = 0;
			powerupContainer.classList.remove("hide");
			powerupProgressbarContainer.classList.add("hide");
			powerupProgressInfoEl.classList.add("hide");
		}
	}
}

// updates the progress bar when counting down after powerup is active
function countDownPowerUpProgress() {
	const s = 1000;
	let x = 1000;
	powerUpValue = powerUpMaxValue;
	let t = setInterval(() => {
		powerUpDurationEl.innerHTML = `${(powerUpDuration - x) / 1000}s`;
		powerUpValue -= floor((powerUpMaxValue / powerUpDuration) * 1000);
		powerUpValue = powerUpValue < 0 ? 0 : powerUpValue;
		updateProgressInfo();
		if (powerUpValue <= 0) {
			powerUpValue = 0;
			totalHealers = 3;
			clearInterval(t);
		}
		x += s;
	}, s);
}

// If core is destroyed. Destroy everyone
function destroyEveryone() {
	let options = {
		minRadius: 1,
		maxRadius: 2,
		maxVelocity: 10,
		maxParticles: 50,
		blast: true
	};
	attackers.forEach((attacker) => {
		let option = {
			...options,
			color: attacker.color
		};
		attacker.breakIntoParticles(particles, attacker.position, option);
	});
	healers.forEach((healer) => {
		let option = {
			...options,
			color: healer.color
		};
		healer.breakIntoParticles(particles, healer.position, option);
	});

	healers = [];
	attackers = [];
	coinsArray = [];

	canon.radius = 0;
	canon.canonWidth = 0;

	let t = setTimeout(() => {
		if (core.destroyed == true) {
			gameStarted = false;
			clearTimeout(t);
		}
	}, 3000);

	hideUI();
}

// counter animates text value in DOM from start to end for given duration
function animateValue(el, start, end, duration) {
	// source : https://stackoverflow.com/questions/16994662/count-animation-from-number-a-to-b
	let range = end - start;
	let minTimer = 50;
	let stepTime = Math.abs(Math.floor(duration / range));
	stepTime = Math.max(stepTime, minTimer);
	let startTime = new Date().getTime();
	let endTime = startTime + duration;
	let timer;
	function run() {
		let now = new Date().getTime();
		let remaining = Math.max((endTime - now) / duration, 0);
		let value = Math.round(end - remaining * range);
		el.innerHTML = value;
		if (gamePaused) {
			bulletsShot = magazineSize - value;
			clearInterval(timer);
		}
		if (value == end) {
			clearInterval(timer);
		}
	}
	timer = setInterval(run, stepTime);
	run();
}

function setTextAsAttribute(el) {
	const allText = el.innerHTML.replace(/<(.|\n)*?>/g, "");
	el.setAttribute("data-all-text", allText);
}
setTextAsAttribute(gameTitle);