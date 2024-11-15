// Function to load the cart and display its details
function loadStaysCart() {
  const cart = JSON.parse(localStorage.getItem("hotel"));
  const cartContainer = document.getElementById("cartDetails");
  cartContainer.innerHTML = "";

  if (cart) {
    cartContainer.innerHTML = `
            <p><b>Hotel:</b> ${cart.name} (ID: ${cart.hotel_id})</p>
            <p><b>City:</b> ${cart.city}</p>
            <p><b>Check-in:</b> ${cart.check_in_date}</p>
            <p><b>Check-out:</b> ${cart.check_out_date}</p>
            <p><b>Price per Night:</b> $${cart.price_per_night}</p>
            <p><b>Rooms Required:</b>${cart.rooms_required}</p>
            <p><b> Total Stay: </b>${calculateTotalStay(
              cart.check_in_date,
              cart.check_out_date
            )} days</p>
            <p><b>Total Price:</b> $${calculateTotalPrice(
              cart.check_in_date,
              cart.check_out_date,
              cart.price_per_night,
              cart.rooms_required
            )}</p>
            <button class="book-button" onclick="bookHotel()">Book Now</button>
        `;
  } else {
    cartContainer.innerHTML = "<p>No Hotel Selected.</p>";
  }
}

// Function to calculate the total stay
function calculateTotalStay(checkIn, checkOut) {
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const stayDuration = (endDate - startDate) / (1000 * 60 * 60 * 24);
  return stayDuration;
}

// Function to calculate the total price for the stay
function calculateTotalPrice(checkIn, checkOut, pricePerNight, roomsRequired) {
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const stayDuration = (endDate - startDate) / (1000 * 60 * 60 * 24);
  return stayDuration * pricePerNight * roomsRequired;
}

// Function to book the hotel and update the available rooms
function bookHotel() {
  const cart = JSON.parse(localStorage.getItem("hotel"));

  if (!cart) {
    alert("Your cart is empty.");
    return;
  }

  fetch("bookHotel.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cart),
  })
    .then((response) => response.text())
    .then((data) => {
      alert(data);
      localStorage.removeItem("hotel");
      window.location.href = "stays.html"; // Redirect to stays page after booking
    })
    .catch((error) => console.error("Error booking hotel:", error));
}

