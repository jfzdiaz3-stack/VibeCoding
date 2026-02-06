/**
 * FitLife Pro - JavaScript Application
 * Vanilla JS, no external dependencies
 */

// ==========================================
// DATA & CONFIGURATION
// ==========================================

const foodData = [
    {
        id: 1,
        name: "Pechuga de Pollo",
        category: "protein",
        emoji: "🍗",
        calories: 165,
        protein: 31,
        carbs: 0,
        fats: 3.6,
        badge: "Alta Proteína"
    },
    {
        id: 2,
        name: "Salmón Atlántico",
        category: "fats",
        emoji: "🐟",
        calories: 208,
        protein: 20,
        carbs: 0,
        fats: 13,
        badge: "Omega-3"
    },
    {
        id: 3,
        name: "Avena en Hojuelas",
        category: "carbs",
        emoji: "🥣",
        calories: 389,
        protein: 16.9,
        carbs: 66,
        fats: 6.9,
        badge: "Energía"
    },
    {
        id: 4,
        name: "Huevos Enteros",
        category: "protein",
        emoji: "🥚",
        calories: 155,
        protein: 13,
        carbs: 1.1,
        fats: 11,
        badge: "Completo"
    },
    {
        id: 5,
        name: "Aguacate",
        category: "fats",
        emoji: "🥑",
        calories: 160,
        protein: 2,
        carbs: 8.5,
        fats: 15,
        badge: "Grasas Saludables"
    },
    {
        id: 6,
        name: "Batata",
        category: "carbs",
        emoji: "🍠",
        calories: 86,
        protein: 1.6,
        carbs: 20,
        fats: 0.1,
        badge: "Fibra"
    },
    {
        id: 7,
        name: "Almendras",
        category: "fats",
        emoji: "🥜",
        calories: 579,
        protein: 21,
        carbs: 22,
        fats: 50,
        badge: "Snack"
    },
    {
        id: 8,
        name: "Atún en Lata",
        category: "protein",
        emoji: "🐟",
        calories: 132,
        protein: 28,
        carbs: 0,
        fats: 1,
        badge: "Rápido"
    }
];

const activityMultipliers = {
    1: { value: 1.2, label: "Sedentario" },
    2: { value: 1.375, label: "Ligero" },
    3: { value: 1.55, label: "Moderado" },
    4: { value: 1.725, label: "Activo" },
    5: { value: 1.9, label: "Muy Activo" }
};

const progressData = {
    weight: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        data: [120, 125, 123, 128, 130, 135, 140],
        color: '#10B981',
        trend: '+12%'
    },
    cardio: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        data: [30, 45, 40, 50, 45, 60, 55],
        color: '#3B82F6',
        trend: '+8%'
    },
    calories: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        data: [320, 450, 400, 520, 480, 600, 550],
        color: '#F59E0B',
        trend: '+15%'
    }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const animateValue = (element, start, end, duration, suffix = '') => {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value + suffix;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
};

// ==========================================
// CHART ENGINE (Vanilla JS Canvas)
// ==========================================

class ChartEngine {
    constructor(canvasId) {
        this.canvas = $(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.dpr = window.devicePixelRatio || 1;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width * this.dpr;
        this.canvas.height = rect.height * this.dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.scale(this.dpr, this.dpr);
        this.width = rect.width;
        this.height = rect.height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}

class BarChart extends ChartEngine {
    constructor(canvasId, data) {
        super(canvasId);
        this.data = data;
        this.animationProgress = 0;
        this.animate();
    }

    animate() {
        const duration = 1000;
        const start = performance.now();
        
        const frame = (now) => {
            const elapsed = now - start;
            this.animationProgress = Math.min(elapsed / duration, 1);
            this.draw();
            
            if (this.animationProgress < 1) {
                requestAnimationFrame(frame);
            }
        };
        requestAnimationFrame(frame);
    }

    draw() {
        this.clear();
        const { width, height } = this;
        const padding = { top: 40, right: 20, bottom: 60, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        
        const maxValue = Math.max(...this.data.map(d => d.value));
        const barWidth = (chartWidth / this.data.length) * 0.6;
        const spacing = (chartWidth / this.data.length) * 0.4;

        // Draw axes
        this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(padding.left, padding.top);
        this.ctx.lineTo(padding.left, height - padding.bottom);
        this.ctx.lineTo(width - padding.right, height - padding.bottom);
        this.ctx.stroke();

        // Draw bars
        this.data.forEach((item, index) => {
            const x = padding.left + (index * (barWidth + spacing)) + (spacing / 2);
            const barHeight = (item.value / maxValue) * chartHeight * this.animationProgress;
            const y = height - padding.bottom - barHeight;

            // Bar gradient
            const gradient = this.ctx.createLinearGradient(0, y, 0, height - padding.bottom);
            gradient.addColorStop(0, item.color);
            gradient.addColorStop(1, item.color + '40');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, barWidth, barHeight);

            // Bar top highlight
            this.ctx.fillStyle = item.color;
            this.ctx.fillRect(x, y, barWidth, 3);

            // Labels
            this.ctx.fillStyle = '#94A3B8';
            this.ctx.font = '12px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(item.label, x + barWidth / 2, height - padding.bottom + 20);

            // Values
            if (this.animationProgress > 0.5) {
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = 'bold 14px Inter';
                this.ctx.fillText(Math.round(item.value * this.animationProgress), x + barWidth / 2, y - 10);
            }
        });

        // Y-axis labels
        this.ctx.fillStyle = '#64748B';
        this.ctx.font = '11px Inter';
        this.ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const value = Math.round((maxValue / 5) * i);
            const y = height - padding.bottom - ((chartHeight / 5) * i);
            this.ctx.fillText(value, padding.left - 10, y + 4);
        }
    }
}

class LineChart extends ChartEngine {
    constructor(canvasId, data, labels, color) {
        super(canvasId);
        this.data = data;
        this.labels = labels;
        this.color = color;
        this.points = [];
        this.animationProgress = 0;
        this.animate();
    }

