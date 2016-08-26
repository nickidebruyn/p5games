var labelFont;
var player;
var level;

var highScore = 0;
var score = 0;

var startButton;
var info;
var gameOver = true;

function preload() {
	labelFont = loadFont("font/Vinegar Stroke.ttf");
}

function setup() {
	createCanvas(720, 480);

	startButton = createButton("Start Game");
	startButton.size(300, 60);
	startButton.addClass("hvr-grow-shadow");
	startButton.position(width / 2 - 150, height / 2);
	startButton.mousePressed(startGame);
	
	info = createSpan("Click left mouse to jump.");
	info.addClass("info");
	info.position(width / 2 - 100, height / 2+100);

}

function startGame() {
	level = new Level(labelFont);
	player = new Player(level);
	
	score = 0;
	gameOver = false;
	level.start(player);
	startButton.hide();
	info.hide();
}

function draw() {
	background(41, 128, 185, 180);

	angleMode(DEGREES);
	rectMode(CENTER);

	if (!gameOver) {
		level.update();
		player.update();

		level.render();
		player.render();

		score = level.getScore();

		if (level.hasCollision()) {
			gameOver = true;
			startButton.show();
			info.show();
			
			if (level.getScore() > highScore) {
				highScore = level.getScore();	
			}
			

		}
	}

	fill(255);
	stroke(143, 56, 118);
	strokeWeight(3);
	textFont(labelFont);
	textStyle(BOLD);
	textSize(34);

	textAlign(RIGHT);
	text("Highscore: " + highScore, 230, 40);

	textAlign(LEFT);
	text("Score: " + score, width - 180, 40);

}

function mousePressed() {
	if (!gameOver && score > 2) {
		player.jump();		
	}

}