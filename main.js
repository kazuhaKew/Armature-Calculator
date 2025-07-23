document.addEventListener('DOMContentLoaded', function() {
    // Theme toggling functionality
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    
    // Initialize theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggleBtn.setAttribute('aria-checked', savedTheme === 'dark');
    
    // Add keyboard shortcut (Shift+D) for toggling theme
    document.addEventListener('keydown', function(e) {
        if (e.key === 'D' && e.shiftKey) {
            toggleTheme();
        }
    });
    
    // Theme toggle function
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggleBtn.setAttribute('aria-checked', newTheme === 'dark');
    }
    
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Add variable to track editing state
    let currentlyEditing = null;
    
    // Calculator functionality
    const calculateBtn = document.getElementById('calculateBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    // Change Calculate button to Clear button
    calculateBtn.textContent = "Очистить";
    calculateBtn.addEventListener('click', function() {
        if (currentlyEditing) {
            cancelEditing();
        } else {
            clearInputs();
        }
    });
    saveBtn.addEventListener('click', saveCalculation);
    
    // Add live calculation with input event listeners
    document.getElementById('rebarLength').addEventListener('input', calculateResults);
    document.getElementById('segmentLength').addEventListener('input', calculateResults);
    document.getElementById('quantity').addEventListener('input', calculateResults);
    
    // Initialize saved records from localStorage
    let savedRecords = JSON.parse(localStorage.getItem('savedRecords')) || [];
    updateRecordsTable();
    
    // Sort buttons functionality
    document.getElementById('sortByNameBtn').addEventListener('click', () => sortRecords('name'));
    document.getElementById('sortByLengthBtn').addEventListener('click', () => sortRecords('length'));
    document.getElementById('sortBySegmentBtn').addEventListener('click', () => sortRecords('segment'));
    document.getElementById('sortByQuantityBtn').addEventListener('click', () => sortRecords('quantity'));
    document.getElementById('sortBySegmentsBtn').addEventListener('click', () => sortRecords('segments'));
    document.getElementById('sortByRemainderBtn').addEventListener('click', () => sortRecords('remainder'));
    document.getElementById('sortByDateBtn').addEventListener('click', () => sortRecords('date'));
    
    // Export/Import functionality
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('click', function() {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', importData);
    
    // Clear all data functionality
    document.getElementById('clearBtn').addEventListener('click', clearAllData);
    
    // Clear inputs function
    function clearInputs() {
        document.getElementById('rebarName').value = '';
        document.getElementById('rebarLength').value = '1750';
        document.getElementById('segmentLength').value = '';
        document.getElementById('quantity').value = '1';
        document.getElementById('segments').textContent = '0';
        document.getElementById('remainder').textContent = '0';
        document.getElementById('totalRemainder').textContent = '0';
    }
    
    // Function to cancel editing
    function cancelEditing() {
        currentlyEditing = null;
        clearInputs();
        calculateBtn.textContent = "Очистить";
        saveBtn.textContent = "Сохранить";
    }
    
    // Calculate function - now updates live
    function calculateResults() {
        const rebarLength = parseFloat(document.getElementById('rebarLength').value) || 0;
        const segmentLength = parseFloat(document.getElementById('segmentLength').value) || 0;
        const quantity = parseInt(document.getElementById('quantity').value) || 0;
        
        if (rebarLength <= 0 || segmentLength <= 0 || quantity <= 0) {
            document.getElementById('segments').textContent = '0';
            document.getElementById('remainder').textContent = '0';
            document.getElementById('totalRemainder').textContent = '0';
            return;
        }
        
        const segments = Math.floor(rebarLength / segmentLength);
        const remainder = rebarLength % segmentLength;
        const totalRemainder = remainder * quantity;
        
        document.getElementById('segments').textContent = segments;
        document.getElementById('remainder').textContent = remainder;
        document.getElementById('totalRemainder').textContent = totalRemainder;
    }
    
    // Update the records table with improved visualization
    function updateRecordsTable() {
        const tbody = document.getElementById('recordsBody');
        tbody.innerHTML = '';
        
        if (savedRecords.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="8" class="empty-records">Нет сохраненных расчетов</td>`;
            tbody.appendChild(emptyRow);
            return;
        }
        
        savedRecords.forEach((record, index) => {
            const tr = document.createElement('tr');
            
            // Add class for row identification
            tr.classList.add('record-row');
            tr.dataset.recordId = record.id;
            
            // Add class for animation if it's a newly added record
            if (index === savedRecords.length - 1 && savedRecords.length > 1) {
                tr.classList.add('new-record');
            }
            
            tr.innerHTML = `
                <td title="${record.name}">${truncateText(record.name, 20)}</td>
                <td>${record.length}</td>
                <td>${record.segment}</td>
                <td>${record.quantity}</td>
                <td>${record.segments}</td>
                <td>${record.remainder}</td>
                <td title="${record.date}">${record.date}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${record.id}" title="Редактировать">✏️</button>
                    <button class="action-btn delete-btn" data-id="${record.id}" title="Удалить">🗑️</button>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', editRecord);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteRecord);
        });
    }
    
    // Helper function to truncate long text
    function truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
    
    // Save calculation with improved UX
    function saveCalculation() {
        const rebarName = document.getElementById('rebarName').value;
        const rebarLength = parseFloat(document.getElementById('rebarLength').value);
        const segmentLength = parseFloat(document.getElementById('segmentLength').value);
        const quantity = parseInt(document.getElementById('quantity').value);
        const segments = parseInt(document.getElementById('segments').textContent);
        const remainder = parseFloat(document.getElementById('remainder').textContent);
        
        if (!rebarName || !rebarLength || !segmentLength || !quantity) {
            alert('Пожалуйста, заполните все поля корректно');
            return;
        }
        
        if (segments === 0) {
            alert('Пожалуйста, введите корректные значения для расчета');
            return;
        }
        
        // Create record object
        const record = {
            id: currentlyEditing ? currentlyEditing : Date.now(),
            name: rebarName,
            length: rebarLength,
            segment: segmentLength,
            quantity: quantity,
            segments: segments,
            remainder: remainder,
            totalRemainder: remainder * quantity,
            date: currentlyEditing ? 
                  (savedRecords.find(r => r.id === currentlyEditing)?.date || new Date().toLocaleString('ru-RU')) : 
                  new Date().toLocaleString('ru-RU')
        };
        
        if (currentlyEditing) {
            // Update existing record
            const index = savedRecords.findIndex(r => r.id === currentlyEditing);
            if (index !== -1) {
                savedRecords[index] = record;
            }
            // Reset editing state
            currentlyEditing = null;
            calculateBtn.textContent = "Очистить";
            saveBtn.textContent = "Сохранить";
        } else {
            // Add new record
            savedRecords.push(record);
        }
        
        // Save to localStorage and update UI
        localStorage.setItem('savedRecords', JSON.stringify(savedRecords));
        updateRecordsTable();
        
        // Optional: clear inputs after saving
        clearInputs();
        
        // Scroll to the table to show the newly added/edited record
        document.querySelector('.table-container').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Sort records function
    let sortConfig = {
        key: 'date',
        direction: 'desc'
    };
    
    function sortRecords(key) {
        if (sortConfig.key === key) {
            sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            sortConfig.key = key;
            sortConfig.direction = 'asc';
        }
        
        savedRecords.sort((a, b) => {
            let valueA = a[key];
            let valueB = b[key];
            
            // Handle numeric values
            if (typeof valueA === 'number' && typeof valueB === 'number') {
                return sortConfig.direction === 'asc' ? valueA - valueB : valueB - valueA;
            }
            
            // Handle string values
            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return sortConfig.direction === 'asc' 
                    ? valueA.localeCompare(valueB, 'ru') 
                    : valueB.localeCompare(valueA, 'ru');
            }
            
            return 0;
        });
        
        updateRecordsTable();
        
        // Update sort icons
        document.querySelectorAll('.sort-btn .sort-icon').forEach(icon => {
            icon.textContent = '↕';
        });
        
        const activeIcon = document.querySelector(`#sortBy${key.charAt(0).toUpperCase() + key.slice(1)}Btn .sort-icon`);
        if (activeIcon) {
            activeIcon.textContent = sortConfig.direction === 'asc' ? '↑' : '↓';
        }
    }
    
    // Edit record function
    function editRecord(e) {
        const recordId = parseInt(e.target.getAttribute('data-id'));
        const record = savedRecords.find(r => r.id === recordId);
        
        if (record) {
            // Set the editing state
            currentlyEditing = recordId;
            
            // Change button texts
            calculateBtn.textContent = "Отмена";
            saveBtn.textContent = "Обновить";
            
            // Fill the form with record data
            document.getElementById('rebarName').value = record.name;
            document.getElementById('rebarLength').value = record.length;
            document.getElementById('segmentLength').value = record.segment;
            document.getElementById('quantity').value = record.quantity;
            
            // Calculate with loaded values
            calculateResults();
            
            // Scroll to form
            document.querySelector('#rebarForm').scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Delete record function with improved UX
    function deleteRecord(e) {
        const recordId = parseInt(e.target.getAttribute('data-id'));
        const record = savedRecords.find(r => r.id === recordId);
        
        if (confirm(`Вы уверены, что хотите удалить запись "${record.name}"?`)) {
            // Animate the row before removing
            const row = document.querySelector(`.record-row[data-record-id="${recordId}"]`);
            if (row) {
                row.style.transition = 'opacity 0.3s ease-out';
                row.style.opacity = '0';
                
                setTimeout(() => {
                    savedRecords = savedRecords.filter(r => r.id !== recordId);
                    localStorage.setItem('savedRecords', JSON.stringify(savedRecords));
                    updateRecordsTable();
                }, 300);
            } else {
                // Fallback if animation doesn't work
                savedRecords = savedRecords.filter(r => r.id !== recordId);
                localStorage.setItem('savedRecords', JSON.stringify(savedRecords));
                updateRecordsTable();
            }
        }
    }
    
    // Export data function
    function exportData() {
        if (savedRecords.length === 0) {
            alert('Нет данных для экспорта');
            return;
        }
        
        const dataStr = JSON.stringify(savedRecords, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileName = `armature_data_${new Date().toISOString().slice(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.style.display = 'none';
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
    }
    
    // Import data function
    function importData(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const importedData = JSON.parse(event.target.result);
                
                if (Array.isArray(importedData)) {
                    if (confirm('Импортировать данные? Существующие записи будут сохранены.')) {
                        savedRecords = [...savedRecords, ...importedData];
                        localStorage.setItem('savedRecords', JSON.stringify(savedRecords));
                        updateRecordsTable();
                    }
                } else {
                    alert('Неверный формат файла');
                }
            } catch (error) {
                alert('Ошибка при чтении файла: ' + error.message);
            }
            
            // Reset file input
            e.target.value = '';
        };
        
        reader.readAsText(file);
    }
    
    // Clear all data function
    function clearAllData() {
        if (confirm('Вы уверены, что хотите удалить все сохраненные данные?')) {
            savedRecords = [];
            localStorage.setItem('savedRecords', JSON.stringify(savedRecords));
            updateRecordsTable();
        }
    }
});
