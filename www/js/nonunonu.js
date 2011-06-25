function NNCell(value) {
	this.value = value;	
	this.toggle = function() {
		if (this.value === 0) {
			this.value = 1;
		} else {
			this.value = 0;
		}
	}
	this.set = function(newValue) {
	  this.value = newValue;
	}
	return true;
}

function NNCellFactory() {
 	this.createCellFrom = function(value) {
 	  console.log("Creating cell from: " + value);
		return new NNCell(value)			
	}
	this.getValueFrom = function(cell) {
		return cell.value;
	}
  this.emptyCell = function() {
	  return new NNCell(0);
	}	
	this.bitLength = 4;
	return true;
}

NNCellFactory.prototype = new CellFactory();

function NNGrid() {
	this.width = 0;
	this.height = 0;
	this.grid = [[]];
	this.gridEncoder = new GridEncoder(new NNCellFactory());

	this.getDrawableGrid = function() {
		return this.grid;
	}

	this.resetGrid = function(_grid) {
		_grid.splice(0, _grid.length);
		for (var i = 0; i < this.height; i++) {
			_grid[i] = [];
			for (var j = 0; j < this.width; j++) {
				_grid[i][j] = new NNCell(0);
			}
		}
	}
	
	this.initGrid = function(width, height) {
		this.width = width;
		this.height = height;
		this.resetGrid(this.grid);
	}
	
	this.initDimensions = function() {
		this.width = this.grid[0].length;
		this.height = this.grid.length;
	}
	
	this.toggleCell = function(x, y) {
		if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
			var drawable = this.getDrawableGrid();
			var cell = drawable[y][x];
			cell.toggle();
		} else {
			// console.log("Can't toggle cell for: (x,y: " + x + "," + y + ")");
		}
	}
	
	this.checkState = function() {
		return true;
	}
}

function NNGridEditor() {

	this.setCellValue = function(x, y, value) {
		if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
			var drawable = this.getDrawableGrid();
			var cell = drawable[y][x];
			cell.value = value;
		} else {
			// console.log("Can't toggle cell for: (x,y: " + x + "," + y + ")");
		}
	}

	this.addRow = function() {
		var newRow = [];
		for (; newRow.length < this.width ;) {
			newRow.push(new NNCell(0));
		}
		this.grid.push(newRow);
		this.height = this.height + 1;
	}
	
	this.removeRow = function() {	
		this.height = this.height - 1;
		this.grid.pop();
	}

	this.addColumn = function() {
		this.width = this.width + 1;
		for (var i = 0; i < this.grid.length; i++) {
			this.grid[i].push(new NNCell(0));
		}
	}
	
	this.removeColumn = function() {
		this.width = this.width - 1;
		for (var i = 0; i < this.grid.length; i++) {
			this.grid[i].pop();
		}
	}
	
	this.clear = function() {
		var confirmed = window.confirm("Really clear?");
		if (confirmed) {
			this.resetGrid(this.grid);
		}
	}
	
	this.encodedValue = function() {
	  return this.gridEncoder.encode(this.grid);
	}
}

function ArrayCellFactory() {
	this.getValueFrom = function(cell) {
		return cell;
	}
	return true;
}

ArrayCellFactory.prototype = new NNCellFactory();

function NNGame() {
	this.percentageComplete = 0.0;
	this.selected = [];

	this.getDrawableGrid = function() {
		return this.selected;
	}

	this.initSelected = function() {
		this.selected.splice(0, this.selected.length);
		this.resetGrid(this.selected);
	}
	
	this.initGrid = function(data, width, height) {
		this.grid = this.gridEncoder.decode(data, width, height);
		this.initDimensions();			
	}

	this.initGridFromArray = function(data) {
		var height = data.length;
		var width = data[0].length;
		
		var encoded = this.gridEncoder.encode(data, new ArrayCellFactory());
		
		this.initGrid(encoded, width, height);
	}
	
	this.checkState = function() {				
		var selectable = 0;
		var correct = 0;
		for (var i = 0; i < this.height; i++) {
			for (var j = 0; j < this.width; j++) {
				if (this.grid[i][j].value == 1) {
					selectable = selectable + 1;
					if (this.selected[i][j].value) {
						correct = correct + 1;
					}
				} else {
					if (this.selected[i][j].value) {
						correct = correct - 1;
					}
				}
			}
		}
		if (correct > 0 && selectable > 0) {
			this.percentageComplete = correct / selectable;
		} else {
			this.percentageComplete = 0.0;
		}
		if (selectable === correct) {
			alert("Win!");
		}
	}

	return true;
}

