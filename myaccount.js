// Check login status and redirect if not logged in
function checkLoginStatus() {
  const authToken = localStorage.getItem("authToken");
  if (!authToken) {
    alert("Please log in to access your account!");
    window.location.href = "login.html";
    return;
  }

  // Display user info
  displayUserInfo();

  // Setup appropriate interface based on user type
  const userType = localStorage.getItem("userType");
  if (userType === "admin") {
    setupAdminInterface();
  } else {
    setupUserInterface();
  }
}

// Display user information
function displayUserInfo() {
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");
  const userType = localStorage.getItem("userType");

  document.getElementById(
    "userName"
  ).innerHTML = `Welcome, ${firstName} ${lastName} (${userType})`;
}

// Setup interface for regular users
function setupUserInterface() {
  // Hide admin section
  document.getElementById("admin").style.display = "none";

  // Create and append user interface elements
  const userSection = document.createElement("div");
  userSection.id = "userSection";
  userSection.innerHTML = `
        <h3>My Bookings</h3>
        
        <!-- Search by booking IDs -->
        <div class="search-section search-booking-section">
            <h4>Search Bookings</h4>
            <form id="bookingSearchForm">
                <input type="text" id="bookingId" placeholder="Enter Booking ID">
                <select id="bookingType">
                    <option value="flight">Flight Booking</option>
                    <option value="hotel">Hotel Booking</option>
                </select>
                <button type="submit">Search</button>
            </form>
        </div>

        <!-- Search passengers by flight booking -->
        <div class="search-section search-passenger-section">
            <h4>Search Flight Passengers</h4>
            <form id="passengerSearchForm">
                <input type="text" id="flightBookingId" placeholder="Enter Flight Booking ID">
                <button type="submit">Search Passengers</button>
            </form>
        </div>

        <!-- September 2024 Bookings -->
        <div class="search-section search-september-section">
            <h4>September 2024 Bookings</h4>
            <button onclick="getSeptember2024Bookings()">View All Bookings</button>
        </div>

        <!-- Search by SSN -->
        <div class="search-section ssn-search-section">
            <h4>Search Flights by SSN</h4>
            <form id="ssnSearchForm">
                <input type="text" id="ssn" placeholder="Enter SSN">
                <button type="submit">Search Flights</button>
            </form>
        </div>
    `;

  document.querySelector(".main-content").appendChild(userSection);

  // Add event listeners
  setupUserEventListeners();
}

// Setup interface for admin users
function setupAdminInterface() {
  const adminSection = document.createElement("div");
  adminSection.id = "adminSection";
  adminSection.innerHTML = `
        <!-- Texas Flights Search -->
        <div class="search-section texas-flights-section">
            <h4>Texas Flights (Sep-Oct 2024)</h4>
            <button onclick="getTexasFlights()">View Texas Flights</button>
        </div>

        <!-- Texas Hotels Search -->
        <div class="search-section texas-hotels-section">
            <h4>Texas Hotels (Sep-Oct 2024)</h4>
            <button onclick="getTexasHotels()">View Texas Hotels</button>
        </div>

        <!-- Expensive Bookings -->
        <div class="search-section expensive-section">
            <h4>Most Expensive Bookings</h4>
            <button onclick="getExpensiveHotels()">Expensive Hotels</button>
            <button onclick="getExpensiveFlights()">Expensive Flights</button>
        </div>

        <!-- Passenger Type Searches -->
        <div class="search-section flight-infant-section">
            <h4>Passenger Type Searches</h4>
            <button onclick="getInfantFlights()">Flights with Infants</button>
            <button onclick="getInfantChildrenFlights()">Flights with Infants & 2+ Children</button>
            <button onclick="getTexasNoInfantFlights()">Texas Flights without Infants</button>
        </div>

        <!-- California Arrivals -->
        <div class="search-section california-section">
            <h4>California Arrivals (Sep-Oct 2024)</h4>
            <button onclick="getCaliforniaArrivals()">View Arrivals Count</button>
        </div>
    `;

  document.querySelector(".main-content").appendChild(adminSection);

  // Add event listeners
  setupAdminEventListeners();
}

// Event listeners for user interface
function setupUserEventListeners() {
  document
    .getElementById("bookingSearchForm")
    .addEventListener("submit", searchBooking);

  // Passenger search form
  document
    .getElementById("passengerSearchForm")
    .addEventListener("submit", searchPassengers);

  document
    .getElementById("ssnSearchForm")
    .addEventListener("submit", searchFlightsBySSN);
}

// API call functions for admin features