    animate() {
        const duration = 1200;
        const start = performance.now();
        
        const frame = (now) => {
            const elapsed = now - start;
            this.animationProgress = Math.min(elapsed / duration, 1);
            this.draw();
            
            if (this.animationProgress < 1) {
                requestAnimationFrame(frame);
            }
        };
        requestAnimationFrame(frame);
    }

    draw() {
        this.clear();
        const { width, height } = this;
        const padding = { top: 40, right: 30, bottom: 50, left: 50 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const maxValue = Math.max(...this.data) * 1.1;
        const minValue = Math.min(...this.data) * 0.9;
        const range = maxValue - minValue;

        // Calculate points
        this.points = this.data.map((value, index) => ({
            x: padding.left + (index / (this.data.length - 1)) * chartWidth,
            y: padding.top + chartHeight - ((value - minValue) / range) * chartHeight,
            value: value
        }));

        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartHeight / 4) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(padding.left, y);
            this.ctx.lineTo(width - padding.right, y);
            this.ctx.stroke();
        }

        // Draw line
        if (this.points.length > 1) {
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            // Create gradient fill
            const gradient = this.ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
            gradient.addColorStop(0, this.color + '40');
            gradient.addColorStop(1, this.color + '00');

            this.ctx.beginPath();
            this.ctx.moveTo(this.points[0].x, this.points[0].y);
            
            // Draw animated path
            const totalPoints = this.points.length;
            const currentPoints = Math.floor(totalPoints * this.animationProgress);
            
            for (let i = 1; i < currentPoints; i++) {
                const cp1x = (this.points[i - 1].x + this.points[i].x) / 2;
                const cp1y = this.points[i - 1].y;
                const cp2x = (this.points[i - 1].x + this.points[i].x) / 2;
                const cp2y = this.points[i].y;
                this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, this.points[i].x, this.points[i].y);
            }
            
            this.ctx.stroke();

            // Fill area
            if (this.animationProgress > 0.8) {
                this.ctx.lineTo(this.points[currentPoints - 1]?.x || this.points[0].x, height - padding.bottom);
                this.ctx.lineTo(this.points[0].x, height - padding.bottom);
                this.ctx.closePath();
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
            }
        }

        // Draw points
        if (this.animationProgress > 0.5) {
            this.points.forEach((point, index) => {
                if (index < this.points.length * this.animationProgress) {
                    // Outer circle
                    this.ctx.beginPath();
                    this.ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
                    this.ctx.fillStyle = this.color;
                    this.ctx.fill();
                    
                    // Inner circle
                    this.ctx.beginPath();
                    this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
                    this.ctx.fillStyle = '#0F172A';
                    this.ctx.fill();

                    // Value label on hover (show last point)
                    if (index === this.points.length - 1 && this.animationProgress === 1) {
                        this.ctx.fillStyle = '#FFFFFF';
                        this.ctx.font = 'bold 12px Inter';
                        this.ctx.textAlign = 'center';
                        this.ctx.fillText(point.value, point.x, point.y - 15);
                    }
                }
            });
        }

        // X-axis labels
        this.ctx.fillStyle = '#94A3B8';
        this.ctx.font = '12px Inter';
        this.ctx.textAlign = 'center';
        this.labels.forEach((label, index) => {
            const x = padding.left + (index / (this.labels.length - 1)) * chartWidth;
            this.ctx.fillText(label, x, height - padding.bottom + 25);
        });
    }
}

