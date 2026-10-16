/* ============================================
   WORDCRAFT - Interactive Dysgraphia Platform
   Main Application Logic
   ============================================ */

// ===== 8-Bit Web Audio Sound System =====
const SoundFX = {
    ctx: null,
    enabled: true,

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    playTone(freq, type, duration, delay = 0, gainVal = 0.1) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        setTimeout(() => {
            try {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch (e) {
                // Ignore audio policy errors
            }
        }, delay * 1000);
    },

    playClick() {
        this.playTone(600, 'square', 0.05, 0, 0.05);
    },

    playKey() {
        this.playTone(450, 'triangle', 0.04, 0, 0.03);
    },

    playCorrect() {
        // Triumphant 8-bit coin sound
        this.playTone(523.25, 'square', 0.08, 0, 0.08); // C5
        this.playTone(659.25, 'square', 0.08, 0.07, 0.08); // E5
        this.playTone(783.99, 'square', 0.18, 0.14, 0.1); // G5
        this.playTone(1046.50, 'square', 0.35, 0.22, 0.12); // C6
    },

    playWrong() {
        // Low buzzer
        this.playTone(180, 'sawtooth', 0.15, 0, 0.09);
        this.playTone(130, 'sawtooth', 0.25, 0.12, 0.09);
    },

    playLevelUp() {
        // Fanfare
        const notes = [440, 554.37, 659.25, 880, 783.99, 880];
        notes.forEach((f, i) => {
            this.playTone(f, 'square', 0.16, i * 0.1, 0.1);
        });
    }
};

// ===== Accessibility Features =====
const Accessibility = {
    fontSizes: ['', 'font-large', 'font-xlarge'],
    currentFontIndex: 0,
    rulerActive: false,
    contrastActive: false,

    init() {
        const ruler = document.getElementById('reading-ruler');
        window.addEventListener('mousemove', (e) => {
            if (this.rulerActive && ruler) {
                ruler.style.top = (e.clientY - 24) + 'px';
            }
        });
        window.addEventListener('touchmove', (e) => {
            if (this.rulerActive && ruler && e.touches[0]) {
                ruler.style.top = (e.touches[0].clientY - 24) + 'px';
            }
        }, { passive: true });
    },

    toggleRuler() {
        this.rulerActive = !this.rulerActive;
        const ruler = document.getElementById('reading-ruler');
        const btn = document.getElementById('btn-ruler');
        if (ruler) ruler.classList.toggle('hidden', !this.rulerActive);
        if (btn) btn.classList.toggle('active', this.rulerActive);
        showToast(this.rulerActive ? '📏 Reading focus ruler enabled' : '📏 Reading ruler disabled', 'info');
    },

    cycleFontSize() {
        document.body.classList.remove(this.fontSizes[this.currentFontIndex]);
        this.currentFontIndex = (this.currentFontIndex + 1) % this.fontSizes.length;
        if (this.fontSizes[this.currentFontIndex]) {
            document.body.classList.add(this.fontSizes[this.currentFontIndex]);
        }
        const labels = ['Normal', 'Large', 'Extra Large'];
        showToast(`🔤 Text Size: ${labels[this.currentFontIndex]}`, 'info');
    },

    toggleContrast() {
        this.contrastActive = !this.contrastActive;
        document.body.classList.toggle('high-contrast', this.contrastActive);
        const btn = document.getElementById('btn-contrast');
        if (btn) btn.classList.toggle('active', this.contrastActive);
        showToast(this.contrastActive ? '🌓 High Contrast Mode enabled' : '🌓 Standard Theme enabled', 'info');
    }
};

function toggleSound() {
    SoundFX.enabled = !SoundFX.enabled;
    const icon = document.getElementById('sound-icon');
    if (icon) icon.textContent = SoundFX.enabled ? '🔊' : '🔇';
    showToast(SoundFX.enabled ? '🔊 Sound effects on' : '🔇 Sound effects muted', 'info');
}

function toggleReadingRuler() { Accessibility.toggleRuler(); }
function toggleFontSize() { Accessibility.cycleFontSize(); }
function toggleContrast() { Accessibility.toggleContrast(); }

// ===== Confetti FX =====
function launchConfetti() {
    const canvas = document.getElementById('fx-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#ff6b9d', '#4ade80', '#38bdf8', '#fbbf24', '#c084fc', '#ffffff'];

    for (let i = 0; i < 90; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.7) * 16,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            decay: Math.random() * 0.015 + 0.01
        });
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.35; // gravity
            p.alpha -= p.decay;
            if (p.alpha > 0) {
                alive = true;
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fillRect(p.x, p.y, p.size, p.size); // pixel shape
            }
        });
        ctx.globalAlpha = 1;
        if (alive) {
            requestAnimationFrame(render);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    render();
}

// ===== API Service =====
const API = {
    async getTypes() {
        const res = await fetch('/api/exercises/types');
        return res.json();
    },
    async getExercises(type) {
        const res = await fetch(`/api/exercises/${type}`);
        return res.json();
    },
    async submitExercise(submission) {
        const res = await fetch('/api/exercises/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submission)
        });
        return res.json();
    },
    async getProgress() {
        const res = await fetch('/api/progress');
        return res.json();
    },
    async resetProgress() {
        const res = await fetch('/api/progress/reset', { method: 'POST' });
        return res.json();
    }
};

// ===== App State =====
const state = {
    currentView: 'dashboard',
    currentType: null,
    currentExercise: null,
    currentExerciseList: [],
    currentExerciseIndex: 0,
    progress: null,
    previousLevel: 1,
    types: []
};

// ===== Router =====
const router = {
    navigate(view, params = {}) {
        SoundFX.playClick();
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

        state.currentView = view;

        if (view === 'dashboard') {
            document.getElementById('view-dashboard').classList.add('active');
            document.getElementById('nav-dashboard').classList.add('active');
            loadDashboard();
        } else if (view === 'exercise-list') {
            document.getElementById('view-exercise-list').classList.add('active');
            loadExerciseList(params.type);
        } else if (view === 'exercise') {
            document.getElementById('view-exercise').classList.add('active');
            loadExercise(params.exercise);
        } else if (view === 'progress') {
            document.getElementById('view-progress').classList.add('active');
            document.getElementById('nav-progress').classList.add('active');
            loadProgressView();
        }

        window.scrollTo(0, 0);
    }
};

// ===== Dashboard =====
async function loadDashboard() {
    try {
        state.types = await API.getTypes();
        state.progress = await API.getProgress();
        updateNavStats();
        renderExerciseGrid();
    } catch (err) {
        console.error('Failed to load dashboard:', err);
        showToast('Connection issue, please check server', 'error');
    }
}

