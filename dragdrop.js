// dragdrop.js - Manages drag-and-drop behavior between columns

class DragDropManager {
    constructor() {
        this.columnElements = {};
        this.initializeColumns();
        this.setupDragAndDrop();
    }
    
    initializeColumns() {
        this.columnElements = {
            todo: document.getElementById('todo'),
            inprogress: document.getElementById('inprogress'),
            done: document.getElementById('done')
        };
    }
    
    setupDragAndDrop() {
        Object.values(this.columnElements).forEach(column => {
            if (column) {
                column.addEventListener('dragover', this.handleDragOver.bind(this));
                column.addEventListener('drop', this.handleDrop.bind(this));
                column.addEventListener('dragenter', this.handleDragEnter.bind(this));
                column.addEventListener('dragleave', this.handleDragLeave.bind(this));
            }
        });
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    handleDragEnter(e) {
        e.preventDefault();
        if (e.target.classList.contains('dropzone')) {
            e.target.classList.add('drag-over');
        }
    }
    
    handleDragLeave(e) {
        if (e.target.classList.contains('dropzone')) {
            e.target.classList.remove('drag-over');
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        
        const zone = e.target.closest('.dropzone');
        if (!zone) return;
        
        zone.classList.remove('drag-over');
        
        const taskId = e.dataTransfer.getData("text/plain");
        const sourceStatus = e.dataTransfer.getData("application/x-task-status");
        const targetStatus = zone.id;
        
        if (!taskId || !targetStatus) return;
        
        // Fix for Bug 3: Validate task exists and handle gracefully
        const task = taskStorage.getTaskById(taskId);
        if (!task) {
            console.error("Task not found for drop:", taskId);
            return;
        }
        
        // Only move if dropping in a different status
        if (sourceStatus !== targetStatus) {
            this.moveTaskToStatus(taskId, targetStatus);
        }
    }
    
    moveTaskToStatus(taskId, newStatus) {
        const task = taskStorage.getTaskById(taskId);
        if (!task) {
            console.error("Cannot move task - task not found:", taskId);
            return false;
        }
        
        // Update storage
        const updatedTask = taskStorage.moveTask(taskId, newStatus);
        if (!updatedTask) {
            console.error("Failed to move task in storage:", taskId);
            return false;
        }
        
        // Update renderer - this will handle moving the DOM element
        taskRenderer.updateTask(updatedTask);
        
        return true;
    }
    
    // Additional safety check for drag operations
    safeMoveTask(taskId, targetStatus) {
        try {
            // Double-check task exists and is valid
            const task = taskStorage.getTaskById(taskId);
            if (!task) {
                console.error("Task not found for safe move:", taskId);
                return false;
            }
            
            // Ensure we're not moving to the same status
            if (task.status === targetStatus) {
                return true; // No change needed
            }
            
            return this.moveTaskToStatus(taskId, targetStatus);
        } catch (error) {
            console.error("Error during safe task move:", error);
            return false;
        }
    }
    
    // Refresh drag and drop after DOM changes
    refresh() {
        this.initializeColumns();
        this.setupDragAndDrop();
    }
}

// Create global instance
const dragDropManager = new DragDropManager();