function NNViewConfig() {
	this.pxCellWidth = 16;
	this.pxCellHeight = 16;
	this.pxFontWidth = 8;
	this.pxFontHeight = 10;
}

function NNViewState() {
	this.gridX = 0;
	this.gridY = 0;
	this.pxGridWidth = 0;
	this.pxGridHeight = 0;
	this.pxDigitsWidth = 0;
	this.pxDigitsHeight = 0;
}

function NNGridView(el, cfg) {
	this.el = el;
	
	this.cfg = cfg;
	this.state = new NNViewState();
	
	this.setViewState = function(width, height) {
		this.state.pxGridWidth = width * this.cfg.pxCellWidth;
		this.state.pxGridHeight = height * this.cfg.pxCellHeight;
	
		this.state.pxDigitsWidth = Math.ceil(width / 2) * this.cfg.pxFontWidth;
		this.state.pxDigitsHeight = Math.ceil(height / 2) * this.cfg.pxFontHeight;
			
		/* These are used in click event to determine cell location */
		this.state.gridX = this.state.pxDigitsWidth;
		this.state.gridY = this.state.pxDigitsHeight;

		/* Set the size of the element - needed? */
		this.el.width = this.state.pxGridWidth + (this.state.pxDigitsWidth * 2);
		this.el.height = this.state.pxGridHeight + (this.state.pxDigitsHeight * 2);
	}
		
	this.drawGridLines = function(context) {
		/* vertical lines */
		for (var x = this.state.gridX + this.cfg.pxCellWidth; x < this.state.pxGridWidth + this.state.gridX; x += this.cfg.pxCellWidth) {
			context.moveTo(0.5 + x, this.state.gridY);
			context.lineTo(0.5 + x, this.state.pxGridHeight + this.state.gridY);
		}
		/* horizontal lines */
		for (var y = this.cfg.pxCellHeight; y < this.state.pxGridHeight; y += this.cfg.pxCellHeight) {
			context.moveTo(this.state.gridX, 0.5 + y + this.state.gridY);
			context.lineTo(this.state.pxGridWidth + this.state.gridX, 0.5 + y + this.state.gridY);
		}
		/* draw it! */
		context.strokeStyle = "#ddd";
		context.stroke();
	}
		
	this.drawSelectedPixels = function(context, grid) {
		/* draw 'pixels' */
		context.fillStyle = "#333";
		for (var i = 0; i < grid.length; i++) {
			var row = grid[i];
			var y = i * this.cfg.pxCellHeight + this.state.gridY;
	
			for (var j = 0; j < row.length; j++) {
				var x = j * this.cfg.pxCellWidth + this.state.gridX;
				var cell = grid[i][j];
				if (cell == undefined) {
					alert(i +" " +j);
				}
				if (cell.value == 1) {
					context.fillRect(x + 1, y + 1, this.cfg.pxCellWidth - 1, this.cfg.pxCellHeight - 1);        
				}      
			}
		}
	}

	this.drawNumbers = function(context, grid) {
		/* Set up font */
		context.font = "normal 10px sans-serif";
		context.textBaseline = "top";
		context.fillStyle = "#333";
		
		/* Draw numbers left/right of the grid */
		var rows = this.getRowData(grid);
		for (var i = 0; i < rows.length; i++) {
			var y = i * this.cfg.pxCellHeight + this.state.pxDigitsHeight;
			for (var j = 0; j < rows[i].length; j++) {
				var x1 = this.state.pxDigitsWidth - (this.cfg.pxFontWidth * rows[i].length) + (this.cfg.pxFontWidth * j);
				context.fillText(rows[i][j], x1, y);	
				var x2 = this.state.pxGridWidth + this.state.pxDigitsWidth + (this.cfg.pxFontWidth * j);
				context.fillText(rows[i][j], x2, y);	
			}
		}
	
		/* Draw numbers top/bottom of the grid */
		var cols = this.getColData(grid);
		for (var i = 0; i < cols.length; i++) {
			var x = this.state.pxDigitsWidth + (this.cfg.pxCellWidth * i) + 5;		
			for (var j = 0; j < cols[i].length; j++) {
				var y1 = this.state.pxDigitsHeight - (this.cfg.pxFontHeight * cols[i].length) + (this.cfg.pxFontHeight * j);
				context.fillText(cols[i][j], x, y1);	
				var y2 = this.state.pxDigitsHeight + (j * this.cfg.pxFontHeight) + this.state.pxGridHeight;
				context.fillText(cols[i][j], x, y2);	
			}
		}	
	}
		
	this.getRowData = function(grid) {
		var rowData = [];
		for (var i = 0; i < grid.length; i++) {
			var row = grid[i];
			rowData[i] = [];	
			var count = 0;		
			for (var j = 0; j < row.length; j++) {			
				var cell = grid[i][j];
				if (cell.value === 1) {
					count = count + 1;
				}
				if (cell.value === 0) {
					if (count > 0) {
						rowData[i].push(count);
						count = 0;
					}
				}
			}
			if (count > 0) {
				rowData[i].push(count);
			}
		}
		return rowData;
	}

	this.getColData = function(grid) {
		var colData = [];
		for (var i = 0; i < grid[0].length; i++) {
			colData[i]= [];
			var count = 0;		
			for (var j = 0; j < grid.length; j++) {			
				var cell = grid[j][i];
				if (cell.value === 1) {
					count = count + 1;
				}
				if (cell.value === 0) {
					if (count > 0) {
						colData[i].push(count);
						count = 0;
					}
				}
			}
			if (count > 0) {
				colData[i].push(count);
			}
		}
		return colData;
	}
	
	this.drawGrid = function(game) {	
		var context = el.getContext("2d");	
		context.clearRect(0, 0, this.el.width, this.el.height);
		this.drawGridLines(context);
		this.drawSelectedPixels(context, game.getDrawableGrid());
		this.drawNumbers(context, game.grid);
	}
	
	this.getCellX = function(x) {
		return Math.floor((x - this.state.gridX) / this.cfg.pxCellWidth);
	}

	this.getCellY = function(y) {
		return Math.floor((y - this.state.gridY) / this.cfg.pxCellHeight);
	}
}