function renderExerciseGrid() {
    const grid = document.getElementById('exercise-grid');
    grid.innerHTML = state.types.map(type => `
        <div class="exercise-card" style="--card-color: ${type.color}" 
             onclick="router.navigate('exercise-list', { type: '${type.type}' })"
             role="button" tabindex="0" aria-label="${type.name}">
            <span class="card-icon">${type.icon}</span>
            <h3 class="card-title">${type.name}</h3>
            <p class="card-desc">${type.description}</p>
            <div class="card-footer">
                <span class="card-count">${type.exerciseCount} Quests</span>
                <span class="card-arrow">►</span>
            </div>
        </div>
    `).join('');
}

// ===== Exercise List =====
async function loadExerciseList(type) {
    try {
        state.currentType = type;
        const exercises = await API.getExercises(type);
        state.currentExerciseList = exercises;

        const typeInfo = state.types.find(t => t.type === type) || {};
        document.getElementById('exercise-list-title').textContent =
            `${typeInfo.icon || ''} ${typeInfo.name || type}`;
        document.getElementById('exercise-list-desc').textContent =
            typeInfo.description || '';

        renderExerciseList(exercises);
    } catch (err) {
        console.error('Failed to load exercises:', err);
        showToast('Failed to load quest list', 'error');
    }
}

function renderExerciseList(exercises) {
    const list = document.getElementById('exercise-list');
    list.innerHTML = exercises.map((ex, i) => {
        const stars = '★'.repeat(ex.difficulty) + '☆'.repeat(3 - ex.difficulty);
        return `
        <div class="exercise-list-item" 
             onclick="startExercise(${i})"
             role="button" tabindex="0" aria-label="${ex.title}">
            <div class="list-item-left">
                <span class="list-item-num">#${i + 1}</span>
                <span class="list-item-title">${escapeHtml(ex.title)}</span>
            </div>
            <div class="list-item-right">
                <span class="difficulty-badge difficulty-${ex.difficulty}">${stars}</span>
                <span class="xp-badge">+${ex.xpReward} XP</span>
            </div>
        </div>`;
    }).join('');
}

function startExercise(index) {
    state.currentExerciseIndex = index;
    const exercise = state.currentExerciseList[index];
    if (exercise) {
        router.navigate('exercise', { exercise });
    }
}

// ===== Exercise View =====
function loadExercise(exercise) {
    state.currentExercise = exercise;
    
    document.getElementById('exercise-title').textContent = exercise.title;
    document.getElementById('exercise-instruction').textContent = exercise.instruction;
    document.getElementById('exercise-difficulty').textContent =
        '★'.repeat(exercise.difficulty) + '☆'.repeat(3 - exercise.difficulty);
    document.getElementById('exercise-difficulty').className =
        `difficulty-badge difficulty-${exercise.difficulty}`;
    document.getElementById('exercise-xp-reward').textContent = `+${exercise.xpReward} XP`;

    const backBtn = document.getElementById('exercise-back-btn');
    backBtn.onclick = () => router.navigate('exercise-list', { type: state.currentType });

    const area = document.getElementById('exercise-area');
    area.innerHTML = '';

    switch (exercise.type) {
        case 'LETTER_TRACING': renderLetterTracing(area, exercise); break;
        case 'TYPING_PRACTICE': renderTypingPractice(area, exercise); break;
        case 'SPELLING_PRACTICE': renderSpellingPractice(area, exercise); break;
        case 'SENTENCE_CONSTRUCTION': renderSentenceConstruction(area, exercise); break;
        case 'READING_COPYING': renderReadingCopying(area, exercise); break;
        case 'CAPITALIZATION_PUNCTUATION': renderCapitalizationPunctuation(area, exercise); break;
        case 'WORD_SPACING': renderWordSpacing(area, exercise); break;
        case 'VISUAL_RECOGNITION': renderVisualRecognition(area, exercise); break;
    }
}

