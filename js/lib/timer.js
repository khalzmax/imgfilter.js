function Timer() {
	this.time = 0;
}

Timer.prototype.start = function() {
	this.time = new Date().getTime();
	return this.time;
}

Timer.prototype.stop = function() {
	return new Date().getTime() - this.time;
}