function loadFlightsCart() {
  // Retrieve selected flights from localStorage
  const selectedDepartingFlight = JSON.parse(
    localStorage.getItem("selectedDepartingFlight")
  );
  const selectedReturningFlight = JSON.parse(
    localStorage.getItem("selectedReturningFlight")
  );

  // References for conditional display
  const flightDetailsContainer = document.getElementById("selectedFlightDetails");
  const passengerForm = document.getElementById("passengerForm");
  const passengerInfoHeading = document.getElementById("passengerInfoHeading");

  // Clear flight details initially
  flightDetailsContainer.innerHTML = "";

  // If no flight is selected, show a message and hide the form and heading
  if (!selectedDepartingFlight && !selectedReturningFlight) {
    flightDetailsContainer.innerHTML = "<p>No flight selected.</p>";
    passengerForm.style.display = "none";
    if (passengerInfoHeading) {
      passengerInfoHeading.style.display = "none";
    }
    return;
  }

  // Show passenger form and heading if there is at least one selected flight
  passengerForm.style.display = "block";
  if (passengerInfoHeading) {
    passengerInfoHeading.style.display = "block";
  }

  let flightDetailsHTML = "";

  // Display departing flight details
  let totalDepartingPrice = 0;
  if (selectedDepartingFlight) {
    flightDetailsHTML += `
        <h3>Departing Flight</h3>
        <p><strong>Flight ID:</strong> ${selectedDepartingFlight.flightId}</p>
        <p><strong>Origin:</strong> ${selectedDepartingFlight.origin}</p>
        <p><strong>Destination:</strong> ${
          selectedDepartingFlight.destination
        }</p>
        <p><strong>Departure Date:</strong> ${
          selectedDepartingFlight.departureDate
        }</p>
        <p><strong>Arrival Date:</strong> ${
          selectedDepartingFlight.arrivalDate
        }</p>
        <p><strong>Departure Time:</strong> ${
          selectedDepartingFlight.departureTime
        }</p>
        <p><strong>Arrival Time:</strong> ${
          selectedDepartingFlight.arrivalTime
        }</p>
        <p><strong>Price:</strong> $${selectedDepartingFlight.price.toFixed(
          2
        )}</p>
      `;
    totalDepartingPrice = selectedDepartingFlight.price;
  }

  // Display returning flight details if present
  let totalReturningPrice = 0;
  if (selectedReturningFlight) {
    flightDetailsHTML += `
        <h3>Returning Flight</h3>
        <p><strong>Flight ID:</strong> ${selectedReturningFlight.flightId}</p>
        <p><strong>Origin:</strong> ${selectedReturningFlight.origin}</p>
        <p><strong>Destination:</strong> ${
          selectedReturningFlight.destination
        }</p>
        <p><strong>Departure Date:</strong> ${
          selectedReturningFlight.departureDate
        }</p>
        <p><strong>Arrival Date:</strong> ${
          selectedReturningFlight.arrivalDate
        }</p>
        <p><strong>Departure Time:</strong> ${
          selectedReturningFlight.departureTime
        }</p>
        <p><strong>Arrival Time:</strong> ${
          selectedReturningFlight.arrivalTime
        }</p>
        <p><strong>Price:</strong> $${selectedReturningFlight.price.toFixed(
          2
        )}</p>
      `;
    totalReturningPrice = selectedReturningFlight.price;
  }

  document.getElementById("selectedFlightDetails").innerHTML =
    flightDetailsHTML;

  // Calculate total price for all passengers
  const adults = parseInt(localStorage.getItem("adults")) || 0;
  const children = parseInt(localStorage.getItem("children")) || 0;
  const infants = parseInt(localStorage.getItem("infants")) || 0;

  const totalAdultPrice =
    totalDepartingPrice * adults + totalReturningPrice * adults;
  const totalChildPrice =
    totalDepartingPrice * 0.7 * children + totalReturningPrice * 0.7 * children;
  const totalInfantPrice =
    totalDepartingPrice * 0.1 * infants + totalReturningPrice * 0.1 * infants;
  const totalPrice = totalAdultPrice + totalChildPrice + totalInfantPrice;

  localStorage.setItem("totalPrice", totalPrice);

  // Display total price
  document.getElementById("selectedFlightDetails").innerHTML += `
      <h3>Total Price</h3>
      <p><strong>Adults:</strong> ${adults} x $${totalDepartingPrice.toFixed(
    2
  )} (Departing) + $${totalReturningPrice.toFixed(
    2
  )} (Returning) = $${totalAdultPrice.toFixed(2)}</p>
      <p><strong>Children (70% of adult price):</strong> ${children} x $${(
    totalDepartingPrice * 0.7
  ).toFixed(2)} (Departing) + $${(totalReturningPrice * 0.7).toFixed(
    2
  )} (Returning) = $${totalChildPrice.toFixed(2)}</p>
      <p><strong>Infants (10% of adult price):</strong> ${infants} x $${(
    totalDepartingPrice * 0.1
  ).toFixed(2)} (Departing) + $${(totalReturningPrice * 0.1).toFixed(
    2
  )} (Returning) = $${totalInfantPrice.toFixed(2)}</p>
      <p><strong>Total Price:</strong> $${totalPrice.toFixed(2)}</p>
    `;

  // Display passenger inputs based on number of passengers
  const totalPassengers = adults + children + infants;
  const passengerInputs = document.getElementById("passengerInputs");
  for (let i = 1; i <= totalPassengers; i++) {
    passengerInputs.innerHTML += `
        <h4>Passenger ${i}</h4>
        <label for="firstName${i}">First Name:</label>
        <input type="text" id="firstName${i}" required /><br />
        <label for="lastName${i}">Last Name:</label>
        <input type="text" id="lastName${i}" required /><br />
        <label for="dob${i}">Date of Birth:</label>
        <input type="date" id="dob${i}" required /><br />
        <label for="ssn${i}">SSN:</label>
        <input type="text" id="ssn${i}" required /><br />
      `;
  }
}