async function searchBooking(event) {
  event.preventDefault();
  const bookingId = document.getElementById("bookingId").value;
  const bookingType = document.getElementById("bookingType").value;

  try {
    const response = await fetch("db_operations.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify({
        action: "searchBooking",
        bookingId: bookingId,
        bookingType: bookingType,
      }),
    });
    const data = await response.json();
    displayUserResults(data, "search-booking-section");
  } catch (error) {
    console.error("Error:", error);
    alert("Error searching bookings");
  }
}

async function searchPassengers(event) {
  event.preventDefault();
  const flightBookingId = document.getElementById("flightBookingId").value;

  try {
    const response = await fetch("db_operations.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify({
        action: "searchPassengers",
        flightBookingId: flightBookingId,
      }),
    });
    const data = await response.json();
    displayUserResults(data, "search-passenger-section");
  } catch (error) {
    console.error("Error:", error);
    alert("Error searching passengers");
  }
}

async function getSeptember2024Bookings() {
  try {
    const response = await fetch("db_operations.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "septemberBookings" }), // Sending action as payload
    });
    const data = await response.json();
    displayUserResults(data, "search-september-section");
  } catch (error) {
    console.error("Error:", error);
    alert("Error retrieving September bookings");
  }
}

async function searchFlightsBySSN(event) {
  event.preventDefault();
  const ssn = document.getElementById("ssn").value;

  if (!ssn) {
    alert("Please enter an SSN");
    return;
  }

  try {
    const response = await fetch("db_operations.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify({
        action: "searchFlightsBySSN",
        ssn: ssn,
      }),
    });

    const data = await response.json();

    if (data.status === "error") {
      throw new Error(data.message);
    }

    // Display the results in the appropriate section
    displayUserResults(data, "ssn-search-section");
  } catch (error) {
    console.error("Error:", error);
    const parentSection = document.querySelector(".search-section");
    let resultsContainer = parentSection.querySelector(".results-container");
    if (!resultsContainer) {
      resultsContainer = document.createElement("div");
      resultsContainer.className = "results-container";
      resultsContainer.style.marginTop = "20px";
      parentSection.appendChild(resultsContainer);
    }
    resultsContainer.innerHTML = `<p style="color: red;">Error searching flights: ${error.message}</p>`;
  }
}

function displayUserResults(data, className) {
  // Find the parent section based on className
  const parentSection = document.querySelector(`.${className}`);

  // Create or get the results container
  let resultsContainer = parentSection.querySelector(".results-container");
  if (!resultsContainer) {
    resultsContainer = document.createElement("div");
    resultsContainer.className = "results-container";
    resultsContainer.style.marginTop = "20px";
    parentSection.appendChild(resultsContainer);
  }

  // Clear any previous content
  resultsContainer.innerHTML = "";

  // Handle empty or invalid data
  if (!data || data.length === 0) {
    resultsContainer.innerHTML = '<p class="no-results">No results found</p>';
    return;
  }

  // Create the horizontally scrollable container
  const scrollContainer = document.createElement("div");
  scrollContainer.style.cssText = `
    overflow-x: auto;
    white-space: nowrap;
    margin-bottom: 10px;
    max-width: 100%;
    border: 1px solid #dee2e6;
    border-radius: 4px;
  `;

  // Create table
  let tableHtml =
    '<table style="width: 100%; border-collapse: collapse; min-width: 600px;">';

  // Add headers
  const headers = Object.keys(data[0]);
  tableHtml += "<thead><tr>";
  headers.forEach((header) => {
    tableHtml += `
      <th style="
        position: sticky;
        top: 0;
        background-color: #f8f9fa;
        padding: 12px 15px;
        border: 1px solid #dee2e6;
        text-align: left;
        font-weight: bold;
      ">
        ${header.replace(/_/g, " ").toUpperCase()}
      </th>`;
  });
  tableHtml += "</tr></thead>";

  // Add data rows
  tableHtml += "<tbody>";
  data.forEach((row) => {
    tableHtml += "<tr>";
    headers.forEach((header) => {
      tableHtml += `
        <td style="
          padding: 12px 15px;
          border: 1px solid #dee2e6;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        ">
          ${row[header] || "-"}
        </td>`;
    });
    tableHtml += "</tr>";
  });
  tableHtml += "</tbody></table>";

  // Add the table to the scroll container
  scrollContainer.innerHTML = tableHtml;
  resultsContainer.appendChild(scrollContainer);

  // Create close button
  const closeButton = document.createElement("button");
  closeButton.innerHTML = "Close Results";
  closeButton.style.cssText = `
    background-color: #dc3545;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
    transition: background-color 0.2s;
  `;

  // Add hover effect
  closeButton.onmouseover = () => {
    closeButton.style.backgroundColor = "#c82333";
  };
  closeButton.onmouseout = () => {
    closeButton.style.backgroundColor = "#dc3545";
  };

  // Add click handler
  closeButton.onclick = () => {
    resultsContainer.remove();
  };

  // Add the close button below the table
  resultsContainer.appendChild(closeButton);
}

