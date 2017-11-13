//THIS IS A TEMPLATE FOR CREATING A P5 GALAGO GAME CANVAS

var gameEngine;
var instructions;
var boxImage;
var boxSprite;

//Preload data such as images and sound
function preload() {
  boxImage = loadImage("images/crate.png");
}

//Setup the canvas and all preloaded canvas detail
function setup() { 
  createCanvas(800, 600);
  
  instructions = createP("Click mouse to set the box as a sensor and release to disable sensor.");
  instructions.position(width/2-260, 1);
  instructions.style("color: white; font-size: 18px;");
 
  gameEngine = new GameEngine();
  gameEngine.debugEnabled = true;
  gameEngine.load();
  //gameEngine.setTimeScale(0.2);
  
  addBox(width/2, 100, 50, 50);
  
  addPlatform(width/2, 500, 500, 10);
  
  gameEngine.start();
  
} 

//Draw loop when rendering the sprites and world
function draw() { 
  background(80);
  
  //Update the gameEngine
	gameEngine.update();
  
}

function addBox(xPos, yPos, w, h) {
  
  sprite = new Sprite(boxImage, xPos, yPos, w, h, gameEngine.BOX, {isStatic: false, collisionFilter: {group: -1}});
  sprite.setUserData("tag", "box");
  gameEngine.addSprite(sprite);
  sprite.setCollisionCallback(function(sprite, collider) {
  	// var tag = collider.getUserData("tag");
  	
  	// if (tag == 'box') {
  	// 	console.log("******************************************************************************");	
  	// 	console.log(collider);	
  	// 	collider.body.isSensor = true;
  	// 	// collider.setSensor(true);
  	// } else {
  	// 	collider.body.isSensor = false;
  	// }
    
  });
  
  
}

function addPlatform(xPos, yPos, w, h) {
  sprite = new Sprite(null, xPos, yPos, w, h, gameEngine.BOX, {isStatic: true});
  gameEngine.addSprite(sprite);
  
}

function mousePressed() {
  addBox(mouseX, mouseY, random(30, 60), random(30, 60));
  
}

function mouseReleased() {

}

























// var gameEngine;
// var lastItem;
// var crateImage;
// var ballImage;
// var playerImage;
// var smokeImage;
// var ringImage;
// var bladeImage;
// var platformImage;
// var platformStoneImage;
// var groundLeftImage;
// var groundRightImage;
// var groundCenterImage;
// var sideLeftImage;
// var sideRightImage;

// var spider1Image;
// var spider2Image;
// var spider3Image;
// var spider4Image;
// var spider5Image;
// var spider6Image;
// var spider7Image;
// var spider;

// var pickedSprite;
// var movePlatformSprite;
// var platformMoveSpeed = 0.6;
// var platformMoveDistance = 80;
// var bladeSprite;
// var player;
// var moveSpeed = 4;
// var smokeParticleSystem;
// var onGround = false;
// var bombInterval = 100;

// function preload() {
//  crateImage = loadImage("images/crate.png");
//  ballImage = loadImage("images/spikeball.png");
//  playerImage = loadImage("images/player.png");
//  smokeImage = loadImage("images/smoke.png");
//  platformImage = loadImage("images/platform.png");
//  platformStoneImage = loadImage("images/platform-stone.png");
//  ringImage = loadImage("images/ring.png");
//  bladeImage = loadImage("images/blade.png");
  
//  groundLeftImage = loadImage("images/ground-left.png");
//  groundRightImage = loadImage("images/ground-right.png");
//  groundCenterImage = loadImage("images/ground-center.png");
//  sideLeftImage = loadImage("images/side-left.png");
//  sideRightImage = loadImage("images/side-right.png");
  
//  spider1Image = loadImage("images/spider-sprite1.png");
//  spider2Image = loadImage("images/spider-sprite2.png");
//  spider3Image = loadImage("images/spider-sprite3.png");
//  spider4Image = loadImage("images/spider-sprite4.png");
//  spider5Image = loadImage("images/spider-sprite5.png");
//  spider6Image = loadImage("images/spider-sprite6.png");
//  spider7Image = loadImage("images/spider-sprite7.png");
// }

