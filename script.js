document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');

    // Load tasks from db.json
    fetch('http://localhost:3000/tasks')
        .then(response => response.json())
        .then(tasks => {
            tasks.forEach(task => {
                addTask(task.text, task.completed, task.id);
            });
        });

    addTaskBtn.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            saveTask(taskText);
            taskInput.value = '';
        }
    });

    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addTaskBtn.click();
        }
    });

    function addTask(text, completed = false, id = null) {
        const li = document.createElement('li');
        li.textContent = text;
        if (completed) {
            li.classList.add('completed');
        }

        li.addEventListener('click', () => {
            li.classList.toggle('completed');
            updateTaskStatus(li.textContent, li.classList.contains('completed'), id);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            taskList.removeChild(li);
            removeTask(id);
        });

        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    }

    function saveTask(text) {
        fetch('http://localhost:3000/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text, completed: false })
        })
        .then(response => response.json())
        .then(task => {
            addTask(task.text, task.completed, task.id);
        });
    }

    function removeTask(id) {
        fetch(`http://localhost:3000/tasks/${id}`, {
            method: 'DELETE'
        });
    }

    function updateTaskStatus(text, completed, id) {
        fetch(`http://localhost:3000/tasks/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed })
        });
    }
});