// API call functions for admin features
async function getTexasFlights() {
  try {
    const response = await fetch("db_operations.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "texasFlights" }), // Sending action as payload
    });
    const data = await response.json();
    console.log(data);
    displayResults(data, "texas-flights-section");
  } catch (error) {
    console.error("Error:", error);
    alert("Error retrieving Texas hotels");
  }
}

async function getTexasHotels() {
  try {
    const response = await fetch("db_operations.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "texasHotels" }), // Sending action as payload
    });
    const data = await response.json();
    console.log(data);
    displayResults(data, "texas-hotels-section");
  } catch (error) {
    console.error("Error:", error);
    alert("Error retrieving Texas hotels");
  }
}

async function getExpensiveHotels() {
  try {
    const response = await fetch("db_operations.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "expensiveHotels" }),
    });
    const data = await response.json();
    displayExpensiveResults(data, "hotel", "expensive-section");
  } catch (error) {
    console.error("Error:", error);
    alert("Error retrieving expensive hotels");
  }
}

async function getExpensiveFlights() {
  try {
    const response = await fetch("db_operations.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "expensiveFlights" }),
    });
    const data = await response.json();
    displayExpensiveResults(data, "flight", "expensive-section");
  } catch (error) {
    console.error("Error:", error);
    alert("Error retrieving expensive flights");
  }
}

async function getInfantFlights() {
  try {
    const response = await fetch("db_operations.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "infantFlights" }),
    });
    const data = await response.json();
    displayResults(data, "flight-infant-section");
  } catch (error) {
    console.error("Error:", error);
    alert("Error retrieving infant flights");
  }
}

async function getTexasNoInfantFlights() {
  try {
    const response = await fetch("db_operations.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "noInfantTexasFlights" }),
    });
    const data = await response.json();
    displayResults(data, "flight-infant-section");
  } catch (error) {
    console.error("Error:", error);
    alert("Error retrieving infant flights");
  }
}

async function getInfantChildrenFlights() {
  try {
    const response = await fetch("db_operations.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "infantChildrenFlights" }),
    });
    const data = await response.json();
    displayResults(data, "flight-infant-section");
  } catch (error) {
    console.error("Error:", error);
    alert("Error retrieving infant and children flights");
  }
}

async function getCaliforniaArrivals() {
  try {
    const response = await fetch("db_operations.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "californiaArrivals" }), // Sending action as payload
    });
    const data = await response.json();
    displayResults(data, "california-section");
  } catch (error) {
    console.error("Error:", error);
    alert("Error retrieving California arrivals");
  }
}

// Helper function to display results in Texas flights section
function displayResults(data, id) {
  let resultsContainer = document.getElementById(id);

  // Create the container if it doesn't exist
  if (!resultsContainer) {
    resultsContainer = document.createElement("div");
    resultsContainer.id = id;
    resultsContainer.style.marginTop = "10px"; // Space below button
    document.querySelector(`.${id}`).appendChild(resultsContainer);
  }

  // Clear any previous content
  resultsContainer.innerHTML = "";

  // Convert data to horizontally scrollable HTML table
  let html = '<div style="overflow-x: auto; white-space: nowrap;">'; // Scrollable container
  html +=
    '<table class="results-table" style="width: 100%; border-collapse: collapse;"><tr>';

  // Add headers based on first result
  const headers = Object.keys(data[0]);
  headers.forEach((header) => {
    html += `<th style="padding: 5px; border: 1px solid #ccc;">${header}</th>`;
  });
  html += "</tr>";

  // Add data rows
  data.forEach((row) => {
    html += "<tr>";
    headers.forEach((header) => {
      html += `<td style="padding: 5px; border: 1px solid #ccc;">${row[header]}</td>`;
    });
    html += "</tr>";
  });
  html += "</table></div>";

  // Insert table into results container
  resultsContainer.innerHTML += html;

  // Create and append the "Remove Results" button
  const removeButton = document.createElement("button");
  removeButton.innerText = "Remove Results";
  removeButton.style.backgroundColor = "tomato"; // Tomato red color
  removeButton.style.color = "white";
  removeButton.style.padding = "10px";
  removeButton.style.border = "none";
  removeButton.style.marginTop = "10px";
  removeButton.style.cursor = "pointer";

  // Add the remove button below the table
  resultsContainer.appendChild(removeButton);

  // Button click handler to remove the results container
  removeButton.onclick = () => {
    resultsContainer.style.display = "none"; // Hide the results
  };

  resultsContainer.style.display = "block"; // Ensure the results are visible
}

