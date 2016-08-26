function Player(level) {
	this.level = level;
	this.playerSize = 50;
	this.posX = width / 2;
	this.posY = height - this.level.floorHeight-this.playerSize*0.5;
	this.jumpVelocity = 0;
	this.maxJumpVelocity = 18;
	this.onGround = true;
	this.rotationSpeed = 5;
	this.angle = 0;
	this.targetAngle = 0;

	this.update = function() {

		this.posY = this.posY - this.jumpVelocity;

		if (!this.onGround) {
			this.jumpVelocity = this.jumpVelocity - 1;
			this.angle = this.angle + this.rotationSpeed;
			
			if (this.angle >= this.targetAngle) {
				this.angle = this.targetAngle;
				
			}

			if ((this.posY-this.playerSize) >= (height-this.level.floorHeight-this.playerSize*1.5)) {
				this.jumpVelocity = 0;
				this.onGround = true;
			}
		}


	}

	this.render = function() {
		push();
		fill(243, 156, 18);
		stroke(10);
		strokeWeight(2);
		translate(this.posX, this.posY);
		rotate(this.angle);
		
		//Body
		rect(0, 0, this.playerSize, this.playerSize);
		
		//Eyes
		stroke(10);
		strokeWeight(2);
		fill(0, 255, 0);
		rect(12, -14, 10, 10);
		rect(-12, -14, 10, 10);
		
		rect(0, 10, 30, 10);
		
		pop();
	}

	this.jump = function() {
		if (this.onGround) {
			this.targetAngle += 180;
			this.onGround = false;
			this.jumpVelocity = this.maxJumpVelocity;
		}

	}

	this.getPosX = function() {
		return this.posX;
	}
	
	this.getPosY = function() {
		return this.posY;
	}

}