/*   */

var gGame;
var gView;

function invader() {
  var data = "0000000000000001000000000000000000000000000000101000000000000000000000000000000100000000000000000000000000000111110000000000000000000000000010000010000000000000000000000001010001010000000000000000000000101010101010000000000000000000011010101010110000000000000000001010011011001010000000000000000010010000000100100000000000000000110011111110011000000000000000010010000000001001000000000000001010010000000100101000000000000101000100000001000101000000000010101001000000010010101000000001010100010010100100010101000000101010100100111001001010101000010101001001000100010010010101001000100010010000000100100010001010001000100011111110001000100010100100001000000000000010000100100110000010000000000000100000110000000000010000000000010000000000000000000011111111111000000000000000000000000000000000000000000000000000001111000111100000000000000000000000000000000000000000000000000000111100011110000000000000000000001111000111100000000000000000001111110001111110000000000000000101111100011111010000000000000001111111000111111100000000";
  return data;
}

function bear() {
  var data = "000011111000011111000010000010010000010010000001010000001001000000111000000101000000000000000011000000000000000001100000000000000000110011000001100000011010110001011000001101111010111100000110011001001100000011000001010000000001100000000000000000110000000000000000011000000000010000001100100000001001000110010000000100100011001000000010010001011000000000110000101000000000000000010100000011000000010010000001100000010001010101010101010000011111000111110000";
  return data;
}

function initGame() {
	NNGame.prototype = new NNGrid();
	gGame = new NNGame();
  
  //   var data = [
  //     [0,1,0,1,0],
  //     [1,0,1,0,1],
  //     [0,1,0,1,0],
  //     [0,0,1,0,0]
  //   ];
  // gGame.initGridFromArray(data);

  // gGame.initGrid(invader(), 32, 32);
  gGame.initGrid(bear(), 19, 24);
	
	gGame.initSelected();
	
	var cfg = new NNViewConfig();
	cfg.pxCellWidth = 16;
	cfg.pxCellHeight = 16;
	cfg.pxFontWidth = 8;
	cfg.pxFontHeight = 10;		
	
	gView = new NNGridView($('nonunonu_grid'), cfg);
	/* Set the initial state of the view */
	gView.setViewState(gGame.width, gGame.height);
	gView.drawGrid(gGame);
	
	//var gCtrl = new NNControl(game, view);
	$('nonunonu_grid').onclick = onClick;
	
}