function displayExpensiveResults(data, type, parentClass) {
  // Get the parent container by class name (assumes it's the first element with that class)
  const parentDivs = document.getElementsByClassName(parentClass);

  if (parentDivs.length === 0) {
    console.error(`No parent container found with class name: ${parentClass}`);
    return;
  }

  const parentDiv = parentDivs[0]; // Get the first element with the class name

  // Create a container for results if it doesn't exist
  let resultsContainer = document.getElementById(`${parentClass}-results`);

  if (!resultsContainer) {
    resultsContainer = document.createElement("div");
    resultsContainer.id = `${parentClass}-results`;
    resultsContainer.style.marginTop = "10px"; // Add some spacing
    parentDiv.appendChild(resultsContainer);
  }

  // Clear previous results
  resultsContainer.innerHTML = "";

  if (
    !data ||
    (type === "hotel" && !data.hotel && !data.guests) ||
    (type === "flight" && !data.flight && !data.passengers)
  ) {
    resultsContainer.innerHTML = "<p>No results found</p>";
    return;
  }

  // Display Primary Data (Hotel/Flight)
  const primaryData = type === "hotel" ? data.hotel : data.flight;
  const secondaryData = type === "hotel" ? data.guests : data.passengers;
  const primaryTitle =
    type === "hotel"
      ? "Most Expensive Hotel Booking"
      : "Most Expensive Flight Booking";
  const secondaryTitle =
    type === "hotel" ? "Guest Information" : "Passenger Information";

  // Display Primary Data (e.g. hotel or flight)
  if (primaryData && primaryData.length > 0) {
    let primaryHtml = `<h3>${primaryTitle}</h3><div style="overflow-x: auto; white-space: nowrap;">`;
    primaryHtml += `<table class="results-table" style="width: 100%; border-collapse: collapse;"><tr>`;

    // Add headers for primary data
    const primaryHeaders = Object.keys(primaryData[0]);
    primaryHeaders.forEach((header) => {
      primaryHtml += `<th style="padding: 5px; border: 1px solid #ccc;">${header
        .replace(/_/g, " ")
        .toUpperCase()}</th>`;
    });
    primaryHtml += "</tr>";

    // Add primary data row
    primaryHtml += "<tr>";
    primaryHeaders.forEach((header) => {
      primaryHtml += `<td style="padding: 5px; border: 1px solid #ccc;">${primaryData[0][header]}</td>`;
    });
    primaryHtml += "</tr></table></div>";

    resultsContainer.innerHTML += primaryHtml;
  }

  // Add spacing between tables
  resultsContainer.innerHTML += "<br><br>";

  // Display Secondary Data (Guests/Passengers)
  if (secondaryData && secondaryData.length > 0) {
    let secondaryHtml = `<h3>${secondaryTitle}</h3><div style="overflow-x: auto; white-space: nowrap;">`;
    secondaryHtml += `<table class="results-table" style="width: 100%; border-collapse: collapse;"><tr>`;

    // Add headers for secondary data
    const secondaryHeaders = Object.keys(secondaryData[0]);
    secondaryHeaders.forEach((header) => {
      secondaryHtml += `<th style="padding: 5px; border: 1px solid #ccc;">${header
        .replace(/_/g, " ")
        .toUpperCase()}</th>`;
    });
    secondaryHtml += "</tr>";

    // Add secondary data rows
    secondaryData.forEach((item) => {
      secondaryHtml += "<tr>";
      secondaryHeaders.forEach((header) => {
        secondaryHtml += `<td style="padding: 5px; border: 1px solid #ccc;">${item[header]}</td>`;
      });
      secondaryHtml += "</tr>";
    });
    secondaryHtml += "</table></div>";

    resultsContainer.innerHTML += secondaryHtml;
  } else {
    resultsContainer.innerHTML += `<p>No ${
      type === "hotel" ? "guest" : "passenger"
    } information available</p>`;
  }

  // Create and append the "Remove Results" button
  const removeButton = document.createElement("button");
  removeButton.innerText = "Remove Results";
  removeButton.style.backgroundColor = "tomato"; // Tomato red color
  removeButton.style.color = "white";
  removeButton.style.padding = "10px";
  removeButton.style.border = "none";
  removeButton.style.marginTop = "10px";
  removeButton.style.cursor = "pointer";

  // Add the remove button below the tables
  resultsContainer.appendChild(removeButton);

  // Button click handler to remove the results container
  removeButton.onclick = () => {
    resultsContainer.style.display = "none"; // Hide the results
  };

  resultsContainer.style.display = "block"; // Ensure the results are visible
}

// Initialize page
document.addEventListener("DOMContentLoaded", checkLoginStatus);
