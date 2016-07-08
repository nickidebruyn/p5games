var bubbles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  
}

function draw() {
	background(18, 52, 86);
	
	//Random placement of bubbles
	if (random(1) < 0.05) {
		bubbles.push(new Bubble(random(0, width), height, random(50, 100)));
	}
	
	for (var i=0; i<bubbles.length; i++) {
		bubbles[i].update();
		bubbles[i].render();
		
	}
	
	//Check if bubbles can be remove
	for (var i=bubbles.length-1; i>=0; i--) {
		
		if (bubbles[i].isDead()) {
			bubbles.splice(i, 1);
			
		}
		
	}
	
	console.log("bubble count = " + bubbles.length);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}