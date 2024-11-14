// Load the XML data (assuming the XML file is hosted on the server)
async function loadFlightsXML() {
  const response = await fetch('flights.xml');
  const xmlText = await response.text();
  const parser = new DOMParser();
  return parser.parseFromString(xmlText, 'application/xml');
}

// Toggle return date field visibility based on trip type
function toggleReturnDate(show) {
  const returnDateField = document.getElementById("returnDate");
  const returnDateContainer = document.getElementById("returnDateContainer");

  if (show) {
    returnDateContainer.style.display = "block";
    returnDateField.setAttribute("required", true);
  } else {
    returnDateContainer.style.display = "none";
    returnDateField.removeAttribute("required");
  }
}

// Show passenger form when the icon is clicked
function showPassengerForm() {
  const passengerForm = document.getElementById("passengerForm");
  const isVisible = passengerForm.style.display === "block";

  passengerForm.style.display = isVisible ? "none" : "block";

  // Get passenger input fields
  const adults = document.getElementById("adults");
  const children = document.getElementById("children");
  const infants = document.getElementById("infants");

  // Set required attributes based on form visibility
  if (isVisible) {
    adults.removeAttribute("required");
    children.removeAttribute("required");
    infants.removeAttribute("required");
  } else {
    adults.setAttribute("required", true);
    children.setAttribute("required", true);
    infants.setAttribute("required", true);
  }
}

let cityData = { cities: [] }; // Default structure in case fetch fails

// Fetch cities data
fetch("./cities.json")
  .then((response) => response.json())
  .then((data) => {
    cityData = data;
    const originDropdown = document.getElementById("origin");
    const destinationDropdown = document.getElementById("destination");

    // Populate both origin and destination dropdowns with cities
    data.cities.forEach((city) => {
      const originOption = document.createElement("option");
      originOption.value = city;
      originOption.textContent = city;
      originDropdown.appendChild(originOption);

      const destinationOption = document.createElement("option");
      destinationOption.value = city;
      destinationOption.textContent = city;
      destinationDropdown.appendChild(destinationOption);
    });
  })
  .catch((error) => {
    console.error("Error loading city data:", error);
  });

// Validate and search for flights based on form inputs
async function validateFlightForm() {
  const origin = document.getElementById("origin").value.trim().toLowerCase();
  const destination = document
    .getElementById("destination")
    .value.trim()
    .toLowerCase();
  const departureDate = document.getElementById("departureDate").value;
  const returnDateElement = document.getElementById("returnDate");
  const returnDate = returnDateElement && returnDateElement.value ? returnDateElement.value : null;
  const tripType = document.querySelector('input[name="tripType"]:checked').value;
  const adults = parseInt(document.getElementById("adults").value) || 0;
  const children = parseInt(document.getElementById("children").value) || 0;
  const infants = parseInt(document.getElementById("infants").value) || 0;
  const totalPassengers = adults + children + infants;

  localStorage.setItem('totalPassengers', JSON.stringify(totalPassengers));
  localStorage.setItem('adults', JSON.stringify(adults))
  localStorage.setItem('children', JSON.stringify(children))
  localStorage.setItem('infants', JSON.stringify(infants))

  // Validate number of passengers
  if (totalPassengers === 0) {
    alert("Please enter at least one passenger.");
    return;
  }
  if (adults < 1) {
    alert("At least one adult is required for booking.");
    return;
  }

  // Validate origin and destination
  const originCity = document.getElementById("origin").value;
  const destinationCity = document.getElementById("destination").value;
  const validCities = cityData.cities;
  if (!validCities.includes(originCity)) {
    alert("Origin must be a city in Texas or California.");
    return;
  }
  if (!validCities.includes(destinationCity)) {
    alert("Destination must be a city in Texas or California.");
    return;
  }
  if (origin === destination) {
    alert("Origin and destination must be different.");
    return;
  }

  // Validate departure date
  const startDate = new Date("2024-09-01");
  const endDate = new Date("2024-12-01");
  const depDateObj = new Date(departureDate);
  if (depDateObj < startDate || depDateObj > endDate) {
    alert("Departure date must be between Sep 1, 2024, and Dec 1, 2024.");
    return;
  }

  // Validate return date if round trip
  let returnDateObj;
  if (tripType === "roundtrip") {
    if (!returnDate) {
      alert("Please select a return date for a round trip.");
      return;
    }
    returnDateObj = new Date(returnDate);
    if (returnDateObj <= depDateObj) {
      alert("Return date must be after the departure date.");
      return;
    }
  }

  // Load and search flights in XML
  const xmlDoc = await loadFlightsXML();
  const flights = xmlDoc.getElementsByTagName('flight');

  // Search for departing flights
  const departingFlights = searchFlights(flights, origin, destination, departureDate, totalPassengers);

  // Handle round-trip search for return flights if applicable
  let returningFlights = [];
  if (tripType === "roundtrip") {
    returningFlights = searchFlights(flights, destination, origin, returnDate, totalPassengers);
  }

  // Display results
  if (tripType === "oneway") {
    displayFlights(departingFlights, "Departing Flights");
  } else {
    displayRoundTripFlights(departingFlights, returningFlights);
  }
}

