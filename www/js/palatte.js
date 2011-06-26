var PALATTE = {
  swatch_colors: ['000','f00','0ff'],
  swatch_selected: 0
};  
  
  function drawSwatch(num, hex) {
    var el = $('swatch_color_' + num);
    var context = el.getContext("2d");	
		context.clearRect(0, 0, el.width, el.height);
		context.fillStyle = "#" + hex;
		context.fillRect(0, 0, 12, 12);		    
  }

  function valueChanged(target) {
    return target.prevValue != target.value;
  }

  function isValidHex(value) {
    var regex = /^[0-9a-fA-F]{3}(|[0-9a-fA-F]{3})$/;
    return value.match(regex) ? true : false;
  }

  function hexChanged(e) {
    if (valueChanged(e.target) && isValidHex(e.target.value)) {
       var swatchNum = String(e.target.id).substring("swatch_hex_".length);
       drawSwatch(swatchNum, e.target.value);
    }
    e.target.prevValue = e.target.value;
  }

  function onSwatchClick(e) {
    var swatchNum = String(e.target.id).substring("swatch_color_".length);
    selectSwatch(swatchNum);
  }

  function selectSwatch(n) {
    $('swatch_selected_' + n).checked = true;
    PALATTE.swatch_selected = n;
  }

  function createSwatch(n) {
    var canvasDiv = new Element('div', {
      'class': 'swatch_color'
    });
    
    var canvas = new Element('canvas',{
      id: 'swatch_color_' + n,
      'class': 'swatch_color',
      width: 12,
      height: 12,
      events: {
        'click': onSwatchClick
      }
    });
    canvasDiv.adopt(canvas);
    
    var hexValue = new Element('input', {
      id: 'swatch_hex_' + n,
      type: 'text',
      maxlength: 6,
      events: {
        'keyup': hexChanged        
      }
    })

    var hexSelected = new Element('input', {
      type: 'radio',
      name: 'swatch_selected',
      id: 'swatch_selected_' + n,
      value: n
    });

    var swatch = new Element('div', {
      id: 'swatch_' + n,      
    });
    swatch.adopt(canvasDiv);
    swatch.adopt(hexValue);
    swatch.adopt(hexSelected);
    
    return swatch;
  }

var PICKER = {
  values: []
};

  function pickColor(e) {
    var x = e.page.x - e.target.offsetLeft;
    var y = e.page.y - e.target.offsetTop;    

    x = Math.floor(x/10);
    y = Math.floor(y/10);

    var hex = 'fff';
    if (PICKER.values.length > y) {
      var row = PICKER.values[y];
      if (row.length > x) {
        hex = row[x];
      }
    }

    var n = PALATTE.swatch_selected;
    $('swatch_hex_' + n).value = hex;
    PALATTE.swatch_colors[n] = hex;
    drawSwatch(n, hex);
  }

  function drawPicker() {
    var el = $('color_picker');
    var ctx = el.getContext("2d");
    
    var count = 0;
    ctx.clearRect(0, 0, el.width, el.height);		

    var hexValues = [];
    var row;
    
    for (var i = 0; i < 16; i+=3) {
      for (var j = 0; j < 16; j+=3) {
        for (var k = 0; k < 16; k+=3) {
          var hex = i.toString(16) + j.toString(16) + k.toString(16);          
          ctx.fillStyle = "#" + hex;
          var x = count % 15;
          var y = Math.floor(count / 15); 
          if (x == 0) {
            row = [];
            hexValues.push(row);
          }
          row.push(hex);
          x*=10;
          y*=10;
      		ctx.fillRect(x, y, 10, 10);		    
      		count++;
        }
      }
    }
    
    PICKER.values = hexValues;
    el.addEvent('click', pickColor);
  }

  function initPalatte() {
    var nColors = PALATTE.swatch_colors.length;
    var palatte = $('color_palatte');
    for (var n = 0; n < nColors; n++) {
      var swatch = createSwatch(n);
      palatte.adopt(swatch); 
      $('swatch_hex_' + n).value = PALATTE.swatch_colors[n];
      drawSwatch(n, PALATTE.swatch_colors[n]);      
    }
    selectSwatch(0);
    drawPicker();    
  }