// function setup() { 
//  createCanvas(1024, 768);
  
//  gameEngine = new GameEngine();
//  gameEngine.load();
  
//  ////This is the collision listener
//  //gameEngine.addCollisionListener(function(collisionEvent) {
//  //	// console.log("collisionEvent: " + collisionEvent.colliderB);

//  //	if (collisionEvent.colliderA.getUserData("player") != null ||
//  //		collisionEvent.colliderB.getUserData("player") != null) {
//  //		onGround = true;
//  //	}
  	
//  //	if (collisionEvent.colliderA.getUserData("bomb") != null) {
//  //		collisionEvent.colliderA.destroy();
//  //	}
  	
//  //	if (collisionEvent.colliderB.getUserData("bomb") != null) {
//  //		collisionEvent.colliderB.destroy();
//  //	}
//  //});
  
//  //gameEngine.setGravity(0, 1.5);
//  groundHeight = height-30;
//  groundSize = 64;
  
//  //Load the terrain sprites and game objects
//  for (var y=-64; y<height+64; y+=64) {
//  	gameEngine.addSprite(new Sprite(sideRightImage, 0, y, groundSize, groundSize, gameEngine.BOX));
//  	gameEngine.addSprite(new Sprite(sideLeftImage, width, y, groundSize, groundSize, gameEngine.BOX));
//  }
  
//  for (var x=-64; x<width+64; x+=64) {
//  	gameEngine.addSprite(new Sprite(groundCenterImage, x, groundHeight, groundSize, groundSize, gameEngine.BOX));
//  }
  
//  //Add crates
// 	gameEngine.addSprite(new Sprite(crateImage, width/2 - 200, height-128, groundSize, groundSize, gameEngine.BOX, {isStatic: false, restitution: 0, friction: 0}))
	
// 	spider = new Sprite(spider1Image, width/2, height/2, 60, 60)
// 	spider.addAnimation("walk", [spider1Image, spider2Image, spider3Image, spider4Image, spider5Image, spider6Image, spider7Image]);
// 	spider.playAnimation("walk", 5);
// 	gameEngine.addSprite(spider);
  
//  //gameEngine.addSprite(new Sprite(groundRightImage, width/2 - 200, height-groundHeight, 100, 100, gameEngine.BOX));
//  //gameEngine.addSprite(new Sprite(groundCenterImage, width/2 - 300, height-groundHeight, 100, 100, gameEngine.BOX));
//  //gameEngine.addSprite(new Sprite(groundCenterImage, width/2 - 400, height-groundHeight, 100, 100, gameEngine.BOX));
  
//  //gameEngine.addSprite(new Sprite(groundLeftImage, width/2 + 200, height-groundHeight, 100, 100, gameEngine.BOX));
//  //gameEngine.addSprite(new Sprite(groundCenterImage, width/2 + 300, height-groundHeight, 100, 100, gameEngine.BOX));
//  //gameEngine.addSprite(new Sprite(groundCenterImage, width/2 + 400, height-groundHeight, 100, 100, gameEngine.BOX));

//  //Load the platform
//  movePlatformSprite = new Sprite(platformStoneImage, width/2, height/2+50, 100, 25, gameEngine.BOX);
//  gameEngine.addSprite(movePlatformSprite);
  
//  //Load the blade sprites
//  bladeSprite = new Sprite(bladeImage, 150, height/2, 80, 80, gameEngine.CIRCLE);
//  gameEngine.addSprite(bladeSprite);
  
//  //gameEngine.addSprite(new BoxSprite(crateImage, 200, 400, 0, 70, 70, {isStatic: false, restitution: 0.1, friction: 1}));
//  player = new Sprite(playerImage, width/2-300, 340, 50, 50, gameEngine.BOX, {isStatic: false, restitution: 0.2, friction: 0.1});
//  player.setUserData("player", true);
//  //player.setRenderer(function(obj) {
//  //	console.log("render");
//  //	fill(23);
//  //	rect(0, 0, 30, 30);
//  //});