// ========================================================
// 1. LETTER & SHAPE TRACING WITH GUIDELINES
// ========================================================
function renderLetterTracing(area, exercise) {
    const data = exercise.data;
    const canvasW = Math.min(520, window.innerWidth - 60);
    const canvasH = data.mode === 'word' ? 260 : data.mode === 'shape' ? 400 : 360;

    let brushSize = 7;

    area.innerHTML = `
        <div class="tracing-container">
            <div class="tracing-legend">
                <span class="legend-item"><span class="legend-line legend-sky"></span> Top Skyline</span>
                <span class="legend-item"><span class="legend-line legend-plane"></span> Midline</span>
                <span class="legend-item"><span class="legend-line legend-grass"></span> Baseline</span>
                <span class="legend-item"><span class="legend-line legend-worm"></span> Lower Descender</span>
            </div>

            <div class="trace-canvas-wrapper" style="width:${canvasW}px; height:${canvasH}px;">
                <canvas id="trace-canvas" width="${canvasW}" height="${canvasH}"></canvas>
            </div>

            <div class="trace-tools-row">
                <span style="font-family: var(--font-pixel); font-size: 0.45rem; color: var(--text-muted);">Stroke Size:</span>
                <button class="brush-size-btn" onclick="setBrushSize(4, this)">Fine</button>
                <button class="brush-size-btn active" onclick="setBrushSize(7, this)">Medium</button>
                <button class="brush-size-btn" onclick="setBrushSize(12, this)">Thick</button>
                <button class="btn btn-secondary btn-small" onclick="clearTracing()">Clear ↻</button>
                <button class="btn btn-success btn-small" onclick="submitTracing()">Check & Submit ✓</button>
            </div>
            ${data.hint ? `<div class="spelling-hint">💡 ${escapeHtml(data.hint)}</div>` : ''}
        </div>
    `;

    const canvas = document.getElementById('trace-canvas');
    const ctx = canvas.getContext('2d');
    
    // Draw 4-line guidelines and dotted glyphs
    drawTracingGuide(ctx, data, canvasW, canvasH);

    let drawing = false;
    let strokePoints = [];

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        return {
            x: (touch.clientX - rect.left) * (canvas.width / rect.width),
            y: (touch.clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    function startDraw(e) {
        e.preventDefault();
        drawing = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        strokePoints.push(pos);
        SoundFX.playKey();
    }

    function draw(e) {
        if (!drawing) return;
        e.preventDefault();
        const pos = getPos(e);
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        strokePoints.push(pos);
    }

    function stopDraw(e) {
        if (e) e.preventDefault();
        drawing = false;
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDraw);

    window._tracingState = {
        ctx, data, canvasW, canvasH,
        getPoints: () => strokePoints,
        resetPoints: () => { strokePoints = []; },
        setBrush: (s) => { brushSize = s; }
    };
}

function setBrushSize(size, btn) {
    if (window._tracingState) window._tracingState.setBrush(size);
    document.querySelectorAll('.brush-size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function drawTracingGuide(ctx, data, w, h) {
    ctx.fillStyle = '#fbf8f0';
    ctx.fillRect(0, 0, w, h);

    if (data.mode !== 'shape') {
        // Dysgraphia 4-line guidelines
        const skyY = h * 0.22;
        const planeY = h * 0.48;
        const grassY = h * 0.74;
        const wormY = h * 0.90;

        // Skyline (Blue)
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, skyY); ctx.lineTo(w, skyY); ctx.stroke();

        // Midline (Dashed Red)
        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath(); ctx.moveTo(0, planeY); ctx.lineTo(w, planeY); ctx.stroke();
        ctx.setLineDash([]);

        // Baseline (Green)
        ctx.strokeStyle = '#86efac';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, grassY); ctx.lineTo(w, grassY); ctx.stroke();

        // Lower wormline (Tan)
        ctx.strokeStyle = '#d6bc9f';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0, wormY); ctx.lineTo(w, wormY); ctx.stroke();

        // Render letter/word guide
        const text = data.letter;
        const fontSize = data.mode === 'word' ? Math.min(100, Math.floor(w / (text.length * 0.75))) : Math.min(220, Math.floor(h * 0.65));
        ctx.font = `bold ${fontSize}px "VT323", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';

        // Base text baseline aligned with grass line
        const textY = grassY;

        // Dotted guide
        ctx.fillStyle = 'rgba(160, 150, 130, 0.2)';
        ctx.fillText(text, w / 2, textY);

        ctx.strokeStyle = 'rgba(120, 110, 95, 0.45)';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 8]);
        ctx.strokeText(text, w / 2, textY);
        ctx.setLineDash([]);

        // Starting dot
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(w / 2 - (fontSize * 0.22), skyY + 12, 6, 0, Math.PI * 2);
        ctx.fill();
    } else {
        drawShapeGuide(ctx, data.letter, w, h);
    }
}

function drawShapeGuide(ctx, shape, w, h) {
    const cx = w / 2, cy = h / 2;
    const r = Math.min(w, h) * 0.32;

    ctx.strokeStyle = 'rgba(130, 120, 105, 0.5)';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 8]);

    ctx.beginPath();
    switch (shape) {
        case 'circle':
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            break;
        case 'square':
            ctx.rect(cx - r, cy - r, r * 2, r * 2);
            break;
        case 'triangle':
            ctx.moveTo(cx, cy - r);
            ctx.lineTo(cx + r, cy + r);
            ctx.lineTo(cx - r, cy + r);
            ctx.closePath();
            break;
        case 'star':
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.closePath();
            break;
        case 'heart':
            ctx.moveTo(cx, cy + r * 0.7);
            ctx.bezierCurveTo(cx - r * 1.3, cy - r * 0.2, cx - r * 0.5, cy - r * 1.1, cx, cy - r * 0.5);
            ctx.bezierCurveTo(cx + r * 0.5, cy - r * 1.1, cx + r * 1.3, cy - r * 0.2, cx, cy + r * 0.7);
            break;
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Starting green beacon
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(cx, cy - r, 7, 0, Math.PI * 2);
    ctx.fill();
}

function clearTracing() {
    SoundFX.playClick();
    if (window._tracingState) {
        const { ctx, data, canvasW, canvasH } = window._tracingState;
        drawTracingGuide(ctx, data, canvasW, canvasH);
        window._tracingState.resetPoints();
    }
}

async function submitTracing() {
    const points = window._tracingState ? window._tracingState.getPoints() : [];
    const count = points.length;
    // Score based on drawing engagement
    let score = 50;
    if (count > 80) score = 95;
    else if (count > 45) score = 85;
    else if (count > 20) score = 70;
    else if (count > 5) score = 55;
    else score = 30;

    await submitAnswer('', { score });
}

// ========================================================
// 2. TYPING PRACTICE & FINGER PLACEMENT GUIDANCE
// ========================================================
const FINGER_MAP = {
    // Left Hand
    '1': { finger: 'Left Pinky', class: 'f-l-pinky', color: '#ff6b8b' },
    'q': { finger: 'Left Pinky', class: 'f-l-pinky', color: '#ff6b8b' },
    'a': { finger: 'Left Pinky', class: 'f-l-pinky', color: '#ff6b8b' },
    'z': { finger: 'Left Pinky', class: 'f-l-pinky', color: '#ff6b8b' },

    '2': { finger: 'Left Ring Finger', class: 'f-l-ring', color: '#fb923c' },
    'w': { finger: 'Left Ring Finger', class: 'f-l-ring', color: '#fb923c' },
    's': { finger: 'Left Ring Finger', class: 'f-l-ring', color: '#fb923c' },
    'x': { finger: 'Left Ring Finger', class: 'f-l-ring', color: '#fb923c' },

    '3': { finger: 'Left Middle Finger', class: 'f-l-middle', color: '#facc15' },
    'e': { finger: 'Left Middle Finger', class: 'f-l-middle', color: '#facc15' },
    'd': { finger: 'Left Middle Finger', class: 'f-l-middle', color: '#facc15' },
    'c': { finger: 'Left Middle Finger', class: 'f-l-middle', color: '#facc15' },

    '4': { finger: 'Left Index Finger', class: 'f-l-index', color: '#4ade80' },
    '5': { finger: 'Left Index Finger', class: 'f-l-index', color: '#4ade80' },
    'r': { finger: 'Left Index Finger', class: 'f-l-index', color: '#4ade80' },
    't': { finger: 'Left Index Finger', class: 'f-l-index', color: '#4ade80' },
    'f': { finger: 'Left Index Finger', class: 'f-l-index', color: '#4ade80' },
    'g': { finger: 'Left Index Finger', class: 'f-l-index', color: '#4ade80' },
    'v': { finger: 'Left Index Finger', class: 'f-l-index', color: '#4ade80' },
    'b': { finger: 'Left Index Finger', class: 'f-l-index', color: '#4ade80' },

    // Thumbs
    ' ': { finger: 'Thumb (Left or Right)', class: 'f-thumb', color: '#38bdf8' },

    // Right Hand
    '6': { finger: 'Right Index Finger', class: 'f-r-index', color: '#4ade80' },
    '7': { finger: 'Right Index Finger', class: 'f-r-index', color: '#4ade80' },
    'y': { finger: 'Right Index Finger', class: 'f-r-index', color: '#4ade80' },
    'u': { finger: 'Right Index Finger', class: 'f-r-index', color: '#4ade80' },
    'h': { finger: 'Right Index Finger', class: 'f-r-index', color: '#4ade80' },
    'j': { finger: 'Right Index Finger', class: 'f-r-index', color: '#4ade80' },
    'n': { finger: 'Right Index Finger', class: 'f-r-index', color: '#4ade80' },
    'm': { finger: 'Right Index Finger', class: 'f-r-index', color: '#4ade80' },

    '8': { finger: 'Right Middle Finger', class: 'f-r-middle', color: '#facc15' },
    'i': { finger: 'Right Middle Finger', class: 'f-r-middle', color: '#facc15' },
    'k': { finger: 'Right Middle Finger', class: 'f-r-middle', color: '#facc15' },
    ',': { finger: 'Right Middle Finger', class: 'f-r-middle', color: '#facc15' },

    '9': { finger: 'Right Ring Finger', class: 'f-r-ring', color: '#fb923c' },
    'o': { finger: 'Right Ring Finger', class: 'f-r-ring', color: '#fb923c' },
    'l': { finger: 'Right Ring Finger', class: 'f-r-ring', color: '#fb923c' },
    '.': { finger: 'Right Ring Finger', class: 'f-r-ring', color: '#fb923c' },

    '0': { finger: 'Right Pinky', class: 'f-r-pinky', color: '#ff6b8b' },
    'p': { finger: 'Right Pinky', class: 'f-r-pinky', color: '#ff6b8b' },
    ';': { finger: 'Right Pinky', class: 'f-r-pinky', color: '#ff6b8b' },
    '-': { finger: 'Right Pinky', class: 'f-r-pinky', color: '#ff6b8b' }
};

function renderTypingPractice(area, exercise) {
    const text = exercise.data.text;
    let startTime = null;

    const chars = text.split('').map((ch, i) => {
        const cls = i === 0 ? 'char-current' : 'char-pending';
        return `<span class="${cls}" data-idx="${i}">${ch === ' ' ? '&nbsp;' : escapeHtml(ch)}</span>`;
    }).join('');

    // Virtual keyboard layout
    const row1 = ['1','2','3','4','5','6','7','8','9','0'];
    const row2 = ['q','w','e','r','t','y','u','i','o','p'];
    const row3 = ['a','s','d','f','g','h','j','k','l',';'];
    const row4 = ['z','x','c','v','b','n','m',',','.'];

    function buildRowHtml(keys) {
        return keys.map(k => {
            const fInfo = FINGER_MAP[k] || { class: '' };
            return `<div class="kb-key ${fInfo.class}" id="kb-key-${k}">${k.toUpperCase()}</div>`;
        }).join('');
    }

    area.innerHTML = `
        <div class="typing-container">
            <div class="typing-stats">
                <div class="typing-stat-item">
                    <span class="typing-stat-label">Speed:</span>
                    <span class="typing-stat-value" id="typing-wpm">0 WPM</span>
                </div>
                <div class="typing-stat-item">
                    <span class="typing-stat-label">Accuracy:</span>
                    <span class="typing-stat-value" id="typing-accuracy">100%</span>
                </div>
                <div class="typing-stat-item">
                    <span class="typing-stat-label">Timer:</span>
                    <span class="typing-stat-value" id="typing-time">0s</span>
                </div>
            </div>

            <div class="typing-target" id="typing-display">${chars}</div>

            <input type="text" class="typing-input" id="typing-input" 
                   placeholder="Click here and begin typing..." autocomplete="off" autofocus>

            <!-- Finger Guidance Keyboard -->
            <div class="virtual-keyboard-section">
                <div class="finger-guidance-banner">
                    <span class="finger-prompt-active" id="finger-prompt">
                        <span class="finger-dot" id="finger-dot" style="background:#4ade80;"></span>
                        <span id="finger-text">👉 Next key: 'T' using Left Index Finger</span>
                    </span>
                    <span style="color:var(--text-muted); font-size: 0.42rem;">Color-Coded Finger Guidance</span>
                </div>

                <div class="keyboard-rows">
                    <div class="kb-row">${buildRowHtml(row1)}</div>
                    <div class="kb-row">${buildRowHtml(row2)}</div>
                    <div class="kb-row">${buildRowHtml(row3)}</div>
                    <div class="kb-row">${buildRowHtml(row4)}</div>
                    <div class="kb-row">
                        <div class="kb-key key-space f-thumb" id="kb-key-space">SPACEBAR (THUMB)</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const input = document.getElementById('typing-input');
    const display = document.getElementById('typing-display');
    let timerInterval = null;

    function updateFingerGuidance(currentChar) {
        if (!currentChar) return;
        const low = currentChar.toLowerCase();
        const fInfo = FINGER_MAP[low] || { finger: 'Either Finger', color: '#ffffff' };
        
        const dot = document.getElementById('finger-dot');
        const textEl = document.getElementById('finger-text');
        if (dot && textEl) {
            dot.style.background = fInfo.color;
            const displayChar = currentChar === ' ' ? 'SPACE' : currentChar.toUpperCase();
            textEl.textContent = `👉 Next: '${displayChar}' with [${fInfo.finger}]`;
        }

        // Highlight virtual key
        document.querySelectorAll('.kb-key').forEach(k => k.classList.remove('active-target-key'));
        const targetId = currentChar === ' ' ? 'kb-key-space' : `kb-key-${low}`;
        const keyEl = document.getElementById(targetId);
        if (keyEl) keyEl.classList.add('active-target-key');
    }

    // Set initial finger guidance
    updateFingerGuidance(text[0]);

    input.addEventListener('input', () => {
        if (!startTime) {
            startTime = Date.now();
            timerInterval = setInterval(updateTimer, 200);
        }

        SoundFX.playKey();
        const typed = input.value;
        const totalTyped = typed.length;
        let correctCount = 0;

        const spans = display.querySelectorAll('span');
        spans.forEach((span, i) => {
            span.className = '';
            if (i < typed.length) {
                if (typed[i] === text[i]) {
                    span.className = 'char-correct';
                    correctCount++;
                } else {
                    span.className = 'char-incorrect';
                }
            } else if (i === typed.length) {
                span.className = 'char-current';
            } else {
                span.className = 'char-pending';
            }
        });

        if (typed.length < text.length) {
            updateFingerGuidance(text[typed.length]);
        }

        // Stats
        const elapsedMins = (Date.now() - startTime) / 1000 / 60;
        const wpm = elapsedMins > 0 ? Math.round((typed.length / 5) / elapsedMins) : 0;
        const accuracy = totalTyped > 0 ? Math.round((correctCount / totalTyped) * 100) : 100;
        document.getElementById('typing-wpm').textContent = `${wpm} WPM`;
        document.getElementById('typing-accuracy').textContent = `${accuracy}%`;

        // Check completion
        if (typed.length >= text.length) {
            clearInterval(timerInterval);
            const finalWpm = wpm;
            setTimeout(() => submitAnswer(typed, { wpm: finalWpm }), 300);
        }
    });

    function updateTimer() {
        if (startTime) {
            const s = Math.round((Date.now() - startTime) / 1000);
            document.getElementById('typing-time').textContent = `${s}s`;
        }
    }

    input.focus();
}

// ========================================================
// 3. SPELLING PRACTICE
// ========================================================
function renderSpellingPractice(area, exercise) {
    const data = exercise.data;
    const subType = data.subType;

    let subLabel = 'Complete the Word';
    let displayText = data.display || '';
    if (subType === 'unscramble') {
        subLabel = 'Unscramble the Letters';
        displayText = data.scrambled;
    } else if (subType === 'correction') {
        subLabel = 'Identify & Correct Misspelled Word';
        displayText = data.misspelled;
    }

    area.innerHTML = `
        <div class="spelling-container">
            <span class="spelling-sublabel">🔤 ${subLabel}</span>
            <div class="spelling-display">${escapeHtml(displayText)}</div>
            <div class="spelling-hint">💡 ${escapeHtml(data.hint)}</div>

            ${subType === 'unscramble' ? `
                <div class="sentence-bank" id="tile-bank" style="max-width:450px;">
                    ${data.scrambled.split('').map(char => `
                        <button class="word-chip" onclick="clickTile(this, '${char}')">${char.toUpperCase()}</button>
                    `).join('')}
                </div>
            ` : ''}

            <input type="text" class="spelling-input" id="spelling-input" 
                   placeholder="Type answer here..." autocomplete="off" autofocus>
            <div class="submit-row">
                <button class="btn btn-secondary btn-small" onclick="document.getElementById('spelling-input').value='';">Clear ↻</button>
                <button class="btn btn-success" onclick="submitSpelling()">Submit Word ✓</button>
            </div>
        </div>
    `;

    const input = document.getElementById('spelling-input');
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') submitSpelling();
    });
    input.focus();
}

