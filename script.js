// ==========================================
// VITALFIT - APLICACIÓN DE SALUD Y BIENESTAR
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar aplicación
    const app = new VitalFitApp();
    app.init();
});

class VitalFitApp {
    constructor() {
        this.storageKey = 'vitalfit_data';
        this.defaultData = {
            lastIMC: null,
            lastWeight: null,
            lastProtein: null,
            timestamp: null
        };
    }

    init() {
        this.initNavigation();
        this.initIMC();
        this.initProteins();
        this.loadSavedData();
    }

    // ==========================================
    // NAVEGACIÓN
    // ==========================================
    
    initNavigation() {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.querySelector('.nav-links');

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // ==========================================
    // LOCALSTORAGE
    // ==========================================
    
    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : { ...this.defaultData };
        } catch (e) {
            console.error('Error reading localStorage:', e);
            return { ...this.defaultData };
        }
    }

    saveData(data) {
        try {
            const currentData = this.getData();
            const newData = { ...currentData, ...data, timestamp: new Date().toISOString() };
            localStorage.setItem(this.storageKey, JSON.stringify(newData));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    }

    loadSavedData() {
        const data = this.getData();
        
        // Cargar último peso en ambos formularios
        if (data.lastWeight) {
            const imcWeight = document.getElementById('imc-weight');
            const proteinWeight = document.getElementById('protein-weight');
            
            if (imcWeight) imcWeight.value = data.lastWeight;
            if (proteinWeight) proteinWeight.value = data.lastWeight;
            
            // Mostrar en UI
            const savedWeightEl = document.querySelector('#savedWeight .saved-value');
            if (savedWeightEl) {
                savedWeightEl.textContent = `${data.lastWeight} kg`;
            }
        }

        // Recalcular IMC si hay datos guardados
        if (data.lastIMC && data.lastWeight) {
            this.displayIMCResult(data.lastIMC);
        }

        // Recalcular proteínas si hay datos guardados
        if (data.lastProtein && data.lastWeight) {
            this.displayProteinResult(data.lastProtein);
        }
    }

    // ==========================================
    // CALCULADORA IMC
    // ==========================================
    
    initIMC() {
        const form = document.getElementById('imcForm');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateIMC();
        });
    }

    calculateIMC() {
        const weightInput = document.getElementById('imc-weight');
        const heightInput = document.getElementById('imc-height');
        
        const weight = parseFloat(weightInput.value);
        const heightCm = parseFloat(heightInput.value);

        if (!weight || !heightCm || weight <= 0 || heightCm <= 0) {
            alert('Por favor ingresa valores válidos');
            return;
        }

        // Convertir altura a metros
        const heightM = heightCm / 100;
        
        // Calcular IMC
        const imc = weight / (heightM * heightM);
        const imcRounded = Math.round(imc * 10) / 10;

        // Guardar datos
        this.saveData({
            lastIMC: imcRounded,
            lastWeight: weight
        });

        // Actualizar UI
        this.displayIMCResult(imcRounded);
        
        // Actualizar peso guardado mostrado
        const savedWeightEl = document.querySelector('#savedWeight .saved-value');
        if (savedWeightEl) {
            savedWeightEl.textContent = `${weight} kg`;
        }

        // Actualizar también el campo de peso en proteínas
        const proteinWeight = document.getElementById('protein-weight');
        if (proteinWeight) proteinWeight.value = weight;
    }

    displayIMCResult(imc) {
        const resultContainer = document.getElementById('imcResult');
        
        // Determinar categoría
        let category, categoryClass, message, color;
        
        if (imc < 18.5) {
            category = 'Bajo peso';
            categoryClass = 'bajo';
            color = '#3b82f6';
            message = 'Tu IMC indica que tienes bajo peso. Es importante consultar con un profesional de la salud para desarrollar un plan de alimentación adecuado que te ayude a alcanzar un peso saludable de forma gradual y segura.';
        } else if (imc < 25) {
            category = 'Peso normal';
            categoryClass = 'normal';
            color = '#10b981';
            message = '¡Excelente! Tu IMC está dentro del rango saludable. Mantén tus hábitos actuales de alimentación y ejercicio para conservar tu bienestar.';
        } else if (imc < 30) {
            category = 'Sobrepeso';
            categoryClass = 'sobrepeso';
            color = '#f59e0b';
            message = 'Tu IMC indica sobrepeso. Pequeños cambios en tu dieta y un aumento gradual de la actividad física pueden ayudarte a alcanzar un peso más saludable.';
        } else {
            category = 'Obesidad';
            categoryClass = 'obesidad';
            color = '#ef4444';
            message = 'Tu IMC indica obesidad. Te recomendamos consultar con un profesional de la salud para recibir orientación personalizada y crear un plan seguro de pérdida de peso.';
        }

        // Actualizar tabla de referencia
        document.querySelectorAll('.table-row').forEach(row => {
            row.classList.remove('active');
            if (row.dataset.category === categoryClass) {
                row.classList.add('active');
            }
        });

        resultContainer.innerHTML = `
            <div class="result-content">
                <div class="imc-display">
                    <div class="imc-number" style="color: ${color}">${imc}</div>
                    <div class="imc-category ${categoryClass}">${category}</div>
                </div>
                <div class="imc-message">
                    <strong>Recomendación:</strong> ${message}
                </div>
            </div>
        `;

        // Animar el número
        this.animateNumber(resultContainer.querySelector('.imc-number'), 0, imc, 1000, 1);
    }

    // ==========================================
    // CALCULADORA PROTEÍNAS
    // ==========================================
    
    initProteins() {
        const form = document.getElementById('proteinForm');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateProteins();
        });
    }

    calculateProteins() {
        const weightInput = document.getElementById('protein-weight');
        const activityInputs = document.getElementsByName('activity');
        
        const weight = parseFloat(weightInput.value);
        let activity = 'sedentary';
        
        for (const input of activityInputs) {
            if (input.checked) {
                activity = input.value;
                break;
            }
        }

        if (!weight || weight <= 0) {
            alert('Por favor ingresa un peso válido');
            return;
        }

        // Multiplicadores según actividad
        const multipliers = {
            sedentary: 1.2,
            moderate: 1.6,
            intense: 2.0
        };

        const proteinGrams = Math.round(weight * multipliers[activity]);
        
        // Guardar datos
        this.saveData({
            lastProtein: { grams: proteinGrams, activity, weight },
            lastWeight: weight
        });

        this.displayProteinResult({ grams: proteinGrams, activity, weight });

        // Actualizar también el campo de peso en IMC
        const imcWeight = document.getElementById('imc-weight');
        if (imcWeight) imcWeight.value = weight;
        
        // Actualizar peso guardado mostrado
        const savedWeightEl = document.querySelector('#savedWeight .saved-value');
        if (savedWeightEl) {
            savedWeightEl.textContent = `${weight} kg`;
        }
    }

    displayProteinResult(data) {
        const resultContainer = document.getElementById('proteinResult');
        
        const activityLabels = {
            sedentary: 'Sedentario',
            moderate: 'Moderado',
            intense: 'Intenso'
        };

        // Calcular porcentaje para la barra (máximo 3g/kg como 100%)
        const maxProtein = data.weight * 3;
        const percentage = Math.min((data.grams / maxProtein) * 100, 100);

        resultContainer.innerHTML = `
            <div class="protein-result-content">
                <div class="protein-amount">
                    <span class="protein-number" data-target="${data.grams}">0</span>
                    <span class="protein-unit">g/día</span>
                    <span class="protein-label">de proteínas recomendadas</span>
                </div>
                
                <div class="protein-bar-container">
                    <div class="protein-bar-label">
                        <span>0g</span>
                        <span>Nivel: ${activityLabels[data.activity]}</span>
                        <span>${maxProtein}g</span>
                    </div>
                    <div class="protein-bar">
                        <div class="protein-bar-fill" style="width: 0%"></div>
                    </div>
                </div>

                <div class="protein-info">
                    <div class="info-box">
                        <span class="info-value">${data.weight} kg</span>
                        <span class="info-label">Peso</span>
                    </div>
                    <div class="info-box">
                        <span class="info-value">${(data.grams / data.weight).toFixed(1)}g</span>
                        <span class="info-label">Por kg</span>
                    </div>
                    <div class="info-box">
                        <span class="info-value">~${Math.round(data.grams * 4)}</span>
                        <span class="info-label">Kcal</span>
                    </div>
                </div>
            </div>
        `;

        // Animar número
        const numberEl = resultContainer.querySelector('.protein-number');
        this.animateNumber(numberEl, 0, data.grams, 1000, 0);

        // Animar barra
        setTimeout(() => {
            const barFill = resultContainer.querySelector('.protein-bar-fill');
            if (barFill) {
                barFill.style.width = percentage + '%';
            }
        }, 100);
    }

    // ==========================================
    // UTILIDADES
    // ==========================================
    
    animateNumber(element, start, end, duration, decimals = 0) {
        const startTime = performance.now();
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (easeOutQuart)
            const eased = 1 - Math.pow(1 - progress, 4);
            
            const current = start + (end - start) * eased;
            element.textContent = current.toFixed(decimals);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    }
}