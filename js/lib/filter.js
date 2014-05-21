var app = window.app || {};
app.lib = app.lib || {};
app.lib.filter = {
	getPixel : function (data, curPos, offsetX, offsetY, width, dataLength) {
		var dataLength = dataLength || data.length;
		if (offsetX == undefined && offsetY == undefined) {
			// return current pixel
			if (curPos >= 0 && curPos+3 < data.length) { 
				return [data[curPos], data[curPos+1], data[curPos+2], data[curPos+3]];
			}
		} else if (width) {

			var yPos = (+offsetY) * width * 4,
			xPos = (+offsetX) * 4,
			pos = curPos + yPos + xPos;
			
			// ban pixels that are out of image
			if (pos < 0 || pos+3 >= data.length) {
				return ;
			}

			/* ban pixels from different row */
			if ((curPos + xPos) - ((curPos + xPos) % (width*4)) != 
					curPos - (curPos % (width*4))) {
				return;
			}
			
			return [data[pos], data[pos+1], data[pos+2], data[pos+3]];
		}
		return ;
	},

	setPixel : function (data, pixel, pos) {
		for (var i = 0; i < 4; i++) {
			data[pos+i] = pixel[i];
		}
	},

	saveRow : function (data, row, pos) {
		aa = window.aa || {}; bb = window.bb || {};
		
		var rowLength = row.length;
		for (var i = 0; i < rowLength; i++) {
			if ( (i+1) % 4 == 0) continue; 
			
			if (data[pos + i] != row[i])
				aa[pos + i] = data[pos + i] + ' ' + row[i];
			
			data[pos + i] = row[i];
			
			
		}
	},

	saveCol : function (data, col, pos, width) {
		var rows = col.length / 4;
		// iterate throwug column
		for (var i=0; i<rows; i++) {
			// iterate through pixel
			for (var j=0; j<4; j++) {
				if (data[pos + i*width*4 + j] != col[i*4 + j]) 
					bb[pos + i*width*4 + j] = data[pos + i*width*4 + j] + ' ' + col[i*4 + j];
			
				data[pos + i*width*4 + j] = col[i*4 + j];
				
			}
		}
	}
}