function clickTile(btn, char) {
    SoundFX.playKey();
    const input = document.getElementById('spelling-input');
    if (input) {
        input.value += char;
        input.focus();
    }
}

function submitSpelling() {
    const input = document.getElementById('spelling-input');
    if (!input || !input.value.trim()) {
        showToast('Please type your spelling answer', 'info');
        return;
    }
    submitAnswer(input.value.trim());
}

// ========================================================
// 4. SENTENCE CONSTRUCTION (Words & Grammar)
// ========================================================
function renderSentenceConstruction(area, exercise) {
    const data = exercise.data;
    const subType = data.subType;

    if (subType === 'grammar') {
        // Grammar practice
        area.innerHTML = `
            <div class="sentence-container">
                <div class="grammar-prompt">${escapeHtml(data.sentence)}</div>
                <div class="text-edit-label" style="text-align:center;">Choose the grammatically correct word:</div>
                <div class="grammar-options-grid">
                    ${data.options.map(opt => `
                        <button class="grammar-opt-btn" onclick="submitGrammar('${escapeAttr(opt)}')">${escapeHtml(opt)}</button>
                    `).join('')}
                </div>
                ${data.explanation ? `<div class="spelling-hint" style="margin: 0 auto;">💡 Rule Hint: ${escapeHtml(data.explanation)}</div>` : ''}
            </div>
        `;
    } else {
        // Scrambled word order
        const words = [...data.words];
        // Fisher-Yates shuffle
        for (let i = words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [words[i], words[j]] = [words[j], words[i]];
        }

        let selectedWords = [];

        area.innerHTML = `
            <div class="sentence-container">
                <div>
                    <div class="text-edit-label">Available Word Bank (Click in order):</div>
                    <div class="sentence-bank" id="word-bank">
                        ${words.map((w, i) => `
                            <button class="word-chip" data-idx="${i}" onclick="toggleWord(this, '${escapeAttr(w)}')">${escapeHtml(w)}</button>
                        `).join('')}
                    </div>
                </div>
                <div>
                    <div class="text-edit-label">Your Constructed Sentence:</div>
                    <div class="sentence-build-area" id="sentence-build">
                        <span class="sentence-placeholder">Click words from bank above to assemble your sentence...</span>
                    </div>
                </div>
                <div class="submit-row">
                    <button class="btn btn-secondary btn-small" onclick="clearSentence()">Clear ↻</button>
                    <button class="btn btn-success" onclick="submitSentence()">Submit Sentence ✓</button>
                </div>
            </div>
        `;

        window._sentenceState = { selectedWords, words };
    }
}

