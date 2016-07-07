var tunnels = [];
var maxTunnels = 60;
var sizeSlider;
var strokeSlider;

var sizeLabel;
var strokeLabel;

function setup() {
  createCanvas(1280, 720);
  
  sizeLabel = createSpan('Size:');
  sizeLabel.position(10, 10);
  sizeSlider = createSlider(50, 300, 200);
  sizeSlider.position(100, 10);
  
  strokeLabel = createSpan('Stroke:');
  strokeLabel.position(10, 50);
  strokeSlider = createSlider(1, 30, 2);
  strokeSlider.position(100, 50);
  
}

function draw() {
	
	background(255);
	
	tunnels.push(new Tunnel(mouseX, mouseY, sizeSlider.value(), strokeSlider.value()));
	
	if (tunnels.length >= maxTunnels) {
		tunnels.splice(0, 1);
		
	}

	//Draw all tunnels
	for (i = 0; i < tunnels.length; i++) {
		tunnels[i].render();
		
	}
  
}