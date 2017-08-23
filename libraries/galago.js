//************************************************
//*         The galago game engine build on      *
//*         p5.js and matter.js                  *
//*         DATE(2017/08/21)                     *
//************************************************

//========= THE GAME ENGINE ===========
function GameEngine() {
	//Variables for the Matter.js physics engine we use
	var Engine = Matter.Engine,
		 World = Matter.World,
	 	 Bodies = Matter.Bodies,
	 	 Body = Matter.Body,
	 	 Constraint = Matter.Constraint;
	var runningEngine;
	 	 
	//List of sprites we render using p5.js
	var sprites = [];
	var particleSystems = [];
	var mouseCollisions = [];
	var cameraX = 0;
	var cameraY = 0;
	
	this.PhysicsWorld = World;
	this.PhysicsBodies = Bodies;
	this.PhysicsBody = Body;
	this.PhysicsEngine = Engine;
	this.PhysicsConstraint = Constraint;
	
	//Add a physics body
	this.addBody = function(body) {
		World.add(runningEngine.world, body);
	}
	
	//Remove a physics body
	this.removeBody = function(body) {
		World.remove(runningEngine.world, body);
	}
	
	//Add a constraint
	this.addConstraint = function(constraint) {
		World.add(runningEngine.world, constraint);
	}
	
	//Remove a physics body
	this.removeConstraint = function(constraint) {
		World.remove(runningEngine.world, constraint);
	}
	
	//Add particleSystem
	this.addParticleSystem = function(particleSystem) {
		particleSystems.push(particleSystem);
	}
	
	//Should be called to load the game engine
	this.load = function() {
		//Set some default modes
  		rectMode(CENTER);
  		ellipseMode(CENTER);
  		imageMode(CENTER);
  		
		//Create the physics engine
  		runningEngine = Engine.create();
  		
  		//Set the camera position
  		this.setCameraPosition(width/2, height/2);
		
	}
	
	//This should be called after the load of the game engine
	this.addSprite = function(sprite) {
		sprite.load(this);
		sprites.push(sprite);
	}
	
	//Should be called to start the game engine
	this.start = function() {
		
	}
	
	//Returns the current collision object at the mouseX
	this.collisionsAtMouse = function() {
		return mouseCollisions;
	}
	
	//Set the camera position in the world
	this.setCameraPosition = function(posX, posY) {
		cameraX = posX;
		cameraY = posY;
	}
	
	//We call this to update the physics engine and render the game graphics
	this.update = function() {
		//Update the engine manually
		Engine.update(runningEngine);
		
		//Camera translation
		translate((width*0.5) - cameraX, (height*0.5) - cameraY);
		
		//Clear collisions at mouse array
		mouseCollisions = [];
		
		//Update all sprites
		for (var i=0; i < sprites.length; i++) {
			//Check for picks
			var collision = sprites[i].collisionAtPoint(mouseX, mouseY);
			if (collision) {
				mouseCollisions.push(sprites[i]);
			}
			
			//Update the sprites
			sprites[i].update();
			if (sprites[i].isDead()) {
				sprites.splice(i, 1);
				i--;
			}
		}
		
		//Update all particle systems
		for (var i=0; i < particleSystems.length; i++) {
			
			//Check for picks
			var collision = particleSystems[i].collisionAtPoint(mouseX, mouseY);
			if (collision) {
				mouseCollisions.push(particleSystems[i]);
			}
			
			//Run the particle system
			particleSystems[i].run();
			particleSystems[i].addParticle();
			if (particleSystems[i].isDead()) {
				particleSystems.splice(i, 1);
				i--;
			}
		}
		
		//Debug
		// console.log(sprites.length +" - "+ runningEngine.world.bodies.length);
	}
}