function submitGrammar(choice) {
    submitAnswer(choice);
}

function toggleWord(chip, word) {
    SoundFX.playKey();
    const state_s = window._sentenceState;
    if (chip.classList.contains('selected')) return;

    chip.classList.add('selected');
    state_s.selectedWords.push(word);
    updateSentenceBuild();
}

function removeWord(index) {
    SoundFX.playClick();
    const state_s = window._sentenceState;
    const removed = state_s.selectedWords.splice(index, 1)[0];

    // Restore word chip in bank
    const bank = document.getElementById('word-bank');
    const chips = bank.querySelectorAll('.word-chip.selected');
    for (const chip of chips) {
        if (chip.textContent.trim() === removed) {
            chip.classList.remove('selected');
            break;
        }
    }
    updateSentenceBuild();
}

function updateSentenceBuild() {
    const build = document.getElementById('sentence-build');
    const state_s = window._sentenceState;
    if (state_s.selectedWords.length === 0) {
        build.innerHTML = '<span class="sentence-placeholder">Click words from bank above to assemble your sentence...</span>';
    } else {
        build.innerHTML = state_s.selectedWords.map((w, i) =>
            `<button class="word-chip" onclick="removeWord(${i})">${escapeHtml(w)} ✕</button>`
        ).join('');
    }
}

function clearSentence() {
    SoundFX.playClick();
    const state_s = window._sentenceState;
    if (!state_s) return;
    state_s.selectedWords = [];
    document.querySelectorAll('#word-bank .word-chip').forEach(c => c.classList.remove('selected'));
    updateSentenceBuild();
}

