function CellFactory() {
	this.createCellFrom = function(value) {
		return new Cell(value)			
	}
	this.getValueFrom = function(cell) {
		return cell.value;
	}
	this.emptyCell = function() {
	  return new Cell(0);
	}
	this.bitLength = 1;
	return true;
}

function GridEncoder(cellFactory) {
	this.cellFactory = cellFactory;
	
	this.decode = function(data, w, h, fcty) {
		if (fcty == undefined) {
			fcty = this.cellFactory;
		}
		
    var bitLength = fcty.bitLength;
    var bitMask = Math.pow(2, bitLength) - 1;

		var grid = [[]];
		var len = w * h;
		var row = grid[0];
    for (var i = 0; i < data.length; i += 4) {
    // for (var i = 0; i < data.length; i++) {
			// Get the next encoded character
      // var charCode = data.charCodeAt(i);
      var chunk = data.substring(i, i + 4);
      console.log("Chunk: " + chunk);
			var charCode = parseInt("0x" + chunk)
			console.log("code: " + charCode);
			
			// Iterate the bits of the encoding
			for (var j = 0; j < 16 && len-- > 0; j += bitLength) {
				if (row.length == w) {
					row = [];
					grid.push(row);
				}

				var pad = 16 - bitLength - j;				
        var bits = (charCode >>> pad) & bitMask;
        var cell = fcty.createCellFrom(bits);
        row.push(cell);
			}  
		}
		for (var i = grid.length - 1; i < h; i ++) {
			if (i === grid.length) {
				row = [];
				grid.push(row);
			}
			row = grid[i];
			for (; row.length < w; ) {
				row.push(fcty.emptyCell()); 		
			}
		}
		return grid;
	}	
	
	this.encode = function encode(grid, fcty) {
		if (fcty == undefined) {
			fcty = this.cellFactory;
		}

		var data = '';
		var bitLength = fcty.bitLength;
    var bitMask = Math.pow(2, bitLength) - 1;
		
		var bitCount = 0;
		var charCode = 0;

		for (var i = 0; i < grid.length; i++) {
			var row = grid[i];
			for (var j = 0; j < row.length; j++) {
				var cell = row[j];
				
				var value = fcty.getValueFrom(cell) & bitMask;
        // console.log(value);

				bitCount += bitLength;
				charCode <<= bitLength;
				charCode |= value;
        if (bitCount == 16) {
          console.log("CharCode: " + charCode);          
          var chunk = Number(charCode).toString(16);
          while (chunk.length < 4) {
            chunk = "0" + chunk;
          }          
          data += chunk;
          console.log("Data: " + data);
          // data += String.fromCharCode(charCode);
          // console.log(data);
          bitCount = 0;
          charCode = 0;
        }
				
			}
		}  
		if (bitCount > 0) {
      charCode <<= (16 - bitCount);      
      var chunk = Number(charCode).toString(16);
      while (chunk.length < 4) {
        chunk = "0" + chunk;
      }          
      data += chunk;
      // data += String.fromCharCode(charCode);
      // data += charCode.toString(16);
		}
    console.log("Final encoded: " + data);
		return data;
	}
	
	return true;
}