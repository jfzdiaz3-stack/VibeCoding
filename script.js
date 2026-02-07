// ==========================================
// DATOS DE EJEMPLO PARA COMPARADOR
// ==========================================

const weeksData = [
    {
        week: 1,
        date: "1-7 Ene",
        status: "Inicio",
        calories: 2450,
        minutes: 180,
        avgWeight: 45,
        sessions: 4
    },
    {
        week: 2,
        date: "8-14 Ene",
        status: "Adaptación",
        calories: 2800,
        minutes: 210,
        avgWeight: 52,
        sessions: 5
    },
    {
        week: 3,
        date: "15-21 Ene",
        status: "Progreso",
        calories: 3200,
        minutes: 240,
        avgWeight: 58,
        sessions: 5
    },
    {
        week: 4,
        date: "22-28 Ene",
        status: "Consolidación",
        calories: 3650,
        minutes: 285,
        avgWeight: 65,
        sessions: 6
    },
    {
        week: 5,
        date: "29 Ene-4 Feb",
        status: "Superación",
        calories: 4100,
        minutes: 320,
        avgWeight: 72,
        sessions: 6
    },
    {
        week: 6,
        date: "5-11 Feb",
        status: "Pico",
        calories: 4580,
        minutes: 360,
        avgWeight: 80,
        sessions: 7
    }
];

// ==========================================
// CLASE PARA GRÁFICA DE COMPARACIÓN
// ==========================================

class ComparisonChart extends ChartEngine {
    constructor(canvasId, data1, data2, labels) {
        super(canvasId);
        this.data1 = data1;
        this.data2 = data2;
        this.labels = labels;
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
        const padding = { top: 60, right: 40, bottom: 80, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const maxValue = Math.max(...this.data1, ...this.data2) * 1.2;
        const barWidth = (chartWidth / this.labels.length) * 0.35;
        const spacing = (chartWidth / this.labels.length) * 0.3;

        // Dibujar líneas de grid horizontales
        this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(padding.left, y);
            this.ctx.lineTo(width - padding.right, y);
            this.ctx.stroke();
        }

        // Dibujar barras agrupadas
        this.labels.forEach((label, index) => {
            const groupX = padding.left + (index * (chartWidth / this.labels.length)) + (chartWidth / this.labels.length - (barWidth * 2 + 10)) / 2;
            
            // Barra Semana 1 (izquierda)
            const height1 = (this.data1[index] / maxValue) * chartHeight * this.animationProgress;
            const y1 = padding.top + chartHeight - height1;
            
            const gradient1 = this.ctx.createLinearGradient(0, y1, 0, padding.top + chartHeight);
            gradient1.addColorStop(0, '#3B82F6');
            gradient1.addColorStop(1, '#3B82F640');
            
            this.ctx.fillStyle = gradient1;
            this.ctx.fillRect(groupX, y1, barWidth, height1);
            
            // Barra Semana 2 (derecha)
            const height2 = (this.data2[index] / maxValue) * chartHeight * this.animationProgress;
            const y2 = padding.top + chartHeight - height2;
            
            const gradient2 = this.ctx.createLinearGradient(0, y2, 0, padding.top + chartHeight);
            gradient2.addColorStop(0, '#10B981');
            gradient2.addColorStop(1, '#10B98140');
            
            this.ctx.fillStyle = gradient2;
            this.ctx.fillRect(groupX + barWidth + 10, y2, barWidth, height2);

            // Valores sobre las barras
            if (this.animationProgress > 0.7) {
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = 'bold 12px Inter';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(Math.round(this.data1[index]), groupX + barWidth / 2, y1 - 8);
                this.ctx.fillText(Math.round(this.data2[index]), groupX + barWidth + 10 + barWidth / 2, y2 - 8);
            }

            // Etiquetas eje X
            this.ctx.fillStyle = '#94A3B8';
            this.ctx.font = '12px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(label, groupX + barWidth + 5, padding.top + chartHeight + 25);
        });

        // Leyenda
        const legendY = 30;
        
        // Semana 1
        this.ctx.fillStyle = '#3B82F6';
        this.ctx.fillRect(width / 2 - 100, legendY - 8, 16, 16);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px Inter';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Semana Base', width / 2 - 75, legendY + 4);
        
        // Semana 2
        this.ctx.fillStyle = '#10B981';
        this.ctx.fillRect(width / 2 + 20, legendY - 8, 16, 16);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText('Semana Comparación', width / 2 + 45, legendY + 4);

        // Eje Y labels
        this.ctx.fillStyle = '#64748B';
        this.ctx.font = '11px Inter';
        this.ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const value = Math.round((maxValue / 5) * i);
            const y = padding.top + chartHeight - ((chartHeight / 5) * i);
            this.ctx.fillText(value, padding.left - 10, y + 4);
        }
    }
}

// ==========================================
// EXTENSIÓN DE LA CLASE PRINCIPAL
// ==========================================

