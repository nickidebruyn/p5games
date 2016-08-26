function Level(font) {
	this.player = null;
	this.font = font;
	this.levelString = "Ludum           Dare         36          Prepare            your           battle        stations             Get          ready           for        a          stressful         time" +
	"         See            how        good            you     can                  be      in                48              hour         jam";
	this.floorHeight = 80;
	this.obstacles = [];
	this.obstacleAddCounter = 1;
	this.obstacleAddRate = 3;
	this.obstacleIndex = 0;
	this.score = 0;
	this.collision = true;

	this.start = function(player) {
		this.player = player;
		this.collision = false;
		this.obstacleAddCounter = frameCount + this.obstacleAddRate;

	}

	this.update = function() {
		// console.log("frame: " + this.obstacles.length);

		if (!this.collision) {
			//Check if we can add the next obstacle and then add it
			if (frameCount == this.obstacleAddCounter) {
				this.obstacleAddCounter = frameCount + this.obstacleAddRate;

				//Add the next obstacle
				var charStr = this.levelString.charAt(this.obstacleIndex);
				if (charStr != " ") {
					this.obstacles.push(new Obstacle(width + 100, height - this.floorHeight, charStr, this.font));

				}

				this.obstacleIndex++;
				this.score++;

			}

			//Check if the obstacles are still alive if not remove
			for (var i = this.obstacles.length - 1; i >= 0; i--) {
				// console.log("dead: " + this.obstacles[i].isDead());
				if (this.obstacles[i].isDead()) {
					this.obstacles.splice(i, 1);
				}

			}


			//Update the obstacles
			for (var i = 0; i < this.obstacles.length; i++) {
				this.obstacles[i].update();
				var d = int(dist(this.obstacles[i].getPosX(), this.obstacles[i].getPosY(), this.player.getPosX(), this.player.getPosY()));
				if (d <= 50) {
					this.collision = true;

				}
				//console.log("distance=" + d);

			}
		}

	}


	this.render = function() {


		//Render the obstacles
		for (var i = 0; i < this.obstacles.length; i++) {
			this.obstacles[i].render();
		}


		stroke(10);
		strokeWeight(2);
		fill(127, 140, 141);
		rect(width / 2, height, width + 10, (this.floorHeight * 2));


	}

	this.getScore = function() {
		return this.score;
	}

	this.hasCollision = function() {
		return this.collision;
	}

}