// ==========================================
// APPLICATION LOGIC
// ==========================================

class FitLifeApp {
    constructor() {
        this.init();
    }

    init() {
        this.initNavigation();
        this.initCharts();
        this.initNutrition();
        this.initCalculator();
        this.initScrollAnimations();
        this.initCounters();
    }

    initNavigation() {
        const navbar = $('#navbar');
        const hamburger = $('#hamburger');
        const navLinks = $('#navLinks');

        // Scroll effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Mobile menu
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu on link click
        $$('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    initCharts() {
        // Calorie comparison chart
        const caloriesData = [
            { label: 'Fuerza', value: 350, color: '#10B981' },
            { label: 'Cardio', value: 520, color: '#3B82F6' },
            { label: 'HIIT', value: 680, color: '#F59E0B' },
            { label: 'Movilidad', value: 180, color: '#8B5CF6' }
        ];
        
        setTimeout(() => {
            new BarChart('#caloriesChart', caloriesData);
            this.loadProgressChart('weight');
        }, 100);

        // Tab switching
        $$('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                $$('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const metric = e.target.dataset.metric;
                this.loadProgressChart(metric);
            });
        });
    }

    loadProgressChart(metric) {
        const data = progressData[metric];
        const canvas = $('#progressChart');
        const trendValue = $('#trendValue');
        
        // Update trend
        if (trendValue) {
            trendValue.textContent = data.trend;
        }

        // Destroy previous chart instance if exists
        if (canvas.chart) {
            canvas.chart = null;
        }

        // Small delay for smooth transition
        setTimeout(() => {
            canvas.chart = new LineChart('#progressChart', data.data, data.labels, data.color);
        }, 50);
    }

    initNutrition() {
        const grid = $('#foodGrid');
        
        // Render food cards
        const renderFoods = (filter = 'all') => {
            grid.innerHTML = '';
            const filtered = filter === 'all' 
                ? foodData 
                : foodData.filter(f => f.category === filter);
            
            filtered.forEach((food, index) => {
                const card = document.createElement('div');
                card.className = 'food-card';
                card.style.animationDelay = `${index * 0.1}s`;
                card.innerHTML = `
                    <div class="food-image">
                        <span style="z-index:1">${food.emoji}</span>
                        <span class="food-badge">${food.badge}</span>
                    </div>
                    <div class="food-content">
                        <h3 class="food-name">${food.name}</h3>
                        <p class="food-category">${food.category}</p>
                        <div class="food-macros">
                            <div class="macro">
                                <span class="macro-value">${food.calories}</span>
                                <span class="macro-label">Kcal</span>
                            </div>
                            <div class="macro">
                                <span class="macro-value">${food.protein}g</span>
                                <span class="macro-label">Prot</span>
                            </div>
                            <div class="macro">
                                <span class="macro-value">${food.carbs}g</span>
                                <span class="macro-label">Carb</span>
                            </div>
                            <div class="macro">
                                <span class="macro-value">${food.fats}g</span>
                                <span class="macro-label">Gras</span>
                            </div>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
        };

        renderFoods();

        // Filter buttons
        $$('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                $$('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                renderFoods(e.target.dataset.filter);
            });
        });
    }

    initCalculator() {
        let selectedGender = 'male';
        const genderBtns = $$('.gender-btn');
        const activitySlider = $('#activity');
        const activityValue = $('#activityValue');
        const calculateBtn = $('#calculateBtn');

        // Gender selection
        genderBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                genderBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add Parece que la respuesta se cortó. Aquí está la continuación del archivo `script.js` completo:

```javascript
                btn.classList.add('active');
                selectedGender = btn.dataset.gender;
            });
        });

        // Activity slider
        activitySlider.addEventListener('input', (e) => {
            const level = e.target.value;
            activityValue.textContent = activityMultipliers[level].label;
        });

        // Calculate button
        calculateBtn.addEventListener('click', () => {
            this.calculateTMB(selectedGender);
        });
    }

    calculateTMB(gender) {
        const age = parseInt($('#age').value);
        const weight = parseFloat($('#weight').value);
        const height = parseFloat($('#height').value);
        const activityLevel = parseInt($('#activity').value);

        if (!age || !weight || !height) {
            alert('Por favor completa todos los campos');
            return;
        }

        // Mifflin-St Jeor Equation
        let tmb;
        if (gender === 'male') {
            tmb = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            tmb = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }

        const multiplier = activityMultipliers[activityLevel].value;
        const maintenance = Math.round(tmb * multiplier);
        const deficit = maintenance - 500;
        const surplus = maintenance + 500;

        this.displayResults(tmb, maintenance, deficit, surplus);
    }

    displayResults(tmb, maintenance, deficit, surplus) {
        const resultsContainer = $('#results');
        
        resultsContainer.innerHTML = `
            <div class="results-content">
                <div class="result-main">
                    <div class="result-label">Tu Tasa Metabólica Basal</div>
                    <div class="result-value">${Math.round(tmb)}<span class="result-unit"> kcal</span></div>
                    <div class="result-sub">Calorías necesarias en reposo absoluto</div>
                </div>
                
                <div class="result-details">
                    <div class="detail-item">
                        <span class="detail-label">Mantenimiento</span>
                        <span class="detail-value" style="color: #3B82F6">${maintenance} kcal</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Pérdida de grasa</span>
                        <span class="detail-value" style="color: #10B981">${deficit} kcal</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Ganancia muscular</span>
                        <span class="detail-value" style="color: #F59E0B">${surplus} kcal</span>
                    </div>
                </div>

                <div class="result-chart">
                    <canvas id="resultChart"></canvas>
                </div>
            </div>
        `;

        // Draw result chart
        setTimeout(() => {
            this.drawResultChart(tmb, maintenance, deficit, surplus);
        }, 100);
    }

    drawResultChart(tmb, maintenance, deficit, surplus) {
        const canvas = $('#resultChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const centerX = width / 2;
        const centerY = height / 2 + 20;
        const radius = Math.min(width, height) / 2 - 40;

        const data = [
            { label: 'TMB', value: tmb, color: '#8B5CF6' },
            { label: 'Mantenimiento', value: maintenance, color: '#3B82F6' },
            { label: 'Déficit', value: deficit, color: '#10B981' },
            { label: 'Superávit', value: surplus, color: '#F59E0B' }
        ];

        const maxValue = Math.max(...data.map(d => d.value));
        let currentAngle = -Math.PI / 2;

        // Draw radar chart
        data.forEach((item, index) => {
            const angle = (Math.PI * 2 / data.length) * index;
            const value = item.value / maxValue;
            
            // Draw axis
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(angle - Math.PI / 2) * radius,
                centerY + Math.sin(angle - Math.PI / 2) * radius
            );
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
            ctx.stroke();

            // Draw data point
            const pointRadius = radius * value * 0.8;
            const pointX = centerX + Math.cos(angle - Math.PI / 2) * pointRadius;
            const pointY = centerY + Math.sin(angle - Math.PI / 2) * pointRadius;

            // Draw line to center
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(pointX, pointY);
            ctx.strokeStyle = item.color + '40';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw point
            ctx.beginPath();
            ctx.arc(pointX, pointY, 6, 0, Math.PI * 2);
            ctx.fillStyle = item.color;
            ctx.fill();
            ctx.strokeStyle = '#0F172A';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw label
            const labelRadius = radius + 25;
            const labelX = centerX + Math.cos(angle - Math.PI / 2) * labelRadius;
            const labelY = centerY + Math.sin(angle - Math.PI / 2) * labelRadius;
            
            ctx.fillStyle = '#94A3B8';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.label, labelX, labelY - 8);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 11px Inter';
            ctx.fillText(Math.round(item.value), labelX, labelY + 8);
        });

        // Draw connecting polygon
        ctx.beginPath();
        data.forEach((item, index) => {
            const angle = (Math.PI * 2 / data.length) * index;
            const value = item.value / maxValue;
            const pointRadius = radius * value * 0.8;
            const x = centerX + Math.cos(angle - Math.PI / 2) * pointRadius;
            const y = centerY + Math.sin(angle - Math.PI / 2) * pointRadius;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();
        ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
        ctx.fill();
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Animate counters if it's a stat card
                    if (entry.target.classList.contains('stat-card')) {
                        const valueEl = entry.target.querySelector('.stat-value');
                        if (valueEl && !valueEl.classList.contains('counted')) {
                            const target = parseInt(valueEl.dataset.target);
                            const suffix = entry.target.querySelector('.stat-unit').textContent;
                            animateValue(valueEl, 0, target, 2000, suffix === '%' ? '%' : '');
                            valueEl.classList.add('counted');
                        }
                    }
                }
            });
        }, observerOptions);

        // Observe elements
        $$('.stat-card, .chart-card, .food-card, .section-header').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        // Add animation class styles
        const style = document.createElement('style');
        style.textContent = `
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }

    initCounters() {
        // Animate hero stats on load
        setTimeout(() => {
            $$('.hero-stats .stat-number').forEach(stat => {
                const text = stat.textContent;
                const num = parseInt(text);
                const suffix = text.replace(/[0-9]/g, '');
                if (!isNaN(num)) {
                    stat.textContent = '0' + suffix;
                    animateValue(stat, 0, num, 2000, suffix);
                }
            });
        }, 500);
    }
}

// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    new FitLifeApp();
});