//========= BOX PHYSICS SPRITE ===========
//This is a box type of sprite object in physics space
function BoxSprite(initImage, initX, initY, initAngle, initWidth, initHeight, initOptions) {
	
	//Local variabled of graphics box
	this.body;
	var img = initImage;
	var positionX = initX;
	var positionY = initY;
	var w = initWidth;
	var h = initHeight;
	var options = initOptions;
	// console.log("Angle: " + initAngle);
	options.angle = radians(initAngle);
	var dead = false;
	var gameEngine;
	var links = [];
	
	//Returns the position
	this.getInitialPosition = function() {
		return {
			x: positionX,
			y: positionY
		};
	}
	
	//Returns the position
	this.getPosition = function() {
		return this.body.position;
	}
	
	//Set the sprite position
	this.setPosition = function(posX, posY) {
		gameEngine.PhysicsBody.setPosition(this.body, {
			x: posX,
			y: posY
		});
		
	}
	
	//Move the sprite
	this.move = function(amountX, amountY) {
		var posX = this.body.position.x + amountX;
		var posY = this.body.position.y + amountY;
		
		gameEngine.PhysicsBody.setPosition(this.body, {
			x: posX,
			y: posY
		});
		
	}
	
	//Rotates the body by a given amount
	this.rotate = function(rotationAmount) {
		gameEngine.PhysicsBody.rotate(this.body, radians(rotationAmount));
	}
	
	//Sets the angle of this physics object
	this.setAngle = function(angleInDegrees) {
		gameEngine.PhysicsBody.setAngle(this.body, radians(angleInDegrees));
	}
	
	//Apply a force to this physics body
	this.applyForce = function(forceX, forceY) {
		gameEngine.PhysicsBody.applyForce(this.body, this.body.position, {
			x: forceX,
			y: forceY
		});
	}
	
	//Set the angular velocity
	this.setAngularVelocity = function(angularVelocity) {
		gameEngine.PhysicsBody.setAngularVelocity(this.body, angularVelocity);
	}
	
	//Set the angular velocity
	this.setVelocity = function(velX, velY) {
		gameEngine.PhysicsBody.setVelocity(this.body, {
			x: velX,
			y: velY
		});
	}

	//Clear all physics forces
	this.clearForces = function() {
		gameEngine.PhysicsBody.setVelocity(this.body, {
			x: 0,
			y: 0
		});
		gameEngine.PhysicsBody.setAngularVelocity(this.body, 0);
	}
	
	//Sets the density of the body
	this.setDensity = function(density) {
		gameEngine.PhysicsBody.setDensity(this.body, density);
	}
	
	//Check if 2 points are in the object
	this.collisionAtPoint = function(pointX, pointY) {
		// console.log(this.position());
		if (pointX > (this.getPosition().x-(w/2)) &&
			 pointX < (this.getPosition().x+(w/2)) &&
			 pointY > (this.getPosition().y-(h/2)) &&
			 pointY < (this.getPosition().y+(w/2))) {
			return true;
		} else {
			return false;
		}
		
	}
	
	this.load = function(engine) {
		gameEngine = engine;
		
		//Local body of the physics box
		this.body = gameEngine.PhysicsBodies.rectangle(positionX, positionY, w, h, options);
		
		//Adding body to the world
		gameEngine.addBody(this.body);
		
	}
	
	this.link = function(targetSprite, length, stiffness, offsetX, offsetY, targetOffsetX, targetOffsetY) {
		var constraintOptions = {
			bodyA: this.body,
			bodyB: targetSprite.body,
			length: length,
			stiffness: stiffness,
		}
		// console.log("log: " + targetOffsetX);
		if (offsetX != undefined && offsetY != undefined) {
			constraintOptions.pointA = {
				x: offsetX,
				y: offsetY
			}
		}
		if (targetOffsetX != undefined && targetOffsetY != undefined) {
			constraintOptions.pointB = {
				x: targetOffsetX,
				y: targetOffsetY
			}
		}
		var con = gameEngine.PhysicsConstraint.create(constraintOptions);
		gameEngine.addConstraint(con);
		links.push(con);
	}

	this.update = function() {
		push();
		
			//Move and rotate to physics world
			translate(this.body.position.x, this.body.position.y);
			rotate(this.body.angle);
			
			//Draw the image
			if (img) {
				image(img, 0, 0, w, h);
				
			}
			
			//Show the debug info
			noFill();
			if (options != undefined && options.isStatic) {
				stroke(0, 0, 200);
			} else {
				stroke(0, 200, 0);
			}
			rect(0, 0, w, h);
			
		pop();
		
		push();
			//Draw all links
			for (var i=0; i<links.length; i++) {
				var con = links[i];
				stroke(200, 0, 200);
				line(con.bodyA.position.x+con.pointA.x, 
						con.bodyA.position.y+con.pointA.y, 
						con.bodyB.position.x+con.pointB.x, 
						con.bodyB.position.y+con.pointB.y);
			}
		pop();
	}
	
	//This function should be called when you want to destroy a sprite
	this.destroy = function() {
		//Remove the constraints/joints
		for (var i=0; i<links.length; i++) {
			var con = links[i];
			gameEngine.removeConstraint(con);
				
		}
		gameEngine.removeBody(this.body);
		dead = true;
	}
	
	//Returns if the sprite is dead
	this.isDead = function() {
		return dead;
	}
}

