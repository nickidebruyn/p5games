var labelFont;
var player;
var level;

var highScore = 0;
var score = 0;

var startButton;
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

}

function startGame() {
	level = new Level(labelFont);
	player = new Player(level);
	
	gameOver = false;
	level.start(player);
	startButton.hide();
}

function draw() {
	background(41, 128, 185, 80);

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
			
			if (level.getScore() > highScore) {
				highScore = level.getScore();	
			}
			

		}
	}

	fill(255);
	stroke(243, 156, 218);
	strokeWeight(3);
	textFont(labelFont);
	textStyle(BOLD);
	textSize(34);

	textAlign(RIGHT);
	text("Highscore: " + highScore, 220, 40);

	textAlign(LEFT);
	text("Score: " + score, width - 180, 40);

}

function mousePressed() {
	if (!gameOver) {
		player.jump();		
	}

}