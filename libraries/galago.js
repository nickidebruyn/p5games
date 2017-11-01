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
	 	 Constraint = Matter.Constraint,
	 	 Events = Matter.Events,
	 	 Sleeping = Matter.Sleeping;
	var runningEngine;
	 	 
	//List of sprites we render using p5.js
	var sprites = [];
	var particleSystems = [];
	var mouseCollisions = [];
	var collisionListeners = [];
	var cameraX = 0;
	var cameraY = 0;
	
	//GLOBAL VARIABLED
	this.NONE = 0;
	this.BOX = 1;
	this.CIRCLE = 2;

	//Physics variables	
	this.PhysicsWorld = World;
	this.PhysicsBodies = Bodies;
	this.PhysicsBody = Body;
	this.PhysicsEngine = Engine;
	this.PhysicsConstraint = Constraint;
	this.PhysicsSleeping = Sleeping;
	
	this.debugEnabled = false;
	
	//Sets the world gravity
	this.setGravity = function(gravX, gravY) {
		runningEngine.world.gravity.x = gravX;
		runningEngine.world.gravity.y = gravY;
		
	}
	
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
	
	//Add a physics collision listener to the world
	this.addCollisionListener = function(collisionListener) {
		collisionListeners.push(collisionListener);
	}
	
	//Remove a physics collision listener to the world
	this.removeCollisionListener = function(collisionListener) {
		collisionListeners.remove(collisionListener);
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
		
		//Check if any collision in physics happend
		Events.on(runningEngine, 'collisionStart collisionActive', function(event) {
			var pairs = event.pairs;
			
			//Fire collision listeners
			for (var c = 0; c < collisionListeners.length; c++) {
				
         	//Loop over all collision pairs
        		for (var i = 0; i < pairs.length; i++) {
            	var pair = pairs[i];
            	
            	//Here we have 2 collisions
            	//console.log(pair.bodyA.id +" collided with " + pair.bodyB.id);
            	var collisionASprite = null;
            	var collisionBSprite = null;
            	
            	for (var s=0; s < sprites.length; s++) {
						//Check for sprites
						if (!sprites[s].isDead() && sprites[s].hasPhysics()) {
							if (collisionASprite == null && pair.bodyA.id == sprites[s].body.id) {
								collisionASprite = sprites[s];
							} else if (collisionBSprite == null && pair.bodyB.id == sprites[s].body.id) {
								collisionBSprite = sprites[s];
							} else if (collisionASprite != null && collisionBSprite != null) {
								break;
							}
						}
					}
            	
            	if (collisionASprite != null && collisionBSprite != null) {
            		collisionListeners[c]({
            			colliderA: collisionASprite,
            			colliderB: collisionBSprite
            		});
            	}

        		}
				
			}

    });
		
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
	
	//Set the camera position in the world
	this.getCameraPosition = function() {
		return createVector(cameraX, cameraY);
	}
	
	//We call this to update the physics engine and render the game graphics
	this.update = function() {
		//Update the engine manually
		Engine.update(runningEngine);
		
		//Camera translation
		translate((width*0.5) - cameraX, (height*0.5) - cameraY);
		
		//Clear collisions at mouse array
		mouseCollisions = [];
		
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
		
		
		//Debug
		// console.log(sprites.length +" - "+ runningEngine.world.bodies.length);
	}
}