// Añadir método initComparator al prototipo de FitLifeApp
FitLifeApp.prototype.initComparator = function() {
    const week1Select = $('#week1');
    const week2Select = $('#week2');
    const compareBtn = $('#compareBtn');
    const week1Info = $('#week1Info');
    const week2Info = $('#week2Info');

    // Actualizar info al cambiar selección
    const updateWeekInfo = (select, infoDiv) => {
        const week = weeksData[select.value];
        infoDiv.innerHTML = `
            <span class="week-date">${week.date}</span>
            <span class="week-status">${week.status}</span>
        `;
    };

    week1Select.addEventListener('change', () => updateWeekInfo(week1Select, week1Info));
    week2Select.addEventListener('change', () => updateWeekInfo(week2Select, week2Info));

    // Comparar al hacer clic
    compareBtn.addEventListener('click', () => {
        const idx1 = parseInt(week1Select.value);
        const idx2 = parseInt(week2Select.value);
        
        if (idx1 === idx2) {
            alert('Selecciona dos semanas diferentes para comparar');
            return;
        }

        this.compareWeeks(idx1, idx2);
    });

    // Comparación inicial
    this.compareWeeks(0, 3);
};

FitLifeApp.prototype.compareWeeks = function(idx1, idx2) {
    const week1 = weeksData[idx1];
    const week2 = weeksData[idx2];

    // Datos para gráfica
    const labels = ['Calorías', 'Minutos', 'Peso (x10)', 'Sesiones (x100)'];
    const data1 = [week1.calories, week1.minutes, week1.avgWeight * 10, week1.sessions * 100];
    const data2 = [week2.calories, week2.minutes, week2.avgWeight * 10, week2.sessions * 100];

    // Dibujar gráfica
    const canvas = $('#comparisonChart');
    if (canvas.chart) {
        canvas.chart = null;
    }
    
    setTimeout(() => {
        canvas.chart = new ComparisonChart('#comparisonChart', data1, data2, labels);
    }, 50);

    // Actualizar métricas
    this.updateMetricCard('cal', week1.calories, week2.calories, 'kcal');
    this.updateMetricCard('min', week1.minutes, week2.minutes, 'min');
    this.updateMetricCard('weight', week1.avgWeight, week2.avgWeight, 'kg');
    this.updateMetricCard('sess', week1.sessions, week2.sessions, '');

    // Generar resumen
    this.generateSummary(week1, week2, idx1, idx2);
};

FitLifeApp.prototype.updateMetricCard = function(prefix, oldVal, newVal, unit) {
    const oldEl = $(`#${prefix}Old`);
    const newEl = $(`#${prefix}New`);
    const changeEl = $(`#${prefix}Change`);
    const percentEl = changeEl.querySelector('.change-percent');

    oldEl.textContent = oldVal + (unit ? ' ' + unit : '');
    newEl.textContent = newVal + (unit ? ' ' + unit : '');

    const diff = newVal - oldVal;
    const percent = ((diff / oldVal) * 100).toFixed(1);
    
    const isPositive = diff >= 0;
    changeEl.className = `metric-change ${isPositive ? 'positive' : 'negative'}`;
    percentEl.textContent = (isPositive ? '+' : '') + percent + '%';

    // Animar valores
    animateValue(oldEl, 0, oldVal, 1000, unit ? ' ' + unit : '');
    setTimeout(() => {
        animateValue(newEl, 0, newVal, 1000, unit ? ' ' + unit : '');
    }, 200);
};

FitLifeApp.prototype.generateSummary = function(week1, week2, idx1, idx2) {
    const summaryEl = $('#summaryText');
    const weeksDiff = idx2 - idx1;
    
    const calDiff = week2.calories - week1.calories;
    const minDiff = week2.minutes - week1.minutes;
    const weightDiff = week2.avgWeight - week1.avgWeight;
    const sessDiff = week2.sessions - week1.sessions;

    let summary = `En ${weeksDiff} semanas de progreso, has logrado mejoras significativas. `;
    
    if (calDiff > 0) {
        summary += `Tu gasto calórico aumentó ${calDiff} kcal (${((calDiff/week1.calories)*100).toFixed(0)}%), demostrando mayor intensidad. `;
    }
    
    if (minDiff > 0) {
        summary += `Incrementaste tu tiempo de entrenamiento en ${minDiff} minutos semanales. `;
    }
    
    if (weightDiff > 0) {
        summary += `Tu fuerza mejoró notablemente, levantando ${weightDiff}kg más de promedio. `;
    }
    
    if (sessDiff > 0) {
        summary += `Además, aumentaste tu consistencia con ${sessDiff} sesiones extras por semana. `;
    }

    summary += `¡Sigue así para alcanzar tus objetivos! 💪`;

    // Typing effect
    summaryEl.textContent = '';
    let i = 0;
    const typeWriter = () => {
        if (i < summary.length) {
            summaryEl.textContent += summary.charAt(i);
            i++;
            setTimeout(typeWriter, 20);
        }
    };
    typeWriter();
};

// Modificar el método init original para incluir initComparator
const originalInit = FitLifeApp.prototype.init;
FitLifeApp.prototype.init = function() {
    originalInit.call(this);
    this.initComparator();
};