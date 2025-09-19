// storage.js - Manages task data (create, delete, update, load, save)

function TaskStorage() {
    this.tasks = this.loadTasks();
    this.nextId = this.calculateNextId();
}

TaskStorage.prototype.calculateNextId = function() {
    if (this.tasks.length === 0) return 1;
    var ids = this.tasks.map(function(task) { return parseInt(task.id); });
    return Math.max.apply(null, ids) + 1;
};

TaskStorage.prototype.loadTasks = function() {
    try {
        var stored = localStorage.getItem("tasks");
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading tasks:', error);
        return [];
    }
};

TaskStorage.prototype.saveTasks = function() {
    try {
        localStorage.setItem("tasks", JSON.stringify(this.tasks));
    } catch (error) {
        console.error('Error saving tasks:', error);
    }
};

TaskStorage.prototype.createTask = function(title, priority) {
    if (!priority) priority = 'medium';
    var taskId = this.nextId++;
    var task = {
        id: String(taskId),
        title: title.trim(),
        priority: priority,
        status: "todo"
    };
    
    this.tasks.push(task);
    this.saveTasks();
    return task;
};

TaskStorage.prototype.deleteTask = function(taskId) {
    var initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(function(task) { return task.id !== taskId; });
    
    if (this.tasks.length < initialLength) {
        this.saveTasks();
        return true;
    }
    return false;
};

TaskStorage.prototype.updateTask = function(taskId, updates) {
    var taskIndex = -1;
    for (var i = 0; i < this.tasks.length; i++) {
        if (this.tasks[i].id === taskId) {
            taskIndex = i;
            break;
        }
    }
    
    if (taskIndex !== -1) {
        var existingTask = this.tasks[taskIndex];
        for (var key in updates) {
            if (updates.hasOwnProperty(key)) {
                existingTask[key] = updates[key];
            }
        }
        this.saveTasks();
        return existingTask;
    }
    return null;
};

TaskStorage.prototype.moveTask = function(taskId, newStatus) {
    return this.updateTask(taskId, { status: newStatus });
};

TaskStorage.prototype.getTasksByStatus = function(status) {
    return this.tasks
        .filter(function(task) { return task.status === status; })
        .sort(function(a, b) {
            var priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
};

TaskStorage.prototype.getAllTasks = function() {
    return this.tasks;
};

TaskStorage.prototype.getTaskById = function(taskId) {
    for (var i = 0; i < this.tasks.length; i++) {
        if (this.tasks[i].id === taskId) {
            return this.tasks[i];
        }
    }
    return null;
};

// Create global instance
var taskStorage = new TaskStorage();