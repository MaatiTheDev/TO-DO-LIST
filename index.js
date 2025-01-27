document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'http://localhost:3000';

    // Event listeners for forms
    if (document.getElementById('login-form')) {
        document.getElementById('login-form').addEventListener('submit', loginUser);
    }

    if (document.getElementById('signup-form')) {
        document.getElementById('signup-form').addEventListener('submit', signUpUser);
    }

    if (document.getElementById('account-form')) {
        document.getElementById('account-form').addEventListener('submit', updateAccount);
        loadAccount();
    }

    if (document.getElementById('task-form')) {
        document.getElementById('task-form').addEventListener('submit', addTask);
    }

    if (document.getElementById('task-list')) {
        loadTasks();
    }

    function loginUser(event) {
        event.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        fetch(`${apiUrl}/users`)
            .then(response => response.json())
            .then(users => {
                const user = users.find(user => user.username === username && user.password === password);
                if (user) {
                    alert('Login successful');
                    localStorage.setItem('loggedInUser', JSON.stringify(user));
                    window.location.href = 'tasks.html';
                } else {
                    alert('Invalid username or password');
                }
            });
    }

    function signUpUser(event) {
        event.preventDefault();
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;
        const avatar = document.getElementById('signup-avatar').files[0];

        const reader = new FileReader();
        reader.onload = function(event) {
            const avatarUrl = event.target.result;
            const newUser = { username, password, avatarUrl };
            
            fetch(`${apiUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            })
            .then(response => response.json())
            .then(user => {
                console.log('User created:', user);
                alert('Sign up successful');
                window.location.href = 'index.html';
            })
            .catch(error => {
                console.error('Error creating user:', error);
                alert('Error signing up');
            });
        };
        reader.readAsDataURL(avatar);
    }

    function updateAccount(event) {
        event.preventDefault();
        const username = document.getElementById('user-name').value;
        const password = document.getElementById('user-password').value;
        const avatar = document.getElementById('user-avatar').files[0];

        const reader = new FileReader();
        reader.onload = function(event) {
            const avatarUrl = event.target.result;
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

            const updatedUser = {
                ...loggedInUser,
                username: username || loggedInUser.username,
                password: password || loggedInUser.password,
                avatarUrl: avatarUrl || loggedInUser.avatarUrl
            };
            
            fetch(`${apiUrl}/users/${loggedInUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedUser)
            })
            .then(() => {
                localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
                alert('Account updated successfully');
            })
            .catch(error => {
                console.error('Error updating account:', error);
                alert('Error updating account');
            });
        };
        reader.readAsDataURL(avatar);
    }

    function loadAccount() {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser) {
            document.getElementById('user-name').value = loggedInUser.username;
        }
    }

    function addTask(event) {
        event.preventDefault();
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const image = document.getElementById('task-image').files[0];

        const reader = new FileReader();
        reader.onload = function(event) {
            const imageUrl = event.target.result;
            const newTask = {
                id: Date.now(),
                title,
                description,
                imageUrl,
                done: false
            };

            fetch(`${apiUrl}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask)
            })
            .then(() => {
                loadTasks();
                document.getElementById('task-form').reset();
                window.location.href = 'tasks.html';
            })
            .catch(error => {
                console.error('Error adding task:', error);
                alert('Error adding task');
            });
        };
        reader.readAsDataURL(image);
    }

    function loadTasks() {
        fetch(`${apiUrl}/tasks`)
            .then(response => response.json())
            .then(tasks => {
                const taskList = document.getElementById('task-list');
                taskList.innerHTML = '';
                let nonDoneCount = 0;
                let doneCount = 0;
                let scheduledCount = 0;

                tasks.forEach(task => {
                    const taskItem = document.createElement('div');
                    taskItem.innerHTML = `
                        <h3>${task.title}</h3>
                        <p>${task.description}</p>
                        <img src="${task.imageUrl}" alt="${task.title}" width="100">
                        <button onclick="markTaskAsDone(${task.id})">Mark as Done</button>
                        <button onclick="deleteTask(${task.id})">Delete</button>
                    `;
                    taskList.appendChild(taskItem);

                    if (task.done) {
                        doneCount++;
                    } else {
                        nonDoneCount++;
                    }
                });

                document.getElementById('non-done-tasks').innerText = nonDoneCount;
                document.getElementById('done-tasks').innerText = doneCount;
                document.getElementById('scheduled-tasks').innerText = scheduledCount;
            })
            .catch(error => {
                console.error('Error loading tasks:', error);
            });
    }

    window.logout = function() {
        localStorage.removeItem('loggedInUser');
    }

    window.markTaskAsDone = function(taskId) {
        fetch(`${apiUrl}/tasks/${taskId}`)
            .then(response => response.json())
            .then(task => {
                task.done = true;
                return fetch(`${apiUrl}/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(task)
                });
            })
            .then(() => {
                loadTasks();
            })
            .catch(error => {
                console.error('Error marking task as done:', error);
            });
    }

    window.deleteTask = function(taskId) {
        fetch(`${apiUrl}/tasks/${taskId}`, {
            method: 'DELETE'
        })
        .then(() => {
            loadTasks();
        })
        .catch(error => {
            console.error('Error deleting task:', error);
        });
    }
});
