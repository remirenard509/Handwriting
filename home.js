const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let isDrawing = false;
let history = [];
let redoStack = [];

function saveState() {
    history.push(canvas.toDataURL());
    redoStack = []; // Réinitialise le redo après un nouveau dessin
    updateButtons();
}

function updateButtons() {
    document.getElementById('undo').disabled = history.length <= 1;
    document.getElementById('redo').disabled = redoStack.length === 0;
}

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
});

canvas.addEventListener('mouseup', () => {
    if (isDrawing) {
        isDrawing = false;
        saveState(); // Sauvegarde après chaque trait terminé
    }
});

// Fonction pour revenir en arrière
document.getElementById('undo').addEventListener('click', () => {
    if (history.length > 1) {
        redoStack.push(history.pop());
        restoreCanvas(history[history.length - 1]);
        updateButtons();
    }
});

// Fonction pour rétablir
document.getElementById('redo').addEventListener('click', () => {
    if (redoStack.length > 0) {
        const imageData = redoStack.pop();
        history.push(imageData);
        restoreCanvas(imageData);
        updateButtons();
    }
});

// Restaurer l'état du canvas
function restoreCanvas(imageData) {
    const img = new Image();
    img.src = imageData;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
}

// Initialisation
saveState();