function submitSentence() {
    const state_s = window._sentenceState;
    if (!state_s || state_s.selectedWords.length === 0) {
        showToast('Please select words to build a sentence', 'info');
        return;
    }
    const answer = state_s.selectedWords.join(' ');
    submitAnswer(answer);
}

// ========================================================
// 5. READING & COPYING EXERCISES
// ========================================================
function renderReadingCopying(area, exercise) {
    const sentence = exercise.data.sentence;
    const displayTime = exercise.data.displayTime || 8;
    let countdown = displayTime;

    area.innerHTML = `
        <div class="reading-container">
            <div class="reading-timer" id="reading-timer">
                ⏳ Read carefully! Memorize the words. Time left: ${displayTime}s
            </div>
            <div class="reading-sentence" id="reading-sentence">${escapeHtml(sentence)}</div>
            <div style="display:none" id="reading-input-area">
                <div class="text-edit-label">Type the sentence accurately:</div>
                <textarea class="text-edit-input" id="reading-input" rows="3" 
                          placeholder="Type what you remembered here..." autofocus></textarea>
                <div class="submit-row">
                    <button class="btn btn-success" onclick="submitReading()">Check Sentence ✓</button>
                </div>
            </div>
        </div>
    `;

    const timer = setInterval(() => {
        countdown--;
        const timerEl = document.getElementById('reading-timer');
        if (timerEl) {
            timerEl.textContent = countdown > 0 
                ? `⏳ Read carefully! Memorize the words. Time left: ${countdown}s` 
                : '✍️ Now type what you read from memory!';
        }
        
        if (countdown <= 0) {
            clearInterval(timer);
            const sentenceEl = document.getElementById('reading-sentence');
            const inputArea = document.getElementById('reading-input-area');
            if (sentenceEl) sentenceEl.classList.add('hidden-text');
            if (inputArea) inputArea.style.display = 'block';
            const input = document.getElementById('reading-input');
            if (input) input.focus();
            SoundFX.playClick();
        }
    }, 1000);
}

function submitReading() {
    const input = document.getElementById('reading-input');
    if (!input || !input.value.trim()) {
        showToast('Please type the sentence', 'info');
        return;
    }
    submitAnswer(input.value.trim());
}

// ========================================================
// 6. CAPITALISATION & PUNCTUATION PRACTICE
// ========================================================
function renderCapitalizationPunctuation(area, exercise) {
    const broken = exercise.data.broken;

    area.innerHTML = `
        <div class="text-edit-container">
            <div>
                <div class="text-edit-label">Unformatted Text (Needs punctuation and capitalization):</div>
                <div class="text-edit-original">${escapeHtml(broken)}</div>
            </div>

            <div>
                <div class="text-edit-label">Quick Punctuation Inserters:</div>
                <div class="quick-punc-toolbar">
                    <span class="punc-label">Insert:</span>
                    <button class="punc-insert-btn" onclick="insertPunc('.')">Period [ . ]</button>
                    <button class="punc-insert-btn" onclick="insertPunc(',')">Comma [ , ]</button>
                    <button class="punc-insert-btn" onclick="insertPunc('?')">Question [ ? ]</button>
                    <button class="punc-insert-btn" onclick="insertPunc('!')">Exclamation [ ! ]</button>
                    <button class="punc-insert-btn" onclick="insertPunc('\"')">Quotes [ \" ]</button>
                </div>

                <div class="text-edit-label">Your Corrected Version:</div>
                <textarea class="text-edit-input" id="capPunc-input" rows="3" 
                          placeholder="Type the corrected sentence...">${escapeHtml(broken)}</textarea>
            </div>

            ${exercise.data.tip ? `<div class="spelling-hint">💡 Formatting Tip: ${escapeHtml(exercise.data.tip)}</div>` : ''}

            <div class="submit-row">
                <button class="btn btn-secondary btn-small" onclick="document.getElementById('capPunc-input').value='${escapeAttr(broken)}'">Reset ↻</button>
                <button class="btn btn-success" onclick="submitCapPunc()">Submit Corrected Text ✓</button>
            </div>
        </div>
    `;

    document.getElementById('capPunc-input').focus();
}

function insertPunc(char) {
    SoundFX.playKey();
    const input = document.getElementById('capPunc-input');
    if (input) {
        input.value += char;
        input.focus();
    }
}

function submitCapPunc() {
    const input = document.getElementById('capPunc-input');
    if (!input || !input.value.trim()) return;
    submitAnswer(input.value.trim());
}

// ========================================================
// 7. WORD SPACING EXERCISES
// ========================================================
function renderWordSpacing(area, exercise) {
    const data = exercise.data;
    const subType = data.subType;

    if (subType === 'identify') {
        // Identify incorrectly spaced text
        area.innerHTML = `
            <div class="sentence-container">
                <div class="grammar-prompt">${escapeHtml(data.prompt)}</div>
                <div class="spacing-options-list">
                    ${data.options.map(opt => `
                        <button class="spacing-opt-card" onclick="submitSpacingChoice('${escapeAttr(opt)}')">
                            ${escapeHtml(opt)}
                        </button>
                    `).join('')}
                </div>
                ${data.explanation ? `<div class="spelling-hint">💡 Spacing Guide: ${escapeHtml(data.explanation)}</div>` : ''}
            </div>
        `;
    } else {
        // Insert spaces
        const noSpaces = data.noSpaces;
        area.innerHTML = `
            <div class="text-edit-container">
                <div>
                    <div class="text-edit-label">Fused Text without Spaces:</div>
                    <div class="text-edit-original" style="letter-spacing: 3px; font-family: var(--font-pixel); font-size: 0.9rem; color: var(--color-teal);">
                        ${escapeHtml(noSpaces)}
                    </div>
                </div>

                <div>
                    <div class="text-edit-label">Type the text with one space between each word:</div>
                    <textarea class="text-edit-input" id="spacing-input" rows="2"
                              placeholder="Insert spaces here...">${escapeHtml(noSpaces)}</textarea>
                </div>

                ${data.hint ? `<div class="spelling-hint">💡 Hint: ${escapeHtml(data.hint)}</div>` : ''}

                <div class="submit-row">
                    <button class="btn btn-success" onclick="submitSpacingInput()">Check Spacing ✓</button>
                </div>
            </div>
        `;
        document.getElementById('spacing-input').focus();
    }
}

function submitSpacingChoice(choice) {
    submitAnswer(choice);
}

function submitSpacingInput() {
    const input = document.getElementById('spacing-input');
    if (!input || !input.value.trim()) return;
    submitAnswer(input.value.trim());
}

