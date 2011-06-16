function CellFactory() {
	this.createCellFrom = function(value) {
		return new Cell(value)			
	}
	this.getValueFrom = function(cell) {
		return cell.value;
	}
	return true;
}

function GridEncoder(cellFactory) {
	this.cellFactory = cellFactory;
	
	this.decode = function(data, w, h, fcty) {
		if (fcty == undefined) {
			fcty = this.cellFactory;
		}
		var grid = [[]];
		var len = w * h;
		var row = grid[0];
  	for (i = 0; i < data.length; i++) {
			// Get the next encoded character
			var charCode = data.charCodeAt(i);
			// Iterate the bits of the encoding
			for (j = 0; j < 16 && len-- > 0; j++) {
				if (row.length == w) {
					row = [];
					grid.push(row);
				}
				// Read the least-significant bit as cell value
				var cellValue = (charCode & 0x01 == 1) ? 1 : 0;
				row.push(cellFactory.createCellFrom(cellValue));
				charCode >>= 1;
			}  
		}
		for (i = grid.length - 1; i < h; i ++) {
			if (i === grid.length) {
				row = [];
				grid.push(row);
			}
			row = grid[i];
			for (; row.length < w; ) {
				row.push(cellFactory.createCellFrom(0));		
			}
		}
		return grid;
	}	
	
	this.encode = function encode(grid, fcty) {
		if (fcty == undefined) {
			fcty = this.cellFactory;
		}
		var data = '';
		var buf = [];
		var str = '';
		for (var i = 0; i < grid.length; i++) {
			var row = grid[i];
			for (var j = 0; j < row.length; j++) {
				var cell = row[j];
				var value = fcty.getValueFrom(cell);
				buf.push(value);  
				if (buf.length == 16) {
					data += this.encodeCharCode(buf);
					buf = [];
				}
			}
		}  
		if (buf.length > 0) {
			data += this.encodeCharCode(buf);
		}
		return data;
	}
	
	this.encodeCharCode = function encodeCharCode(bits) {
		var charCode = 0;
		for (var i = bits.length - 1; i >= 0; i--) {
			charCode <<= 1;
			charCode |= bits[i];
		}
		return String.fromCharCode(charCode)
	}
	
	return true;
}

/**
function decodeGameData(data, grid, w, h, cellFactory) {
  if (!grid) {
    grid = [[]];
  }
  
  // Linear length of grid
  var len = w * h;
  
  var row = grid[0];
  
  for (i = 0; i < data.length; i++) {
    // Get the next encoded character
    var charCode = data.charCodeAt(i);
    
    // Iterate the bits of the encoding
    for (j = 0; j < 16 && len-- > 0; j++) {
        
      // Initialize row if needed
      if (row.length == w) {
        row = [];
        grid.push(row);
      }

      // Read the least-significant bit as cell value
      var cellValue = (charCode & 0x01 == 1) ? 1 : 0;
      row.push(cellFactory.createCellFrom(cellValue));
      
      charCode >>= 1;
    }  
  }

	console.log("Rows (Y):" + grid.length);
	console.log("Row length (X): " + row.length);

	// alertGrid(grid);

	for (i = grid.length - 1; i < h; i ++) {
		if (i === grid.length) {
			row = [];
			grid.push(row);
		}
		row = grid[i];
		
		for (; row.length < w; ) {
			row.push(cellFactory.createCellFrom(0));		
		}
	}

	// alertGrid(grid);

  return grid;
}

function encodeGameData(grid, cellFactory) {
  var data = '';
  var buf = [];
  var str = '';
  for (var i = 0; i < grid.length; i++) {
    var row = grid[i];
    for (var j = 0; j < row.length; j++) {
    	var cell = row[j];
    	var value = cellFactory.getValueFrom(cell);
      buf.push(value);  
      if (buf.length == 16) {
        data += encodeCharCode(buf);
        buf = [];
      }
    }
  }  
  if (buf.length > 0) {
    data += encodeCharCode(buf);
  }
  return data;
}

function encodeCharCode(bits) {
  var charCode = 0;
  for (var i = bits.length - 1; i >= 0; i--) {
    charCode <<= 1;
    charCode |= bits[i];
  }
  return String.fromCharCode(charCode)
}
**/