//========= PHYSICS SPRITE ===========
//This is a type of sprite object that can have physics in physics space
function Sprite(initImage, initX, initY, initWidth, initHeight, physicsShape, initOptions) {
	
	//Local variabled of graphics box
	this.body;
	
	var physicsShape = physicsShape;
	var img = initImage;
	var position = createVector(initX, initY);
	var angle = 0;
	var w = initWidth;
	var h = initHeight;
	var options = initOptions;
	if (!options) {
		options = {isStatic: true, restitution: 0.5, friction: 0.5};
	}
	var dead = false;
	var gameEngine;
	var links = [];
	var children = [];
	var userData = [];
	var collision = false;
	var animations = [];
	var currentAnimation;
	var animationSpeed;
	var animationIndex = 0;
	var animationLoop = true;
	var animationReverse = false;
	var animationIncrease = true;
	var controller;
	var overrideRender;
	
	this.setRenderer = function(renderrr) {
		this.overrideRender = renderrr;
	}
	
	this.setController = function(controllerFunction) {
		this.controller = controllerFunction;
	}
	
	this.addAnimation = function(name, animationImages) {
		var anim = {
			"name" : name,
			"images" : animationImages
		}
		animations.push(anim);
		
	}
	
	this.playAnimation = function(name, speed, loopAnim, reverseAnim) {
		
		if (name == undefined) {
			return;
		}
		
		if (speed == undefined) {
			speed = 5;
		} else {
			animationSpeed = speed;
		}
		
		if (loopAnim == undefined) {
			animationLoop = true;
		} else {
			animationLoop = loopAnim;
		}
		
		if (reverseAnim == undefined) {
			animationReverse = false;
		} else {
			animationReverse = reverseAnim;
		}
		
		animationIncrease = true
		
		//find the animation
		for (var i=0; i<animations.length; i++) {
			if (animations[i].name == name) {
				currentAnimation = animations[i];
				animationIndex = 0;
				break;
			}
		}
	}
	
	this.setCollision = function(col) {
		collision = col;
	}
	
	this.hasCollision = function() {
		return collision;
	}
	
	//Attach a child sprite or object to this one
	this.attachChild = function(child) {
		children.push(child);
	}
	
	//Attach a child sprite or object to this one
	this.detachChild = function(child) {
		children.remove(child);
	}
	
	//Make all children follow this sprite
	var updateChildren = function(posX, posY, ang) {
		for (var i=0; i<children.length; i++) {
			children[i].setPosition(posX, posY);
			children[i].setAngle(ang);
		}
	}
	
	//Add some user data to this object which will identify it
	this.setUserData = function(code, val) {
		userData.push({
			code: code,
			value: val
		});
	}
	
	//Return some user data
	this.getUserData = function(code) {
		var val = null;
		for (var i=0; i<userData.length; i++) {
			if (userData[i].code == code) {
				val = userData[i].value;
				break;
			}
		}
		return val;
	}
	
	//Determine if this sprite has physics
	this.hasPhysics = function() {
		return this.body;
	}
	
	//Returns the position
	this.getInitialPosition = function() {
		return position;
	}
	
	//Returns the position
	this.getPosition = function() {
		if (this.body) {
			return createVector(this.body.position.x, this.body.position.y);
		} else {
			return position;
		}
		
	}
	
	//Set the sprite position
	this.setPosition = function(posX, posY) {
		if (this.body) {
			gameEngine.PhysicsBody.setPosition(this.body, {
				x: posX,
				y: posY
			});
		} else {
			position = createVector(posX, posY);
		}

	}
	
	//Move the sprite
	this.move = function(amountX, amountY) {
		if (this.body) {
			var posX = this.body.position.x + amountX;
			var posY = this.body.position.y + amountY;
		
			gameEngine.PhysicsBody.setPosition(this.body, {
				x: posX,
				y: posY
			});
			
		} else {
			position.add(amountX, amountY);
			
		}

	}
	
	//Rotates the body by a given amount
	this.rotate = function(rotationAmount) {
		if (this.body) {
			gameEngine.PhysicsBody.rotate(this.body, radians(rotationAmount));
			
		} else {
			angle = angle + rotationAmount;
			
		}
		
	}
	
	//Sets the angle of this physics object
	this.setAngle = function(angleInDegrees) {
		if (this.body) {
			gameEngine.PhysicsBody.setAngle(this.body, radians(angleInDegrees));
			
		} else {
			angle = angleInDegrees;
			
		}
		
	}
	
	//Apply a force to this physics body
	this.applyForce = function(forceX, forceY) {
		if (this.body) {
			gameEngine.PhysicsBody.applyForce(this.body, this.body.position, {
				x: forceX,
				y: forceY
			});
		} else {
			console.log("No body found for sprite");
		}

	}
	
	//Set the angular velocity
	this.setAngularVelocity = function(angularVelocity) {
		if (this.body) {
			gameEngine.PhysicsBody.setAngularVelocity(this.body, angularVelocity);
		} else {
			console.log("No body found for sprite");
		}
		
	}
	
	//Set the angular velocity
	this.setVelocity = function(velX, velY) {
		if (this.body) {
			gameEngine.PhysicsBody.setVelocity(this.body, {
				x: velX,
				y: velY
			});
		} else {
			console.log("No body found for sprite");
		}

	}

	//Clear all physics forces
	this.clearForces = function() {
		if (this.body) {
			gameEngine.PhysicsBody.setVelocity(this.body, {
				x: 0,
				y: 0
			});
			gameEngine.PhysicsBody.setAngularVelocity(this.body, 0);
		} else {
			console.log("No body found for sprite");
		}

	}
	
	//Sets the density of the body
	this.setDensity = function(density) {
		if (this.body) {
			gameEngine.PhysicsBody.setDensity(this.body, density);
			
		} else {
			console.log("No body found for sprite");
		}
		
	}
	
	//Sets the mass of the body
	this.setMass = function(mass) {
		if (this.body) {
			gameEngine.PhysicsBody.setMass(this.body, mass);

		} else {
			console.log("No body found for sprite");
		}
		
	}
	
	//Sets the static property
	this.setStatic = function(stat) {
		if (this.body) {
			gameEngine.PhysicsBody.setStatic(this.body, stat);

		} else {
			console.log("No body found for sprite");
		}
		
	}
	
	//Sets the sleeping property
	this.setSleeping = function(sleepin) {
		if (this.body) {
			gameEngine.PhysicsSleeping.set(this.body, sleepin)

		} else {
			console.log("No body found for sprite");
		}
		
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
		
		if (physicsShape == gameEngine.BOX) {
			//Local body of the physics box
			this.body = gameEngine.PhysicsBodies.rectangle(position.x, position.y, w, h, options);
			//Adding body to the world
			gameEngine.addBody(this.body);
			
		} else if (physicsShape == gameEngine.CIRCLE) {
			//Local body of the physics box
			this.body = gameEngine.PhysicsBodies.circle(position.x, position.y, w/2, options);
			//Adding body to the world
			gameEngine.addBody(this.body);			
		}

		
	}
	
	this.link = function(targetSprite, length, stiffness, offsetX, offsetY, targetOffsetX, targetOffsetY) {
		if (this.body) {
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
			
		} else {
			console.log("No body found for sprite");
		}

	}
	
	this.getRotation = function() {
		
			if (this.body) {
				return degrees(this.body.angle);

			} else {
				return angle;
			}		
	}
	
	this.getAngle = function() {
		
			if (this.body) {
				return degrees(this.body.angle);

			} else {
				return angle;
			}		
	}

	this.update = function() {
		push();
		
			//Move in world
			if (this.body) {
				//Move and rotate to physics world
				translate(this.body.position.x, this.body.position.y);
				rotate(this.body.angle);				
				updateChildren(this.body.position.x, this.body.position.y, degrees(this.body.angle));
				
			} else {
				//Move and rotate the sprite
				translate(position.x, position.y);
				rotate(radians(angle));
				updateChildren(position.x, position.y, angle);
			}

			
			//Draw the image
			if (currentAnimation) {
				// console.log("currentAnimation: " + currentAnimation.name);
				
				if (frameCount % animationSpeed == 0) {
					if (animationReverse) {
						
						if (animationIncrease) {
							animationIndex ++;
							if (animationIndex >= currentAnimation.images.length) {
								animationIndex = currentAnimation.images.length - 1;
								animationIncrease = false;
							}	
						} else {
							animationIndex --;
							if (animationIndex <= 0) {
								animationIndex = 0;
								animationIncrease = true;
							}	
							
						}
						
					} else {
						animationIndex ++;
						if (animationIndex >= currentAnimation.images.length) {
						
							if (animationLoop) {
								animationIndex = 0;
							} else {
								currentAnimation = null;
							}
						}	
					}
					

				}
				
				image(currentAnimation.images[animationIndex], 0, 0, w, h);
				
			} else if (this.overrideRender) {
				this.overrideRender(this);
				
			} else if (img) {
				image(img, 0, 0, w, h);
				
			}

			
			//Show the debug info of the physics body
			if (gameEngine.debugEnabled && this.body) {
				noFill();
				if (options != undefined && options.isStatic) {
					stroke(0, 0, 200);
				} else {
					stroke(0, 200, 0);
				}
				if (physicsShape == gameEngine.BOX) {
					rect(0, 0, w, h);	
				} else if (physicsShape == gameEngine.CIRCLE) {
					ellipse(0, 0, w);
				}
				
			}

		pop();
		
		//Draw lines of any connected or joint bodies
		if (gameEngine.debugEnabled && this.body) {
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
		
		//Now we check for the controller
		if (this.controller) {
			this.controller(this);
		}

	}
	
	//This function should be called when you want to destroy a sprite
	this.destroy = function() {
		if (this.body) {
			//Remove the constraints/joints
			for (var i=0; i<links.length; i++) {
				var con = links[i];
				gameEngine.removeConstraint(con);
					
			}
			gameEngine.removeBody(this.body);
		}
		
		//Remove the attached children
		for (var i=0; i<children.length; i++) {
			children[i].destroy();
				
		}

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
	var userData = [];
	var controller;
	
	this.setController = function(controllerFunction) {
		this.controller = controllerFunction;
	}
	
	
	//Add some user data to this object which will identify it
	this.setUserData = function(code, val) {
		userData.push({
			code: code,
			value: val
		});
	}
	
	//Return some user data
	this.getUserData = function(code) {
		var val = null;
		for (var i=0; i<userData.length; i++) {
			if (userData[i].code == code) {
				val = userData[i].value;
				break;
			}
		}
		return val;
	}
  	

	//Returns the position
	this.getPosition = function() {
		return this.origin;
	}
	
	//Set the sprite position
	this.setPosition = function(posX, posY) {
		this.origin = createVector(posX, posY);
		
	}
	
	this.setAngle = function(angleInDegrees) {
		
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
	
	//Determine if this sprite has physics
	this.hasPhysics = function() {
		return false;
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
  	
  	//Now we check for the controller
	if (this.controller) {
		this.controller(this);
	}
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













//================== DEPENDENCY LIBS ======================
//*********************************************************
//***					    SceneManager								 *
//*********************************************************
//
// p5 SceneManager helps you create p5.js sketches with multiple states / scenes
// Each scene is a like a sketch within the main sketch. You focus on creating
// the scene like a regular sketch and SceneManager ensure scene switching
// routing the main setup(), draw(), mousePressed(), etc. events to the 
// appropriate current scene.
//
// Author: Marian Veteanu
// http://github.com/mveteanu
//
function SceneManager(p)
{
    this.scenes = [];
    this.scene = null;
    
    // Wire relevant p5.js events, except setup()
    // If you don't call this method, you need to manually wire events
    this.wire = function()
    {
        var me = this;
        var o = p != null ? p : window;

        o.draw = function(){ me.draw(); };
        o.mousePressed = function(){ me.mousePressed(); };
        o.keyPressed = function(){ me.keyPressed(); };

        return me;
    }

    // Add a scene to the collection
    // You need to add all the scenes if intend to call .showNextScene()
    this.addScene = function( fnScene )
    {
        var oScene = new fnScene(p);

        // inject p as a property of the scene
        this.p = p;
        
        // inject sceneManager as a property of the scene
        oScene.sceneManager = this;

        var o = {   fnScene: fnScene, 
                    oScene: oScene,
                    hasSetup : "setup" in oScene,
                    hasEnter : "enter" in oScene,
                    hasDraw : "draw" in oScene,
                    hasMousePressed : "mousePressed" in oScene,
                    hasKeyPressed : "keyPressed" in oScene,
                    setupExecuted : false,
                    enterExecuted : false };

        this.scenes.push(o);
        return o;
    }

    // Return the index of a scene in the internal collection
    this.findSceneIndex = function( fnScene )
    {
        for(var i = 0; i < this.scenes.length; i++)
        {
            var o = this.scenes[i]; 
            if ( o.fnScene == fnScene )
                return i;
        }

        return -1;
    }

    // Return a scene object wrapper
    this.findScene = function( fnScene )
    {
        var i = this.findSceneIndex( fnScene );
        return i >= 0 ? this.scenes[i] : null;
    }

    // Returns true if the current displayed scene is fnScene
    this.isCurrent = function ( fnScene )
    {
        if ( this.scene == null )
            return false;

        return this.scene.fnScene == fnScene;
    }

    // Show a scene based on the function name
    // Optionally you can send arguments to the scene
    // Arguments will be retrieved in the scene via .sceneArgs property
    this.showScene = function( fnScene, sceneArgs )
    {
        var o = this.findScene( fnScene );

        if ( o == null )
            o = this.addScene( fnScene );
        
        // Re-arm the enter function at each show of the scene
        o.enterExecuted = false;

        this.scene = o;

        // inject sceneArgs as a property of the scene
        o.oScene.sceneArgs = sceneArgs;
    }

    // Show the next scene in the collection
    // Useful if implementing demo applications 
    // where you want to advance scenes automatically
    this.showNextScene = function( sceneArgs )
    {
        if ( this.scenes.length == 0 )
            return;

        var nextSceneIndex = 0;

        if ( this.scene != null )
        {
            // search current scene... 
            // can be optimized to avoid searching current scene...
            var i = this.findSceneIndex( this.scene.fnScene );
            nextSceneIndex = i < this.scenes.length - 1 ? i + 1 : 0;
        }

        var nextScene = this.scenes[nextSceneIndex];
        this.showScene( nextScene.fnScene, sceneArgs );
    }
    
    // This is the SceneManager .draw() method
    // This will dispatch the main draw() to the 
    // current scene draw() method
    this.draw = function()
    {
        if ( this.scene == null )
            return;

        if ( this.scene.hasSetup && !this.scene.setupExecuted  )
        {
            this.scene.oScene.setup();
            this.scene.setupExecuted = true;
        }

        if ( this.scene.hasEnter && !this.scene.enterExecuted  )
        {
            this.scene.oScene.enter();
            this.scene.enterExecuted = true;
        }

        if ( this.scene.hasDraw )
        {
            this.scene.oScene.draw();
        }
    }

    // This will dispatch .mousePressed() to the 
    // current scene .mousePressed() method
    this.mousePressed = function()
    {
        if ( this.scene == null )
            return;

        if ( this.scene.hasMousePressed )
        {
            this.scene.oScene.mousePressed();
        }
    }

    // This will dispatch .keyPressed() to the
    // current scene .keyPressed() method
    this.keyPressed = function()
    {
        if ( this.scene == null )
            return;

        if ( this.scene.hasKeyPressed )
        {
            this.scene.oScene.keyPressed();
        }
    }
}






//********************* MATTER JS FOR PHYSICS ****************************
/**
* matter-js 0.10.0 by @liabru 2016-05-01
* http://brm.io/matter-js/
* License MIT
*/
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var t;t="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,t.Matter=e()}}(function(){return function e(t,o,n){function i(s,a){if(!o[s]){if(!t[s]){var l="function"==typeof require&&require;if(!a&&l)return l(s,!0);if(r)return r(s,!0);var c=new Error("Cannot find module '"+s+"'");throw c.code="MODULE_NOT_FOUND",c}var d=o[s]={exports:{}};t[s][0].call(d.exports,function(e){var o=t[s][1][e];return i(o?o:e)},d,d.exports,e,t,o,n)}return o[s].exports}for(var r="function"==typeof require&&require,s=0;s<n.length;s++)i(n[s]);return i}({1:[function(e,t,o){var n={};t.exports=n;var i=e("../geometry/Vertices"),r=e("../geometry/Vector"),s=e("../core/Sleeping"),a=(e("../render/Render"),e("../core/Common")),l=e("../geometry/Bounds"),c=e("../geometry/Axes");!function(){n._inertiaScale=4,n._nextCollidingGroupId=1,
n._nextNonCollidingGroupId=-1,n._nextCategory=1,n.create=function(t){var o={id:a.nextId(),type:"body",label:"Body",parts:[],angle:0,vertices:i.fromPath("L 0 0 L 40 0 L 40 40 L 0 40"),position:{x:0,y:0},force:{x:0,y:0},torque:0,positionImpulse:{x:0,y:0},constraintImpulse:{x:0,y:0,angle:0},totalContacts:0,speed:0,angularSpeed:0,velocity:{x:0,y:0},angularVelocity:0,isSensor:!1,isStatic:!1,isSleeping:!1,motion:0,sleepThreshold:60,density:.001,restitution:0,friction:.1,frictionStatic:.5,frictionAir:.01,collisionFilter:{category:1,mask:4294967295,group:0},slop:.05,timeScale:1,render:{visible:!0,opacity:1,sprite:{xScale:1,yScale:1,xOffset:0,yOffset:0},lineWidth:1.5}},n=a.extend(o,t);return e(n,t),n},n.nextGroup=function(e){return e?n._nextNonCollidingGroupId--:n._nextCollidingGroupId++},n.nextCategory=function(){return n._nextCategory=n._nextCategory<<1,n._nextCategory};var e=function(e,t){n.set(e,{bounds:e.bounds||l.create(e.vertices),positionPrev:e.positionPrev||r.clone(e.position),anglePrev:e.anglePrev||e.angle,
vertices:e.vertices,parts:e.parts||[e],isStatic:e.isStatic,isSleeping:e.isSleeping,parent:e.parent||e}),i.rotate(e.vertices,e.angle,e.position),c.rotate(e.axes,e.angle),l.update(e.bounds,e.vertices,e.velocity),n.set(e,{axes:t.axes||e.axes,area:t.area||e.area,mass:t.mass||e.mass,inertia:t.inertia||e.inertia});var o=e.isStatic?"#eeeeee":a.choose(["#556270","#4ECDC4","#C7F464","#FF6B6B","#C44D58"]),s=a.shadeColor(o,-20);e.render.fillStyle=e.render.fillStyle||o,e.render.strokeStyle=e.render.strokeStyle||s,e.render.sprite.xOffset+=-(e.bounds.min.x-e.position.x)/(e.bounds.max.x-e.bounds.min.x),e.render.sprite.yOffset+=-(e.bounds.min.y-e.position.y)/(e.bounds.max.y-e.bounds.min.y)};n.set=function(e,t,o){var i;"string"==typeof t&&(i=t,t={},t[i]=o);for(i in t)if(o=t[i],t.hasOwnProperty(i))switch(i){case"isStatic":n.setStatic(e,o);break;case"isSleeping":s.set(e,o);break;case"mass":n.setMass(e,o);break;case"density":n.setDensity(e,o);break;case"inertia":n.setInertia(e,o);break;case"vertices":n.setVertices(e,o);
break;case"position":n.setPosition(e,o);break;case"angle":n.setAngle(e,o);break;case"velocity":n.setVelocity(e,o);break;case"angularVelocity":n.setAngularVelocity(e,o);break;case"parts":n.setParts(e,o);break;default:e[i]=o}},n.setStatic=function(e,t){for(var o=0;o<e.parts.length;o++){var n=e.parts[o];n.isStatic=t,t&&(n.restitution=0,n.friction=1,n.mass=n.inertia=n.density=1/0,n.inverseMass=n.inverseInertia=0,n.positionPrev.x=n.position.x,n.positionPrev.y=n.position.y,n.anglePrev=n.angle,n.angularVelocity=0,n.speed=0,n.angularSpeed=0,n.motion=0)}},n.setMass=function(e,t){e.mass=t,e.inverseMass=1/e.mass,e.density=e.mass/e.area},n.setDensity=function(e,t){n.setMass(e,t*e.area),e.density=t},n.setInertia=function(e,t){e.inertia=t,e.inverseInertia=1/e.inertia},n.setVertices=function(e,t){t[0].body===e?e.vertices=t:e.vertices=i.create(t,e),e.axes=c.fromVertices(e.vertices),e.area=i.area(e.vertices),n.setMass(e,e.density*e.area);var o=i.centre(e.vertices);i.translate(e.vertices,o,-1),n.setInertia(e,n._inertiaScale*i.inertia(e.vertices,e.mass)),
i.translate(e.vertices,e.position),l.update(e.bounds,e.vertices,e.velocity)},n.setParts=function(e,o,r){var s;for(o=o.slice(0),e.parts.length=0,e.parts.push(e),e.parent=e,s=0;s<o.length;s++){var a=o[s];a!==e&&(a.parent=e,e.parts.push(a))}if(1!==e.parts.length){if(r="undefined"!=typeof r?r:!0){var l=[];for(s=0;s<o.length;s++)l=l.concat(o[s].vertices);i.clockwiseSort(l);var c=i.hull(l),d=i.centre(c);n.setVertices(e,c),i.translate(e.vertices,d)}var u=t(e);e.area=u.area,e.parent=e,e.position.x=u.centre.x,e.position.y=u.centre.y,e.positionPrev.x=u.centre.x,e.positionPrev.y=u.centre.y,n.setMass(e,u.mass),n.setInertia(e,u.inertia),n.setPosition(e,u.centre)}},n.setPosition=function(e,t){var o=r.sub(t,e.position);e.positionPrev.x+=o.x,e.positionPrev.y+=o.y;for(var n=0;n<e.parts.length;n++){var s=e.parts[n];s.position.x+=o.x,s.position.y+=o.y,i.translate(s.vertices,o),l.update(s.bounds,s.vertices,e.velocity)}},n.setAngle=function(e,t){var o=t-e.angle;e.anglePrev+=o;for(var n=0;n<e.parts.length;n++){
var s=e.parts[n];s.angle+=o,i.rotate(s.vertices,o,e.position),c.rotate(s.axes,o),l.update(s.bounds,s.vertices,e.velocity),n>0&&r.rotateAbout(s.position,o,e.position,s.position)}},n.setVelocity=function(e,t){e.positionPrev.x=e.position.x-t.x,e.positionPrev.y=e.position.y-t.y,e.velocity.x=t.x,e.velocity.y=t.y,e.speed=r.magnitude(e.velocity)},n.setAngularVelocity=function(e,t){e.anglePrev=e.angle-t,e.angularVelocity=t,e.angularSpeed=Math.abs(e.angularVelocity)},n.translate=function(e,t){n.setPosition(e,r.add(e.position,t))},n.rotate=function(e,t){n.setAngle(e,e.angle+t)},n.scale=function(e,o,r,s){for(var a=0;a<e.parts.length;a++){var d=e.parts[a];i.scale(d.vertices,o,r,e.position),d.axes=c.fromVertices(d.vertices),e.isStatic||(d.area=i.area(d.vertices),n.setMass(d,e.density*d.area),i.translate(d.vertices,{x:-d.position.x,y:-d.position.y}),n.setInertia(d,i.inertia(d.vertices,d.mass)),i.translate(d.vertices,{x:d.position.x,y:d.position.y})),l.update(d.bounds,d.vertices,e.velocity)}if(e.circleRadius&&(o===r?e.circleRadius*=o:e.circleRadius=null),
!e.isStatic){var u=t(e);e.area=u.area,n.setMass(e,u.mass),n.setInertia(e,u.inertia)}},n.update=function(e,t,o,n){var s=Math.pow(t*o*e.timeScale,2),a=1-e.frictionAir*o*e.timeScale,d=e.position.x-e.positionPrev.x,u=e.position.y-e.positionPrev.y;e.velocity.x=d*a*n+e.force.x/e.mass*s,e.velocity.y=u*a*n+e.force.y/e.mass*s,e.positionPrev.x=e.position.x,e.positionPrev.y=e.position.y,e.position.x+=e.velocity.x,e.position.y+=e.velocity.y,e.angularVelocity=(e.angle-e.anglePrev)*a*n+e.torque/e.inertia*s,e.anglePrev=e.angle,e.angle+=e.angularVelocity,e.speed=r.magnitude(e.velocity),e.angularSpeed=Math.abs(e.angularVelocity);for(var p=0;p<e.parts.length;p++){var f=e.parts[p];i.translate(f.vertices,e.velocity),p>0&&(f.position.x+=e.velocity.x,f.position.y+=e.velocity.y),0!==e.angularVelocity&&(i.rotate(f.vertices,e.angularVelocity,e.position),c.rotate(f.axes,e.angularVelocity),p>0&&r.rotateAbout(f.position,e.angularVelocity,e.position,f.position)),l.update(f.bounds,f.vertices,e.velocity)}},n.applyForce=function(e,t,o){
e.force.x+=o.x,e.force.y+=o.y;var n={x:t.x-e.position.x,y:t.y-e.position.y};e.torque+=n.x*o.y-n.y*o.x};var t=function(e){for(var t={mass:0,area:0,inertia:0,centre:{x:0,y:0}},o=1===e.parts.length?0:1;o<e.parts.length;o++){var n=e.parts[o];t.mass+=n.mass,t.area+=n.area,t.inertia+=n.inertia,t.centre=r.add(t.centre,r.mult(n.position,n.mass!==1/0?n.mass:1))}return t.centre=r.div(t.centre,t.mass!==1/0?t.mass:e.parts.length),t}}()},{"../core/Common":14,"../core/Sleeping":20,"../geometry/Axes":23,"../geometry/Bounds":24,"../geometry/Vector":26,"../geometry/Vertices":27,"../render/Render":29}],2:[function(e,t,o){var n={};t.exports=n;var i=e("../core/Events"),r=e("../core/Common"),s=e("./Body");!function(){n.create=function(e){return r.extend({id:r.nextId(),type:"composite",parent:null,isModified:!1,bodies:[],constraints:[],composites:[],label:"Composite"},e)},n.setModified=function(e,t,o,i){if(e.isModified=t,o&&e.parent&&n.setModified(e.parent,t,o,i),i)for(var r=0;r<e.composites.length;r++){var s=e.composites[r];
n.setModified(s,t,o,i)}},n.add=function(e,t){var o=[].concat(t);i.trigger(e,"beforeAdd",{object:t});for(var s=0;s<o.length;s++){var a=o[s];switch(a.type){case"body":if(a.parent!==a){r.log("Composite.add: skipped adding a compound body part (you must add its parent instead)","warn");break}n.addBody(e,a);break;case"constraint":n.addConstraint(e,a);break;case"composite":n.addComposite(e,a);break;case"mouseConstraint":n.addConstraint(e,a.constraint)}}return i.trigger(e,"afterAdd",{object:t}),e},n.remove=function(e,t,o){var r=[].concat(t);i.trigger(e,"beforeRemove",{object:t});for(var s=0;s<r.length;s++){var a=r[s];switch(a.type){case"body":n.removeBody(e,a,o);break;case"constraint":n.removeConstraint(e,a,o);break;case"composite":n.removeComposite(e,a,o);break;case"mouseConstraint":n.removeConstraint(e,a.constraint)}}return i.trigger(e,"afterRemove",{object:t}),e},n.addComposite=function(e,t){return e.composites.push(t),t.parent=e,n.setModified(e,!0,!0,!1),e},n.removeComposite=function(e,t,o){
var i=r.indexOf(e.composites,t);if(-1!==i&&(n.removeCompositeAt(e,i),n.setModified(e,!0,!0,!1)),o)for(var s=0;s<e.composites.length;s++)n.removeComposite(e.composites[s],t,!0);return e},n.removeCompositeAt=function(e,t){return e.composites.splice(t,1),n.setModified(e,!0,!0,!1),e},n.addBody=function(e,t){return e.bodies.push(t),n.setModified(e,!0,!0,!1),e},n.removeBody=function(e,t,o){var i=r.indexOf(e.bodies,t);if(-1!==i&&(n.removeBodyAt(e,i),n.setModified(e,!0,!0,!1)),o)for(var s=0;s<e.composites.length;s++)n.removeBody(e.composites[s],t,!0);return e},n.removeBodyAt=function(e,t){return e.bodies.splice(t,1),n.setModified(e,!0,!0,!1),e},n.addConstraint=function(e,t){return e.constraints.push(t),n.setModified(e,!0,!0,!1),e},n.removeConstraint=function(e,t,o){var i=r.indexOf(e.constraints,t);if(-1!==i&&n.removeConstraintAt(e,i),o)for(var s=0;s<e.composites.length;s++)n.removeConstraint(e.composites[s],t,!0);return e},n.removeConstraintAt=function(e,t){return e.constraints.splice(t,1),n.setModified(e,!0,!0,!1),
e},n.clear=function(e,t,o){if(o)for(var i=0;i<e.composites.length;i++)n.clear(e.composites[i],t,!0);return t?e.bodies=e.bodies.filter(function(e){return e.isStatic}):e.bodies.length=0,e.constraints.length=0,e.composites.length=0,n.setModified(e,!0,!0,!1),e},n.allBodies=function(e){for(var t=[].concat(e.bodies),o=0;o<e.composites.length;o++)t=t.concat(n.allBodies(e.composites[o]));return t},n.allConstraints=function(e){for(var t=[].concat(e.constraints),o=0;o<e.composites.length;o++)t=t.concat(n.allConstraints(e.composites[o]));return t},n.allComposites=function(e){for(var t=[].concat(e.composites),o=0;o<e.composites.length;o++)t=t.concat(n.allComposites(e.composites[o]));return t},n.get=function(e,t,o){var i,r;switch(o){case"body":i=n.allBodies(e);break;case"constraint":i=n.allConstraints(e);break;case"composite":i=n.allComposites(e).concat(e)}return i?(r=i.filter(function(e){return e.id.toString()===t.toString()}),0===r.length?null:r[0]):null},n.move=function(e,t,o){return n.remove(e,t),
n.add(o,t),e},n.rebase=function(e){for(var t=n.allBodies(e).concat(n.allConstraints(e)).concat(n.allComposites(e)),o=0;o<t.length;o++)t[o].id=r.nextId();return n.setModified(e,!0,!0,!1),e},n.translate=function(e,t,o){for(var i=o?n.allBodies(e):e.bodies,r=0;r<i.length;r++)s.translate(i[r],t);return n.setModified(e,!0,!0,!1),e},n.rotate=function(e,t,o,i){for(var r=Math.cos(t),a=Math.sin(t),l=i?n.allBodies(e):e.bodies,c=0;c<l.length;c++){var d=l[c],u=d.position.x-o.x,p=d.position.y-o.y;s.setPosition(d,{x:o.x+(u*r-p*a),y:o.y+(u*a+p*r)}),s.rotate(d,t)}return n.setModified(e,!0,!0,!1),e},n.scale=function(e,t,o,i,r){for(var a=r?n.allBodies(e):e.bodies,l=0;l<a.length;l++){var c=a[l],d=c.position.x-i.x,u=c.position.y-i.y;s.setPosition(c,{x:i.x+d*t,y:i.y+u*o}),s.scale(c,t,o)}return n.setModified(e,!0,!0,!1),e}}()},{"../core/Common":14,"../core/Events":16,"./Body":1}],3:[function(e,t,o){var n={};t.exports=n;var i=e("./Composite"),r=(e("../constraint/Constraint"),e("../core/Common"));!function(){n.create=function(e){
var t=i.create(),o={label:"World",gravity:{x:0,y:1,scale:.001},bounds:{min:{x:-(1/0),y:-(1/0)},max:{x:1/0,y:1/0}}};return r.extend(t,o,e)}}()},{"../constraint/Constraint":12,"../core/Common":14,"./Composite":2}],4:[function(e,t,o){var n={};t.exports=n,function(){n.create=function(e){return{id:n.id(e),vertex:e,normalImpulse:0,tangentImpulse:0}},n.id=function(e){return e.body.id+"_"+e.index}}()},{}],5:[function(e,t,o){var n={};t.exports=n;var i=e("./SAT"),r=e("./Pair"),s=e("../geometry/Bounds");!function(){n.collisions=function(e,t){for(var o=[],a=t.pairs.table,l=0;l<e.length;l++){var c=e[l][0],d=e[l][1];if((!c.isStatic&&!c.isSleeping||!d.isStatic&&!d.isSleeping)&&n.canCollide(c.collisionFilter,d.collisionFilter)&&s.overlaps(c.bounds,d.bounds))for(var u=c.parts.length>1?1:0;u<c.parts.length;u++)for(var p=c.parts[u],f=d.parts.length>1?1:0;f<d.parts.length;f++){var v=d.parts[f];if(p===c&&v===d||s.overlaps(p.bounds,v.bounds)){var m,y=r.id(p,v),g=a[y];m=g&&g.isActive?g.collision:null;var x=i.collides(p,v,m);
x.collided&&o.push(x)}}}return o},n.canCollide=function(e,t){return e.group===t.group&&0!==e.group?e.group>0:0!==(e.mask&t.category)&&0!==(t.mask&e.category)}}()},{"../geometry/Bounds":24,"./Pair":7,"./SAT":11}],6:[function(e,t,o){var n={};t.exports=n;var i=e("./Pair"),r=e("./Detector"),s=e("../core/Common");!function(){n.create=function(e){var t={controller:n,detector:r.collisions,buckets:{},pairs:{},pairsList:[],bucketWidth:48,bucketHeight:48};return s.extend(t,e)},n.update=function(o,n,i,r){var s,p,f,v,m,y=i.world,g=o.buckets,x=!1;for(s=0;s<n.length;s++){var h=n[s];if((!h.isSleeping||r)&&!(h.bounds.max.x<y.bounds.min.x||h.bounds.min.x>y.bounds.max.x||h.bounds.max.y<y.bounds.min.y||h.bounds.min.y>y.bounds.max.y)){var b=t(o,h);if(!h.region||b.id!==h.region.id||r){h.region&&!r||(h.region=b);var w=e(b,h.region);for(p=w.startCol;p<=w.endCol;p++)for(f=w.startRow;f<=w.endRow;f++){m=a(p,f),v=g[m];var S=p>=b.startCol&&p<=b.endCol&&f>=b.startRow&&f<=b.endRow,C=p>=h.region.startCol&&p<=h.region.endCol&&f>=h.region.startRow&&f<=h.region.endRow;
!S&&C&&C&&v&&d(o,v,h),(h.region===b||S&&!C||r)&&(v||(v=l(g,m)),c(o,v,h))}h.region=b,x=!0}}}x&&(o.pairsList=u(o))},n.clear=function(e){e.buckets={},e.pairs={},e.pairsList=[]};var e=function(e,t){var n=Math.min(e.startCol,t.startCol),i=Math.max(e.endCol,t.endCol),r=Math.min(e.startRow,t.startRow),s=Math.max(e.endRow,t.endRow);return o(n,i,r,s)},t=function(e,t){var n=t.bounds,i=Math.floor(n.min.x/e.bucketWidth),r=Math.floor(n.max.x/e.bucketWidth),s=Math.floor(n.min.y/e.bucketHeight),a=Math.floor(n.max.y/e.bucketHeight);return o(i,r,s,a)},o=function(e,t,o,n){return{id:e+","+t+","+o+","+n,startCol:e,endCol:t,startRow:o,endRow:n}},a=function(e,t){return e+","+t},l=function(e,t){var o=e[t]=[];return o},c=function(e,t,o){for(var n=0;n<t.length;n++){var r=t[n];if(!(o.id===r.id||o.isStatic&&r.isStatic)){var s=i.id(o,r),a=e.pairs[s];a?a[2]+=1:e.pairs[s]=[o,r,1]}}t.push(o)},d=function(e,t,o){t.splice(s.indexOf(t,o),1);for(var n=0;n<t.length;n++){var r=t[n],a=i.id(o,r),l=e.pairs[a];l&&(l[2]-=1)}},u=function(e){
var t,o,n=[];t=s.keys(e.pairs);for(var i=0;i<t.length;i++)o=e.pairs[t[i]],o[2]>0?n.push(o):delete e.pairs[t[i]];return n}}()},{"../core/Common":14,"./Detector":5,"./Pair":7}],7:[function(e,t,o){var n={};t.exports=n;var i=e("./Contact");!function(){n.create=function(e,t){var o=e.bodyA,i=e.bodyB,r=e.parentA,s=e.parentB,a={id:n.id(o,i),bodyA:o,bodyB:i,contacts:{},activeContacts:[],separation:0,isActive:!0,isSensor:o.isSensor||i.isSensor,timeCreated:t,timeUpdated:t,inverseMass:r.inverseMass+s.inverseMass,friction:Math.min(r.friction,s.friction),frictionStatic:Math.max(r.frictionStatic,s.frictionStatic),restitution:Math.max(r.restitution,s.restitution),slop:Math.max(r.slop,s.slop)};return n.update(a,e,t),a},n.update=function(e,t,o){var r=e.contacts,s=t.supports,a=e.activeContacts,l=t.parentA,c=t.parentB;if(e.collision=t,e.inverseMass=l.inverseMass+c.inverseMass,e.friction=Math.min(l.friction,c.friction),e.frictionStatic=Math.max(l.frictionStatic,c.frictionStatic),e.restitution=Math.max(l.restitution,c.restitution),
e.slop=Math.max(l.slop,c.slop),a.length=0,t.collided){for(var d=0;d<s.length;d++){var u=s[d],p=i.id(u),f=r[p];f?a.push(f):a.push(r[p]=i.create(u))}e.separation=t.depth,n.setActive(e,!0,o)}else e.isActive===!0&&n.setActive(e,!1,o)},n.setActive=function(e,t,o){t?(e.isActive=!0,e.timeUpdated=o):(e.isActive=!1,e.activeContacts.length=0)},n.id=function(e,t){return e.id<t.id?e.id+"_"+t.id:t.id+"_"+e.id}}()},{"./Contact":4}],8:[function(e,t,o){var n={};t.exports=n;var i=e("./Pair"),r=e("../core/Common");!function(){var e=1e3;n.create=function(e){return r.extend({table:{},list:[],collisionStart:[],collisionActive:[],collisionEnd:[]},e)},n.update=function(e,t,o){var n,s,a,l,c=e.list,d=e.table,u=e.collisionStart,p=e.collisionEnd,f=e.collisionActive,v=[];for(u.length=0,p.length=0,f.length=0,l=0;l<t.length;l++)n=t[l],n.collided&&(s=i.id(n.bodyA,n.bodyB),v.push(s),a=d[s],a?(a.isActive?f.push(a):u.push(a),i.update(a,n,o)):(a=i.create(n,o),d[s]=a,u.push(a),c.push(a)));for(l=0;l<c.length;l++)a=c[l],a.isActive&&-1===r.indexOf(v,a.id)&&(i.setActive(a,!1,o),
p.push(a))},n.removeOld=function(t,o){var n,i,r,s,a=t.list,l=t.table,c=[];for(s=0;s<a.length;s++)n=a[s],i=n.collision,i.bodyA.isSleeping||i.bodyB.isSleeping?n.timeUpdated=o:o-n.timeUpdated>e&&c.push(s);for(s=0;s<c.length;s++)r=c[s]-s,n=a[r],delete l[n.id],a.splice(r,1)},n.clear=function(e){return e.table={},e.list.length=0,e.collisionStart.length=0,e.collisionActive.length=0,e.collisionEnd.length=0,e}}()},{"../core/Common":14,"./Pair":7}],9:[function(e,t,o){var n={};t.exports=n;var i=e("../geometry/Vector"),r=e("./SAT"),s=e("../geometry/Bounds"),a=e("../factory/Bodies"),l=e("../geometry/Vertices");!function(){n.ray=function(e,t,o,n){n=n||1e-100;for(var l=i.angle(t,o),c=i.magnitude(i.sub(t,o)),d=.5*(o.x+t.x),u=.5*(o.y+t.y),p=a.rectangle(d,u,c,n,{angle:l}),f=[],v=0;v<e.length;v++){var m=e[v];if(s.overlaps(m.bounds,p.bounds))for(var y=1===m.parts.length?0:1;y<m.parts.length;y++){var g=m.parts[y];if(s.overlaps(g.bounds,p.bounds)){var x=r.collides(g,p);if(x.collided){x.body=x.bodyA=x.bodyB=m,
f.push(x);break}}}}return f},n.region=function(e,t,o){for(var n=[],i=0;i<e.length;i++){var r=e[i],a=s.overlaps(r.bounds,t);(a&&!o||!a&&o)&&n.push(r)}return n},n.point=function(e,t){for(var o=[],n=0;n<e.length;n++){var i=e[n];if(s.contains(i.bounds,t))for(var r=1===i.parts.length?0:1;r<i.parts.length;r++){var a=i.parts[r];if(s.contains(a.bounds,t)&&l.contains(a.vertices,t)){o.push(i);break}}}return o}}()},{"../factory/Bodies":21,"../geometry/Bounds":24,"../geometry/Vector":26,"../geometry/Vertices":27,"./SAT":11}],10:[function(e,t,o){var n={};t.exports=n;var i=e("../geometry/Vertices"),r=e("../geometry/Vector"),s=e("../core/Common"),a=e("../geometry/Bounds");!function(){n._restingThresh=4,n._restingThreshTangent=6,n._positionDampen=.9,n._positionWarming=.8,n._frictionNormalMultiplier=5,n.preSolvePosition=function(e){var t,o,n;for(t=0;t<e.length;t++)o=e[t],o.isActive&&(n=o.activeContacts.length,o.collision.parentA.totalContacts+=n,o.collision.parentB.totalContacts+=n)},n.solvePosition=function(e,t){
var o,i,s,a,l,c,d,u,p,f=r._temp[0],v=r._temp[1],m=r._temp[2],y=r._temp[3];for(o=0;o<e.length;o++)i=e[o],i.isActive&&!i.isSensor&&(s=i.collision,a=s.parentA,l=s.parentB,c=s.normal,d=r.sub(r.add(l.positionImpulse,l.position,f),r.add(a.positionImpulse,r.sub(l.position,s.penetration,v),m),y),i.separation=r.dot(c,d));for(o=0;o<e.length;o++)i=e[o],!i.isActive||i.isSensor||i.separation<0||(s=i.collision,a=s.parentA,l=s.parentB,c=s.normal,p=(i.separation-i.slop)*t,(a.isStatic||l.isStatic)&&(p*=2),a.isStatic||a.isSleeping||(u=n._positionDampen/a.totalContacts,a.positionImpulse.x+=c.x*p*u,a.positionImpulse.y+=c.y*p*u),l.isStatic||l.isSleeping||(u=n._positionDampen/l.totalContacts,l.positionImpulse.x-=c.x*p*u,l.positionImpulse.y-=c.y*p*u))},n.postSolvePosition=function(e){for(var t=0;t<e.length;t++){var o=e[t];if(o.totalContacts=0,0!==o.positionImpulse.x||0!==o.positionImpulse.y){for(var s=0;s<o.parts.length;s++){var l=o.parts[s];i.translate(l.vertices,o.positionImpulse),a.update(l.bounds,l.vertices,o.velocity),
l.position.x+=o.positionImpulse.x,l.position.y+=o.positionImpulse.y}o.positionPrev.x+=o.positionImpulse.x,o.positionPrev.y+=o.positionImpulse.y,r.dot(o.positionImpulse,o.velocity)<0?(o.positionImpulse.x=0,o.positionImpulse.y=0):(o.positionImpulse.x*=n._positionWarming,o.positionImpulse.y*=n._positionWarming)}}},n.preSolveVelocity=function(e){var t,o,n,i,s,a,l,c,d,u,p,f,v,m,y=r._temp[0],g=r._temp[1];for(t=0;t<e.length;t++)if(n=e[t],n.isActive&&!n.isSensor)for(i=n.activeContacts,s=n.collision,a=s.parentA,l=s.parentB,c=s.normal,d=s.tangent,o=0;o<i.length;o++)u=i[o],p=u.vertex,f=u.normalImpulse,v=u.tangentImpulse,0===f&&0===v||(y.x=c.x*f+d.x*v,y.y=c.y*f+d.y*v,a.isStatic||a.isSleeping||(m=r.sub(p,a.position,g),a.positionPrev.x+=y.x*a.inverseMass,a.positionPrev.y+=y.y*a.inverseMass,a.anglePrev+=r.cross(m,y)*a.inverseInertia),l.isStatic||l.isSleeping||(m=r.sub(p,l.position,g),l.positionPrev.x-=y.x*l.inverseMass,l.positionPrev.y-=y.y*l.inverseMass,l.anglePrev-=r.cross(m,y)*l.inverseInertia))},n.solveVelocity=function(e,t){
for(var o=t*t,i=r._temp[0],a=r._temp[1],l=r._temp[2],c=r._temp[3],d=r._temp[4],u=r._temp[5],p=0;p<e.length;p++){var f=e[p];if(f.isActive&&!f.isSensor){var v=f.collision,m=v.parentA,y=v.parentB,g=v.normal,x=v.tangent,h=f.activeContacts,b=1/h.length;m.velocity.x=m.position.x-m.positionPrev.x,m.velocity.y=m.position.y-m.positionPrev.y,y.velocity.x=y.position.x-y.positionPrev.x,y.velocity.y=y.position.y-y.positionPrev.y,m.angularVelocity=m.angle-m.anglePrev,y.angularVelocity=y.angle-y.anglePrev;for(var w=0;w<h.length;w++){var S=h[w],C=S.vertex,A=r.sub(C,m.position,a),B=r.sub(C,y.position,l),P=r.add(m.velocity,r.mult(r.perp(A),m.angularVelocity),c),M=r.add(y.velocity,r.mult(r.perp(B),y.angularVelocity),d),k=r.sub(P,M,u),I=r.dot(g,k),T=r.dot(x,k),V=Math.abs(T),R=s.sign(T),E=(1+f.restitution)*I,_=s.clamp(f.separation+I,0,1)*n._frictionNormalMultiplier,F=T,O=1/0;V>f.friction*f.frictionStatic*_*o&&(O=V,F=s.clamp(f.friction*R*o,-O,O));var L=r.cross(A,g),q=r.cross(B,g),W=b/(m.inverseMass+y.inverseMass+m.inverseInertia*L*L+y.inverseInertia*q*q);
if(E*=W,F*=W,0>I&&I*I>n._restingThresh*o)S.normalImpulse=0;else{var D=S.normalImpulse;S.normalImpulse=Math.min(S.normalImpulse+E,0),E=S.normalImpulse-D}if(T*T>n._restingThreshTangent*o)S.tangentImpulse=0;else{var N=S.tangentImpulse;S.tangentImpulse=s.clamp(S.tangentImpulse+F,-O,O),F=S.tangentImpulse-N}i.x=g.x*E+x.x*F,i.y=g.y*E+x.y*F,m.isStatic||m.isSleeping||(m.positionPrev.x+=i.x*m.inverseMass,m.positionPrev.y+=i.y*m.inverseMass,m.anglePrev+=r.cross(A,i)*m.inverseInertia),y.isStatic||y.isSleeping||(y.positionPrev.x-=i.x*y.inverseMass,y.positionPrev.y-=i.y*y.inverseMass,y.anglePrev-=r.cross(B,i)*y.inverseInertia)}}}}}()},{"../core/Common":14,"../geometry/Bounds":24,"../geometry/Vector":26,"../geometry/Vertices":27}],11:[function(e,t,o){var n={};t.exports=n;var i=e("../geometry/Vertices"),r=e("../geometry/Vector");!function(){n.collides=function(t,n,s){var a,l,c,d,u=s,p=!1;if(u){var f=t.parent,v=n.parent,m=f.speed*f.speed+f.angularSpeed*f.angularSpeed+v.speed*v.speed+v.angularSpeed*v.angularSpeed;
p=u&&u.collided&&.2>m,d=u}else d={collided:!1,bodyA:t,bodyB:n};if(u&&p){var y=d.axisBody,g=y===t?n:t,x=[y.axes[u.axisNumber]];if(c=e(y.vertices,g.vertices,x),d.reused=!0,c.overlap<=0)return d.collided=!1,d}else{if(a=e(t.vertices,n.vertices,t.axes),a.overlap<=0)return d.collided=!1,d;if(l=e(n.vertices,t.vertices,n.axes),l.overlap<=0)return d.collided=!1,d;a.overlap<l.overlap?(c=a,d.axisBody=t):(c=l,d.axisBody=n),d.axisNumber=c.axisNumber}d.bodyA=t.id<n.id?t:n,d.bodyB=t.id<n.id?n:t,d.collided=!0,d.normal=c.axis,d.depth=c.overlap,d.parentA=d.bodyA.parent,d.parentB=d.bodyB.parent,t=d.bodyA,n=d.bodyB,r.dot(d.normal,r.sub(n.position,t.position))>0&&(d.normal=r.neg(d.normal)),d.tangent=r.perp(d.normal),d.penetration={x:d.normal.x*d.depth,y:d.normal.y*d.depth};var h=o(t,n,d.normal),b=d.supports||[];if(b.length=0,i.contains(t.vertices,h[0])&&b.push(h[0]),i.contains(t.vertices,h[1])&&b.push(h[1]),b.length<2){var w=o(n,t,r.neg(d.normal));i.contains(n.vertices,w[0])&&b.push(w[0]),b.length<2&&i.contains(n.vertices,w[1])&&b.push(w[1]);
}return b.length<1&&(b=[h[0]]),d.supports=b,d};var e=function(e,o,n){for(var i,s,a=r._temp[0],l=r._temp[1],c={overlap:Number.MAX_VALUE},d=0;d<n.length;d++){if(s=n[d],t(a,e,s),t(l,o,s),i=Math.min(a.max-l.min,l.max-a.min),0>=i)return c.overlap=i,c;i<c.overlap&&(c.overlap=i,c.axis=s,c.axisNumber=d)}return c},t=function(e,t,o){for(var n=r.dot(t[0],o),i=n,s=1;s<t.length;s+=1){var a=r.dot(t[s],o);a>i?i=a:n>a&&(n=a)}e.min=n,e.max=i},o=function(e,t,o){for(var n,i,s,a,l=Number.MAX_VALUE,c=r._temp[0],d=t.vertices,u=e.position,p=0;p<d.length;p++)i=d[p],c.x=i.x-u.x,c.y=i.y-u.y,n=-r.dot(o,c),l>n&&(l=n,s=i);var f=s.index-1>=0?s.index-1:d.length-1;i=d[f],c.x=i.x-u.x,c.y=i.y-u.y,l=-r.dot(o,c),a=i;var v=(s.index+1)%d.length;return i=d[v],c.x=i.x-u.x,c.y=i.y-u.y,n=-r.dot(o,c),l>n&&(a=i),[s,a]}}()},{"../geometry/Vector":26,"../geometry/Vertices":27}],12:[function(e,t,o){var n={};t.exports=n;var i=e("../geometry/Vertices"),r=e("../geometry/Vector"),s=e("../core/Sleeping"),a=e("../geometry/Bounds"),l=e("../geometry/Axes"),c=e("../core/Common");
!function(){var e=1e-6,t=.001;n.create=function(t){var o=t;o.bodyA&&!o.pointA&&(o.pointA={x:0,y:0}),o.bodyB&&!o.pointB&&(o.pointB={x:0,y:0});var n=o.bodyA?r.add(o.bodyA.position,o.pointA):o.pointA,i=o.bodyB?r.add(o.bodyB.position,o.pointB):o.pointB,s=r.magnitude(r.sub(n,i));o.length=o.length||s||e;var a={visible:!0,lineWidth:2,strokeStyle:"#666"};return o.render=c.extend(a,o.render),o.id=o.id||c.nextId(),o.label=o.label||"Constraint",o.type="constraint",o.stiffness=o.stiffness||1,o.angularStiffness=o.angularStiffness||0,o.angleA=o.bodyA?o.bodyA.angle:o.angleA,o.angleB=o.bodyB?o.bodyB.angle:o.angleB,o},n.solveAll=function(e,t){for(var o=0;o<e.length;o++)n.solve(e[o],t)},n.solve=function(o,n){var i=o.bodyA,s=o.bodyB,a=o.pointA,l=o.pointB;i&&!i.isStatic&&(o.pointA=r.rotate(a,i.angle-o.angleA),o.angleA=i.angle),s&&!s.isStatic&&(o.pointB=r.rotate(l,s.angle-o.angleB),o.angleB=s.angle);var c=a,d=l;if(i&&(c=r.add(i.position,a)),s&&(d=r.add(s.position,l)),c&&d){var u=r.sub(c,d),p=r.magnitude(u);0===p&&(p=e);
var f=(p-o.length)/p,v=r.div(u,p),m=r.mult(u,.5*f*o.stiffness*n*n);if(!(Math.abs(1-p/o.length)<t*n)){var y,g,x,h,b,w,S,C;i&&!i.isStatic?(x={x:c.x-i.position.x+m.x,y:c.y-i.position.y+m.y},i.velocity.x=i.position.x-i.positionPrev.x,i.velocity.y=i.position.y-i.positionPrev.y,i.angularVelocity=i.angle-i.anglePrev,y=r.add(i.velocity,r.mult(r.perp(x),i.angularVelocity)),b=r.dot(x,v),S=i.inverseMass+i.inverseInertia*b*b):(y={x:0,y:0},S=i?i.inverseMass:0),s&&!s.isStatic?(h={x:d.x-s.position.x-m.x,y:d.y-s.position.y-m.y},s.velocity.x=s.position.x-s.positionPrev.x,s.velocity.y=s.position.y-s.positionPrev.y,s.angularVelocity=s.angle-s.anglePrev,g=r.add(s.velocity,r.mult(r.perp(h),s.angularVelocity)),w=r.dot(h,v),C=s.inverseMass+s.inverseInertia*w*w):(g={x:0,y:0},C=s?s.inverseMass:0);var A=r.sub(g,y),B=r.dot(v,A)/(S+C);B>0&&(B=0);var P,M={x:v.x*B,y:v.y*B};i&&!i.isStatic&&(P=r.cross(x,M)*i.inverseInertia*(1-o.angularStiffness),i.constraintImpulse.x-=m.x,i.constraintImpulse.y-=m.y,i.constraintImpulse.angle+=P,
i.position.x-=m.x,i.position.y-=m.y,i.angle+=P),s&&!s.isStatic&&(P=r.cross(h,M)*s.inverseInertia*(1-o.angularStiffness),s.constraintImpulse.x+=m.x,s.constraintImpulse.y+=m.y,s.constraintImpulse.angle-=P,s.position.x+=m.x,s.position.y+=m.y,s.angle-=P)}}},n.postSolveAll=function(e){for(var t=0;t<e.length;t++){var o=e[t],n=o.constraintImpulse;if(0!==n.x||0!==n.y||0!==n.angle){s.set(o,!1);for(var c=0;c<o.parts.length;c++){var d=o.parts[c];i.translate(d.vertices,n),c>0&&(d.position.x+=n.x,d.position.y+=n.y),0!==n.angle&&(i.rotate(d.vertices,n.angle,o.position),l.rotate(d.axes,n.angle),c>0&&r.rotateAbout(d.position,n.angle,o.position,d.position)),a.update(d.bounds,d.vertices,o.velocity)}n.angle=0,n.x=0,n.y=0}}}}()},{"../core/Common":14,"../core/Sleeping":20,"../geometry/Axes":23,"../geometry/Bounds":24,"../geometry/Vector":26,"../geometry/Vertices":27}],13:[function(e,t,o){var n={};t.exports=n;var i=e("../geometry/Vertices"),r=e("../core/Sleeping"),s=e("../core/Mouse"),a=e("../core/Events"),l=e("../collision/Detector"),c=e("./Constraint"),d=e("../body/Composite"),u=e("../core/Common"),p=e("../geometry/Bounds");
!function(){n.create=function(t,o){var i=(t?t.mouse:null)||(o?o.mouse:null);i||(t&&t.render&&t.render.canvas?i=s.create(t.render.canvas):o&&o.element?i=s.create(o.element):(i=s.create(),u.log("MouseConstraint.create: options.mouse was undefined, options.element was undefined, may not function as expected","warn")));var r=c.create({label:"Mouse Constraint",pointA:i.position,pointB:{x:0,y:0},length:.01,stiffness:.1,angularStiffness:1,render:{strokeStyle:"#90EE90",lineWidth:3}}),l={type:"mouseConstraint",mouse:i,element:null,body:null,constraint:r,collisionFilter:{category:1,mask:4294967295,group:0}},p=u.extend(l,o);return a.on(t,"tick",function(){var o=d.allBodies(t.world);n.update(p,o),e(p)}),p},n.update=function(e,t){var o=e.mouse,n=e.constraint,s=e.body;if(0===o.button){if(n.bodyB)r.set(n.bodyB,!1),n.pointA=o.position;else for(var c=0;c<t.length;c++)if(s=t[c],p.contains(s.bounds,o.position)&&l.canCollide(s.collisionFilter,e.collisionFilter))for(var d=s.parts.length>1?1:0;d<s.parts.length;d++){
var u=s.parts[d];if(i.contains(u.vertices,o.position)){n.pointA=o.position,n.bodyB=e.body=s,n.pointB={x:o.position.x-s.position.x,y:o.position.y-s.position.y},n.angleB=s.angle,r.set(s,!1),a.trigger(e,"startdrag",{mouse:o,body:s});break}}}else n.bodyB=e.body=null,n.pointB=null,s&&a.trigger(e,"enddrag",{mouse:o,body:s})};var e=function(e){var t=e.mouse,o=t.sourceEvents;o.mousemove&&a.trigger(e,"mousemove",{mouse:t}),o.mousedown&&a.trigger(e,"mousedown",{mouse:t}),o.mouseup&&a.trigger(e,"mouseup",{mouse:t}),s.clearSourceEvents(t)}}()},{"../body/Composite":2,"../collision/Detector":5,"../core/Common":14,"../core/Events":16,"../core/Mouse":18,"../core/Sleeping":20,"../geometry/Bounds":24,"../geometry/Vertices":27,"./Constraint":12}],14:[function(e,t,o){var n={};t.exports=n,function(){n._nextId=0,n._seed=0,n.extend=function(e,t){var o,i,r;"boolean"==typeof t?(o=2,r=t):(o=1,r=!0),i=Array.prototype.slice.call(arguments,o);for(var s=0;s<i.length;s++){var a=i[s];if(a)for(var l in a)r&&a[l]&&a[l].constructor===Object?e[l]&&e[l].constructor!==Object?e[l]=a[l]:(e[l]=e[l]||{},
n.extend(e[l],r,a[l])):e[l]=a[l]}return e},n.clone=function(e,t){return n.extend({},t,e)},n.keys=function(e){if(Object.keys)return Object.keys(e);var t=[];for(var o in e)t.push(o);return t},n.values=function(e){var t=[];if(Object.keys){for(var o=Object.keys(e),n=0;n<o.length;n++)t.push(e[o[n]]);return t}for(var i in e)t.push(e[i]);return t},n.shadeColor=function(e,t){var o=parseInt(e.slice(1),16),n=Math.round(2.55*t),i=(o>>16)+n,r=(o>>8&255)+n,s=(255&o)+n;return"#"+(16777216+65536*(255>i?1>i?0:i:255)+256*(255>r?1>r?0:r:255)+(255>s?1>s?0:s:255)).toString(16).slice(1)},n.shuffle=function(e){for(var t=e.length-1;t>0;t--){var o=Math.floor(n.random()*(t+1)),i=e[t];e[t]=e[o],e[o]=i}return e},n.choose=function(e){return e[Math.floor(n.random()*e.length)]},n.isElement=function(e){try{return e instanceof HTMLElement}catch(t){return"object"==typeof e&&1===e.nodeType&&"object"==typeof e.style&&"object"==typeof e.ownerDocument}},n.isArray=function(e){return"[object Array]"===Object.prototype.toString.call(e);
},n.clamp=function(e,t,o){return t>e?t:e>o?o:e},n.sign=function(e){return 0>e?-1:1},n.now=function(){var e=window.performance||{};return e.now=function(){return e.now||e.webkitNow||e.msNow||e.oNow||e.mozNow||function(){return+new Date}}(),e.now()},n.random=function(t,o){return t="undefined"!=typeof t?t:0,o="undefined"!=typeof o?o:1,t+e()*(o-t)},n.colorToNumber=function(e){return e=e.replace("#",""),3==e.length&&(e=e.charAt(0)+e.charAt(0)+e.charAt(1)+e.charAt(1)+e.charAt(2)+e.charAt(2)),parseInt(e,16)},n.log=function(e,t){if(console&&console.log&&console.warn)switch(t){case"warn":console.warn("Matter.js:",e);break;case"error":console.log("Matter.js:",e)}},n.nextId=function(){return n._nextId++},n.indexOf=function(e,t){if(e.indexOf)return e.indexOf(t);for(var o=0;o<e.length;o++)if(e[o]===t)return o;return-1};var e=function(){return n._seed=(9301*n._seed+49297)%233280,n._seed/233280}}()},{}],15:[function(e,t,o){var n={};t.exports=n;var i=e("../body/World"),r=e("./Sleeping"),s=e("../collision/Resolver"),a=e("../render/Render"),l=e("../collision/Pairs"),c=(e("./Metrics"),
e("../collision/Grid")),d=e("./Events"),u=e("../body/Composite"),p=e("../constraint/Constraint"),f=e("./Common"),v=e("../body/Body");!function(){n.create=function(e,t){t=f.isElement(e)?t:e,e=f.isElement(e)?e:null,t=t||{},(e||t.render)&&f.log("Engine.create: engine.render is deprecated (see docs)","warn");var o={positionIterations:6,velocityIterations:4,constraintIterations:2,enableSleeping:!1,events:[],timing:{timestamp:0,timeScale:1},broadphase:{controller:c}},n=f.extend(o,t);if(e||n.render){var r={element:e,controller:a};n.render=f.extend(r,n.render)}return n.render&&n.render.controller&&(n.render=n.render.controller.create(n.render)),n.render&&(n.render.engine=n),n.world=t.world||i.create(n.world),n.pairs=l.create(),n.broadphase=n.broadphase.controller.create(n.broadphase),n.metrics=n.metrics||{extended:!1},n},n.update=function(n,i,a){i=i||1e3/60,a=a||1;var c,f=n.world,v=n.timing,m=n.broadphase,y=[];v.timestamp+=i*v.timeScale;var g={timestamp:v.timestamp};d.trigger(n,"beforeUpdate",g);
var x=u.allBodies(f),h=u.allConstraints(f);for(n.enableSleeping&&r.update(x,v.timeScale),t(x,f.gravity),o(x,i,v.timeScale,a,f.bounds),c=0;c<n.constraintIterations;c++)p.solveAll(h,v.timeScale);p.postSolveAll(x),m.controller?(f.isModified&&m.controller.clear(m),m.controller.update(m,x,n,f.isModified),y=m.pairsList):y=x,f.isModified&&u.setModified(f,!1,!1,!0);var b=m.detector(y,n),w=n.pairs,S=v.timestamp;for(l.update(w,b,S),l.removeOld(w,S),n.enableSleeping&&r.afterCollisions(w.list,v.timeScale),w.collisionStart.length>0&&d.trigger(n,"collisionStart",{pairs:w.collisionStart}),s.preSolvePosition(w.list),c=0;c<n.positionIterations;c++)s.solvePosition(w.list,v.timeScale);for(s.postSolvePosition(x),s.preSolveVelocity(w.list),c=0;c<n.velocityIterations;c++)s.solveVelocity(w.list,v.timeScale);return w.collisionActive.length>0&&d.trigger(n,"collisionActive",{pairs:w.collisionActive}),w.collisionEnd.length>0&&d.trigger(n,"collisionEnd",{pairs:w.collisionEnd}),e(x),d.trigger(n,"afterUpdate",g),n},
n.merge=function(e,t){if(f.extend(e,t),t.world){e.world=t.world,n.clear(e);for(var o=u.allBodies(e.world),i=0;i<o.length;i++){var s=o[i];r.set(s,!1),s.id=f.nextId()}}},n.clear=function(e){var t=e.world;l.clear(e.pairs);var o=e.broadphase;if(o.controller){var n=u.allBodies(t);o.controller.clear(o),o.controller.update(o,n,e,!0)}};var e=function(e){for(var t=0;t<e.length;t++){var o=e[t];o.force.x=0,o.force.y=0,o.torque=0}},t=function(e,t){var o="undefined"!=typeof t.scale?t.scale:.001;if((0!==t.x||0!==t.y)&&0!==o)for(var n=0;n<e.length;n++){var i=e[n];i.isStatic||i.isSleeping||(i.force.y+=i.mass*t.y*o,i.force.x+=i.mass*t.x*o)}},o=function(e,t,o,n,i){for(var r=0;r<e.length;r++){var s=e[r];s.isStatic||s.isSleeping||v.update(s,t,o,n)}}}()},{"../body/Body":1,"../body/Composite":2,"../body/World":3,"../collision/Grid":6,"../collision/Pairs":8,"../collision/Resolver":10,"../constraint/Constraint":12,"../render/Render":29,"./Common":14,"./Events":16,"./Metrics":17,"./Sleeping":20}],16:[function(e,t,o){
var n={};t.exports=n;var i=e("./Common");!function(){n.on=function(e,t,o){for(var n,i=t.split(" "),r=0;r<i.length;r++)n=i[r],e.events=e.events||{},e.events[n]=e.events[n]||[],e.events[n].push(o);return o},n.off=function(e,t,o){if(!t)return void(e.events={});"function"==typeof t&&(o=t,t=i.keys(e.events).join(" "));for(var n=t.split(" "),r=0;r<n.length;r++){var s=e.events[n[r]],a=[];if(o&&s)for(var l=0;l<s.length;l++)s[l]!==o&&a.push(s[l]);e.events[n[r]]=a}},n.trigger=function(e,t,o){var n,r,s,a;if(e.events){o||(o={}),n=t.split(" ");for(var l=0;l<n.length;l++)if(r=n[l],s=e.events[r]){a=i.clone(o,!1),a.name=r,a.source=e;for(var c=0;c<s.length;c++)s[c].apply(e,[a])}}}}()},{"./Common":14}],17:[function(e,t,o){},{"../body/Composite":2,"./Common":14}],18:[function(e,t,o){var n={};t.exports=n;var i=e("../core/Common");!function(){n.create=function(t){var o={};return t||i.log("Mouse.create: element was undefined, defaulting to document.body","warn"),o.element=t||document.body,o.absolute={x:0,y:0
},o.position={x:0,y:0},o.mousedownPosition={x:0,y:0},o.mouseupPosition={x:0,y:0},o.offset={x:0,y:0},o.scale={x:1,y:1},o.wheelDelta=0,o.button=-1,o.pixelRatio=o.element.getAttribute("data-pixel-ratio")||1,o.sourceEvents={mousemove:null,mousedown:null,mouseup:null,mousewheel:null},o.mousemove=function(t){var n=e(t,o.element,o.pixelRatio),i=t.changedTouches;i&&(o.button=0,t.preventDefault()),o.absolute.x=n.x,o.absolute.y=n.y,o.position.x=o.absolute.x*o.scale.x+o.offset.x,o.position.y=o.absolute.y*o.scale.y+o.offset.y,o.sourceEvents.mousemove=t},o.mousedown=function(t){var n=e(t,o.element,o.pixelRatio),i=t.changedTouches;i?(o.button=0,t.preventDefault()):o.button=t.button,o.absolute.x=n.x,o.absolute.y=n.y,o.position.x=o.absolute.x*o.scale.x+o.offset.x,o.position.y=o.absolute.y*o.scale.y+o.offset.y,o.mousedownPosition.x=o.position.x,o.mousedownPosition.y=o.position.y,o.sourceEvents.mousedown=t},o.mouseup=function(t){var n=e(t,o.element,o.pixelRatio),i=t.changedTouches;i&&t.preventDefault(),o.button=-1,
o.absolute.x=n.x,o.absolute.y=n.y,o.position.x=o.absolute.x*o.scale.x+o.offset.x,o.position.y=o.absolute.y*o.scale.y+o.offset.y,o.mouseupPosition.x=o.position.x,o.mouseupPosition.y=o.position.y,o.sourceEvents.mouseup=t},o.mousewheel=function(e){o.wheelDelta=Math.max(-1,Math.min(1,e.wheelDelta||-e.detail)),e.preventDefault()},n.setElement(o,o.element),o},n.setElement=function(e,t){e.element=t,t.addEventListener("mousemove",e.mousemove),t.addEventListener("mousedown",e.mousedown),t.addEventListener("mouseup",e.mouseup),t.addEventListener("mousewheel",e.mousewheel),t.addEventListener("DOMMouseScroll",e.mousewheel),t.addEventListener("touchmove",e.mousemove),t.addEventListener("touchstart",e.mousedown),t.addEventListener("touchend",e.mouseup)},n.clearSourceEvents=function(e){e.sourceEvents.mousemove=null,e.sourceEvents.mousedown=null,e.sourceEvents.mouseup=null,e.sourceEvents.mousewheel=null,e.wheelDelta=0},n.setOffset=function(e,t){e.offset.x=t.x,e.offset.y=t.y,e.position.x=e.absolute.x*e.scale.x+e.offset.x,
e.position.y=e.absolute.y*e.scale.y+e.offset.y},n.setScale=function(e,t){e.scale.x=t.x,e.scale.y=t.y,e.position.x=e.absolute.x*e.scale.x+e.offset.x,e.position.y=e.absolute.y*e.scale.y+e.offset.y};var e=function(e,t,o){var n,i,r=t.getBoundingClientRect(),s=document.documentElement||document.body.parentNode||document.body,a=void 0!==window.pageXOffset?window.pageXOffset:s.scrollLeft,l=void 0!==window.pageYOffset?window.pageYOffset:s.scrollTop,c=e.changedTouches;return c?(n=c[0].pageX-r.left-a,i=c[0].pageY-r.top-l):(n=e.pageX-r.left-a,i=e.pageY-r.top-l),{x:n/(t.clientWidth/t.width*o),y:i/(t.clientHeight/t.height*o)}}}()},{"../core/Common":14}],19:[function(e,t,o){var n={};t.exports=n;var i=e("./Events"),r=e("./Engine"),s=e("./Common");!function(){var e,t;"undefined"!=typeof window&&(e=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||function(e){window.setTimeout(function(){e(s.now())},1e3/60)},t=window.cancelAnimationFrame||window.mozCancelAnimationFrame||window.webkitCancelAnimationFrame||window.msCancelAnimationFrame),
n.create=function(e){var t={fps:60,correction:1,deltaSampleSize:60,counterTimestamp:0,frameCounter:0,deltaHistory:[],timePrev:null,timeScalePrev:1,frameRequestId:null,isFixed:!1,enabled:!0},o=s.extend(t,e);return o.delta=o.delta||1e3/o.fps,o.deltaMin=o.deltaMin||1e3/o.fps,o.deltaMax=o.deltaMax||1e3/(.5*o.fps),o.fps=1e3/o.delta,o},n.run=function(t,o){return"undefined"!=typeof t.positionIterations&&(o=t,t=n.create()),function i(r){t.frameRequestId=e(i),r&&t.enabled&&n.tick(t,o,r)}(),t},n.tick=function(e,t,o){var n,s=t.timing,a=1,l={timestamp:s.timestamp};i.trigger(e,"beforeTick",l),i.trigger(t,"beforeTick",l),e.isFixed?n=e.delta:(n=o-e.timePrev||e.delta,e.timePrev=o,e.deltaHistory.push(n),e.deltaHistory=e.deltaHistory.slice(-e.deltaSampleSize),n=Math.min.apply(null,e.deltaHistory),n=n<e.deltaMin?e.deltaMin:n,n=n>e.deltaMax?e.deltaMax:n,a=n/e.delta,e.delta=n),0!==e.timeScalePrev&&(a*=s.timeScale/e.timeScalePrev),0===s.timeScale&&(a=0),e.timeScalePrev=s.timeScale,e.correction=a,e.frameCounter+=1,
o-e.counterTimestamp>=1e3&&(e.fps=e.frameCounter*((o-e.counterTimestamp)/1e3),e.counterTimestamp=o,e.frameCounter=0),i.trigger(e,"tick",l),i.trigger(t,"tick",l),t.world.isModified&&t.render&&t.render.controller&&t.render.controller.clear&&t.render.controller.clear(t.render),i.trigger(e,"beforeUpdate",l),r.update(t,n,a),i.trigger(e,"afterUpdate",l),t.render&&t.render.controller&&(i.trigger(e,"beforeRender",l),i.trigger(t,"beforeRender",l),t.render.controller.world(t.render),i.trigger(e,"afterRender",l),i.trigger(t,"afterRender",l)),i.trigger(e,"afterTick",l),i.trigger(t,"afterTick",l)},n.stop=function(e){t(e.frameRequestId)},n.start=function(e,t){n.run(e,t)}}()},{"./Common":14,"./Engine":15,"./Events":16}],20:[function(e,t,o){var n={};t.exports=n;var i=e("./Events");!function(){n._motionWakeThreshold=.18,n._motionSleepThreshold=.08,n._minBias=.9,n.update=function(e,t){for(var o=t*t*t,i=0;i<e.length;i++){var r=e[i],s=r.speed*r.speed+r.angularSpeed*r.angularSpeed;if(0===r.force.x&&0===r.force.y){
var a=Math.min(r.motion,s),l=Math.max(r.motion,s);r.motion=n._minBias*a+(1-n._minBias)*l,r.sleepThreshold>0&&r.motion<n._motionSleepThreshold*o?(r.sleepCounter+=1,r.sleepCounter>=r.sleepThreshold&&n.set(r,!0)):r.sleepCounter>0&&(r.sleepCounter-=1)}else n.set(r,!1)}},n.afterCollisions=function(e,t){for(var o=t*t*t,i=0;i<e.length;i++){var r=e[i];if(r.isActive){var s=r.collision,a=s.bodyA.parent,l=s.bodyB.parent;if(!(a.isSleeping&&l.isSleeping||a.isStatic||l.isStatic)&&(a.isSleeping||l.isSleeping)){var c=a.isSleeping&&!a.isStatic?a:l,d=c===a?l:a;!c.isStatic&&d.motion>n._motionWakeThreshold*o&&n.set(c,!1)}}}},n.set=function(e,t){var o=e.isSleeping;t?(e.isSleeping=!0,e.sleepCounter=e.sleepThreshold,e.positionImpulse.x=0,e.positionImpulse.y=0,e.positionPrev.x=e.position.x,e.positionPrev.y=e.position.y,e.anglePrev=e.angle,e.speed=0,e.angularSpeed=0,e.motion=0,o||i.trigger(e,"sleepStart")):(e.isSleeping=!1,e.sleepCounter=0,o&&i.trigger(e,"sleepEnd"))}}()},{"./Events":16}],21:[function(e,t,o){var n={};
t.exports=n;var i=e("../geometry/Vertices"),r=e("../core/Common"),s=e("../body/Body"),a=e("../geometry/Bounds"),l=e("../geometry/Vector");!function(){n.rectangle=function(e,t,o,n,a){a=a||{};var l={label:"Rectangle Body",position:{x:e,y:t},vertices:i.fromPath("L 0 0 L "+o+" 0 L "+o+" "+n+" L 0 "+n)};if(a.chamfer){var c=a.chamfer;l.vertices=i.chamfer(l.vertices,c.radius,c.quality,c.qualityMin,c.qualityMax),delete a.chamfer}return s.create(r.extend({},l,a))},n.trapezoid=function(e,t,o,n,a,l){l=l||{},a*=.5;var c,d=(1-2*a)*o,u=o*a,p=u+d,f=p+u;c=.5>a?"L 0 0 L "+u+" "+-n+" L "+p+" "+-n+" L "+f+" 0":"L 0 0 L "+p+" "+-n+" L "+f+" 0";var v={label:"Trapezoid Body",position:{x:e,y:t},vertices:i.fromPath(c)};if(l.chamfer){var m=l.chamfer;v.vertices=i.chamfer(v.vertices,m.radius,m.quality,m.qualityMin,m.qualityMax),delete l.chamfer}return s.create(r.extend({},v,l))},n.circle=function(e,t,o,i,s){i=i||{};var a={label:"Circle Body",circleRadius:o};s=s||25;var l=Math.ceil(Math.max(10,Math.min(s,o)));return l%2===1&&(l+=1),
n.polygon(e,t,l,o,r.extend({},a,i))},n.polygon=function(e,t,o,a,l){if(l=l||{},3>o)return n.circle(e,t,a,l);for(var c=2*Math.PI/o,d="",u=.5*c,p=0;o>p;p+=1){var f=u+p*c,v=Math.cos(f)*a,m=Math.sin(f)*a;d+="L "+v.toFixed(3)+" "+m.toFixed(3)+" "}var y={label:"Polygon Body",position:{x:e,y:t},vertices:i.fromPath(d)};if(l.chamfer){var g=l.chamfer;y.vertices=i.chamfer(y.vertices,g.radius,g.quality,g.qualityMin,g.qualityMax),delete l.chamfer}return s.create(r.extend({},y,l))},n.fromVertices=function(e,t,o,n,c,d,u){var p,f,v,m,y,g,x,h,b;for(n=n||{},f=[],c="undefined"!=typeof c?c:!1,d="undefined"!=typeof d?d:.01,u="undefined"!=typeof u?u:10,window.decomp||r.log("Bodies.fromVertices: poly-decomp.js required. Could not decompose vertices. Fallback to convex hull.","warn"),r.isArray(o[0])||(o=[o]),h=0;h<o.length;h+=1)if(m=o[h],v=i.isConvex(m),v||!window.decomp)m=v?i.clockwiseSort(m):i.hull(m),f.push({position:{x:e,y:t},vertices:m});else{var w=new decomp.Polygon;for(y=0;y<m.length;y++)w.vertices.push([m[y].x,m[y].y]);
w.makeCCW(),d!==!1&&w.removeCollinearPoints(d);var S=w.quickDecomp();for(y=0;y<S.length;y++){var C=S[y],A=[];for(g=0;g<C.vertices.length;g++)A.push({x:C.vertices[g][0],y:C.vertices[g][1]});u>0&&i.area(A)<u||f.push({position:i.centre(A),vertices:A})}}for(y=0;y<f.length;y++)f[y]=s.create(r.extend(f[y],n));if(c){var B=5;for(y=0;y<f.length;y++){var P=f[y];for(g=y+1;g<f.length;g++){var M=f[g];if(a.overlaps(P.bounds,M.bounds)){var k=P.vertices,I=M.vertices;for(x=0;x<P.vertices.length;x++)for(b=0;b<M.vertices.length;b++){var T=l.magnitudeSquared(l.sub(k[(x+1)%k.length],I[b])),V=l.magnitudeSquared(l.sub(k[x],I[(b+1)%I.length]));B>T&&B>V&&(k[x].isInternal=!0,I[b].isInternal=!0)}}}}}return f.length>1?(p=s.create(r.extend({parts:f.slice(0)},n)),s.setPosition(p,{x:e,y:t}),p):f[0]}}()},{"../body/Body":1,"../core/Common":14,"../geometry/Bounds":24,"../geometry/Vector":26,"../geometry/Vertices":27}],22:[function(e,t,o){var n={};t.exports=n;var i=e("../body/Composite"),r=e("../constraint/Constraint"),s=e("../core/Common"),a=e("../body/Body"),l=e("./Bodies");
!function(){n.stack=function(e,t,o,n,r,s,l){for(var c,d=i.create({label:"Stack"}),u=e,p=t,f=0,v=0;n>v;v++){for(var m=0,y=0;o>y;y++){var g=l(u,p,y,v,c,f);if(g){var x=g.bounds.max.y-g.bounds.min.y,h=g.bounds.max.x-g.bounds.min.x;x>m&&(m=x),a.translate(g,{x:.5*h,y:.5*x}),u=g.bounds.max.x+r,i.addBody(d,g),c=g,f+=1}else u+=r}p+=m+s,u=e}return d},n.chain=function(e,t,o,n,a,l){for(var c=e.bodies,d=1;d<c.length;d++){var u=c[d-1],p=c[d],f=u.bounds.max.y-u.bounds.min.y,v=u.bounds.max.x-u.bounds.min.x,m=p.bounds.max.y-p.bounds.min.y,y=p.bounds.max.x-p.bounds.min.x,g={bodyA:u,pointA:{x:v*t,y:f*o},bodyB:p,pointB:{x:y*n,y:m*a}},x=s.extend(g,l);i.addConstraint(e,r.create(x))}return e.label+=" Chain",e},n.mesh=function(e,t,o,n,a){var l,c,d,u,p,f=e.bodies;for(l=0;o>l;l++){for(c=1;t>c;c++)d=f[c-1+l*t],u=f[c+l*t],i.addConstraint(e,r.create(s.extend({bodyA:d,bodyB:u},a)));if(l>0)for(c=0;t>c;c++)d=f[c+(l-1)*t],u=f[c+l*t],i.addConstraint(e,r.create(s.extend({bodyA:d,bodyB:u},a))),n&&c>0&&(p=f[c-1+(l-1)*t],i.addConstraint(e,r.create(s.extend({
bodyA:p,bodyB:u},a)))),n&&t-1>c&&(p=f[c+1+(l-1)*t],i.addConstraint(e,r.create(s.extend({bodyA:p,bodyB:u},a))))}return e.label+=" Mesh",e},n.pyramid=function(e,t,o,i,r,s,l){return n.stack(e,t,o,i,r,s,function(t,n,s,c,d,u){var p=Math.min(i,Math.ceil(o/2)),f=d?d.bounds.max.x-d.bounds.min.x:0;if(!(c>p)){c=p-c;var v=c,m=o-1-c;if(!(v>s||s>m)){1===u&&a.translate(d,{x:(s+(o%2===1?1:-1))*f,y:0});var y=d?s*f:0;return l(e+y+s*r,n,s,c,d,u)}}})},n.newtonsCradle=function(e,t,o,n,s){for(var a=i.create({label:"Newtons Cradle"}),c=0;o>c;c++){var d=1.9,u=l.circle(e+c*(n*d),t+s,n,{inertia:1/0,restitution:1,friction:0,frictionAir:1e-4,slop:1}),p=r.create({pointA:{x:e+c*(n*d),y:t},bodyB:u});i.addBody(a,u),i.addConstraint(a,p)}return a},n.car=function(e,t,o,n,s){var c=a.nextGroup(!0),d=-20,u=.5*-o+d,p=.5*o-d,f=0,v=i.create({label:"Car"}),m=l.trapezoid(e,t,o,n,.3,{collisionFilter:{group:c},friction:.01,chamfer:{radius:10}}),y=l.circle(e+u,t+f,s,{collisionFilter:{group:c},friction:.8,density:.01}),g=l.circle(e+p,t+f,s,{
collisionFilter:{group:c},friction:.8,density:.01}),x=r.create({bodyA:m,pointA:{x:u,y:f},bodyB:y,stiffness:.2}),h=r.create({bodyA:m,pointA:{x:p,y:f},bodyB:g,stiffness:.2});return i.addBody(v,m),i.addBody(v,y),i.addBody(v,g),i.addConstraint(v,x),i.addConstraint(v,h),v},n.softBody=function(e,t,o,i,r,a,c,d,u,p){u=s.extend({inertia:1/0},u),p=s.extend({stiffness:.4},p);var f=n.stack(e,t,o,i,r,a,function(e,t){return l.circle(e,t,d,u)});return n.mesh(f,o,i,c,p),f.label="Soft Body",f}}()},{"../body/Body":1,"../body/Composite":2,"../constraint/Constraint":12,"../core/Common":14,"./Bodies":21}],23:[function(e,t,o){var n={};t.exports=n;var i=e("../geometry/Vector"),r=e("../core/Common");!function(){n.fromVertices=function(e){for(var t={},o=0;o<e.length;o++){var n=(o+1)%e.length,s=i.normalise({x:e[n].y-e[o].y,y:e[o].x-e[n].x}),a=0===s.y?1/0:s.x/s.y;a=a.toFixed(3).toString(),t[a]=s}return r.values(t)},n.rotate=function(e,t){if(0!==t)for(var o=Math.cos(t),n=Math.sin(t),i=0;i<e.length;i++){var r,s=e[i];
r=s.x*o-s.y*n,s.y=s.x*n+s.y*o,s.x=r}}}()},{"../core/Common":14,"../geometry/Vector":26}],24:[function(e,t,o){var n={};t.exports=n,function(){n.create=function(e){var t={min:{x:0,y:0},max:{x:0,y:0}};return e&&n.update(t,e),t},n.update=function(e,t,o){e.min.x=1/0,e.max.x=-(1/0),e.min.y=1/0,e.max.y=-(1/0);for(var n=0;n<t.length;n++){var i=t[n];i.x>e.max.x&&(e.max.x=i.x),i.x<e.min.x&&(e.min.x=i.x),i.y>e.max.y&&(e.max.y=i.y),i.y<e.min.y&&(e.min.y=i.y)}o&&(o.x>0?e.max.x+=o.x:e.min.x+=o.x,o.y>0?e.max.y+=o.y:e.min.y+=o.y)},n.contains=function(e,t){return t.x>=e.min.x&&t.x<=e.max.x&&t.y>=e.min.y&&t.y<=e.max.y},n.overlaps=function(e,t){return e.min.x<=t.max.x&&e.max.x>=t.min.x&&e.max.y>=t.min.y&&e.min.y<=t.max.y},n.translate=function(e,t){e.min.x+=t.x,e.max.x+=t.x,e.min.y+=t.y,e.max.y+=t.y},n.shift=function(e,t){var o=e.max.x-e.min.x,n=e.max.y-e.min.y;e.min.x=t.x,e.max.x=t.x+o,e.min.y=t.y,e.max.y=t.y+n}}()},{}],25:[function(e,t,o){var n={};t.exports=n;e("../geometry/Bounds");!function(){n.pathToVertices=function(t,o){
var n,i,r,s,a,l,c,d,u,p,f,v,m=[],y=0,g=0,x=0;o=o||15;var h=function(e,t,o){var n=o%2===1&&o>1;if(!u||e!=u.x||t!=u.y){u&&n?(f=u.x,v=u.y):(f=0,v=0);var i={x:f+e,y:v+t};!n&&u||(u=i),m.push(i),g=f+e,x=v+t}},b=function(e){var t=e.pathSegTypeAsLetter.toUpperCase();if("Z"!==t){switch(t){case"M":case"L":case"T":case"C":case"S":case"Q":g=e.x,x=e.y;break;case"H":g=e.x;break;case"V":x=e.y}h(g,x,e.pathSegType)}};for(e(t),r=t.getTotalLength(),l=[],n=0;n<t.pathSegList.numberOfItems;n+=1)l.push(t.pathSegList.getItem(n));for(c=l.concat();r>y;){if(p=t.getPathSegAtLength(y),a=l[p],a!=d){for(;c.length&&c[0]!=a;)b(c.shift());d=a}switch(a.pathSegTypeAsLetter.toUpperCase()){case"C":case"T":case"S":case"Q":case"A":s=t.getPointAtLength(y),h(s.x,s.y,0)}y+=o}for(n=0,i=c.length;i>n;++n)b(c[n]);return m};var e=function(e){for(var t,o,n,i,r,s,a=e.pathSegList,l=0,c=0,d=a.numberOfItems,u=0;d>u;++u){var p=a.getItem(u),f=p.pathSegTypeAsLetter;if(/[MLHVCSQTA]/.test(f))"x"in p&&(l=p.x),"y"in p&&(c=p.y);else switch("x1"in p&&(n=l+p.x1),
"x2"in p&&(r=l+p.x2),"y1"in p&&(i=c+p.y1),"y2"in p&&(s=c+p.y2),"x"in p&&(l+=p.x),"y"in p&&(c+=p.y),f){case"m":a.replaceItem(e.createSVGPathSegMovetoAbs(l,c),u);break;case"l":a.replaceItem(e.createSVGPathSegLinetoAbs(l,c),u);break;case"h":a.replaceItem(e.createSVGPathSegLinetoHorizontalAbs(l),u);break;case"v":a.replaceItem(e.createSVGPathSegLinetoVerticalAbs(c),u);break;case"c":a.replaceItem(e.createSVGPathSegCurvetoCubicAbs(l,c,n,i,r,s),u);break;case"s":a.replaceItem(e.createSVGPathSegCurvetoCubicSmoothAbs(l,c,r,s),u);break;case"q":a.replaceItem(e.createSVGPathSegCurvetoQuadraticAbs(l,c,n,i),u);break;case"t":a.replaceItem(e.createSVGPathSegCurvetoQuadraticSmoothAbs(l,c),u);break;case"a":a.replaceItem(e.createSVGPathSegArcAbs(l,c,p.r1,p.r2,p.angle,p.largeArcFlag,p.sweepFlag),u);break;case"z":case"Z":l=t,c=o}"M"!=f&&"m"!=f||(t=l,o=c)}}}()},{"../geometry/Bounds":24}],26:[function(e,t,o){var n={};t.exports=n,function(){n.create=function(e,t){return{x:e||0,y:t||0}},n.clone=function(e){return{
x:e.x,y:e.y}},n.magnitude=function(e){return Math.sqrt(e.x*e.x+e.y*e.y)},n.magnitudeSquared=function(e){return e.x*e.x+e.y*e.y},n.rotate=function(e,t){var o=Math.cos(t),n=Math.sin(t);return{x:e.x*o-e.y*n,y:e.x*n+e.y*o}},n.rotateAbout=function(e,t,o,n){var i=Math.cos(t),r=Math.sin(t);n||(n={});var s=o.x+((e.x-o.x)*i-(e.y-o.y)*r);return n.y=o.y+((e.x-o.x)*r+(e.y-o.y)*i),n.x=s,n},n.normalise=function(e){var t=n.magnitude(e);return 0===t?{x:0,y:0}:{x:e.x/t,y:e.y/t}},n.dot=function(e,t){return e.x*t.x+e.y*t.y},n.cross=function(e,t){return e.x*t.y-e.y*t.x},n.cross3=function(e,t,o){return(t.x-e.x)*(o.y-e.y)-(t.y-e.y)*(o.x-e.x)},n.add=function(e,t,o){return o||(o={}),o.x=e.x+t.x,o.y=e.y+t.y,o},n.sub=function(e,t,o){return o||(o={}),o.x=e.x-t.x,o.y=e.y-t.y,o},n.mult=function(e,t){return{x:e.x*t,y:e.y*t}},n.div=function(e,t){return{x:e.x/t,y:e.y/t}},n.perp=function(e,t){return t=t===!0?-1:1,{x:t*-e.y,y:t*e.x}},n.neg=function(e){return{x:-e.x,y:-e.y}},n.angle=function(e,t){return Math.atan2(t.y-e.y,t.x-e.x);
},n._temp=[n.create(),n.create(),n.create(),n.create(),n.create(),n.create()]}()},{}],27:[function(e,t,o){var n={};t.exports=n;var i=e("../geometry/Vector"),r=e("../core/Common");!function(){n.create=function(e,t){for(var o=[],n=0;n<e.length;n++){var i=e[n],r={x:i.x,y:i.y,index:n,body:t,isInternal:!1};o.push(r)}return o},n.fromPath=function(e,t){var o=/L?\s*([\-\d\.e]+)[\s,]*([\-\d\.e]+)*/gi,i=[];return e.replace(o,function(e,t,o){i.push({x:parseFloat(t),y:parseFloat(o)})}),n.create(i,t)},n.centre=function(e){for(var t,o,r,s=n.area(e,!0),a={x:0,y:0},l=0;l<e.length;l++)r=(l+1)%e.length,t=i.cross(e[l],e[r]),o=i.mult(i.add(e[l],e[r]),t),a=i.add(a,o);return i.div(a,6*s)},n.mean=function(e){for(var t={x:0,y:0},o=0;o<e.length;o++)t.x+=e[o].x,t.y+=e[o].y;return i.div(t,e.length)},n.area=function(e,t){for(var o=0,n=e.length-1,i=0;i<e.length;i++)o+=(e[n].x-e[i].x)*(e[n].y+e[i].y),n=i;return t?o/2:Math.abs(o)/2},n.inertia=function(e,t){for(var o,n,r=0,s=0,a=e,l=0;l<a.length;l++)n=(l+1)%a.length,o=Math.abs(i.cross(a[n],a[l])),
r+=o*(i.dot(a[n],a[n])+i.dot(a[n],a[l])+i.dot(a[l],a[l])),s+=o;return t/6*(r/s)},n.translate=function(e,t,o){var n;if(o)for(n=0;n<e.length;n++)e[n].x+=t.x*o,e[n].y+=t.y*o;else for(n=0;n<e.length;n++)e[n].x+=t.x,e[n].y+=t.y;return e},n.rotate=function(e,t,o){if(0!==t){for(var n=Math.cos(t),i=Math.sin(t),r=0;r<e.length;r++){var s=e[r],a=s.x-o.x,l=s.y-o.y;s.x=o.x+(a*n-l*i),s.y=o.y+(a*i+l*n)}return e}},n.contains=function(e,t){for(var o=0;o<e.length;o++){var n=e[o],i=e[(o+1)%e.length];if((t.x-n.x)*(i.y-n.y)+(t.y-n.y)*(n.x-i.x)>0)return!1}return!0},n.scale=function(e,t,o,r){if(1===t&&1===o)return e;r=r||n.centre(e);for(var s,a,l=0;l<e.length;l++)s=e[l],a=i.sub(s,r),e[l].x=r.x+a.x*t,e[l].y=r.y+a.y*o;return e},n.chamfer=function(e,t,o,n,s){t=t||[8],t.length||(t=[t]),o="undefined"!=typeof o?o:-1,n=n||2,s=s||14;for(var a=[],l=0;l<e.length;l++){var c=e[l-1>=0?l-1:e.length-1],d=e[l],u=e[(l+1)%e.length],p=t[l<t.length?l:t.length-1];if(0!==p){var f=i.normalise({x:d.y-c.y,y:c.x-d.x}),v=i.normalise({x:u.y-d.y,
y:d.x-u.x}),m=Math.sqrt(2*Math.pow(p,2)),y=i.mult(r.clone(f),p),g=i.normalise(i.mult(i.add(f,v),.5)),x=i.sub(d,i.mult(g,m)),h=o;-1===o&&(h=1.75*Math.pow(p,.32)),h=r.clamp(h,n,s),h%2===1&&(h+=1);for(var b=Math.acos(i.dot(f,v)),w=b/h,S=0;h>S;S++)a.push(i.add(i.rotate(y,w*S),x))}else a.push(d)}return a},n.clockwiseSort=function(e){var t=n.mean(e);return e.sort(function(e,o){return i.angle(t,e)-i.angle(t,o)}),e},n.isConvex=function(e){var t,o,n,i,r=0,s=e.length;if(3>s)return null;for(t=0;s>t;t++)if(o=(t+1)%s,n=(t+2)%s,i=(e[o].x-e[t].x)*(e[n].y-e[o].y),i-=(e[o].y-e[t].y)*(e[n].x-e[o].x),0>i?r|=1:i>0&&(r|=2),3===r)return!1;return 0!==r?!0:null},n.hull=function(e){var t,o,n=[],r=[];for(e=e.slice(0),e.sort(function(e,t){var o=e.x-t.x;return 0!==o?o:e.y-t.y}),o=0;o<e.length;o++){for(t=e[o];r.length>=2&&i.cross3(r[r.length-2],r[r.length-1],t)<=0;)r.pop();r.push(t)}for(o=e.length-1;o>=0;o--){for(t=e[o];n.length>=2&&i.cross3(n[n.length-2],n[n.length-1],t)<=0;)n.pop();n.push(t)}return n.pop(),r.pop(),
n.concat(r)}}()},{"../core/Common":14,"../geometry/Vector":26}],28:[function(e,t,o){var n=t.exports={};n.version="master",n.Body=e("../body/Body"),n.Composite=e("../body/Composite"),n.World=e("../body/World"),n.Contact=e("../collision/Contact"),n.Detector=e("../collision/Detector"),n.Grid=e("../collision/Grid"),n.Pairs=e("../collision/Pairs"),n.Pair=e("../collision/Pair"),n.Query=e("../collision/Query"),n.Resolver=e("../collision/Resolver"),n.SAT=e("../collision/SAT"),n.Constraint=e("../constraint/Constraint"),n.MouseConstraint=e("../constraint/MouseConstraint"),n.Common=e("../core/Common"),n.Engine=e("../core/Engine"),n.Events=e("../core/Events"),n.Mouse=e("../core/Mouse"),n.Runner=e("../core/Runner"),n.Sleeping=e("../core/Sleeping"),n.Bodies=e("../factory/Bodies"),n.Composites=e("../factory/Composites"),n.Axes=e("../geometry/Axes"),n.Bounds=e("../geometry/Bounds"),n.Svg=e("../geometry/Svg"),n.Vector=e("../geometry/Vector"),n.Vertices=e("../geometry/Vertices"),n.Render=e("../render/Render"),
n.RenderPixi=e("../render/RenderPixi"),n.World.add=n.Composite.add,n.World.remove=n.Composite.remove,n.World.addComposite=n.Composite.addComposite,n.World.addBody=n.Composite.addBody,n.World.addConstraint=n.Composite.addConstraint,n.World.clear=n.Composite.clear,n.Engine.run=n.Runner.run},{"../body/Body":1,"../body/Composite":2,"../body/World":3,"../collision/Contact":4,"../collision/Detector":5,"../collision/Grid":6,"../collision/Pair":7,"../collision/Pairs":8,"../collision/Query":9,"../collision/Resolver":10,"../collision/SAT":11,"../constraint/Constraint":12,"../constraint/MouseConstraint":13,"../core/Common":14,"../core/Engine":15,"../core/Events":16,"../core/Metrics":17,"../core/Mouse":18,"../core/Runner":19,"../core/Sleeping":20,"../factory/Bodies":21,"../factory/Composites":22,"../geometry/Axes":23,"../geometry/Bounds":24,"../geometry/Svg":25,"../geometry/Vector":26,"../geometry/Vertices":27,"../render/Render":29,"../render/RenderPixi":30}],29:[function(e,t,o){var n={};t.exports=n;
var i=e("../core/Common"),r=e("../body/Composite"),s=e("../geometry/Bounds"),a=e("../core/Events"),l=e("../collision/Grid"),c=e("../geometry/Vector");!function(){var e,t;"undefined"!=typeof window&&(e=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||function(e){window.setTimeout(function(){e(i.now())},1e3/60)},t=window.cancelAnimationFrame||window.mozCancelAnimationFrame||window.webkitCancelAnimationFrame||window.msCancelAnimationFrame),n.create=function(e){var t={controller:n,engine:null,element:null,canvas:null,mouse:null,frameRequestId:null,options:{width:800,height:600,pixelRatio:1,background:"#fafafa",wireframeBackground:"#222",hasBounds:!!e.bounds,enabled:!0,wireframes:!0,showSleeping:!0,showDebug:!1,showBroadphase:!1,showBounds:!1,showVelocity:!1,showCollisions:!1,showSeparations:!1,showAxes:!1,showPositions:!1,showAngleIndicator:!1,showIds:!1,showShadows:!1,showVertexNumbers:!1,showConvexHulls:!1,showInternalEdges:!1,
showMousePosition:!1}},r=i.extend(t,e);return r.canvas&&(r.canvas.width=r.options.width||r.canvas.width,r.canvas.height=r.options.height||r.canvas.height),r.mouse=e.mouse,r.engine=e.engine,r.canvas=r.canvas||o(r.options.width,r.options.height),r.context=r.canvas.getContext("2d"),r.textures={},r.bounds=r.bounds||{min:{x:0,y:0},max:{x:r.canvas.width,y:r.canvas.height}},1!==r.options.pixelRatio&&n.setPixelRatio(r,r.options.pixelRatio),i.isElement(r.element)?r.element.appendChild(r.canvas):i.log("Render.create: options.element was undefined, render.canvas was created but not appended","warn"),r},n.run=function(t){!function o(i){t.frameRequestId=e(o),n.world(t)}()},n.stop=function(e){t(e.frameRequestId)},n.setPixelRatio=function(e,t){var o=e.options,n=e.canvas;"auto"===t&&(t=d(n)),o.pixelRatio=t,n.setAttribute("data-pixel-ratio",t),n.width=o.width*t,n.height=o.height*t,n.style.width=o.width+"px",n.style.height=o.height+"px",e.context.scale(t,t)},n.world=function(e){var t,o=e.engine,i=o.world,d=e.canvas,u=e.context,f=e.options,v=r.allBodies(i),m=r.allConstraints(i),y=f.wireframes?f.wireframeBackground:f.background,g=[],x=[],h={
timestamp:o.timing.timestamp};if(a.trigger(e,"beforeRender",h),e.currentBackground!==y&&p(e,y),u.globalCompositeOperation="source-in",u.fillStyle="transparent",u.fillRect(0,0,d.width,d.height),u.globalCompositeOperation="source-over",f.hasBounds){var b=e.bounds.max.x-e.bounds.min.x,w=e.bounds.max.y-e.bounds.min.y,S=b/f.width,C=w/f.height;for(t=0;t<v.length;t++){var A=v[t];s.overlaps(A.bounds,e.bounds)&&g.push(A)}for(t=0;t<m.length;t++){var B=m[t],P=B.bodyA,M=B.bodyB,k=B.pointA,I=B.pointB;P&&(k=c.add(P.position,B.pointA)),M&&(I=c.add(M.position,B.pointB)),k&&I&&(s.contains(e.bounds,k)||s.contains(e.bounds,I))&&x.push(B)}u.scale(1/S,1/C),u.translate(-e.bounds.min.x,-e.bounds.min.y)}else x=m,g=v;!f.wireframes||o.enableSleeping&&f.showSleeping?n.bodies(e,g,u):(f.showConvexHulls&&n.bodyConvexHulls(e,g,u),n.bodyWireframes(e,g,u)),f.showBounds&&n.bodyBounds(e,g,u),(f.showAxes||f.showAngleIndicator)&&n.bodyAxes(e,g,u),f.showPositions&&n.bodyPositions(e,g,u),f.showVelocity&&n.bodyVelocity(e,g,u),
f.showIds&&n.bodyIds(e,g,u),f.showSeparations&&n.separations(e,o.pairs.list,u),f.showCollisions&&n.collisions(e,o.pairs.list,u),f.showVertexNumbers&&n.vertexNumbers(e,g,u),f.showMousePosition&&n.mousePosition(e,e.mouse,u),n.constraints(x,u),f.showBroadphase&&o.broadphase.controller===l&&n.grid(e,o.broadphase,u),f.showDebug&&n.debug(e,u),f.hasBounds&&u.setTransform(f.pixelRatio,0,0,f.pixelRatio,0,0),a.trigger(e,"afterRender",h)},n.debug=function(e,t){var o=t,n=e.engine,i=n.world,s=n.metrics,a=e.options,l=(r.allBodies(i),"    ");if(n.timing.timestamp-(e.debugTimestamp||0)>=500){var c="";s.timing&&(c+="fps: "+Math.round(s.timing.fps)+l),e.debugString=c,e.debugTimestamp=n.timing.timestamp}if(e.debugString){o.font="12px Arial",a.wireframes?o.fillStyle="rgba(255,255,255,0.5)":o.fillStyle="rgba(0,0,0,0.5)";for(var d=e.debugString.split("\n"),u=0;u<d.length;u++)o.fillText(d[u],50,50+18*u)}},n.constraints=function(e,t){for(var o=t,n=0;n<e.length;n++){var i=e[n];if(i.render.visible&&i.pointA&&i.pointB){
var r=i.bodyA,s=i.bodyB;r?(o.beginPath(),o.moveTo(r.position.x+i.pointA.x,r.position.y+i.pointA.y)):(o.beginPath(),o.moveTo(i.pointA.x,i.pointA.y)),s?o.lineTo(s.position.x+i.pointB.x,s.position.y+i.pointB.y):o.lineTo(i.pointB.x,i.pointB.y),o.lineWidth=i.render.lineWidth,o.strokeStyle=i.render.strokeStyle,o.stroke()}}},n.bodyShadows=function(e,t,o){for(var n=o,i=(e.engine,0);i<t.length;i++){var r=t[i];if(r.render.visible){if(r.circleRadius)n.beginPath(),n.arc(r.position.x,r.position.y,r.circleRadius,0,2*Math.PI),n.closePath();else{n.beginPath(),n.moveTo(r.vertices[0].x,r.vertices[0].y);for(var s=1;s<r.vertices.length;s++)n.lineTo(r.vertices[s].x,r.vertices[s].y);n.closePath()}var a=r.position.x-.5*e.options.width,l=r.position.y-.2*e.options.height,c=Math.abs(a)+Math.abs(l);n.shadowColor="rgba(0,0,0,0.15)",n.shadowOffsetX=.05*a,n.shadowOffsetY=.05*l,n.shadowBlur=1+12*Math.min(1,c/1e3),n.fill(),n.shadowColor=null,n.shadowOffsetX=null,n.shadowOffsetY=null,n.shadowBlur=null}}},n.bodies=function(e,t,o){
var n,i,r,s,a=o,l=(e.engine,e.options),c=l.showInternalEdges||!l.wireframes;for(r=0;r<t.length;r++)if(n=t[r],n.render.visible)for(s=n.parts.length>1?1:0;s<n.parts.length;s++)if(i=n.parts[s],i.render.visible){if(l.showSleeping&&n.isSleeping?a.globalAlpha=.5*i.render.opacity:1!==i.render.opacity&&(a.globalAlpha=i.render.opacity),i.render.sprite&&i.render.sprite.texture&&!l.wireframes){var d=i.render.sprite,p=u(e,d.texture);a.translate(i.position.x,i.position.y),a.rotate(i.angle),a.drawImage(p,p.width*-d.xOffset*d.xScale,p.height*-d.yOffset*d.yScale,p.width*d.xScale,p.height*d.yScale),a.rotate(-i.angle),a.translate(-i.position.x,-i.position.y)}else{if(i.circleRadius)a.beginPath(),a.arc(i.position.x,i.position.y,i.circleRadius,0,2*Math.PI);else{a.beginPath(),a.moveTo(i.vertices[0].x,i.vertices[0].y);for(var f=1;f<i.vertices.length;f++)!i.vertices[f-1].isInternal||c?a.lineTo(i.vertices[f].x,i.vertices[f].y):a.moveTo(i.vertices[f].x,i.vertices[f].y),i.vertices[f].isInternal&&!c&&a.moveTo(i.vertices[(f+1)%i.vertices.length].x,i.vertices[(f+1)%i.vertices.length].y);
a.lineTo(i.vertices[0].x,i.vertices[0].y),a.closePath()}l.wireframes?(a.lineWidth=1,a.strokeStyle="#bbb"):(a.fillStyle=i.render.fillStyle,a.lineWidth=i.render.lineWidth,a.strokeStyle=i.render.strokeStyle,a.fill()),a.stroke()}a.globalAlpha=1}},n.bodyWireframes=function(e,t,o){var n,i,r,s,a,l=o,c=e.options.showInternalEdges;for(l.beginPath(),r=0;r<t.length;r++)if(n=t[r],n.render.visible)for(a=n.parts.length>1?1:0;a<n.parts.length;a++){for(i=n.parts[a],l.moveTo(i.vertices[0].x,i.vertices[0].y),s=1;s<i.vertices.length;s++)!i.vertices[s-1].isInternal||c?l.lineTo(i.vertices[s].x,i.vertices[s].y):l.moveTo(i.vertices[s].x,i.vertices[s].y),i.vertices[s].isInternal&&!c&&l.moveTo(i.vertices[(s+1)%i.vertices.length].x,i.vertices[(s+1)%i.vertices.length].y);l.lineTo(i.vertices[0].x,i.vertices[0].y)}l.lineWidth=1,l.strokeStyle="#bbb",l.stroke()},n.bodyConvexHulls=function(e,t,o){var n,i,r,s=o;for(s.beginPath(),i=0;i<t.length;i++)if(n=t[i],n.render.visible&&1!==n.parts.length){for(s.moveTo(n.vertices[0].x,n.vertices[0].y),
r=1;r<n.vertices.length;r++)s.lineTo(n.vertices[r].x,n.vertices[r].y);s.lineTo(n.vertices[0].x,n.vertices[0].y)}s.lineWidth=1,s.strokeStyle="rgba(255,255,255,0.2)",s.stroke()},n.vertexNumbers=function(e,t,o){var n,i,r,s=o;for(n=0;n<t.length;n++){var a=t[n].parts;for(r=a.length>1?1:0;r<a.length;r++){var l=a[r];for(i=0;i<l.vertices.length;i++)s.fillStyle="rgba(255,255,255,0.2)",s.fillText(n+"_"+i,l.position.x+.8*(l.vertices[i].x-l.position.x),l.position.y+.8*(l.vertices[i].y-l.position.y))}}},n.mousePosition=function(e,t,o){var n=o;n.fillStyle="rgba(255,255,255,0.8)",n.fillText(t.position.x+"  "+t.position.y,t.position.x+5,t.position.y-5)},n.bodyBounds=function(e,t,o){var n=o,i=(e.engine,e.options);n.beginPath();for(var r=0;r<t.length;r++){var s=t[r];if(s.render.visible)for(var a=t[r].parts,l=a.length>1?1:0;l<a.length;l++){var c=a[l];n.rect(c.bounds.min.x,c.bounds.min.y,c.bounds.max.x-c.bounds.min.x,c.bounds.max.y-c.bounds.min.y)}}i.wireframes?n.strokeStyle="rgba(255,255,255,0.08)":n.strokeStyle="rgba(0,0,0,0.1)",
n.lineWidth=1,n.stroke()},n.bodyAxes=function(e,t,o){var n,i,r,s,a=o,l=(e.engine,e.options);for(a.beginPath(),i=0;i<t.length;i++){var c=t[i],d=c.parts;if(c.render.visible)if(l.showAxes)for(r=d.length>1?1:0;r<d.length;r++)for(n=d[r],s=0;s<n.axes.length;s++){var u=n.axes[s];a.moveTo(n.position.x,n.position.y),a.lineTo(n.position.x+20*u.x,n.position.y+20*u.y)}else for(r=d.length>1?1:0;r<d.length;r++)for(n=d[r],s=0;s<n.axes.length;s++)a.moveTo(n.position.x,n.position.y),a.lineTo((n.vertices[0].x+n.vertices[n.vertices.length-1].x)/2,(n.vertices[0].y+n.vertices[n.vertices.length-1].y)/2)}l.wireframes?a.strokeStyle="indianred":(a.strokeStyle="rgba(0,0,0,0.8)",a.globalCompositeOperation="overlay"),a.lineWidth=1,a.stroke(),a.globalCompositeOperation="source-over"},n.bodyPositions=function(e,t,o){var n,i,r,s,a=o,l=(e.engine,e.options);for(a.beginPath(),r=0;r<t.length;r++)if(n=t[r],n.render.visible)for(s=0;s<n.parts.length;s++)i=n.parts[s],a.arc(i.position.x,i.position.y,3,0,2*Math.PI,!1),a.closePath();
for(l.wireframes?a.fillStyle="indianred":a.fillStyle="rgba(0,0,0,0.5)",a.fill(),a.beginPath(),r=0;r<t.length;r++)n=t[r],n.render.visible&&(a.arc(n.positionPrev.x,n.positionPrev.y,2,0,2*Math.PI,!1),a.closePath());a.fillStyle="rgba(255,165,0,0.8)",a.fill()},n.bodyVelocity=function(e,t,o){var n=o;n.beginPath();for(var i=0;i<t.length;i++){var r=t[i];r.render.visible&&(n.moveTo(r.position.x,r.position.y),n.lineTo(r.position.x+2*(r.position.x-r.positionPrev.x),r.position.y+2*(r.position.y-r.positionPrev.y)))}n.lineWidth=3,n.strokeStyle="cornflowerblue",n.stroke()},n.bodyIds=function(e,t,o){var n,i,r=o;for(n=0;n<t.length;n++)if(t[n].render.visible){var s=t[n].parts;for(i=s.length>1?1:0;i<s.length;i++){var a=s[i];r.font="12px Arial",r.fillStyle="rgba(255,255,255,0.5)",r.fillText(a.id,a.position.x+10,a.position.y-10)}}},n.collisions=function(e,t,o){var n,i,r,s,a=o,l=e.options;for(a.beginPath(),r=0;r<t.length;r++)if(n=t[r],n.isActive)for(i=n.collision,s=0;s<n.activeContacts.length;s++){var c=n.activeContacts[s],d=c.vertex;
a.rect(d.x-1.5,d.y-1.5,3.5,3.5)}for(l.wireframes?a.fillStyle="rgba(255,255,255,0.7)":a.fillStyle="orange",a.fill(),a.beginPath(),r=0;r<t.length;r++)if(n=t[r],n.isActive&&(i=n.collision,n.activeContacts.length>0)){var u=n.activeContacts[0].vertex.x,p=n.activeContacts[0].vertex.y;2===n.activeContacts.length&&(u=(n.activeContacts[0].vertex.x+n.activeContacts[1].vertex.x)/2,p=(n.activeContacts[0].vertex.y+n.activeContacts[1].vertex.y)/2),i.bodyB===i.supports[0].body||i.bodyA.isStatic===!0?a.moveTo(u-8*i.normal.x,p-8*i.normal.y):a.moveTo(u+8*i.normal.x,p+8*i.normal.y),a.lineTo(u,p)}l.wireframes?a.strokeStyle="rgba(255,165,0,0.7)":a.strokeStyle="orange",a.lineWidth=1,a.stroke()},n.separations=function(e,t,o){var n,i,r,s,a,l=o,c=e.options;for(l.beginPath(),a=0;a<t.length;a++)if(n=t[a],n.isActive){i=n.collision,r=i.bodyA,s=i.bodyB;var d=1;s.isStatic||r.isStatic||(d=.5),s.isStatic&&(d=0),l.moveTo(s.position.x,s.position.y),l.lineTo(s.position.x-i.penetration.x*d,s.position.y-i.penetration.y*d),d=1,
s.isStatic||r.isStatic||(d=.5),r.isStatic&&(d=0),l.moveTo(r.position.x,r.position.y),l.lineTo(r.position.x+i.penetration.x*d,r.position.y+i.penetration.y*d)}c.wireframes?l.strokeStyle="rgba(255,165,0,0.5)":l.strokeStyle="orange",l.stroke()},n.grid=function(e,t,o){var n=o,r=e.options;r.wireframes?n.strokeStyle="rgba(255,180,0,0.1)":n.strokeStyle="rgba(255,180,0,0.5)",n.beginPath();for(var s=i.keys(t.buckets),a=0;a<s.length;a++){var l=s[a];if(!(t.buckets[l].length<2)){var c=l.split(",");n.rect(.5+parseInt(c[0],10)*t.bucketWidth,.5+parseInt(c[1],10)*t.bucketHeight,t.bucketWidth,t.bucketHeight)}}n.lineWidth=1,n.stroke()},n.inspector=function(e,t){var o,n=(e.engine,e.selected),i=e.render,r=i.options;if(r.hasBounds){var s=i.bounds.max.x-i.bounds.min.x,a=i.bounds.max.y-i.bounds.min.y,l=s/i.options.width,c=a/i.options.height;t.scale(1/l,1/c),t.translate(-i.bounds.min.x,-i.bounds.min.y)}for(var d=0;d<n.length;d++){var u=n[d].data;switch(t.translate(.5,.5),t.lineWidth=1,t.strokeStyle="rgba(255,165,0,0.9)",
t.setLineDash([1,2]),u.type){case"body":o=u.bounds,t.beginPath(),t.rect(Math.floor(o.min.x-3),Math.floor(o.min.y-3),Math.floor(o.max.x-o.min.x+6),Math.floor(o.max.y-o.min.y+6)),t.closePath(),t.stroke();break;case"constraint":var p=u.pointA;u.bodyA&&(p=u.pointB),t.beginPath(),t.arc(p.x,p.y,10,0,2*Math.PI),t.closePath(),t.stroke()}t.setLineDash([]),t.translate(-.5,-.5)}null!==e.selectStart&&(t.translate(.5,.5),t.lineWidth=1,t.strokeStyle="rgba(255,165,0,0.6)",t.fillStyle="rgba(255,165,0,0.1)",o=e.selectBounds,t.beginPath(),t.rect(Math.floor(o.min.x),Math.floor(o.min.y),Math.floor(o.max.x-o.min.x),Math.floor(o.max.y-o.min.y)),t.closePath(),t.stroke(),t.fill(),t.translate(-.5,-.5)),r.hasBounds&&t.setTransform(1,0,0,1,0,0)};var o=function(e,t){var o=document.createElement("canvas");return o.width=e,o.height=t,o.oncontextmenu=function(){return!1},o.onselectstart=function(){return!1},o},d=function(e){var t=e.getContext("2d"),o=window.devicePixelRatio||1,n=t.webkitBackingStorePixelRatio||t.mozBackingStorePixelRatio||t.msBackingStorePixelRatio||t.oBackingStorePixelRatio||t.backingStorePixelRatio||1;
return o/n},u=function(e,t){var o=e.textures[t];return o?o:(o=e.textures[t]=new Image,o.src=t,o)},p=function(e,t){var o=t;/(jpg|gif|png)$/.test(t)&&(o="url("+t+")"),e.canvas.style.background=o,e.canvas.style.backgroundSize="contain",e.currentBackground=t}}()},{"../body/Composite":2,"../collision/Grid":6,"../core/Common":14,"../core/Events":16,"../geometry/Bounds":24,"../geometry/Vector":26}],30:[function(e,t,o){var n={};t.exports=n;var i=e("../body/Composite"),r=e("../core/Common");!function(){var e,t;"undefined"!=typeof window&&(e=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||function(e){window.setTimeout(function(){e(r.now())},1e3/60)},t=window.cancelAnimationFrame||window.mozCancelAnimationFrame||window.webkitCancelAnimationFrame||window.msCancelAnimationFrame),n.create=function(e){r.log("RenderPixi.create: Matter.RenderPixi is deprecated (see docs)","warn");var t={controller:n,engine:null,element:null,
frameRequestId:null,canvas:null,renderer:null,container:null,spriteContainer:null,pixiOptions:null,options:{width:800,height:600,background:"#fafafa",wireframeBackground:"#222",hasBounds:!1,enabled:!0,wireframes:!0,showSleeping:!0,showDebug:!1,showBroadphase:!1,showBounds:!1,showVelocity:!1,showCollisions:!1,showAxes:!1,showPositions:!1,showAngleIndicator:!1,showIds:!1,showShadows:!1}},o=r.extend(t,e),i=!o.options.wireframes&&"transparent"===o.options.background;return o.pixiOptions=o.pixiOptions||{view:o.canvas,transparent:i,antialias:!0,backgroundColor:e.background},o.mouse=e.mouse,o.engine=e.engine,o.renderer=o.renderer||new PIXI.WebGLRenderer(o.options.width,o.options.height,o.pixiOptions),o.container=o.container||new PIXI.Container,o.spriteContainer=o.spriteContainer||new PIXI.Container,o.canvas=o.canvas||o.renderer.view,o.bounds=o.bounds||{min:{x:0,y:0},max:{x:o.options.width,y:o.options.height}},o.textures={},o.sprites={},o.primitives={},o.container.addChild(o.spriteContainer),r.isElement(o.element)?o.element.appendChild(o.canvas):r.log('No "render.element" passed, "render.canvas" was not inserted into document.',"warn"),
o.canvas.oncontextmenu=function(){return!1},o.canvas.onselectstart=function(){return!1},o},n.run=function(t){!function o(i){t.frameRequestId=e(o),n.world(t)}()},n.stop=function(e){t(e.frameRequestId)},n.clear=function(e){for(var t=e.container,o=e.spriteContainer;t.children[0];)t.removeChild(t.children[0]);for(;o.children[0];)o.removeChild(o.children[0]);var n=e.sprites["bg-0"];e.textures={},e.sprites={},e.primitives={},e.sprites["bg-0"]=n,n&&t.addChildAt(n,0),e.container.addChild(e.spriteContainer),e.currentBackground=null,t.scale.set(1,1),t.position.set(0,0)},n.setBackground=function(e,t){if(e.currentBackground!==t){var o=t.indexOf&&-1!==t.indexOf("#"),n=e.sprites["bg-0"];if(o){var i=r.colorToNumber(t);e.renderer.backgroundColor=i,n&&e.container.removeChild(n)}else if(!n){var s=a(e,t);n=e.sprites["bg-0"]=new PIXI.Sprite(s),n.position.x=0,n.position.y=0,e.container.addChildAt(n,0)}e.currentBackground=t}},n.world=function(e){var t,o=e.engine,r=o.world,s=e.renderer,a=e.container,l=e.options,c=i.allBodies(r),d=i.allConstraints(r),u=[];
l.wireframes?n.setBackground(e,l.wireframeBackground):n.setBackground(e,l.background);var p=e.bounds.max.x-e.bounds.min.x,f=e.bounds.max.y-e.bounds.min.y,v=p/e.options.width,m=f/e.options.height;if(l.hasBounds){for(t=0;t<c.length;t++){var y=c[t];y.render.sprite.visible=Bounds.overlaps(y.bounds,e.bounds)}for(t=0;t<d.length;t++){var g=d[t],x=g.bodyA,h=g.bodyB,b=g.pointA,w=g.pointB;x&&(b=Vector.add(x.position,g.pointA)),h&&(w=Vector.add(h.position,g.pointB)),b&&w&&(Bounds.contains(e.bounds,b)||Bounds.contains(e.bounds,w))&&u.push(g)}a.scale.set(1/v,1/m),a.position.set(-e.bounds.min.x*(1/v),-e.bounds.min.y*(1/m))}else u=d;for(t=0;t<c.length;t++)n.body(e,c[t]);for(t=0;t<u.length;t++)n.constraint(e,u[t]);s.render(a)},n.constraint=function(e,t){var o=(e.engine,t.bodyA),n=t.bodyB,i=t.pointA,s=t.pointB,a=e.container,l=t.render,c="c-"+t.id,d=e.primitives[c];return d||(d=e.primitives[c]=new PIXI.Graphics),l.visible&&t.pointA&&t.pointB?(-1===r.indexOf(a.children,d)&&a.addChild(d),d.clear(),d.beginFill(0,0),
d.lineStyle(l.lineWidth,r.colorToNumber(l.strokeStyle),1),o?d.moveTo(o.position.x+i.x,o.position.y+i.y):d.moveTo(i.x,i.y),n?d.lineTo(n.position.x+s.x,n.position.y+s.y):d.lineTo(s.x,s.y),void d.endFill()):void d.clear()},n.body=function(e,t){var n=(e.engine,t.render);if(n.visible)if(n.sprite&&n.sprite.texture){var i="b-"+t.id,a=e.sprites[i],l=e.spriteContainer;a||(a=e.sprites[i]=o(e,t)),-1===r.indexOf(l.children,a)&&l.addChild(a),a.position.x=t.position.x,a.position.y=t.position.y,a.rotation=t.angle,a.scale.x=n.sprite.xScale||1,a.scale.y=n.sprite.yScale||1}else{var c="b-"+t.id,d=e.primitives[c],u=e.container;d||(d=e.primitives[c]=s(e,t),d.initialAngle=t.angle),-1===r.indexOf(u.children,d)&&u.addChild(d),d.position.x=t.position.x,d.position.y=t.position.y,d.rotation=t.angle-d.initialAngle}};var o=function(e,t){var o=t.render,n=o.sprite.texture,i=a(e,n),r=new PIXI.Sprite(i);return r.anchor.x=t.render.sprite.xOffset,r.anchor.y=t.render.sprite.yOffset,r},s=function(e,t){var o,n=t.render,i=e.options,s=new PIXI.Graphics,a=r.colorToNumber(n.fillStyle),l=r.colorToNumber(n.strokeStyle),c=r.colorToNumber(n.strokeStyle),d=r.colorToNumber("#bbb"),u=r.colorToNumber("#CD5C5C");
s.clear();for(var p=t.parts.length>1?1:0;p<t.parts.length;p++){o=t.parts[p],i.wireframes?(s.beginFill(0,0),s.lineStyle(1,d,1)):(s.beginFill(a,1),s.lineStyle(n.lineWidth,l,1)),s.moveTo(o.vertices[0].x-t.position.x,o.vertices[0].y-t.position.y);for(var f=1;f<o.vertices.length;f++)s.lineTo(o.vertices[f].x-t.position.x,o.vertices[f].y-t.position.y);s.lineTo(o.vertices[0].x-t.position.x,o.vertices[0].y-t.position.y),s.endFill(),(i.showAngleIndicator||i.showAxes)&&(s.beginFill(0,0),i.wireframes?s.lineStyle(1,u,1):s.lineStyle(1,c),s.moveTo(o.position.x-t.position.x,o.position.y-t.position.y),s.lineTo((o.vertices[0].x+o.vertices[o.vertices.length-1].x)/2-t.position.x,(o.vertices[0].y+o.vertices[o.vertices.length-1].y)/2-t.position.y),s.endFill())}return s},a=function(e,t){var o=e.textures[t];return o||(o=e.textures[t]=PIXI.Texture.fromImage(t)),o}}()},{"../body/Composite":2,"../core/Common":14}]},{},[28])(28)});