// Function to search for flights based on input criteria
function searchFlights(flights, origin, destination, date, totalPassengers) {
  flightsContainer.innerHTML="<h3>Available Flights</h3>";
  const results = [];
  const searchDate = new Date(date);

  for (let i = 0; i < flights.length; i++) {
    const flight = flights[i];
    const flightOrigin = flight.getElementsByTagName('origin')[0].textContent.toLowerCase();
    const flightDestination = flight.getElementsByTagName('destination')[0].textContent.toLowerCase();
    const flightDate = flight.getElementsByTagName('departure-date')[0].textContent;
    const availableSeats = parseInt(flight.getElementsByTagName('available-seats')[0].textContent);

    const flightDateObj = new Date(flightDate);
    const diffInDays = Math.abs((flightDateObj - searchDate) / (1000 * 60 * 60 * 24));

    if (
      flightOrigin === origin &&
      flightDestination === destination &&
      diffInDays <= 3 &&
      availableSeats >= totalPassengers
    ) {
      results.push(flight);
    }
  }
  return results;
}

// Function to display round-trip flight options
function displayRoundTripFlights(departingFlights, returningFlights) {
  const flightsContainer = document.getElementById('flightsContainer');
  flightsContainer.innerHTML = ''; // Clear previous results

  const departingHeader = document.createElement('h4');
  departingHeader.textContent = "Available Departing Flights";
  flightsContainer.appendChild(departingHeader);
  displayFlights(departingFlights, "Departing Flights");

  const returningHeader = document.createElement('h4');
  returningHeader.textContent = "Available Returning Flights";
  flightsContainer.appendChild(returningHeader);
  displayFlights(returningFlights, "Returning Flights");

  // Add the unified "Select Both Flights" button if flights are displayed
  if (departingFlights.length > 0 && returningFlights.length > 0) {
    const selectBothButton = document.createElement('button');
    selectBothButton.id = 'selectBothFlightsButton';
    selectBothButton.textContent = 'Select Both Flights';
    selectBothButton.className = 'book-button';
    selectBothButton.onclick = selectBothFlights;
    flightsContainer.appendChild(selectBothButton);
  }
}


// Function to display flights
function displayFlights(flights, type) {
  const flightsContainer = document.getElementById('flightsContainer');

  if (flights.length === 0) {
    const noFlightsMsg = document.createElement('p');
    noFlightsMsg.textContent = `No available ${type.toLowerCase()} found for your criteria.`;
    flightsContainer.appendChild(noFlightsMsg);
    return;
  }

  flights.forEach(flight => {
    const flightId = flight.getElementsByTagName('flight-id')[0].textContent;
    const origin = flight.getElementsByTagName('origin')[0].textContent;
    const destination = flight.getElementsByTagName('destination')[0].textContent;
    const departureDate = flight.getElementsByTagName('departure-date')[0].textContent;
    const arrivalDate = flight.getElementsByTagName('arrival-date')[0].textContent;
    const departureTime = flight.getElementsByTagName('departure-time')[0].textContent;
    const arrivalTime = flight.getElementsByTagName('arrival-time')[0].textContent;
    const availableSeats = flight.getElementsByTagName('available-seats')[0].textContent;
    const price = flight.getElementsByTagName('price')[0].textContent;

    const flightCard = document.createElement('div');
    flightCard.className = 'flight-card';
    flightCard.setAttribute('data-type', type); // Add data-type attribute for distinguishing flights
    flightCard.innerHTML = `
      <p><strong>Flight ID:</strong> ${flightId}</p>
      <p><strong>Origin:</strong> ${origin}</p>
      <p><strong>Destination:</strong> ${destination}</p>
      <p><strong>Departure Date:</strong> ${departureDate}</p>
      <p><strong>Arrival Date:</strong> ${arrivalDate}</p>
      <p><strong>Departure Time:</strong> ${departureTime}</p>
      <p><strong>Arrival Time:</strong> ${arrivalTime}</p>
      <p><strong>Available Seats:</strong> ${availableSeats}</p>
      <p><strong>Price:</strong> $${price}</p>
    `;

    // Add a "Select Flight" button for one-way trips
    const tripType = document.querySelector('input[name="tripType"]:checked')?.value;
    if (tripType !== "roundtrip") {
      const selectButton = document.createElement('button');
      selectButton.textContent = "Select Flight";
      selectButton.className = 'book-button';
      selectButton.onclick = () => selectOneWayFlight(flightId);
      flightCard.appendChild(selectButton);
    }

    flightsContainer.appendChild(flightCard);
  });
}



