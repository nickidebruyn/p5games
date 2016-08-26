function Obstacle(xPos, yPos, val, font) {
	this.font = font;
	this.val = val;
	this.size = 56;
	this.speed = 10;
	this.startX = xPos;
	this.startY = yPos-this.size/2;
	this.posX = this.startX;
	this.posY = this.startY;
	this.c = color(231, random(0, 255), random(0, 255));
	this.scl = random(0, 20);
	
	this.update = function() {
		this.posX -= this.speed;

	}
	
	this.render = function() {
		push();
		fill(this.c);
		stroke(1);
		strokeWeight(3);
		translate(this.posX, this.posY);
		// triangle(-this.size*0.5, this.size*0.5, this.size*0.5, this.size*0.5, 0, -this.size*0.5);
		// rect(0, 0, this.size, this.size);
		textFont(this.font);
		//textAlign(LEFT, BOTTOM)
		textStyle(BOLD);
		textSize(60);
		text(this.val, 0, 5, this.size, this.size);
		pop();

	}
	
	this.isDead = function() {
		// console.log("pos = " + this.posX);
		return this.posX < 0;
	}
	
	this.getPosX = function() {
		return this.posX;
	}
	
	this.getPosY = function() {
		return this.posY;
	}
}