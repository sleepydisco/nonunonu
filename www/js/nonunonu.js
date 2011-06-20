function NNCell(value) {
	this.value = value;	
	this.toggle = function() {
		if (this.value === 0) {
			this.value = 1;
		} else {
			this.value = 0;
		}
	}
	return true;
}

function NNCellFactory() {
 	this.createCellFrom = function(value) {
		return new NNCell(value)			
	}
	this.getValueFrom = function(cell) {
		return cell.value;
	}
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

	this.turnOn = function(x, y) {
		if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
			var drawable = this.getDrawableGrid();
			var cell = drawable[y][x];
			cell.value = 1;
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
}

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
		
		var encoded = this.gridEncoder.encode(data, {
			getValueFrom: function(value) {
				return value;
			}
		});
		
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

function initGame() {
	NNGame.prototype = new NNGrid();
	gGame = new NNGame();
	var data = [
	[0,0,1,1,1,1,0,0],
	[0,1,0,0,0,0,1,0],
	[1,0,0,0,0,0,0,1],
	[1,0,1,0,0,1,0,1],
	[1,0,0,0,0,0,0,1],
	[0,1,0,0,0,0,1,0],
	[0,0,1,0,0,1,0,0],
	[0,0,0,1,1,0,0,0]
	];
	gGame.initGridFromArray(data);
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
  var parent = e.target.parentElement;
  return e.pageX - parent.offsetLeft + parent.scrollLeft;  
}

function getCellY(e) {
  var parent = e.target.parentElement;
  return e.pageY - parent.offsetTop + parent.scrollTop;  
}

function mouseDown(e) {
	// Start tracking mouse
	window.onmousemove = mouseMoved;
	window.onmouseup = function() {
		gView.drawGrid(gGame);	
		window.onmousemove = null;
		window.onmouseup = null;
	}
	var x = gView.getCellX(getCellX(e));
	var y = gView.getCellY(getCellY(e));		
	gGame.toggleCell(x, y);
}

function mouseMoved(e) {
	var x = gView.getCellX(getCellX(e));
	var y = gView.getCellY(getCellY(e));		
	gGame.turnOn(x, y);
	gView.drawGrid(gGame);
}

function initEditor() {
	NNGridEditor.prototype = new NNGrid();
	gGame = new NNGridEditor();
	gGame.initGrid(32,32);
	
	var cfg = new NNViewConfig();
	cfg.pxCellWidth = 16;
	cfg.pxCellHeight = 16;
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
				
	$('nonunonu_grid').onmousedown = mouseDown;
}
		
window.addEvent('domready', function() { 
    //initGame();
    initEditor();    
    $('nonunonu_grid').onselectstart = function() {
      $('nonunonu_grid').style.cursor = 'pointer';
      return false;
    }
    $('nonunonu_grid').onmouseup = function() {
      $('nonunonu_grid').style.cursor = 'pointer';
      return false;
    }
});