//========= CIRCLE PHYSICS SPRITE ===========
//This is a circle type of sprite object in physics space
function CircleSprite(initImage, initX, initY, initAngle, initRadius, initOptions) {
	
	//Local variabled of graphics box
	this.body = null;
	var img = initImage;
	var positionX = initX;
	var positionY = initY;
	var r = initRadius;
	var options = initOptions;
	options.angle = radians(initAngle);
	var dead = false;
	var gameEngine;
	var links = [];
	
	//Returns the position
	this.getInitialPosition = function() {
		return {
			x: positionX,
			y: positionY
		};
	}
	
	//Returns the position
	this.getPosition = function() {
		return this.body.position;
	}
	
	//Set the sprite position
	this.setPosition = function(posX, posY) {
		gameEngine.PhysicsBody.setPosition(this.body, {
			x: posX,
			y: posY
		});
		
	}
	
	//Move the sprite
	this.move = function(amountX, amountY) {
		var posX = this.body.position.x + amountX;
		var posY = this.body.position.y + amountY;
		
		gameEngine.PhysicsBody.setPosition(this.body, {
			x: posX,
			y: posY
		});
		
	}
	
	//Rotates the body by a given amount
	this.rotate = function(rotationAmount) {
		gameEngine.PhysicsBody.rotate(this.body, radians(rotationAmount));
	}
	
	//Sets the angle of this physics object
	this.setAngle = function(angleInDegrees) {
		gameEngine.PhysicsBody.setAngle(this.body, radians(angleInDegrees));
	}
	
	//Apply a force to this physics body
	this.applyForce = function(forceX, forceY) {
		gameEngine.PhysicsBody.applyForce(this.body, this.body.position, {
			x: forceX,
			y: forceY
		});
	}
	
	//Set the angular velocity
	this.setAngularVelocity = function(angularVelocity) {
		gameEngine.PhysicsBody.setAngularVelocity(this.body, angularVelocity);
	}
	
	//Set the angular velocity
	this.setVelocity = function(velX, velY) {
		gameEngine.PhysicsBody.setVelocity(this.body, {
			x: velX,
			y: velY
		});
	}

	//Clear all physics forces
	this.clearForces = function() {
		gameEngine.PhysicsBody.setVelocity(this.body, {
			x: 0,
			y: 0
		});
		gameEngine.PhysicsBody.setAngularVelocity(this.body, 0);
	}
	
	//Sets the density of the body
	this.setDensity = function(density) {
		gameEngine.PhysicsBody.setDensity(this.body, density);
	}
	
	//Check if 2 points are in the object
	this.collisionAtPoint = function(pointX, pointY) {
		if (pointX > (this.getPosition().x-r) &&
			 pointX < (this.getPosition().x+r) &&
			 pointY > (this.getPosition().y-r) &&
			 pointY < (this.getPosition().y+r)) {
			return true;
		} else {
			return false;
		}
		
	}
	
	this.load = function(engine) {
		gameEngine = engine;
		
		//Local body of the physics box
		this.body = gameEngine.PhysicsBodies.circle(positionX, positionY, r, options);
		
		//Adding body to the world
		gameEngine.addBody(this.body);
		
	}
	
	this.link = function(targetSprite, length, stiffness, offsetX, offsetY, targetOffsetX, targetOffsetY) {
		var constraintOptions = {
			bodyA: this.body,
			bodyB: targetSprite.body,
			length: length,
			stiffness: stiffness
		}
		if (offsetX != undefined && offsetY != undefined) {
			constraintOptions.pointA = {
				x: offsetX,
				y: offsetY
			}
		}
		if (targetOffsetX != undefined && targetOffsetY != undefined) {
			constraintOptions.pointB = {
				x: targetOffsetX,
				y: targetOffsetY
			}
		}
		
		var con = gameEngine.PhysicsConstraint.create(constraintOptions);
		gameEngine.addConstraint(con);
		links.push(con);
	}
	
	this.update = function() {
		push();
		
			//Move and rotate to physics world
			translate(this.body.position.x, this.body.position.y);
			rotate(this.body.angle);
			
			//Draw the image
			if (img) {
				image(img, 0, 0, r*2, r*2);
				
			}
			
			//Show the debug info
			noFill();
			if (options != undefined && options.isStatic) {
				stroke(0, 0, 200);
			} else {
				stroke(0, 200, 0);
			}
			ellipse(0, 0, r*2);
		pop();
		
		push();
			//Draw all links
			for (var i=0; i<links.length; i++) {
				var con = links[i];
				stroke(200, 0, 200);
				line(con.bodyA.position.x+con.pointA.x, 
						con.bodyA.position.y+con.pointA.y, 
						con.bodyB.position.x+con.pointB.x, 
						con.bodyB.position.y+con.pointB.y);
			}
		pop();
	}
	
	//This function should be called when you want to destroy a sprite
	this.destroy = function() {
		//Remove the constraints/joints
		for (var i=0; i<links.length; i++) {
			var con = links[i];
			gameEngine.removeConstraint(con);
				
		}
		gameEngine.removeBody(this.body);
		dead = true;
	}
	
	//Returns if the sprite is dead
	this.isDead = function() {
		return dead;
	}
}







