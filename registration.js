
// Validate registration form
async function validateRegistrationForm() {
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const dob = document.getElementById('dob').value.trim();
    const gender = document.querySelector('input[name="gender"]:checked');
    const email = document.getElementById('email').value.trim();

    // Regex patterns for validation
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    const dobRegex = /^\d{2}-\d{2}-\d{4}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;

    // Check required fields
    if (!phone || !password || !confirmPassword || !firstName || !lastName || !dob || !email) {
        alert('All fields except Gender are required.');
        return;
    }

    // Validate phone number format
    if (!phoneRegex.test(phone)) {
        alert('Phone number must be in the format: 123-456-7890');
        return;
    }

    if (phone == '222-222-2222'){
        alert('You cannot use this phone number');
        return;
    }

    // Validate passwords
    if (password.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    // Validate date of birth format
    if (!dobRegex.test(dob)) {
        alert('Date of Birth must be in the format: MM-DD-YYYY');
        return;
    }

    // Validate email format
    if (!emailRegex.test(email)) {
        alert('Email must be valid and contain @ and .com');
        return;
    }

    const hashedPassword = CryptoJS.SHA256(password).toString();

    // Send data to PHP for insertion into the database
    const data = {
        phoneNumber:phone,
        password: hashedPassword,
        firstName,
        lastName,
        dob,
        email,
        gender: gender ? gender.value : null
    };

    try {
        const response = await fetch('registration.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.status === 'success') {
            alert(result.message);
            document.getElementById("registrationForm").reset();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('An error occurred while processing your request.');
        console.error(error);
    }

    return false; // Prevent form submission
}