// ========================================================
// 8. VISUAL LETTER RECOGNITION (b/d, p/q & Image Matching)
// ========================================================
function renderVisualRecognition(area, exercise) {
    const data = exercise.data;
    const options = data.options;
    const subType = data.subType;

    let mnemonicHtml = '';
    if (subType === 'confused') {
        mnemonicHtml = `
            <div class="mnemonic-box">
                💡 <strong>Dysgraphia Tip:</strong> 'b' has a belly in front 🏏 • 'd' has a stick behind 🚪
            </div>
        `;
    }

    area.innerHTML = `
        <div class="recognition-container">
            ${data.imageEmoji ? `
                <div class="recognition-image-card" role="img" aria-label="Target Image">
                    ${data.imageEmoji}
                </div>
            ` : ''}

            <div class="recognition-prompt">${escapeHtml(data.prompt)}</div>
            ${mnemonicHtml}

            <div class="recognition-options">
                ${options.map(opt => `
                    <button class="recognition-option" 
                            onclick="selectLetter(this, '${escapeAttr(opt)}')"
                            aria-label="Option ${opt}">
                        ${escapeHtml(opt)}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function selectLetter(btn, letter) {
    // Lock buttons
    document.querySelectorAll('.recognition-option').forEach(b => {
        b.style.pointerEvents = 'none';
    });

    const correct = state.currentExercise.data.targetLetter;
    if (letter.toLowerCase() === correct.toLowerCase()) {
        btn.classList.add('correct-choice');
        SoundFX.playCorrect();
    } else {
        btn.classList.add('wrong-choice');
        SoundFX.playWrong();
        // Highlight correct button
        document.querySelectorAll('.recognition-option').forEach(b => {
            if (b.textContent.trim().toLowerCase() === correct.toLowerCase()) {
                b.classList.add('correct-choice');
            }
        });
    }

    setTimeout(() => submitAnswer(letter), 850);
}

// ========================================================
// Submission Handler & Scoring
// ========================================================
async function submitAnswer(answer, details = {}) {
    try {
        const submission = {
            exerciseId: state.currentExercise.id,
            type: state.currentExercise.type,
            answer: answer,
            details: details
        };

        const response = await API.submitExercise(submission);
        state.previousLevel = state.progress ? state.progress.level : 1;
        state.progress = response.progress;
        
        updateNavStats();

        if (response.result.correct && response.result.score >= 70) {
            SoundFX.playCorrect();
            if (response.result.score >= 90) {
                launchConfetti();
            }
        } else {
            SoundFX.playWrong();
        }

        showResultModal(response.result);

        // Check for level up
        if (state.progress.level > state.previousLevel) {
            SoundFX.playLevelUp();
            setTimeout(() => showLevelUpModal(state.progress.level), 1400);
        }

        // Check new achievements
        checkNewAchievements(response.progress);

    } catch (err) {
        console.error('Submission failed:', err);
        showToast('Error sending submission to server', 'error');
    }
}

// ===== Result Modal =====
function showResultModal(result) {
    const modal = document.getElementById('result-modal');
    const icon = document.getElementById('result-icon');
    const title = document.getElementById('result-title');
    const scoreDisplay = document.getElementById('result-score-display');
    const feedback = document.getElementById('result-feedback');
    const xp = document.getElementById('result-xp');
    const detailsEl = document.getElementById('result-details');

    if (result.score >= 85) {
        icon.textContent = '🌟';
        title.textContent = 'Masterful Victory!';
    } else if (result.score >= 60) {
        icon.textContent = '⭐';
        title.textContent = 'Quest Complete!';
    } else {
        icon.textContent = '💪';
        title.textContent = 'Courageous Effort!';
    }

    scoreDisplay.textContent = `${result.score} / 100 PTS`;
    feedback.textContent = result.feedback;
    xp.textContent = `+${result.xpEarned} XP Gained!`;

    // Show details if there's a target answer
    const correctVal = result.details?.correctText || result.details?.correctAnswer || 
                      result.details?.correctSentence || result.details?.correctLetter || '';
    if (correctVal && result.score < 100) {
        detailsEl.textContent = 'Target Answer: ' + correctVal;
        detailsEl.classList.add('has-content');
    } else {
        detailsEl.classList.remove('has-content');
    }

    const nextBtn = document.getElementById('result-next-btn');
    const retryBtn = document.getElementById('result-retry-btn');
    const backBtn = document.getElementById('result-back-btn');

    const hasNext = state.currentExerciseIndex < state.currentExerciseList.length - 1;
    nextBtn.style.display = hasNext ? 'block' : 'none';
    nextBtn.onclick = () => {
        closeResultModal();
        startExercise(state.currentExerciseIndex + 1);
    };

    retryBtn.onclick = () => {
        closeResultModal();
        loadExercise(state.currentExercise);
    };

    backBtn.onclick = () => {
        closeResultModal();
        router.navigate('exercise-list', { type: state.currentType });
    };

    modal.classList.remove('hidden');
}

function closeResultModal() {
    document.getElementById('result-modal').classList.add('hidden');
}

function showLevelUpModal(level) {
    document.getElementById('levelup-level').textContent = `Rank Level ${level}`;
    document.getElementById('levelup-modal').classList.remove('hidden');
    launchConfetti();
    showToast(`🎉 LEVEL UP! You reached Level ${level}!`, 'achievement');
}

function closeLevelUpModal() {
    document.getElementById('levelup-modal').classList.add('hidden');
}

// ===== Progress View =====
async function loadProgressView() {
    try {
        state.progress = await API.getProgress();
        if (!state.types.length) {
            state.types = await API.getTypes();
        }
        updateNavStats();
        renderProgress();
    } catch (err) {
        console.error('Failed to load progress:', err);
    }
}

function renderProgress() {
    const p = state.progress;
    const content = document.getElementById('progress-content');

    const allAchievements = [
        { id: 'FIRST_STEP', icon: '🎯', name: 'First Quill', desc: 'Complete your first exercise quest' },
        { id: 'GETTING_STARTED', icon: '📚', name: 'Novice Scribe', desc: 'Complete 10 training exercises' },
        { id: 'DEDICATED_LEARNER', icon: '🎓', name: 'Dedicated Learner', desc: 'Complete 25 training exercises' },
        { id: 'WORD_WARRIOR', icon: '⚔️', name: 'Word Warrior', desc: 'Conquer 50 exercises with courage' },
        { id: 'MASTER_CRAFTER', icon: '👑', name: 'Grand Master Crafter', desc: 'Complete 100 exercise challenges' },
        { id: 'LEVEL_5', icon: '🏅', name: 'Ascendant Knight', desc: 'Reach Level 5 rank' },
        { id: 'LEVEL_10', icon: '🌟', name: 'Legendary Artisan', desc: 'Reach Level 10 rank' },
        { id: 'ON_FIRE', icon: '🔥', name: 'Focus Streak x5', desc: 'Reach a streak of 5 exercises' },
        { id: 'UNSTOPPABLE', icon: '💎', name: 'Focus Streak x10', desc: 'Reach a streak of 10 exercises' },
        { id: 'EXPLORER', icon: '🗺️', name: 'Realm Explorer', desc: 'Train across all 8 disciplines' },
    ];

    const typeIcons = {
        'LETTER_TRACING': '✍️', 'TYPING_PRACTICE': '⌨️', 'SPELLING_PRACTICE': '🔤',
        'SENTENCE_CONSTRUCTION': '📝', 'READING_COPYING': '📖',
        'CAPITALIZATION_PUNCTUATION': '🔠', 'WORD_SPACING': '📏', 'VISUAL_RECOGNITION': '👀'
    };

    const typeNames = {
        'LETTER_TRACING': 'Letter & Shape Tracing', 'TYPING_PRACTICE': 'Typing & Finger Guidance',
        'SPELLING_PRACTICE': 'Spelling Mastery', 'SENTENCE_CONSTRUCTION': 'Sentence & Grammar',
        'READING_COPYING': 'Reading & Memory', 'CAPITALIZATION_PUNCTUATION': 'Capitalization & Punctuation',
        'WORD_SPACING': 'Word Spacing', 'VISUAL_RECOGNITION': 'Visual Recognition'
    };

    content.innerHTML = `
        <!-- Overview Stats -->
        <div class="progress-overview">
            <div class="progress-stat-card">
                <div class="progress-stat-icon">⭐</div>
                <div class="progress-stat-value">${p.totalXp}</div>
                <div class="progress-stat-label">Total XP Earned</div>
            </div>
            <div class="progress-stat-card">
                <div class="progress-stat-icon">🏆</div>
                <div class="progress-stat-value">Rank ${p.level}</div>
                <div class="progress-stat-label">Player Level</div>
            </div>
            <div class="progress-stat-card">
                <div class="progress-stat-icon">🔥</div>
                <div class="progress-stat-value">${p.streak}</div>
                <div class="progress-stat-label">Active Streak</div>
            </div>
            <div class="progress-stat-card">
                <div class="progress-stat-icon">📝</div>
                <div class="progress-stat-value">${p.exercisesCompleted}</div>
                <div class="progress-stat-label">Quests Completed</div>
            </div>
        </div>

        <!-- By Type -->
        <div class="progress-section">
            <h3 class="progress-section-title">📊 Mastery by Discipline</h3>
            ${Object.keys(typeNames).map(type => {
                const count = p.completedByType[type] || 0;
                const typeInfo = state.types.find(t => t.type === type);
                const total = typeInfo ? typeInfo.exerciseCount : 8;
                const pct = Math.min(100, Math.round((count / total) * 100));
                const bestScore = p.bestScoreByType[type] || 0;
                return `
                <div class="progress-type-row">
                    <span class="progress-type-icon">${typeIcons[type]}</span>
                    <span class="progress-type-name">${typeNames[type]}</span>
                    <div class="progress-bar-wrapper">
                        <div class="progress-bar-inner" style="width: ${pct}%"></div>
                    </div>
                    <span class="progress-type-count">${count} done (Best: ${bestScore}pts)</span>
                </div>`;
            }).join('')}
        </div>

        <!-- Achievements -->
        <div class="progress-section">
            <h3 class="progress-section-title">🏅 Trophies & Milestones</h3>
            <div class="achievements-grid">
                ${allAchievements.map(a => `
                    <div class="achievement-card ${p.achievements.includes(a.id) ? 'unlocked' : ''}">
                        <div class="achievement-icon">${a.icon}</div>
                        <div class="achievement-name">${a.name}</div>
                        <div class="achievement-desc">${a.desc}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Reset Button -->
        <div style="text-align: center; margin-top: 24px;">
            <button class="btn btn-danger btn-small" onclick="resetProgress()">Reset Hero Journey</button>
        </div>
    `;
}

async function resetProgress() {
    if (confirm('Are you sure you want to reset all your WordCraft hero progress?')) {
        try {
            state.progress = await API.resetProgress();
            state.previousLevel = 1;
            updateNavStats();
            renderProgress();
            showToast('Progress has been reset', 'info');
        } catch (err) {
            showToast('Failed to reset progress', 'error');
        }
    }
}

// ===== Nav Stats Update =====
function updateNavStats() {
    if (!state.progress) return;
    const p = state.progress;
    document.getElementById('nav-xp').textContent = p.totalXp;
    document.getElementById('nav-level').textContent = p.level;
    document.getElementById('nav-streak').textContent = p.streak;

    const xpForLevel = p.level * 100;
    const currentXp = p.currentLevelXp;
    const pct = Math.min(100, (currentXp / xpForLevel) * 100);
    document.getElementById('xp-bar-fill').style.width = pct + '%';
    document.getElementById('xp-bar-text').textContent = `${currentXp} / ${xpForLevel} XP`;
}

// ===== Achievements Check =====
let knownAchievements = [];
function checkNewAchievements(progress) {
    const newOnes = progress.achievements.filter(a => !knownAchievements.includes(a));
    const names = {
        'FIRST_STEP': '🎯 First Quill Unlocked!',
        'GETTING_STARTED': '📚 Novice Scribe Unlocked!',
        'DEDICATED_LEARNER': '🎓 Dedicated Learner Unlocked!',
        'WORD_WARRIOR': '⚔️ Word Warrior Unlocked!',
        'MASTER_CRAFTER': '👑 Grand Master Crafter Unlocked!',
        'LEVEL_5': '🏅 Ascendant Knight Unlocked!',
        'LEVEL_10': '🌟 Legendary Artisan Unlocked!',
        'ON_FIRE': '🔥 Focus Streak x5!',
        'UNSTOPPABLE': '💎 Focus Streak x10!',
        'EXPLORER': '🗺️ Realm Explorer Unlocked!'
    };
    newOnes.forEach(a => {
        showToast(names[a] || `Trophy: ${a}`, 'achievement');
    });
    knownAchievements = [...progress.achievements];
}

// ===== Toast =====
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ===== Utility Helpers =====
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeResultModal();
        closeLevelUpModal();
    }
});

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    Accessibility.init();
    router.navigate('dashboard');

    API.getProgress().then(p => {
        state.progress = p;
        knownAchievements = [...p.achievements];
        updateNavStats();
    }).catch(err => console.log('Init progress load:', err));
});
