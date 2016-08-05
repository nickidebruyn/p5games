var bubbles = [];

var addTileButton;
var tileTextField;
var tileWidthField;
var tileHeightField;
var tileXPosField;
var tileYPosField;

var selectedTile;
var tiles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  
	tileTextField = new InputField(20, 20, "Tile Text:", "Tile");
	tileWidthField = new InputField(20, 40, "Tile Width", "200");
	tileHeightField = new InputField(20, 60, "Tile Height", "200");
	
	tileXPosField = new InputField(20, 80, "Tile X Pos", "0");
	tileYPosField = new InputField(20, 100, "Tile Y Pos", "0");

	addTileButton = createButton("Add");
	addTileButton.position(20, 120);
	addTileButton.mousePressed(addNewTile);

}

function draw() {
	background(18, 52, 86);
	
	//Random placement of bubbles
	if (random(1) < 0.01) {
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
	
	if (selectedTile != null) {
		// console.log("width: " + );
		selectedTile.position(mouseX - selectedTile.width / 2, mouseY - selectedTile.height / 2);

	}
	
	// console.log("bubble count = " + bubbles.length);
}

function addNewTile() {
	var tile = new TileButton(tileWidthField.getValue(), 
	tileHeightField.getValue(), tileTextField.getValue());
	tile.centerAt(0, 0);
	tile.addTouchDownListener(selectTile);
	tile.addTouchUpListener(unselectTile);
	tiles.push(tile);
	
}

function selectTile() {
	selectedTile = this;
}

function unselectTile() {
	selectedTile = null;

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}