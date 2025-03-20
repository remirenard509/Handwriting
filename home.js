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
        this.lineWidth = 2;
        this.svgContent = '';
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
        document.getElementById('toggleAutoSmooth').addEventListener('click', () => {
            this.autoSmooth = !this.autoSmooth;
            this.smoothButtonStatus();
        });
    }

    smoothButtonStatus() {
        const elSmoothButton = document.querySelector('#toggleAutoSmooth');
        if (this.autoSmooth) {
            elSmoothButton.classList.add('smooth-on');
        } else {
            elSmoothButton.classList.remove('smooth-on');
        }
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
        this.printCenteredSvg(this.history);
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
        this.printCenteredSvg(this.history);
    }

    redo() {
        if (this.redoHistory.length > 0) {
            this.history.push(this.redoHistory.pop());
            this.redrawCanvas();
        }
        this.printCenteredSvg(this.history);
    }

    clear() {
        this.history = [];
        this.redoHistory = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.printCenteredSvg(this.history);
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

    centerPoints(pointsArray) {
        let allPoints = pointsArray.flat();
    
        const minX = Math.min(...allPoints.map(p => p.x));
        const maxX = Math.max(...allPoints.map(p => p.x));
        const minY = Math.min(...allPoints.map(p => p.y));
        const maxY = Math.max(...allPoints.map(p => p.y));
    
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
    
        const centeredPointsArray = pointsArray.map(points =>
            points.map(p => ({
                x: p.x - centerX,
                y: p.y - centerY
            }))
        );
    
        return {
            centeredPointsArray,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    generateSvgCentered(pointsArray) {
        if (pointsArray.length === 0) return '';
        const { centeredPointsArray, width, height } = this.centerPoints(pointsArray);
    
        const padding = Math.max(width, height) * 0.1;
        const viewBox = `${-width / 2 - padding} ${-height / 2 - padding} ${width + 2 * padding} ${height + 2 * padding}`;
    
        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="${viewBox}">`;
    
        centeredPointsArray.forEach(points => {
            svgContent += `<path d="M ${points.map(p => `${p.x} ${p.y}`).join(" L ")}" stroke="black" fill="none"/>`;
        });
    
        svgContent += `</svg>`;
        return svgContent;
    }

    printCenteredSvg(pointsArray) {
        const svgString = this.generateSvgCentered(pointsArray);
        const svgContainer = document.querySelector('#svgContainer1');
    
        svgContainer.innerHTML = svgString;
        svgContainer.style.overflow = 'hidden';

        const svgContainer2 = document.querySelector('#svgContainer2');
    
        svgContainer2.innerHTML = svgString;
        svgContainer2.style.overflow = 'hidden';
    }

    roundPoints(points) {
        return points.map(point => ({
            x: Math.round(point.x * 100) / 100,
            y: Math.round(point.y * 100) / 100
        }));
    }

    run() {
    }
}

const app = new DrawingApp();