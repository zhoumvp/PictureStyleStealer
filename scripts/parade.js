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

function Parade(argCanvas, argOptions) {
	var self      = this,
		canvas    = argCanvas,
		ctx       = canvas.getContext('2d'),
		bufCanvas = document.createElement('CANVAS'),
		buffer    = bufCanvas.getContext('2d'),
		hudCanvas = document.createElement('CANVAS'),
		hudCtx    = hudCanvas.getContext('2d'),
		hud       = null,
		image     = document.createElement('CANVAS'),
		img       = image.getContext('2d')

	self.setImage = function(argImg) {
		image.width  = argImg.width;
		image.height = argImg.height;
		img.drawImage(argImg,0,0)
	}

	function hudDraw() {
		
		hudCanvas.width = canvas.width;
		hudCanvas.height = canvas.height;
		hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
		hudCtx.fillStyle ='#000';
		hudCtx.fillRect(0, 0, hudCanvas.width, hudCanvas.height);

		hudCtx.strokeStyle = '#666';
			
		hudCtx.lineWidth = .5;
		hudCtx.setLineDash([5]);
		
		for(var i=0; i<=8; i+=1) {
			hudCtx.beginPath();
			hudCtx.moveTo(0, parseInt(canvas.height - i/8*canvas.height));
			hudCtx.lineTo(canvas.width, parseInt(canvas.height - i/8*canvas.height));
			hudCtx.stroke();
		}
		
		hud = hudCtx.getImageData(0, 0, hudCanvas.width, hudCanvas.height);
	}

	function hudRedraw() {
		ctx.putImageData(hud, 0, 0);
	}

	function parade() {
		bufCanvas.width = canvas.width;
		bufCanvas.height = canvas.height;
		
		buffer.putImageData(hud, 0, 0);
		
		var data = img.getImageData(0, 0, image.width, image.height),
			d = data.data,
			r, g, b,r1d,g1d,b1d,xx,ry,gy,by,
			out = buffer.getImageData(0, 0, bufCanvas.width, bufCanvas.height),
			dOut = out.data;
		
        var step = Math.max((data.width*data.height) / 1000000, 1);

		for(var ix=0, i; ix<data.width*data.height; ix+=step) {
            i = parseInt(ix);
            
			r = d[i*4+0];
			g = d[i*4+1];
			b = d[i*4+2];

            xx = parseInt((i%data.width)/data.width*out.width/3);
            
			ry = parseInt(r/255*(out.height-1));
			gy = parseInt(g/255*(out.height-1));
			by = parseInt(b/255*(out.height-1));
			
			r1d = ((out.height - 1 - ry) * out.width + xx)*4;
			g1d = ((out.height - 1 - gy) * out.width + parseInt(xx+out.width/3))*4;
			b1d = ((out.height - 1 - by) * out.width + parseInt(xx+out.width*2/3))*4;
			
						
			dOut[r1d] += 2;
			dOut[r1d+3] =  255;

			dOut[g1d+1] += 2;
			dOut[g1d+3] =  255;

			dOut[b1d+2] += 2;
			dOut[b1d+3] =  255;

		}
		ctx.putImageData(out, 0, 0);
		console.debug('stop')
	}

	self.refresh = function() {
		hudRedraw();
		parade();
	}

	function init() {
		hudDraw();
		// hudRedraw();
	}
	init();
}

