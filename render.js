// render.js - Handles rendering tasks to the DOM

class TaskRenderer {
    constructor() {
        this.columnElements = {
            todo: document.getElementById('todo'),
            inprogress: document.getElementById('inprogress'),
            done: document.getElementById('done')
        };
    }
    
    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task';
        taskElement.draggable = true;
        taskElement.dataset.id = task.id;
        taskElement.dataset.status = task.status;
        
        // Create task header
        const taskHeader = document.createElement('div');
        taskHeader.className = 'task-header';
        
        const titleSpan = document.createElement('span');
        titleSpan.textContent = task.title;
        
        const prioritySpan = document.createElement('span');
        prioritySpan.className = 'task-priority priority-' + task.priority;
        prioritySpan.textContent = task.priority;
        
        taskHeader.appendChild(titleSpan);
        taskHeader.appendChild(prioritySpan);
        
        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'x';
        deleteButton.onclick = function() { handleDeleteTask(task.id); };
        
        taskElement.appendChild(taskHeader);
        taskElement.appendChild(deleteButton);
        
        // Add drag event listeners
        taskElement.addEventListener('dragstart', this.handleDragStart);
        taskElement.addEventListener('dragend', this.handleDragEnd);
        
        return taskElement;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    handleDragStart(e) {
        e.target.classList.add('dragging');
        e.dataTransfer.setData("text/plain", e.target.dataset.id);
        e.dataTransfer.setData("application/x-task-status", e.target.dataset.status);
    }
    
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }
    
    renderTask(task) {
        const taskElement = this.createTaskElement(task);
        const columnElement = this.columnElements[task.status];
        
        if (columnElement) {
            // Find the correct position based on priority
            const existingTasks = columnElement.querySelectorAll('.task');
            let inserted = false;
            
            for (let existingTask of existingTasks) {
                const existingTaskId = existingTask.dataset.id;
                if (typeof taskStorage !== 'undefined' && taskStorage) {
                    const existingTaskData = taskStorage.getTaskById(existingTaskId);
                    
                    if (existingTaskData && this.shouldInsertBefore(task, existingTaskData)) {
                        columnElement.insertBefore(taskElement, existingTask);
                        inserted = true;
                        break;
                    }
                }
            }
            
            if (!inserted) {
                columnElement.appendChild(taskElement);
            }
        }
        
        return taskElement;
    }
    
    shouldInsertBefore(newTask, existingTask) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[newTask.priority] > priorityOrder[existingTask.priority];
    }
    
    removeTask(taskId) {
        const taskElement = document.querySelector(`[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.remove();
            return true;
        }
        return false;
    }
    
    updateTask(task) {
        const existingElement = document.querySelector(`[data-id="${task.id}"]`);
        if (existingElement) {
            // Check if status changed
            if (existingElement.dataset.status !== task.status) {
                // Remove from old column and render in new column
                existingElement.remove();
                this.renderTask(task);
            } else {
                // Update in place
                const newElement = this.createTaskElement(task);
                existingElement.replaceWith(newElement);
            }
        } else {
            // Task doesn't exist, render it
            this.renderTask(task);
        }
    }
    
    renderColumn(status) {
        const columnElement = this.columnElements[status];
        if (!columnElement) return;
        
        // Clear existing tasks
        columnElement.innerHTML = '';
        
        // Get tasks for this status, sorted by priority
        if (typeof taskStorage === 'undefined') {
            console.error('taskStorage not available');
            return;
        }
        
        const tasks = taskStorage.getTasksByStatus(status);
        
        // Render each task
        tasks.forEach(task => {
            this.renderTask(task);
        });
    }
    
    renderAll() {
        Object.keys(this.columnElements).forEach(status => {
            this.renderColumn(status);
        });
    }
    
    // Efficient update - only update changed elements
    refreshTask(taskId) {
        if (typeof taskStorage === 'undefined') {
            console.error('taskStorage not available');
            return;
        }
        const task = taskStorage.getTaskById(taskId);
        if (task) {
            this.updateTask(task);
        }
    }
    
    refreshColumn(status) {
        this.renderColumn(status);
    }
}

// Create global instance
const taskRenderer = new TaskRenderer();