//  gameEngine.addSprite(player);
//  player.setController(callBackPlayer);
//  player.setCollisionCallback(function(current, collider) {
//  	console.log("collision: " + current.getUserData("player"));
//  	// collider.destroy();
//  	// current.clearForces();
//  	// current.applyForce(0, -200);
//  	// player.setScale(1, 1);
  	
//  });

//  playerTail = new ParticleSystem(createVector(100, 100), smokeImage);
//  playerTail.setKillSpeed(5);
//  playerTail.setStartSize(50);
//  playerTail.setEndSize(0);
//  playerTail.setEmitterWidth(0);
//  playerTail.setEmitterHeight(0);
//  playerTail.setStartColor(color(255, 255, 0));
//  playerTail.setEndColor(color(255, 255, 222, 0));
//  playerTail.setInitialVelocity(createVector(0, 0));
//  playerTail.setVelocityVariance(0.6);
//  playerTail.setGravity(createVector(0, 0));
//  playerTail.setParticlesPerSecond(1);
//  playerTail.setEmitRate(3);
//  gameEngine.addParticleSystem(playerTail);
  
//  player.attachChild(playerTail);
  
//  platformSprite = new Sprite(platformStoneImage, width-100, 100, 100, 25, gameEngine.BOX);
//  gameEngine.addSprite(platformSprite);
  
//  platformSprite = new Sprite(platformStoneImage, width-300, 200, 100, 25, gameEngine.BOX);
//  gameEngine.addSprite(platformSprite);
  
//  //Waterfall
//  waterfallParticleSystem = new ParticleSystem(createVector(width-100, 100));
//  waterfallParticleSystem.setKillSpeed(3.2);
//  waterfallParticleSystem.setStartSize(20);
//  waterfallParticleSystem.setEndSize(50);
//  waterfallParticleSystem.setEmitterWidth(60);
//  waterfallParticleSystem.setEmitterHeight(2);
//  waterfallParticleSystem.setStartColor(color(255, 255, 255, 100));
//  waterfallParticleSystem.setEndColor(color(42, 107, 162, 20));
//  waterfallParticleSystem.setInitialVelocity(createVector(0, 0));
//  waterfallParticleSystem.setVelocityVariance(0.1);
//  waterfallParticleSystem.setGravity(createVector(0, 0.1));
//  waterfallParticleSystem.setParticlesPerSecond(5);
//  waterfallParticleSystem.setEmitRate(1);
//  gameEngine.addParticleSystem(waterfallParticleSystem);

//  gameEngine.debugEnabled = true;
//  gameEngine.start();
// }

// function callBackPlayer(spriteObj) {
// 	// console.log("callback: " + spriteObj.getPosition());
// }

// function addBomb() {
	
// 	var xPos = random(64, width-64);
// 	bomb = new Sprite(null, xPos, 0, 20, 20, gameEngine.CIRCLE, {isStatic: false, restitution: 0.2, friction: 0.01});
//  	bomb.setUserData("bomb", true);
//  	gameEngine.addSprite(bomb);
  	
//  	// bomb.setMass(random(1, 10));
  	
//  	if (xPos< width/2) {
//  		bomb.setVelocity(random(0, 10), 0);
  		
//  	} else {
//  		bomb.setVelocity(random(-10, 0), 0);
//  	}
  
//  	bombTail = new ParticleSystem(createVector(100, 100), smokeImage);
//  	bombTail.setKillSpeed(15);
//  	bombTail.setStartSize(50);
//  	bombTail.setEndSize(3);
//  	bombTail.setEmitterWidth(0);
//  	bombTail.setEmitterHeight(0);
//  	bombTail.setStartColor(color(255, 128, 0));
//  	bombTail.setEndColor(color(255, 255, 0));
//  	bombTail.setInitialVelocity(createVector(0, 0));
//  	bombTail.setVelocityVariance(0.3);
//  	bombTail.setGravity(createVector(0, 0));
//  	bombTail.setParticlesPerSecond(1);
//  	bombTail.setEmitRate(2);
//  	gameEngine.addParticleSystem(bombTail);
  
