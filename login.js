// Function to check if the user is already logged in
function checkLoginStatus() {
    const authToken = localStorage.getItem('authToken');

    if (authToken) {
        alert('You are already logged in!');
        window.location.href = 'index.html'; // Redirect to the index page
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
});


async function validateLoginForm() {
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value.trim();

    // Regex for phone number validation (format: 123-456-7890)
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;

    if (!phone || !password) {
        alert('All fields are required.');
        return false;
    }

    if (!phoneRegex.test(phone)) {
        alert('Phone number must be in the format: 123-456-7890');
        return false;
    }

    // Hash the password using CryptoJS
    const hashedPassword = CryptoJS.SHA256(password).toString();

    // Send data to the PHP file
    try {
        const response = await fetch('login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phoneNumber:phone, password: hashedPassword })
        });

        const result = await response.json();

        if (result.status === 'success') {
            alert(`${result.message} Welcome, ${result.firstName} ${result.lastName}!`);

            document.getElementById("loginForm").reset();

            localStorage.setItem('firstName', result.firstName);
            localStorage.setItem('lastName', result.lastName);
            localStorage.setItem('userType',result.userType);
            localStorage.setItem('authToken', result.token);

            window.location.href = 'index.html';
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing your request.');
    }

    return false; // Prevent form submission
}
