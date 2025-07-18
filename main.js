class RebarCalculator {
    constructor() {
        this.records = JSON.parse(localStorage.getItem('rebarRecords')) || [];
        this.initEventListeners();
        this.loadRecords();
        this.calculate(); // Initial calculation
        this.initTheme(); // Initialize theme
    }

    initEventListeners() {
        // Live calculation on input change
        const inputs = ['rebarLength', 'segmentLength', 'quantity'];
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.calculate();
            });
        });

        // Button event listeners
        document.getElementById('calculateBtn').addEventListener('click', () => {
            this.calculate();
        });

        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveRecord();
        });

        document.getElementById('sortByNameBtn').addEventListener('click', () => {
            this.sortRecords('name');
        });

        document.getElementById('sortByLengthBtn').addEventListener('click', () => {
            this.sortRecords('rebarLength');
        });

        document.getElementById('sortBySegmentBtn').addEventListener('click', () => {
            this.sortRecords('segmentLength');
        });

        document.getElementById('sortByQuantityBtn').addEventListener('click', () => {
            this.sortRecords('quantity');
        });

        document.getElementById('sortBySegmentsBtn').addEventListener('click', () => {
            this.sortRecords('segments');
        });

        document.getElementById('sortByRemainderBtn').addEventListener('click', () => {
            this.sortRecords('remainder');
        });

        document.getElementById('sortByDateBtn').addEventListener('click', () => {
            this.sortRecords('date');
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importData(e);
        });

        // Clear all saved records functionality
        document.getElementById('clearBtn').addEventListener('click', () => {
            // Show confirmation dialog
            if (confirm('Вы уверены, что хотите удалить все сохраненные расчеты? Это действие невозможно отменить.')) {
                // Clear all records from localStorage
                localStorage.removeItem('rebarRecords');
                
                // Clear the table
                document.getElementById('recordsBody').innerHTML = '';
                
                // Show notification to user
                alert('Все сохраненные расчеты успешно удалены.');
            }
        });

        // Theme toggle functionality
        document.getElementById('themeToggleBtn').addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    // Theme functionality
    initTheme() {
        // Check for saved theme preference or use system preference
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            this.updateThemeIcon(savedTheme);
        } else {
            // Check for system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = prefersDark ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            this.updateThemeIcon(theme);
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        // We don't need to change the icon SVGs anymore
        // since they're both always present in the HTML structure
        // The CSS will handle showing/hiding based on the data-theme attribute
        
        // Optional: Add animation class for smooth transition
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        themeToggleBtn.classList.add('theme-changing');
        
        setTimeout(() => {
            themeToggleBtn.classList.remove('theme-changing');
        }, 300);
    }

    calculate() {
        const rebarLength = parseInt(document.getElementById('rebarLength').value) || 0;
        const segmentLength = parseInt(document.getElementById('segmentLength').value) || 0;
        const quantity = parseInt(document.getElementById('quantity').value) || 1;

        if (rebarLength <= 0 || segmentLength <= 0) {
            this.updateResults(0, 0, 0);
            return;
        }

        const segmentsPerRebar = Math.floor(rebarLength / segmentLength);
        const remainderPerRebar = rebarLength % segmentLength;
        const totalSegments = segmentsPerRebar * quantity;
        const totalRemainder = remainderPerRebar * quantity;

        this.updateResults(totalSegments, remainderPerRebar, totalRemainder);
    }

    updateResults(segments, remainder, totalRemainder) {
        document.getElementById('segments').textContent = segments;
        document.getElementById('remainder').textContent = remainder;
        document.getElementById('totalRemainder').textContent = totalRemainder;
    }

    saveRecord() {
        const name = document.getElementById('rebarName').value.trim();
        const rebarLength = parseInt(document.getElementById('rebarLength').value);
        const segmentLength = parseInt(document.getElementById('segmentLength').value);
        const quantity = parseInt(document.getElementById('quantity').value);

        if (!name || !rebarLength || !segmentLength || !quantity) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        const segments = parseInt(document.getElementById('segments').textContent);
        const remainder = parseInt(document.getElementById('remainder').textContent);

        const record = {
            id: Date.now(),
            name,
            rebarLength,
            segmentLength,
            quantity,
            segments,
            remainder,
            date: new Date().toLocaleString('ru-RU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        };

        this.records.push(record);
        this.saveToStorage();
        this.loadRecords();
        
        // Clear form
        document.getElementById('rebarName').value = '';
        document.getElementById('segmentLength').value = '';
        this.calculate();
    }

    loadRecords() {
        const tbody = document.getElementById('recordsBody');
        tbody.innerHTML = '';

        this.records.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.name}</td>
                <td>${record.rebarLength}</td>
                <td>${record.segmentLength}</td>
                <td>${record.quantity}</td>
                <td>${record.segments}</td>
                <td>${record.remainder}</td>
                <td>${record.date}</td>
                <td>
                    <button class="edit-btn" onclick="calculator.editRecord(${record.id})">Редактировать</button>
                    <button class="delete-btn" onclick="calculator.deleteRecord(${record.id})">Удалить</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    editRecord(id) {
        const record = this.records.find(r => r.id === id);
        if (record) {
            document.getElementById('rebarName').value = record.name;
            document.getElementById('rebarLength').value = record.rebarLength;
            document.getElementById('segmentLength').value = record.segmentLength;
            document.getElementById('quantity').value = record.quantity;
            
            this.deleteRecord(id);
            this.calculate();
        }
    }

    deleteRecord(id) {
        if (confirm('Вы уверены, что хотите удалить эту запись?')) {
            this.records = this.records.filter(r => r.id !== id);
            this.saveToStorage();
            this.loadRecords();
        }
    }

    sortRecords(type) {
        if (type === 'name') {
            this.records.sort((a, b) => a.name.localeCompare(b.name));
        } else if (type === 'date') {
            this.records.sort((a, b) => {
                const parseDate = (dateStr) => {
                    if (dateStr.includes(',')) {
                        const [datePart, timePart] = dateStr.split(', ');
                        const [day, month, year] = datePart.split('.');
                        return new Date(`${year}-${month}-${day}T${timePart}`);
                    } else {
                        const [day, month, year] = dateStr.split('.');
                        return new Date(`${year}-${month}-${day}`);
                    }
                };
                return parseDate(b.date) - parseDate(a.date);
            });
        } else {
            // For numeric fields
            this.records.sort((a, b) => b[type] - a[type]);
        }
        this.loadRecords();
    }

    exportData() {
        const dataStr = JSON.stringify(this.records, null, 2);
        const dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `rebar_calculations_${new Date().toISOString().split('T')[0]}.txt`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    if (confirm('Это заменит все существующие данные. Продолжить?')) {
                        this.records = importedData;
                        this.saveToStorage();
                        this.loadRecords();
                        alert('Данные успешно импортированы');
                    }
                } else {
                    alert('Неверный формат файла');
                }
            } catch (error) {
                alert('Ошибка при чтении файла');
            }
        };
        reader.readAsText(file);
    }

    saveToStorage() {
        localStorage.setItem('rebarRecords', JSON.stringify(this.records));
    }
}

// Initialize calculator when page loads
const calculator = new RebarCalculator();

// Add system theme change listener
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        calculator.updateThemeIcon(newTheme);
    }
});
// Initialize calculator when page loads
const calculator = new RebarCalculator();

// Add system theme change listener
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        calculator.updateThemeIcon(newTheme);
    }
});
