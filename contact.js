function validateContactForm() {
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const gender = document.querySelector('input[name="gender"]:checked');
  const comment = document.getElementById("comment").value;

  const nameRegex = /^[A-Z][a-z]+$/;
  const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$/;
  const emailRegex = /\S+@\S+\.\S+/;

  // Validation checks
  if (!nameRegex.test(firstName)) {
    alert("First name should start with a capital letter and contain only letters.");
    return;
  }
  if (!nameRegex.test(lastName)) {
    alert("Last name should start with a capital letter and contain only letters.");
    return;
  }
  if (firstName === lastName) {
    alert("First name and last name cannot be the same.");
    return;
  }
  if (!phoneRegex.test(phone)) {
    alert("Phone number must be in the format (ddd) ddd-dddd.");
    return;
  }
  if (!emailRegex.test(email)) {
    alert('Email must contain "@" and "."');
    return;
  }
  if (!gender) {
    alert("Please select a gender.");
    return;
  }
  if (comment.trim().length < 10) {
    alert("Comment must be at least 10 characters.");
    return;
  }

  // Create XML string
  const xmlString = `
    <user>
      <firstName>${firstName}</firstName>
      <lastName>${lastName}</lastName>
      <phone>${phone}</phone>
      <email>${email}</email>
      <gender>${gender.value}</gender>
      <comment>${comment}</comment>
    </user>`;

  // Send XML data to the PHP file
  fetch('save_xml.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `xmlData=${encodeURIComponent(xmlString)}`
  })
  .then(response => response.text())
  .then(data => {
    alert(data);
    document.getElementById("contactForm").reset();
  })
  .catch(error => {
    console.error('Error saving XML data:', error);
  });
}
