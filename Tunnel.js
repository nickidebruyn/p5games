function Tunnel(x, y, s, strSize) {
	var xPos = x;
	var yPos = y;
	var scaleVal = 1;
	var size = s;
	var velocity = 0.03;
	var strokeSize = strSize;
	
	this.render = function() {
		push();
		ellipseMode(CENTER);
		noFill();
		strokeWeight(strokeSize*scaleVal);
		stroke(255*(1-scaleVal), 0, 255*scaleVal);
		ellipse(xPos, yPos, size*scaleVal, size*scaleVal);
		// rect(xPos, yPos, size*scaleVal, size*scaleVal, 30);
		pop();
		
		scaleVal = scaleVal - velocity;
		if (scaleVal < velocity) {
			scaleVal = velocity;
			
		}
	}
}