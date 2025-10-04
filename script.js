const taskInput = document.getElementById('taskInput');
        const taskList = document.getElementById('taskList');
        const addBtn = document.getElementById('addBtn');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const emptyState = document.getElementById('emptyState');
        const totalTasksEl = document.getElementById('totalTasks');
        const completedTasksEl = document.getElementById('completedTasks');
        const pendingTasksEl = document.getElementById('pendingTasks');

        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        let currentFilter = 'all';

        // Initialize the app
        function init() {
            renderTasks();
            updateStats();
            
            // Event listeners
            addBtn.addEventListener('click', addTask);
            taskInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') addTask();
            });
            
            filterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentFilter = this.getAttribute('data-filter');
                    renderTasks();
                });
            });
        }

        // Add a new task
        function addTask() {
            const taskText = taskInput.value.trim();
            
            if (taskText === '') {
                showNotification('Please enter a task!', 'error');
                return;
            }
            
            const task = {
                id: Date.now(),
                text: taskText,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            tasks.unshift(task);
            saveTasks();
            renderTasks();
            updateStats();
            
            taskInput.value = '';
            taskInput.focus();
            
            showNotification('Task added successfully!', 'success');
        }

        // Toggle task completion
        function toggleTask(id) {
            tasks = tasks.map(task => {
                if (task.id === id) {
                    return { ...task, completed: !task.completed };
                }
                return task;
            });
            
            saveTasks();
            renderTasks();
            updateStats();
        }

        // Delete a task
        function deleteTask(id) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
            updateStats();
            
            showNotification('Task deleted!', 'info');
        }

        // Render tasks based on current filter
        function renderTasks() {
            const filteredTasks = tasks.filter(task => {
                if (currentFilter === 'completed') return task.completed;
                if (currentFilter === 'pending') return !task.completed;
                return true;
            });
            
            if (filteredTasks.length === 0) {
                taskList.style.display = 'none';
                emptyState.style.display = 'block';
            } else {
                taskList.style.display = 'block';
                emptyState.style.display = 'none';
                
                taskList.innerHTML = '';
                
                filteredTasks.forEach(task => {
                    const li = document.createElement('li');
                    li.className = `task-item ${task.completed ? 'completed' : ''}`;
                    li.setAttribute('data-id', task.id);
                    
                    li.innerHTML = `
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <span class="task-text">${task.text}</span>
                        <div class="task-actions">
                            <button class="task-btn complete-btn" title="${task.completed ? 'Mark as pending' : 'Mark as complete'}">
                                <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                            </button>
                            <button class="task-btn delete-btn" title="Delete task">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    
                    // Add event listeners
                    const checkbox = li.querySelector('.task-checkbox');
                    const completeBtn = li.querySelector('.complete-btn');
                    const deleteBtn = li.querySelector('.delete-btn');
                    
                    checkbox.addEventListener('change', () => toggleTask(task.id));
                    completeBtn.addEventListener('click', () => toggleTask(task.id));
                    deleteBtn.addEventListener('click', () => deleteTask(task.id));
                    
                    taskList.appendChild(li);
                });
            }
        }

        // Update task statistics
        function updateStats() {
            const total = tasks.length;
            const completed = tasks.filter(task => task.completed).length;
            const pending = total - completed;
            
            totalTasksEl.textContent = total;
            completedTasksEl.textContent = completed;
            pendingTasksEl.textContent = pending;
        }

        // Save tasks to localStorage
        function saveTasks() {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        // Show notification
        function showNotification(message, type) {
            // Remove existing notification if any
            const existingNotification = document.querySelector('.notification');
            if (existingNotification) {
                existingNotification.remove();
            }
            
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            
            // Style the notification
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                animation: slideInRight 0.3s ease;
            `;
            
            if (type === 'error') {
                notification.style.background = 'var(--danger)';
            } else if (type === 'success') {
                notification.style.background = 'var(--success)';
            } else {
                notification.style.background = 'var(--primary)';
            }
            
            document.body.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }

        // Add CSS for notification animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', init);