//================== PARTICLE SYSTEM ===================
//An implementation of a particle system
var ParticleSystem = function (position, particleImg) {
	this.origin = position.copy();
	this.particleImage = particleImg;
	this.particles = [];
  	this.startSize = 10;
  	this.endSize = 1;
  	this.killSpeed = 4;
  	this.startColor = color(255, 60, 0, 129);
  	this.endColor = color(255, 255, 0, 50);
  	this.initVelocity = createVector(0, -4);
  	this.gravity = createVector(0, 0.15);
  	this.velocityVariance = 1;
  	this.emitterWidth = 0;    //This is the starting point of each particle
  	this.emitterHeight = 0;   //This is the starting point of each particle
  	this.particlesPerSecond = 1;
  	this.emitRate = 1;        //This is the rate at which particles should be genetated
  	this.started = false;
  	var dead = false;

	//Returns the position
	this.getPosition = function() {
		return this.origin;
	}
	
	//Set the sprite position
	this.setPosition = function(posX, posY) {
		this.origin = createVector(posX, posY);
		
	}
	
	//Move the sprite
	this.move = function(amountX, amountY) {
		this.origin.add(amountX, amountY);
	}
	
	//Check if 2 points are in the object
	this.collisionAtPoint = function(pointX, pointY) {
		if (dist(pointX, pointY, this.getPosition().x, this.getPosition().y) < 50) {
			return true;
		} else {
			return false;
		}
		
	}
	
	//This function should be called when you want to destroy the particle system
	this.destroy = function() {
		dead = true;
	}
	
	//Returns if the particle system is dead
	this.isDead = function() {
		return dead;
	}
};

//Set the start size of the particle system
ParticleSystem.prototype.setStartSize = function (s) {
	this.startSize = s;
}

//Set the end size of the particle system
ParticleSystem.prototype.setEndSize = function (s) {
	this.endSize = s;
}

