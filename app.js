// app.js - Main application logic

// Global function to handle task deletion (called from render.js)
function handleDeleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        const task = taskStorage.getTaskById(taskId);
        if (task) {
            if (taskStorage.deleteTask(taskId)) {
                taskRenderer.removeTask(taskId);
                console.log('Task deleted successfully:', taskId);
            } else {
                console.error('Failed to delete task:', taskId);
                alert('Error deleting task. Please refresh the page and try again.');
            }
        } else {
            console.error('Task not found for deletion:', taskId);
            alert('Task not found. Please refresh the page.');
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Kanban Board initializing...');
    
    // Check if taskStorage is available
    if (typeof taskStorage === 'undefined') {
        console.error('taskStorage not available during initialization');
        alert('Error: Task storage not available. Please refresh the page.');
        return;
    }
    
    // Render existing tasks
    taskRenderer.renderAll();
    
    // Setup form submission
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('taskTitle').value;
            const priority = document.getElementById('taskPriority').value;
            
            if (title.trim()) {
                const newTask = taskStorage.createTask(title, priority);
                taskRenderer.renderTask(newTask);
                taskForm.reset();
                console.log('Task created:', newTask);
            }
        });
    }
    
    console.log('Kanban Board initialized successfully');
});

// Expose necessary functions globally for HTML onclick handlers
window.handleDeleteTask = handleDeleteTask;