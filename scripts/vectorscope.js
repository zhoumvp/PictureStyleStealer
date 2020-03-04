function Point(x, y) {
	var self = this;

	self.x = x ? x : 0;
	self.y = y ? y : 0;
}
function Size(w, h) {
	var self = this;

	self.w = w ? w : 0;
	self.h = h ? h : 0;
}

Math.truncate = function(x) {
	return x < 0 ? (-Math.floor(-x)) : (Math.floor(x));
}

Math.nonIntRem = function(x, y) {
	return x - y * Math.truncate(x / y);
}

function Vectorscope(argCanvas, argOptions) {
	var self      = this,
		canvas    = argCanvas,
		ctx       = canvas.getContext('2d'),
		bufCanvas = document.createElement('CANVAS'),
		buffer    = bufCanvas.getContext('2d'),
		hudCanvas = document.createElement('CANVAS'),
		hudCtx    = hudCanvas.getContext('2d'),
		hud       = null,
		image     = document.createElement('CANVAS'),
		img       = image.getContext('2d'),
		center    = new Point(canvas.width / 2, canvas.height / 2),
		radius    = Math.max(Math.min(canvas.width, canvas.height), 10) / 2 - 10,
		correction = function(phi) {return -phi * 2*Math.PI - Math.PI*3/5}

	self.setImage = function(argImg) {
		image.width  = argImg.width;
		image.height = argImg.height;
		img.drawImage(argImg,0,0)
	}

	function hudDraw() {
		function hudReferencePoint(r, g, b) {
			var hsv, xy2d;

			hudCtx.fillStyle = 'rgb('+r+','+g+','+b+')';
			hsv  = convertRGBtoHSV(r, g, b);
			xy2d = convertPolarToCartesian(hsv.s * radius + 5, correction(hsv.h));
			hudCtx.beginPath();
			hudCtx.arc(xy2d.x + center.x, xy2d.y + center.y, 3, 0, 2*Math.PI);
			hudCtx.fill();
		}

		// init
		hudCanvas.width = canvas.width;
		hudCanvas.height = canvas.height;
		hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
		hudCtx.fillStyle ='#000';
		hudCtx.fillRect(0, 0, hudCanvas.width, hudCanvas.height);

		// lines
		hudCtx.strokeStyle = '#666';
		hudCtx.lineWidth = .5;

		hudCtx.beginPath();
		hudCtx.moveTo(center.x - radius, center.y);
		hudCtx.lineTo(center.x + radius, center.y);
		hudCtx.stroke();

		hudCtx.beginPath();
		hudCtx.moveTo(center.x, center.y - radius);
		hudCtx.lineTo(center.x, center.y + radius);
		hudCtx.stroke();

		// circles
		hudCtx.lineWidth = .5;
		hudCtx.setLineDash([3]);

		hudCtx.beginPath();
		hudCtx.arc(center.x, center.y, radius, 0, 2*Math.PI);
		hudCtx.stroke();

		hudCtx.beginPath();
		hudCtx.arc(center.x, center.y, radius * 0.75, 0, 2*Math.PI);
		hudCtx.stroke();

		hudCtx.beginPath();
		hudCtx.arc(center.x, center.y, radius * 0.5, 0, 2*Math.PI);
		hudCtx.stroke();

		hudCtx.beginPath();
		hudCtx.arc(center.x, center.y, radius * 0.25, 0, 2*Math.PI);
		hudCtx.stroke();

		// reference points
		hudReferencePoint(255,0,0);
		hudReferencePoint(255,255,0);
		hudReferencePoint(0,255,0);
		hudReferencePoint(0,255,255);
		hudReferencePoint(0,0,255);
		hudReferencePoint(255,0,255);

		// get image data
		hud = hudCtx.getImageData(0, 0, hudCanvas.width, hudCanvas.height);
	}

	function hudRedraw() {
		ctx.putImageData(hud, 0, 0);
	}

	function vectorscope() {
		bufCanvas.width = canvas.width;
		bufCanvas.height = canvas.height;
		console.log(bufCanvas.width,bufCanvas.height)

		// buffer.clearRect(0, 0, bufCanvas.width, bufCanvas.height);
		buffer.putImageData(hud, 0, 0);

		var data = img.getImageData(0, 0, image.width, image.height),
			d = data.data,
			r, g, b, hsv, xy2d, xy1d,
			out = buffer.getImageData(0, 0, bufCanvas.width, bufCanvas.height)
			dOut = out.data;
		
		console.debug('start')
		var step = Math.max((data.width*data.height) / 1000000, 1);
		for(var ix=0, i; ix<data.width*data.height; ix+=step) {
			i = parseInt(ix);
			r = d[i*4+0];
			g = d[i*4+1];
			b = d[i*4+2];

			hsv  = convertRGBtoHSV(r, g, b);
			xy2d = convertPolarToCartesian(hsv.s * radius, correction(hsv.h));
			xy2d.x += center.x;
			xy2d.y += center.y;
			xy1d = parseInt(parseInt(xy2d.y) * out.width + xy2d.x) * 4;

			dOut[xy1d]   = r;
			dOut[xy1d+1] = g;
			dOut[xy1d+2] = b;
			dOut[xy1d+3] = 255;
		}
		ctx.putImageData(out, 0, 0);
		console.debug('stop')
	}

	self.refresh = function() {
		hudRedraw();
		vectorscope();
	}

	function init() {
		hudDraw();
		// hudRedraw();
	}
	init();
}

function convertRGBtoHSV(rIn, gIn, bIn) {
	var r = rIn / 255,
		g = gIn / 255,
		b = bIn / 255,
		minRGB = Math.min(r, Math.min(g, b)),
		maxRGB = Math.max(r, Math.max(g, b)),
		delta  = maxRGB - minRGB,
		H      = delta == 0 ? 0 : (
					r == maxRGB ? Math.nonIntRem(((g - b) / delta), 6) : (
					g == maxRGB ? ((b - r) / delta + 2) : (
					(r - g) / delta + 4
					))),
		h      = (H >= 0 ? H : H + 6) / 6,
		s      = maxRGB == 0 ? 0 : delta / maxRGB,
		v      = maxRGB;

	return {h: h, s: s, v: v}
}

function convertPolarToCartesian(r, phi) {
	return new Point(r * Math.cos(phi), r * Math.sin(phi));
}