//Set the start color of the particle system
ParticleSystem.prototype.setStartColor = function (col) {
	this.startColor = col;
}

//Set the end color of the particle system
ParticleSystem.prototype.setEndColor = function (col) {
	this.endColor = col;
}

//Set the speed at which particles are destroyed
ParticleSystem.prototype.setKillSpeed = function (killSpeed) {
	this.killSpeed = killSpeed;
}

//Sets the initial velocity of each particle
ParticleSystem.prototype.setInitialVelocity = function (initVel) {
	this.initVelocity = initVel;
}

//Sets the velocity Variance of each particle
ParticleSystem.prototype.setVelocityVariance = function (initVelVar) {
	this.velocityVariance = initVelVar;
}

//Sets the gravity of each particle over life time
ParticleSystem.prototype.setGravity = function (grav) {
	this.gravity = grav;
}

//This is how wide the emitter of particles can start
ParticleSystem.prototype.setEmitterWidth = function (emitterW) {
	this.emitterWidth = emitterW;
}

//This is how high the emitter of particles can start
ParticleSystem.prototype.setEmitterHeight = function (emitterH) {
	this.emitterHeight = emitterH;
}

//This will set how many particles per second should show
ParticleSystem.prototype.setParticlesPerSecond = function (particlePerSec) {
	this.particlesPerSecond = particlePerSec;
}

//This will set the frame count between particle emits
ParticleSystem.prototype.setEmitRate = function (emitRat) {
	this.emitRate = emitRat;
}

ParticleSystem.prototype.addParticle = function () {
	if (!this.started || frameCount % this.emitRate == 0) {
		for (var i=0; i<this.particlesPerSecond; i++) {
			var pos = createVector(this.origin.x + random(-this.emitterWidth, this.emitterWidth), this.origin.y + random(-this.emitterHeight, this.emitterHeight));
  			this.particles.push(new Particle(pos, this.particleImage, this.startSize, this.endSize, this.startColor, this.endColor, this.killSpeed, this.initVelocity, this.gravity, this.velocityVariance));
		}
		this.started = true;
	}

};

ParticleSystem.prototype.run = function () {
	push();
	//blendMode(BLEND);
	for (var i = 0; i <this.particles.length; i++) {
   	var p = this.particles[i];
    	p.run();
    	if (p.isDead()) {
      	this.particles.splice(i, 1);
      	i--;
    	}
  	}
  	pop();
};

// A simple Particle class
var Particle = function(position, particleImg, startS, endS, startCol, endCol, deathSpeed, initVelocity, initGravity, initVelVar) {
  this.gravity = initGravity.copy();
  this.velocity = createVector(initVelocity.x + random(-initVelVar, initVelVar), initVelocity.y + random(-initVelVar, initVelVar));
  this.position = position;
  this.particleImage = particleImg;
  this.lifespan = 255;
  this.killSpeed = deathSpeed;
  this.startSize = startS;
  this.endSize = endS;
  this.startColor = startCol;
  this.endColor = endCol;
};

Particle.prototype.run = function() {
  this.update();
  this.display();
};

// Method to update position
Particle.prototype.update = function(){
  this.velocity.add(this.gravity);
  this.position.add(this.velocity);
  this.lifespan -= this.killSpeed;
};

// Method to display
Particle.prototype.display = function () {
  
  if (this.particleImage != undefined) {
  	var sx = this.endSize + (this.startSize-this.endSize) * (this.lifespan/255);
  	
  	tint(lerpColor(this.startColor, this.endColor, 1 - (this.lifespan/255)));
  	image(this.particleImage, this.position.x, this.position.y, sx, sx);
  	
  } else {
  	var s = this.endSize + (this.startSize-this.endSize) * (this.lifespan/255);
  	noStroke();
  	fill(lerpColor(this.startColor, this.endColor, 1 - (this.lifespan/255)));
  	ellipse(this.position.x, this.position.y, s, s);  	
  }

};

// Is the particle still useful?
Particle.prototype.isDead = function () {
  if (this.lifespan < 0) {
    return true;
  } else {
    return false;
  }
};

