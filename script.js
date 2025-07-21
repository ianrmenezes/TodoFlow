class TodoFlow {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.isDarkMode = true; // Start with wave mode
        
        this.initializeElements();
        this.bindEvents();
        this.renderTodos();
        this.updateStats();
        this.applyDarkMode();
        
        // Set initial icon based on mode
        const icon = this.darkModeToggle.querySelector('i');
        icon.className = 'fas fa-sun text-lg'; // Sun icon for dark mode
    }

    initializeElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addTodoBtn = document.getElementById('addTodoBtn');
        this.todoList = document.getElementById('todoList');
        this.todoStats = document.getElementById('todoStats');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.darkModeToggle = document.getElementById('darkModeToggle');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    bindEvents() {
        // Add todo
        this.addTodoBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // Clear completed
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());

        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveFilter(e.target.dataset.filter);
            });
        });

        // Dark mode toggle
        this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.renderTodos();
        this.updateStats();
        this.todoInput.value = '';
        
        // Add animation
        this.addTodoBtn.classList.add('scale-110');
        setTimeout(() => {
            this.addTodoBtn.classList.remove('scale-110');
        }, 200);
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.renderTodos();
        this.updateStats();
    }

    clearCompleted() {
        this.todos = this.todos.filter(t => !t.completed);
        this.saveTodos();
        this.renderTodos();
        this.updateStats();
    }

    setActiveFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button styling
        this.filterBtns.forEach(btn => {
            btn.classList.remove('active', 'gradient-bg', 'text-white');
            btn.classList.add('glass-effect');
        });
        
        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        activeBtn.classList.remove('glass-effect');
        activeBtn.classList.add('active', 'gradient-bg', 'text-white');
        
        this.renderTodos();
    }

    renderTodos() {
        let filteredTodos = this.todos;
        
        switch (this.currentFilter) {
            case 'active':
                filteredTodos = this.todos.filter(t => !t.completed);
                break;
            case 'completed':
                filteredTodos = this.todos.filter(t => t.completed);
                break;
        }

        if (filteredTodos.length === 0) {
            // Show empty state message
            const emptyMessage = this.getEmptyStateMessage();
            this.todoList.innerHTML = emptyMessage;
        } else {
            this.todoList.innerHTML = filteredTodos.map(todo => this.createTodoElement(todo)).join('');
        }
    }

    getEmptyStateMessage() {
        const isLightMode = !this.isDarkMode;
        const textColor = isLightMode ? 'text-gray-600' : 'text-gray-300';
        const iconColor = isLightMode ? 'text-green-500' : 'text-green-400';
        
        let message = '';
        let icon = '';
        
        switch (this.currentFilter) {
            case 'active':
                message = 'No active tasks!';
                icon = 'fas fa-check-circle';
                break;
            case 'completed':
                message = 'No completed tasks yet!';
                icon = 'fas fa-list';
                break;
            default:
                message = 'No tasks yet!';
                icon = 'fas fa-plus-circle';
                break;
        }
        
        return `
            <div class="flex flex-col items-center justify-center py-12 space-y-4">
                <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <i class="${icon} ${iconColor} text-2xl"></i>
                </div>
                <div class="text-center">
                    <h3 class="text-lg font-medium ${textColor} mb-2">${message}</h3>
                    <p class="text-sm ${textColor} opacity-75">Add a new task to get started!</p>
                </div>
            </div>
        `;
    }

    createTodoElement(todo) {
        const isLightMode = !this.isDarkMode;
        const cardClass = isLightMode ? 'bg-white shadow-md border border-gray-200' : 'bg-gray-800';
        const textClass = isLightMode ? 
            (todo.completed ? 'line-through text-gray-500' : 'text-gray-700') : 
            (todo.completed ? 'line-through text-gray-400' : 'text-white');
        const hoverClass = isLightMode ? 'hover:bg-gray-50' : 'hover:bg-gray-700';
        
        return `
            <div class="todo-item ${cardClass} rounded-xl p-4 flex items-center gap-3 transition-all duration-300 ${hoverClass} shadow-sm ${todo.completed ? 'opacity-60' : ''}" data-id="${todo.id}">
                <button class="todo-toggle flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-400 hover:border-purple-400 transition-all duration-300 flex items-center justify-center ${todo.completed ? 'bg-green-500 border-transparent' : ''}" onclick="todoFlow.toggleTodo(${todo.id})">
                    ${todo.completed ? '<i class="fas fa-check text-white text-xs"></i>' : ''}
                </button>
                <span class="todo-text flex-1 ${textClass}" onclick="todoFlow.toggleTodo(${todo.id})">
                    ${this.escapeHtml(todo.text)}
                </span>
                <button class="todo-delete flex-shrink-0 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-300 flex items-center justify-center" onclick="todoFlow.deleteTodo(${todo.id})">
                    <i class="fas fa-times text-xs"></i>
                </button>
            </div>
        `;
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const active = total - completed;
        
        this.todoStats.textContent = `${active} active • ${completed} completed • ${total} total`;
        
        // Update clear completed button text
        const clearBtn = document.getElementById('clearCompletedBtn');
        if (completed > 0) {
            clearBtn.textContent = `Clear Completed (${completed})`;
        } else {
            clearBtn.textContent = 'Clear Completed';
        }
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        
        if (this.isDarkMode) {
            this.applyDarkMode();
            // Show sun icon for dark mode (to switch to light)
            const icon = this.darkModeToggle.querySelector('i');
            icon.className = 'fas fa-sun text-lg';
        } else {
            this.applySolidMode();
            // Show moon icon for light mode (to switch to dark)
            const icon = this.darkModeToggle.querySelector('i');
            icon.className = 'fas fa-moon text-lg';
        }
    }

    applyDarkMode() {
        const body = document.body;
        // Apply wave background
        body.style.background = '#0a0a1a';
        body.style.color = '#f3f4f6';
        body.classList.add('wave-mode');
        body.classList.remove('solid-mode');
        
        // Update card colors to dark theme
        this.updateCardColors('dark');
        // Re-render todos with new theme
        this.renderTodos();
        // Update subtitle color
        const subtitle = document.getElementById('subtitle');
        if (subtitle) {
            subtitle.classList.remove('text-gray-900', 'font-semibold', 'text-gray-700', 'text-gray-500');
            subtitle.classList.add('text-gray-300');
        }
    }

    applySolidMode() {
        const body = document.body;
        // Apply light theme with bright background
        body.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)';
        body.style.color = '#1e293b';
        body.classList.add('solid-mode');
        body.classList.remove('wave-mode');
        
        // Update card colors to white/bright theme
        this.updateCardColors('light');
        // Re-render todos with new theme
        this.renderTodos();
        // Update subtitle color
        const subtitle = document.getElementById('subtitle');
        if (subtitle) {
            subtitle.classList.remove('text-gray-300', 'text-gray-700', 'text-gray-500');
            subtitle.classList.add('text-gray-900', 'font-semibold');
        }
    }

    updateCardColors(theme) {
        const cards = document.querySelectorAll('.bg-gray-800, .bg-gray-700, .bg-gray-600, .bg-white');
        const inputs = document.querySelectorAll('input, .bg-gray-700');
        const buttons = document.querySelectorAll('.filter-btn');
        const todoTexts = document.querySelectorAll('.todo-text');
        
        cards.forEach(card => {
            if (theme === 'light') {
                card.classList.remove('bg-gray-800', 'bg-gray-700', 'bg-gray-600');
                card.classList.add('bg-white', 'shadow-md', 'border', 'border-gray-200');
            } else {
                card.classList.remove('bg-white', 'shadow-md', 'border', 'border-gray-200');
                card.classList.add('bg-gray-800');
            }
        });
        
        inputs.forEach(input => {
            if (theme === 'light') {
                input.classList.remove('bg-gray-700');
                input.classList.add('bg-gray-100', 'text-gray-900', 'border', 'border-gray-300');
                input.classList.remove('text-white', 'placeholder-gray-400');
                input.classList.add('placeholder-gray-500');
            } else {
                input.classList.remove('bg-gray-100', 'text-gray-900', 'border', 'border-gray-300', 'placeholder-gray-500');
                input.classList.add('bg-gray-700', 'text-white', 'placeholder-gray-400');
            }
        });
        
        buttons.forEach(btn => {
            if (theme === 'light') {
                btn.classList.remove('bg-gray-700', 'bg-gray-600', 'hover:bg-gray-600', 'hover:bg-gray-500');
                btn.classList.add('bg-gray-200', 'hover:bg-gray-300', 'text-gray-700');
            } else {
                btn.classList.remove('bg-gray-200', 'hover:bg-gray-300', 'text-gray-700');
                btn.classList.add('bg-gray-700', 'hover:bg-gray-600');
            }
        });

        todoTexts.forEach(span => {
            if (theme === 'light') {
                span.classList.remove('text-white', 'text-gray-400');
                if (!span.classList.contains('line-through')) {
                    span.classList.add('text-gray-700');
                } else {
                    span.classList.add('text-gray-500');
                }
            } else {
                span.classList.remove('text-gray-700', 'text-gray-500');
                if (!span.classList.contains('line-through')) {
                    span.classList.add('text-white');
                } else {
                    span.classList.add('text-gray-400');
                }
            }
        });
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
const todoFlow = new TodoFlow(); 