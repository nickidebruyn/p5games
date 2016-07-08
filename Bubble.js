function Bubble(xPos, yPos, size) {
	this.xPos = xPos;
	this.yPos = yPos;
	this.size = size;
	this.vel = createVector(random(-10, 10) * 0.002, -random(1, 5));
	
	this.update = function() {
		this.xPos += this.vel.x;
		this.yPos += this.vel.y;
		
	}
	
 	this.render = function() {
 		push();
 		fill(69, 103, 137, 128);
 		stroke(69, 103, 157, 128);
 		strokeWeight(4);
 		ellipse(this.xPos, this.yPos, this.size, this.size);
 		pop();
 		
 	}
	
	this.isDead = function() {
		return this.yPos < -this.size;
	}
}