//  	bomb.attachChild(bombTail);
// }

// function mouseReleased() {
// 	// pickedSprite = null;
// }

// function mouseDragged() {
// 	if (pickedSprite != null && mouseButton == RIGHT) {
// 		if (pickedSprite.clearForces) {
// 			pickedSprite.clearForces();
// 		}
		
// 		pickedSprite.setPosition(mouseX, mouseY);
// 	}
// }

// function mousePressed() {
	
// 	if (mouseButton == CENTER) {
// 		player.addScale(1, 1);
// 	}
	
// 	if (mouseButton == RIGHT) {
// 		if (gameEngine.collisionsAtMouse().length > 0) {
// 			var picked = gameEngine.collisionsAtMouse()[gameEngine.collisionsAtMouse().length-1];
// 			if (picked != player) {
// 				pickedSprite = picked;
// 			}

// 		}
// 	}

// 	if (mouseButton == LEFT) {
// 		var size = random(30, 60);
// 		var ball = new Sprite(ballImage, mouseX, mouseY, size, size, gameEngine.CIRCLE, {isStatic: false, restitution: 0.5, friction: 0.5});
// 		gameEngine.addSprite(ball);
		
// 		pickedSprite.link(ball, dist(mouseX, mouseY, pickedSprite.getPosition().x, pickedSprite.getPosition().y), 0.2);
// 	}

// }

// function draw() {
// 	background(200,234,255);
	
// 	//Update the gameEngine
// 	gameEngine.update();
	
// 	// console.log("width: " + player.getWidth());
	
// 	//Check when to add bombs
// 	if (frameCount % bombInterval == 0) {
// 		addBomb();
// 		bombInterval = floor(random(200, 500));
// 		// player.setSleeping(true);
// 	}
	
// 	//Rotate the fan sprites
// 	bladeSprite.rotate(-8);

// 	//Move the platform
// 	movePlatformSprite.move(platformMoveSpeed, 0);
// 	if (dist(movePlatformSprite.getInitialPosition().x, movePlatformSprite.getInitialPosition().y, 
//  				movePlatformSprite.getPosition().x, movePlatformSprite.getPosition().y) >= platformMoveDistance) {
//  					platformMoveSpeed = -platformMoveSpeed;
  					
//  	}
  	
//  	player.setAngle(0);
//  	gameEngine.setCameraPosition(player.getPosition().x, lerp(gameEngine.getCameraPosition().y, player.getPosition().y-20, 0.06));
		
// 	if (keyIsDown(LEFT_ARROW)) {
// 		// player.clearForces();
// 		player.move(-moveSpeed, 0);
// 		// player.rotate(-moveSpeed*2);
// 	}
// 	if (keyIsDown(RIGHT_ARROW)) {
// 		// player.clearForces();
// 		player.move(moveSpeed, 0);
// 		// player.rotate(moveSpeed*2);
// 	}

// 	//Draw the selected Sprite
// 	if (pickedSprite != null) {
// 		//Sets the camera position
// 		//gameEngine.setCameraPosition(pickedSprite.getPosition().x, pickedSprite.getPosition().y-100);

// 		push();
// 			translate(pickedSprite.getPosition().x, pickedSprite.getPosition().y);
// 			noFill();
// 			strokeWeight(2);
// 			stroke(200, 0, 0);
// 			ellipse(0, 0, 50);
// 		pop();
// 	}
	
// 	spider.rotate(1);
// 	// console.log("Spider angle: " + spider.getRotation());

// }

// function keyPressed() {
//  if (keyCode == UP_ARROW) {
//  	if (player != null && onGround) {
//  		player.applyForce(0, -0.1);
//  		onGround = false
//  	}
//  }
  
//  if (keyCode == DELETE) {
//  	if (pickedSprite != null) {
//  		pickedSprite.destroy();
//  		pickedSprite = null;
//  	}
//  }
// }
