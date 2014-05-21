/**
 * This class represonts simplte filter
 *
 * @author mkhalzov
 */

/** TODO  require app.lib.filter.js */

/**
 * Creates instance for filter
 *
 * @constructor
 * @this {filter}
 * 
*/

function GBlur(sigma) {
	var sigma = sigma || 5,
		n = sigma * 3,
		win = [];

	win[0] = 1;
	/*for (var i = 1; i <= n; i++) {
		win[i] = Math.exp(-i*i / 2*sigma*sigma);
		//win[-i] = win[i];
	}
	*/
	win = [0.475207, 0.23431, 0.28087];
	console.log(win);

	this.sigma = sigma;
	this.win = win;
}

/* TODO
Filter.prototype.window2imgPos
*/
GBlur.prototype.func = function(color, filterFactor) {
	return color * filterFactor;
}

/**
 * apply filter on image
 *
 * @param {object} pixels Image data
 */
GBlur.prototype.apply = function (pixels) {
	var //data = pixels.data,
		dataLength = pixels.data.length,
		pixelsWidth = pixels.width,
		pixelsHeight = pixels.height;
	var sum,
		pixel, curPixel, rowNo, colNo, rowStart, colStart, row, col ,
		x,y,i,k;

	var timer = new Timer(),
		rowsTimer = new Timer(),
		colsTimer = new Timer(),
		debugTimer = new Timer(),
		debugCounter = 0, debugCounter2 = 0;

	/**
	 * Converts inage index to index related to the central window element
	 * e.g. TODO for window 5 index 0 will be transformed to -2, related to the central element [2,2]
	 */
	//var window2imgPos = function (windowPos, length) { return windowPos - (length - length%2) / 2 };
	/** TODO Converts index related to central window element to matrix index */
	//var img2windowPos = function (imgPos, length) { return imgPos + (length - length%2) / 2 };

	var windowLength = this.win.length-1;/*,
		minImgRange = window2imgPos(0, windowLength),
		maxImgRange = window2imgPos(windowLength-1, windowLength);*/

	timer.start();
	rowsTimer.start();

	// process image rows
	rowNo = 0; rowStart = 0; row = [];
	for (i=0; i<dataLength; i+=4) {
		//curPixel = [data[i], data[i+1], data[i+2], data[i+3]];
		curPixel = [0,0,0, pixels.data[i+3]];
		sum = 0;
		// go through window []
		for (var x = -windowLength; x<=windowLength; x++){
		
			// get pixel according to the current pixel and matrix element
			pixel = app.lib.filter.getPixel(pixels.data, i, x, 0, pixelsWidth, dataLength);
			if (!pixel) {
				continue; // pixel is out of image
			}

			k = Math.abs(x); // window does not consist negative index
			curPixel[0] += this.func(pixel[0], this.win[k]); // red
			curPixel[1] += this.func(pixel[1], this.win[k]); // green
			curPixel[2] += this.func(pixel[2], this.win[k]); // blue
			sum += this.win[k]; // summarize window factor
		}
		// normalize pixel
		curPixel[0] = Math.round(curPixel[0] / sum); // red
		curPixel[1] = Math.round(curPixel[1] / sum); // green
		curPixel[2] = Math.round(curPixel[2] / sum); // blue

		app.lib.filter.setPixel(row, curPixel, i-rowStart);

		// check for end of the row
		if ((i + 4) % (pixelsWidth*4) == 0) {
			// save row
			//console.log('processed row #'+rowNo);
			debugTimer.start();
			app.lib.filter.saveRow(pixels.data, row, rowStart);
			debugCounter += debugTimer.stop(); debugCounter2++;
			//console.log('timer:' + debugTimer.stop()); if (rowNo == 10) return;
			row = [];
			rowNo ++;
			rowStart = i+4;
		}
	}
	console.log('All rows processed. '+rowsTimer.stop() + '; saving time: '+debugCounter + '; saved '+debugCounter2+' times.');

	// process image columns
	i = 0; colStart = 0; col = [];
	colsTimer.start();
	debugCounter = 0; debugCounter2 = 0;
	for (colNo=0; colNo<pixelsWidth; colNo++) {
	//for (var i=0; i<dataLength; i+=4) {
		col = [];
		for (rowNo = 0; rowNo < pixelsHeight; rowNo ++) {
			i = rowNo * pixelsWidth * 4 + colNo * 4; // current posision in data array
			curPixel = [0,0,0, pixels.data[i+3]];
			sum = 0;
			// go through window
			for (var y = -windowLength; y<=windowLength; y++){
			
				// get pixel according to the current pixel and matrix element
				pixel = app.lib.filter.getPixel(pixels.data, i, y, 0, pixelsWidth, dataLength);
				if (!pixel) {
					continue; // pixel is out of image
				}

				k = Math.abs(y); // window does not consist negative index
				curPixel[0] += this.func(pixel[0], this.win[k]); // red
				curPixel[1] += this.func(pixel[1], this.win[k]); // green
				curPixel[2] += this.func(pixel[2], this.win[k]); // blue
				sum += this.win[k]; // summarize window factor
			}
			// normalize pixel
			curPixel[0] = Math.round(curPixel[0] / sum); // red
			curPixel[1] = Math.round(curPixel[1] / sum); // green
			curPixel[2] = Math.round(curPixel[2] / sum); // blue
			app.lib.filter.setPixel(col, curPixel, rowNo * 4);

		}
		//console.log('processed col #'+colNo);
		// save row
		debugTimer.start();
		app.lib.filter.saveCol(pixels.data, col, colStart, pixels.width);
		debugCounter += debugTimer.stop(); debugCounter2++;

	}
	console.log('All columns processed. ' + colsTimer.stop() + '; saving time: '+debugCounter+ '; saved '+debugCounter2+' times.');

	return pixels;
}