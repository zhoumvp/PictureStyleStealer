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

function Histgram(argCanvas, argOptions) {
	var self      = this,
		canvas    = argCanvas,
		ctx       = canvas.getContext('2d'),
		bufCanvas = document.createElement('CANVAS'),
		buffer    = bufCanvas.getContext('2d'),
		hudCanvas = document.createElement('CANVAS'),
		hudCtx    = hudCanvas.getContext('2d'),
		hud       = null,
		image     = document.createElement('CANVAS'),
		img       = image.getContext('2d');

	self.setImage = function(argImg) {
		image.width  = argImg.width;
		image.height = argImg.height;
		img.drawImage(argImg,0,0);
	}

	function hudDraw() {
		
		// init
		hudCanvas.width = canvas.width;
		hudCanvas.height = canvas.height;
		hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
		hudCtx.fillStyle ='#000';
		hudCtx.fillRect(0, 0, hudCanvas.width, hudCanvas.height);

		// lines
		hudCtx.strokeStyle = '#666';
		
		hudCtx.lineWidth = .5;
		hudCtx.setLineDash([3]);
		
		for(var i=0; i<=10; i+=1) {
            hudCtx.beginPath();
            hudCtx.moveTo(parseInt(i/10*hudCanvas.width),0);
            hudCtx.lineTo(parseInt(i/10*hudCanvas.width),hudCanvas.height);
            hudCtx.stroke();
		}
		hud = hudCtx.getImageData(0, 0, hudCanvas.width, hudCanvas.height);
	}

	function hudRedraw() {
		ctx.putImageData(hud, 0, 0);
	}

	function histgram() {
		bufCanvas.width = canvas.width;
		bufCanvas.height = canvas.height;
		
		buffer.putImageData(hud, 0, 0);
		
		var data = img.getImageData(0, 0, image.width, image.height),
			d = data.data,
			r, g, b,r1d,g1d,b1d,xx,ry,gy,by,
			r_hist = new Array(256).fill(0),
			g_hist = new Array(256).fill(0),
			b_hist = new Array(256).fill(0);

        var step = Math.max((data.width*data.height) / 1000000, 1);     

		for(var ix=0, i; ix<data.width*data.height; ix+=step) {
            i = parseInt(ix);
            
			r = d[i*4+0];
			g = d[i*4+1];
            b = d[i*4+2];

            r_hist[r]+=1;
            g_hist[g]+=1;
            b_hist[b]+=1;
        }
        r_hist_max = r_hist.reduce(function(a, b) {return Math.max(a, b);});
        g_hist_max = g_hist.reduce(function(a, b) {return Math.max(a, b);});
        b_hist_max = b_hist.reduce(function(a, b) {return Math.max(a, b);});
        
        rgb_hist_max = Math.max(Math.max(r_hist_max,g_hist_max),b_hist_max)

        buffer.strokeStyle = '#ff0000';
		buffer.lineWidth = .5;
        buffer.beginPath();
        buffer.moveTo(0,parseInt(bufCanvas.height*1/3));
        for(var i=0;i<256;i+=1){
            buffer.lineTo(parseInt(i/255*(bufCanvas.width-1)),parseInt(bufCanvas.height/3 - r_hist[i]/rgb_hist_max*bufCanvas.height/3));
        }
        buffer.lineTo(bufCanvas.width,parseInt(bufCanvas.height*1/3));
        buffer.strokeStyle = '#000';
        buffer.closePath();
        buffer.stroke();
        buffer.fillStyle = "red";
        buffer.fill();

        buffer.strokeStyle = '#00ff00';
		buffer.lineWidth = .5;
        buffer.beginPath();
        buffer.moveTo(0,parseInt(bufCanvas.height*2/3));
        for(var i=0;i<256;i+=1){
            buffer.lineTo(parseInt(i/255*(bufCanvas.width-1)),parseInt(bufCanvas.height*2/3 - b_hist[i]/rgb_hist_max*bufCanvas.height/3));
        }
        buffer.lineTo(bufCanvas.width,parseInt(bufCanvas.height*2/3));
        buffer.closePath();
        buffer.stroke();
        buffer.fillStyle = "green";
        buffer.fill();

        buffer.strokeStyle = '#0000ff';
		buffer.lineWidth = .5;
        buffer.beginPath();
        buffer.moveTo(0,parseInt(bufCanvas.height));
        for(var i=0;i<256;i+=1){
            buffer.lineTo(parseInt(i/255*(bufCanvas.width-1)),parseInt(bufCanvas.height - b_hist[i]/rgb_hist_max*bufCanvas.height/3));
        }
        buffer.lineTo(bufCanvas.width,parseInt(bufCanvas.height));
        buffer.closePath();
        buffer.stroke();
        buffer.fillStyle = "blue";
        buffer.fill();

        out = buffer.getImageData(0, 0, bufCanvas.width, bufCanvas.height);
		ctx.putImageData(out, 0, 0);
		console.debug('stop');
	}

	self.refresh = function() {
		hudRedraw();
		histgram();
	}

	function init() {
		hudDraw();
		// hudRedraw();
	}
	init();
}