function processBooking() {
  // Get passenger details
  const totalPassengers =
    parseInt(localStorage.getItem("totalPassengers")) || 1;
  const passengers = [];

  for (let i = 1; i <= totalPassengers; i++) {
    const firstName = document.getElementById(`firstName${i}`).value;
    const lastName = document.getElementById(`lastName${i}`).value;
    const dob = document.getElementById(`dob${i}`).value;
    const ssn = document.getElementById(`ssn${i}`).value;

    // Validate input fields
    if (!firstName || !lastName || !dob || !ssn) {
      alert(`Please fill out all details for Passenger ${i}`);
      return;
    }

    passengers.push({ firstName, lastName, dob, ssn });
  }

  // Hide the flight details and passenger form sections
  const selectedFlightDetails = document.getElementById('selectedFlightDetails');
  const passengerForm = document.getElementById('passengerForm');
  selectedFlightDetails.style.display = 'none';
  const passengerInfoHeading = document.querySelector('h3#passengerInfoHeading');

  selectedFlightDetails.style.display = 'none';
  passengerForm.style.display = 'none';
  if (passengerInfoHeading) {
    passengerInfoHeading.style.display = 'none';
  }

  // Generate unique booking number
  const bookingNumber = `BOOK${Date.now()}`;

  // Retrieve selected flights
  const selectedDepartingFlight = JSON.parse(
    localStorage.getItem("selectedDepartingFlight")
  );
  const selectedReturningFlight = JSON.parse(
    localStorage.getItem("selectedReturningFlight")
  );

  // Check if flights are selected
  if (selectedDepartingFlight) {
    // Update the available seats for the departing flight
    updateAvailableSeats(
      selectedDepartingFlight.flightId,
      totalPassengers,
      localStorage.getItem("totalPrice"),
      passengers,
      bookingNumber
    );
  }

  if (selectedReturningFlight) {
    // Update the available seats for the returning flight
    updateAvailableSeats(
      selectedReturningFlight.flightId,
      totalPassengers,
      localStorage.getItem("totalPrice"),
      passengers,
      bookingNumber
    );
  }

  // Display booking summary
  const bookingDetails = document.getElementById("bookingDetails");
  bookingDetails.innerHTML = `
      <p><strong>Booking Number:</strong> ${bookingNumber}</p>
    `;

  if (selectedDepartingFlight) {
    bookingDetails.innerHTML += `
        <h3>Departing Flight</h3>
        <p><strong>Flight ID:</strong> ${selectedDepartingFlight.flightId}</p>
        <p><strong>Origin:</strong> ${selectedDepartingFlight.origin}</p>
        <p><strong>Destination:</strong> ${selectedDepartingFlight.destination}</p>
        <p><strong>Departure Date:</strong> ${selectedDepartingFlight.departureDate}</p>
        <p><strong>Arrival Date:</strong> ${selectedDepartingFlight.arrivalDate}</p>
        <p><strong>Departure Time:</strong> ${selectedDepartingFlight.departureTime}</p>
        <p><strong>Arrival Time:</strong> ${selectedDepartingFlight.arrivalTime}</p>
      `;
  }

  if (selectedReturningFlight) {
    bookingDetails.innerHTML += `
        <h3>Returning Flight</h3>
        <p><strong>Flight ID:</strong> ${selectedReturningFlight.flightId}</p>
        <p><strong>Origin:</strong> ${selectedReturningFlight.origin}</p>
        <p><strong>Destination:</strong> ${selectedReturningFlight.destination}</p>
        <p><strong>Departure Date:</strong> ${selectedReturningFlight.departureDate}</p>
        <p><strong>Arrival Date:</strong> ${selectedReturningFlight.arrivalDate}</p>
        <p><strong>Departure Time:</strong> ${selectedReturningFlight.departureTime}</p>
        <p><strong>Arrival Time:</strong> ${selectedReturningFlight.arrivalTime}</p>
      `;
  }

  // Retrieve and correctly parse totalPrice from localStorage
  const totalPrice = parseFloat(localStorage.getItem("totalPrice")) || 0;
  bookingDetails.innerHTML += `<p><strong>Total Price:</strong> $${totalPrice.toFixed(
    2
  )}</p>`;

  bookingDetails.innerHTML += `<h3>Passengers</h3>`;

  passengers.forEach((p, index) => {
    bookingDetails.innerHTML += `
        <p>Passenger ${index + 1}: ${p.firstName} ${p.lastName}, DOB: ${
      p.dob
    }, SSN: ${p.ssn}</p>
      `;
  });

  // Show booking summary
  document.getElementById("bookingSummary").style.display = "block";

  localStorage.removeItem('totalPassengers');
  localStorage.removeItem('adults');
  localStorage.removeItem('children');
  localStorage.removeItem('infants');
  localStorage.removeItem('selectedDepartingFlight');
  localStorage.removeItem('selectedReturningFlight');
  localStorage.removeItem('totalPrice');
  
}

function updateAvailableSeats(
  flightId,
  totalPassengers,
  totalPrice,
  passengers,
  bookingNumber
) {
  // Create POST request payload
  const data = new FormData();
  data.append("flightId", flightId);
  data.append("totalPassengers", totalPassengers);
  data.append("totalPrice", totalPrice);
  data.append("passengers", JSON.stringify(passengers));
  data.append("bookingNumber", bookingNumber);

  // Send POST request to updateSeats.php
  fetch("updateSeats.php", {
    method: "POST",
    body: data,
  })
    .then((response) => response.text())
    .then((result) => {
      alert(result);
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while updating available seats.");
    });
}

loadStaysCart();
loadFlightsCart();
