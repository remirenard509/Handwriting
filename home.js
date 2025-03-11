class DrawingApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.drawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.history = [];
        this.redoHistory = [];
        this.autoSmooth = false;
        this.lineWidth = 5;
        this.svgContent = '';

        this.init();
    }

    init() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));

        document.getElementById('undo').addEventListener('click', () => this.undo());
        document.getElementById('redo').addEventListener('click', () => this.redo());
        document.getElementById('clear').addEventListener('click', () => this.clear());
        document.getElementById('autoSmooth').addEventListener('change', (e) => this.toggleAutoSmooth(e));
        document.getElementById('save').addEventListener('click', () => this.save());
    }

    startDrawing(e) {
        this.drawing = true;
        this.lastX = e.offsetX;
        this.lastY = e.offsetY;

        this.history.push([{ x: this.lastX, y: this.lastY }]);
        this.redoHistory = [];
    }

    stopDrawing() {
        this.drawing = false;
        if (this.autoSmooth) {
            this.smooth();
        }
    }

    draw(e) {
        if (!this.drawing) return;

        const x = e.offsetX;
        const y = e.offsetY;

        this.ctx.lineWidth = this.lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.closePath();

        if (this.autoSmooth) {
            this.smoothStroke(x, y);
        } else {
            this.history[this.history.length - 1].push({ x, y });
        }

        this.lastX = x;
        this.lastY = y;
        console.log(this.history);
    }

    smoothStroke(x, y) {
        const last = this.history[this.history.length - 1];
        if (last.length > 1) {
            const prevPoint = last[last.length - 2];
            const newPoint = {
                x: (x + prevPoint.x) * 0.5,
                y: (y + prevPoint.y) * 0.5
            };
            last.push(newPoint);
        } else {
            last.push({ x, y });
        }
    }

    smooth() {
        if (this.history.length === 0) return;

        const lastStroke = this.history[this.history.length - 1];
        const smoothenedStroke = lastStroke.map((point, index, arr) => {
            if (index === 0 || index === arr.length - 1) return point;
            const prev = arr[index - 1];
            const next = arr[index + 1];
            return {
                x: (point.x + prev.x + next.x) / 3,
                y: (point.y + prev.y + next.y) / 3
            };
        });

        this.history[this.history.length - 1] = smoothenedStroke;
        this.redrawCanvas();
    }

    undo() {
        if (this.history.length > 0) {
            this.redoHistory.push(this.history.pop());
            this.redrawCanvas();
        }
    }

    redo() {
        if (this.redoHistory.length > 0) {
            this.history.push(this.redoHistory.pop());
            this.redrawCanvas();
        }
    }

    clear() {
        this.history = [];
        this.redoHistory = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    toggleAutoSmooth(e) {
        this.autoSmooth = e.target.checked;
    }

    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.history.forEach(stroke => {
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(stroke[0].x, stroke[0].y);
            stroke.forEach(point => this.ctx.lineTo(point.x, point.y));
            this.ctx.stroke();
            this.ctx.closePath();
        });
    }
    save() {
        this.beginsvg();
        for (let i = 0; i < this.history.length; i++) {
            let stroke = this.history[i];
            this.bodysvg(stroke);
        }
        this.endsvg();
        this.saveSvgToLocalStorage(this.svgContent);
    }
    beginsvg() {
        this.svgContent = '';
        this.svgContent += '<?xml version="1.0" encoding="UTF-8"?>\n';
        this.svgContent += '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="800" height="400">\n';
    }
    endsvg() {
        this.svgContent += '</svg>';
    }

    bodysvg(points) {
        for (let i = 0; i < points.length - 1; i++) {
            let p1 = points[i];
            let p2 = points[i + 1];
            this.svgContent += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="black" stroke-width="2" />\n`;
        }
    }
    saveSvgToLocalStorage(svgContent) {
        localStorage.setItem('svgFile', svgContent);
    }
    loadSvgFromLocalStorage() {
        return localStorage.getItem('svgFile');
    }

    run() {
    }
}

const app = new DrawingApp();

