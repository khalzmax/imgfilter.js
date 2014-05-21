/**
 * This class represonts simplte filter
 *
 * @author mkhalzov
 */

/**
 * Creates instance for filter
 *
 * @constructor
 * @this {filter}
 * 
*/

function Filter(options) {
	var defaultOptions = {
		func: function(color, filterFactor) {
			return color * filterFactor;
		},
		matrix: [
				[0,0,0],
				[0,1,0],
				[0,0,0]
			],
		div: 1, // mustn't be 0 !
		offset: 0
	};
	options = options || {};
	this.func = options.func || defaultOptions.func;
	this.matrix = options.matrix || defaultOptions.matrix;
	this.div = options.div || defaultOptions.div; 
	this.offset = options.offset || defaultOptions.offset;
}
/**
 * apply filter on image
 *
 * @param {object} pixels Image data
 */
Filter.prototype.apply = function (pixels, newPixels) {
	var data = pixels.data,
		dataLength = data.length;
	var sum = [],
		pixel, curPixel;
	/**
	 * Converts matrix index to index related to the central matrix element
	 * e.g. for matrix 5x5 index 0 will be transformed to -2, related to the central element [2,2]
	 */
	var matrix2imgPos = function (matrixPos, length) { return matrixPos - (length - length%2) / 2 };
	/** Converts index related to central matrix element to matrix index */
	var img2matrixPos = function (imgPos, length) { return imgPos + (length - length%2) / 2 };

	var matrixLength = this.matrix.length,
		minImgRange = matrix2imgPos(0, matrixLength),
		maxImgRange = matrix2imgPos(matrixLength-1, matrixLength);

	// go through all image
	for (var i=0; i<dataLength; i+=4) {
		curPixel = [data[i], data[i+1], data[i+2], data[i+3]];
		sum = [0,0,0];
		// go through matrix
		for (var n = minImgRange; n<=maxImgRange; n++){
			for (var m = minImgRange; m<=maxImgRange; m++){
				// get pixel according to the current pixel and matrix element
				pixel = this.getPixel(data, i, n, m, pixels.width);
				if (!pixel) {
					continue; // pixel is out of image
				}
				var mX = img2matrixPos(n, matrixLength),
					mY = img2matrixPos(m, matrixLength);

				sum[0] += this.func(pixel[0], this.matrix[mX][mY]); // red
				sum[1] += this.func(pixel[1], this.matrix[mX][mY]); // green
				sum[2] += this.func(pixel[2], this.matrix[mX][mY]); // blue
			}
		}
		// normalize and save pixel
		curPixel[0] = Math.round(sum[0] / this.div + this.offset);
		curPixel[1] = Math.round(sum[1] / this.div + this.offset);
		curPixel[2] = Math.round(sum[2] / this.div + this.offset);

		this.setPixel(newPixels.data, curPixel, i);
	}
	return newPixels;
}

Filter.prototype.getPixel = function (data, curPos, offsetX, offsetY, width) {
	if (offsetX == undefined && offsetY == undefined) {
		// return current pixel
		if (curPos >= 0 && curPos+3 < data.length) { 
			return [data[curPos], data[curPos+1], data[curPos+2], data[curPos+3]];
		}
	} else if (width) {
		var yPos = (+offsetY) * width * 4,
		xPos = (+offsetX) * 4,
		pos = curPos + yPos + xPos;
		if (pos >= 0 && pos+3 < data.length) {
			return [data[pos], data[pos+1], data[pos+2], data[pos+3]];
		}
	}
	return ;
}

Filter.prototype.setPixel = function (data, pixel, curPos) {
	data[curPos+0] = pixel[0];
	data[curPos+1] = pixel[1];
	data[curPos+2] = pixel[2];
	data[curPos+3] = pixel[3];
}