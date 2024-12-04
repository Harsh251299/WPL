// Display date and time
function displayDateTime() {
  const now = new Date();
  document.getElementById("dateTime").textContent = now.toLocaleString();
  setTimeout(displayDateTime, 1000); // Continuously update every second
  changeFontSize(); // Set initial font size when page loads
  displayUserName();
}

function displayUserName() {
  const firstName = localStorage.getItem('firstName');
  const lastName = localStorage.getItem('lastName');
  if (firstName && lastName) {
    document.getElementById('userName').innerHTML = "Current User:- " + firstName + " " + lastName; 
  }
}

// Change font size for form elements and main content
function changeFontSize() {
  // If no size is provided, get from the input

  size = document.getElementById("fontSize").value;

  // Change font size of form elements
  const formElements = document.querySelectorAll(
    "#stayForm input, #stayForm label"
  );

  formElements.forEach((element) => {
    element.style.fontSize = size + "px"; // Apply the font size to form elements
  });

  // Change font size of everything inside the main content
  const mainContentElements = document.querySelectorAll(
    ".main-content h2, .main-content p, .main-content label"
  );

  mainContentElements.forEach((element) => {
    element.style.fontSize = size + "px"; // Apply the font size to main content
  });
}

// Change background color
function changeBgColor() {
  const color = document.getElementById("bgColor").value;
  document.body.style.backgroundColor = color; // Change background color
}