let selectedDepartingFlight = null;
let selectedReturningFlight = null;

function selectOneWayFlight(flightId) {
  const flightsContainer = document.getElementById('flightsContainer');
  const selectedCard = Array.from(flightsContainer.getElementsByClassName('flight-card'))
    .find(card => card.innerText.includes(`Flight ID: ${flightId}`));

  const selectedFlight = {
    flightId,
    origin: selectedCard.querySelector('p:nth-child(2)').textContent.split(': ')[1],
    destination: selectedCard.querySelector('p:nth-child(3)').textContent.split(': ')[1],
    departureDate: selectedCard.querySelector('p:nth-child(4)').textContent.split(': ')[1],
    arrivalDate: selectedCard.querySelector('p:nth-child(5)').textContent.split(': ')[1],
    departureTime: selectedCard.querySelector('p:nth-child(6)').textContent.split(': ')[1],
    arrivalTime: selectedCard.querySelector('p:nth-child(7)').textContent.split(': ')[1],
    price: parseFloat(selectedCard.querySelector('p:nth-child(9)').textContent.split('$')[1]),
  };

  // Store the selected flight in localStorage
  localStorage.setItem('selectedDepartingFlight', JSON.stringify(selectedFlight));
  alert(`Departing flight ${flightId} selected!`);
  
  // Redirect to the cart page
  window.location.href = 'cart.html';
}


function selectBothFlights() {
  // Retrieve the first displayed departing and returning flights
  const departingCard = document.querySelector('.flight-card[data-type="Departing Flights"]');
  const returningCard = document.querySelector('.flight-card[data-type="Returning Flights"]');

  if (!departingCard || !returningCard) {
    alert('Please select both departing and returning flights.');
    return;
  }

  // Extract and store the details of the departing flight
  const selectedDepartingFlight = {
    flightId: departingCard.querySelector('p:nth-child(1)').textContent.split(': ')[1],
    origin: departingCard.querySelector('p:nth-child(2)').textContent.split(': ')[1],
    destination: departingCard.querySelector('p:nth-child(3)').textContent.split(': ')[1],
    departureDate: departingCard.querySelector('p:nth-child(4)').textContent.split(': ')[1],
    arrivalDate: departingCard.querySelector('p:nth-child(5)').textContent.split(': ')[1],
    departureTime: departingCard.querySelector('p:nth-child(6)').textContent.split(': ')[1],
    arrivalTime: departingCard.querySelector('p:nth-child(7)').textContent.split(': ')[1],
    price: parseFloat(departingCard.querySelector('p:nth-child(9)').textContent.split('$')[1]),
  };
  localStorage.setItem('selectedDepartingFlight', JSON.stringify(selectedDepartingFlight));

  // Extract and store the details of the returning flight
  const selectedReturningFlight = {
    flightId: returningCard.querySelector('p:nth-child(1)').textContent.split(': ')[1],
    origin: returningCard.querySelector('p:nth-child(2)').textContent.split(': ')[1],
    destination: returningCard.querySelector('p:nth-child(3)').textContent.split(': ')[1],
    departureDate: returningCard.querySelector('p:nth-child(4)').textContent.split(': ')[1],
    arrivalDate: returningCard.querySelector('p:nth-child(5)').textContent.split(': ')[1],
    departureTime: returningCard.querySelector('p:nth-child(6)').textContent.split(': ')[1],
    arrivalTime: returningCard.querySelector('p:nth-child(7)').textContent.split(': ')[1],
    price: parseFloat(returningCard.querySelector('p:nth-child(9)').textContent.split('$')[1]),
  };
  localStorage.setItem('selectedReturningFlight', JSON.stringify(selectedReturningFlight));

  alert('Both departing and returning flights have been selected!');
  window.location.href = 'cart.html';
}
