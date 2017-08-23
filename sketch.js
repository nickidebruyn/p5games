var gameEngine;
var lastItem;
var crateImage;
var ballImage;

var pickedSprite;
var movePlatformSprite;
var platformMoveSpeed = 0.8;
var platformMoveDistance = 150;
var fanSprite1;
var fanSprite2;
var moveSpeed = 3;
var smokeParticleSystem;
var explosionParticleSystem;
var smokeImage;

function preload() {
  crateImage = loadImage("crate.jpg");
  ballImage = loadImage("ball.png");
  smokeImage = loadImage("smoke.png");
}

function setup() { 
  createCanvas(800, 600);
  
  gameEngine = new GameEngine();
  gameEngine.load();
  
  //Load the sprites and game objects
  gameEngine.addSprite(new BoxSprite(null, width/2, height-10, 0, width, 20, {isStatic: true, friction: 1}));
  gameEngine.addSprite(new BoxSprite(null, 5, height/2, 0, 10, height, {isStatic: true, friction: 1}));
  gameEngine.addSprite(new BoxSprite(null, width-5, height/2, 0, 10, height, {isStatic: true, friction: 1}));
  
  //Load the platform
  movePlatformSprite = new BoxSprite(null, width/2, height/2, 0, 100, 20, {isStatic: true, friction: 1});
  gameEngine.addSprite(movePlatformSprite);
  
  //Load the fan sprites
  fanSprite1 = new BoxSprite(null, 150, height/2, 0, 100, 20, {isStatic: true, friction: 1});
  gameEngine.addSprite(fanSprite1);
  fanSprite2 = new BoxSprite(null, width-150, height/2, 0, 100, 20, {isStatic: true, friction: 1});
  gameEngine.addSprite(fanSprite2);
  
  //gameEngine.addSprite(new BoxSprite(crateImage, 200, 400, 0, 70, 70, {isStatic: false, restitution: 0.1, friction: 1}));
  gameEngine.addSprite(new CircleSprite(ballImage, width/2, 540, 0, 30, {isStatic: false, restitution: 0.5, friction: 1}));
  
  smokeParticleSystem = new ParticleSystem(createVector(width/2, height/2-10), smokeImage);
  smokeParticleSystem.setStartSize(30);
  smokeParticleSystem.setEndSize(1);
  gameEngine.addParticleSystem(smokeParticleSystem);
  
  explosionParticleSystem = new ParticleSystem(createVector(100, 100));
  explosionParticleSystem.setKillSpeed(10);
  explosionParticleSystem.setStartSize(20);
  explosionParticleSystem.setEndSize(1);
  explosionParticleSystem.setEmitterWidth(10);
  explosionParticleSystem.setEmitterHeight(10);
  explosionParticleSystem.setStartColor(color(220, 220, 0));
  explosionParticleSystem.setEndColor(color(220, 220, 220, 0));
  explosionParticleSystem.setInitialVelocity(createVector(0, 0));
  explosionParticleSystem.setVelocityVariance(3);
  explosionParticleSystem.setGravity(createVector(0, 0.3));
  explosionParticleSystem.setParticlesPerSecond(50);
  explosionParticleSystem.setEmitRate(200);
  gameEngine.addParticleSystem(explosionParticleSystem);

  gameEngine.start();
}

function mouseReleased() {
	// pickedSprite = null;
}

function mouseDragged() {
	if (pickedSprite != null) {
		// pickedSprite.clearForces();
		pickedSprite.setPosition(mouseX, mouseY);
	}
}

function mousePressed() {
	
	if (mouseButton == RIGHT) {
		if (gameEngine.collisionsAtMouse().length > 0) {
			pickedSprite = gameEngine.collisionsAtMouse()[gameEngine.collisionsAtMouse().length-1];
			console.log(pickedSprite);
		}
	}

	if (mouseButton == LEFT) {
		var ball = new CircleSprite(ballImage, mouseX, mouseY, 0, random(15, 25), {isStatic: false, restitution: 0.5, friction: 0.5});
		gameEngine.addSprite(ball);
		
		pickedSprite.link(ball, dist(mouseX, mouseY, pickedSprite.getPosition().x, pickedSprite.getPosition().y), 0.2);
	}

}

function draw() {
	background(110,110,110);
	
	//Update the gameEngine
	gameEngine.update();
	
	//Rotate the fan sprites
	fanSprite1.rotate(5);
	fanSprite2.rotate(-5);

	//Move the platform
	movePlatformSprite.move(platformMoveSpeed, 0);
	if (dist(movePlatformSprite.getInitialPosition().x, movePlatformSprite.getInitialPosition().y, 
  				movePlatformSprite.getPosition().x, movePlatformSprite.getPosition().y) >= platformMoveDistance) {
  					platformMoveSpeed = -platformMoveSpeed;
  					
  	}

	//Draw the selected Sprite
	if (pickedSprite != null) {
		//Sets the camera position
		//gameEngine.setCameraPosition(pickedSprite.getPosition().x, pickedSprite.getPosition().y-100);
		
		if (keyIsDown(LEFT_ARROW)) {
			pickedSprite.move(-moveSpeed, 0);
			pickedSprite.rotate(-moveSpeed*2);
		}
		if (keyIsDown(RIGHT_ARROW)) {
			pickedSprite.move(moveSpeed, 0);
			pickedSprite.rotate(moveSpeed*2);
		}

		push();
			translate(pickedSprite.getPosition().x, pickedSprite.getPosition().y);
			noFill();
			strokeWeight(2);
			stroke(200, 0, 0);
			ellipse(0, 0, 50);
		pop();
	}

}

function keyPressed() {
  if (keyCode == UP_ARROW) {
  	if (pickedSprite != null) {
  		pickedSprite.applyForce(0, -0.12);
  	}
  }
  
  if (keyCode == DELETE) {
  	if (pickedSprite != null) {
  		pickedSprite.destroy();
  		pickedSprite = null;
  	}
  }
}
