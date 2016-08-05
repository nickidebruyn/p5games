function InputField(posX, posY, labelStr, value) {
	
	this.fieldLabel = createSpan(labelStr);
	this.fieldLabel.position(posX, posY);
	this.fieldLabel.style("color", "white");
	
	this.fieldInput = createInput(value);
	this.fieldInput.position(posX + 100, posY);
	
	this.getValue = function() {
		return this.fieldInput.value();
	}
}

function TileButton(sizeWidth, sizeHeight, labelStr) {
	this.tileButton = createButton(labelStr);
	this.tileButton.size(sizeWidth, sizeHeight);
	// this.tileButton.position(posX, posY);
	this.tileButton.addClass("large-tile");
	this.tileButton.addClass("hvr-grow-shadow");
	
	this.centerAt = function(xOffSet, yOffSet) {
		this.tileButton.position((width/2) - (this.tileButton.width/2) + xOffSet,
		(height/2) - (this.tileButton.height/2) + yOffSet
		);
	}
	
	this.addTouchDownListener = function(touchListener) {
		this.tileButton.mousePressed(touchListener);
	}
	
	this.addTouchUpListener = function(touchListener) {
		this.tileButton.mouseReleased(touchListener);
	}
}