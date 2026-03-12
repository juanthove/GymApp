document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/users/logged-in')
        .then(response => response.json())
        .then(data => {
            const usersDiv = document.getElementById('users');
            data.forEach(user => {
                const p = document.createElement('p');
                p.textContent = `ID: ${user.id}, Name: ${user.name}, Surname: ${user.surname}`;
                usersDiv.appendChild(p);
            });
        })
        .catch(error => console.error('Error fetching users:', error));
});