function initEditor() {
	NNGridEditor.prototype = new NNGrid();
	gGame = new NNGridEditor();
	gGame.initGrid(32,32);
	
	var cfg = new NNViewConfig();
	cfg.pxCellWidth = 12;
	cfg.pxCellHeight = 12;
	cfg.pxFontWidth = 8;
	cfg.pxFontHeight = 12;		
	
	gView = new NNGridView($('nonunonu_grid'), cfg);
	/* Set the initial state of the view */
	gView.setViewState(gGame.width, gGame.height);
	gView.drawGrid(gGame);

	$('add_row').addEvent('click', addRow);
	$('add_col').addEvent('click', addColumn);
	$('remove_row').addEvent('click', removeRow);
	$('remove_col').addEvent('click', removeColumn);
	$('clear').addEvent('click', clearAll);
	$('save').addEvent('click', saveGrid);
				
	$('nonunonu_grid').addEvent('mousedown', gridOnMouseDown);
}

function addRow(e) {
	e.stop();
	gGame.addRow();
	gView.setViewState(gGame.width, gGame.height);
	gView.drawGrid(gGame);
}

function removeRow(e) {
	e.stop();
	gGame.removeRow();
	gView.setViewState(gGame.width, gGame.height);
	gView.drawGrid(gGame);
}

function addColumn(e) {
	e.stop();
	gGame.addColumn();
	gView.setViewState(gGame.width, gGame.height);
	gView.drawGrid(gGame);
}

function removeColumn(e) {
	e.stop();
	gGame.removeColumn();
	gView.setViewState(gGame.width, gGame.height);
	gView.drawGrid(gGame);
}

function clearAll(e) {
	e.stop();
	gGame.clear();
	gView.drawGrid(gGame);
}

function saveGrid(e) {
	var data = gGame.gridEncoder.encode(gGame.grid);
	window.alert(data);
}

function onClick(e) {
	var x = gView.getCellX(e.offsetX);
	var y = gView.getCellY(e.offsetY);	
	gGame.toggleCell(x, y);	
	gView.drawGrid(gGame);
	gGame.checkState();
}

function getCellX(e) {
  var parent = $('nonunonu_grid').getParent();
  return e.page.x - parent.offsetLeft + parent.scrollLeft;  
}

function getCellY(e) {
  var parent = $('nonunonu_grid').getParent();
  return e.page.y - parent.offsetTop + parent.scrollTop;  
}

function startTrackingMouseMovements() {
	window.addEvent('mousemove', gridOnMouseMoved);
	window.addEvent('mouseup', gridOnMouseUp);
}

function stopTrackingMouseMovements() {
  window.removeEvent('mousemove', gridOnMouseMoved);
  window.removeEvent('mouseup', gridOnMouseUp);
}

var StateChange = {
  TOGGLE : 0,
  ON : 1,
  OFF : -1
}

function updateCellFromState(e, state) {
  var parent = $('nonunonu_grid').getParent();
  var posX = e.page.x - parent.offsetLeft + parent.scrollLeft;  
  var posY = e.page.y - parent.offsetTop + parent.scrollTop;  
	var cellX = gView.getCellX(posX);
	var cellY = gView.getCellY(posY);
	if (cellX < 0 || cellY < 0) {
	  return false;
	}
	switch (state) {
	  case StateChange.TOGGLE: 
	    gGame.toggleCell(cellX, cellY);
	    break;
	  case StateChange.ON:
  	  gGame.setCellValue(cellX, cellY, 1);
	    break;
	  case StateChange.OFF:
	    gGame.setCellValue(cellX, cellY, 0);
	    break;  
	}
	return true;
}

function gridOnMouseDown(e) {
	startTrackingMouseMovements();
  updateCellFromState(e, StateChange.TOGGLE);
}

function gridOnMouseMoved(e) {
  updateCellFromState(e, e.shift?StateChange.OFF:StateChange.ON);
	gView.drawGrid(gGame);
}

function gridOnMouseUp(e) {
	gView.drawGrid(gGame);
	
	$('encoded_value').set('text', gGame.encodedValue());
		
  stopTrackingMouseMovements();
}


		
function setPointerCursor() {
  $('nonunonu_grid').style.cursor = 'pointer';
  return false;
}		
		
window.addEvent('domready', function() { 
    initGame();
    // initEditor();    
    $('nonunonu_grid').addEvent('selectstart', setPointerCursor);
});

/*
Grid:
{
	id:			'unique identifier',
	creator_user_id:	'who created it', // reference 
	title: 			'name of grid',
	credits:		'some info about the image',
	width:			'width',
	height:			'height',
	data:			'grid data encoded',
	encoding:		'grid encoder version',
	palatte:		'colour palatte for the grid'
	
	1bit:  1 color            1 on, 0 off
	2bits: 3 colors           1-3 on, 0 off
	4bits: 7 colors           1-7 on, 0 off
	
	palattes of 1, 2, 7, 15 colors
	
	
	
}
*/
