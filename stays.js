let cityData = { cities: [] }; // Default structure in case fetch fails

// Fetch cities data
fetch("./cities.json")
  .then((response) => response.json())
  .then((data) => {
    cityData = data;
    const dropdown = document.getElementById("city-dropdown");

    // Loop through each city and create an option element
    data.cities.forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      dropdown.appendChild(option);
    });
  })
  .catch((error) => {
    console.error("Error loading city data:", error);
  });

// Validate form inputs before submitting
function validateStayForm() {
  const checkInDate = new Date(document.getElementById("checkIn").value.replace(/-/g, '\/'));
  const checkOutDate = new Date(document.getElementById("checkOut").value.replace(/-/g, '\/'));
  const startDate = new Date("2024/09/01");
  const endDate = new Date("2024/12/01");

  const city = document.getElementById("city-dropdown").value;
  const validCities = cityData.cities;

  // City validation
  if (!validCities.includes(city)) {
    alert("City must be in Texas or California.");
    return;
  }

  // Date validation
  if (checkInDate < startDate || checkOutDate > endDate) {
    alert(
      "Check-in and Check-out dates must be between Sep 1, 2024, and Dec 1, 2024."
    );
    return;
  }

  if (checkInDate >= checkOutDate) {
    alert("Check-in date must be before the Check-out date.");
    return;
  }

  const adults = parseInt(document.getElementById("adults").value);
  const children = parseInt(document.getElementById("children").value);
  const infants = parseInt(document.getElementById("infants").value);

  // Ensure non-negative numbers for all fields
  if (adults < 0 || children < 0 || infants < 0) {
    alert("The number of adults, children, and infants must be non-negative.");
    return;
  }

  // Total guests excluding infants
  const totalGuests = adults + children;

  // Calculate the number of rooms required
  let roomsRequired = Math.ceil(totalGuests / 2);

  // Fetch available hotels after form validation
  fetchHotels(city, checkInDate, checkOutDate, roomsRequired);
}

// Function to fetch hotels based on the city and date range
function fetchHotels(city, checkInDate, checkOutDate, roomsRequired) {
  fetch("hotels.json?nocache=")
    .then(response => response.json())
    .then(data => {
      const availableHotels = data.hotels.filter(
        hotel => hotel.city === city
      );
      displayHotels(availableHotels, checkInDate, checkOutDate, roomsRequired);
    })
    .catch(error => {
      console.error("Error fetching hotel data:", error);
    });
}

// Function to display the available hotels in the search results
function displayHotels(hotels, checkInDate, checkOutDate, roomsRequired) {
  const formattedCheckIn = checkInDate.toLocaleDateString();
  const formattedCheckOut = checkOutDate.toLocaleDateString();
  const hotelContainer = document.getElementById("availableHotels");
  hotelContainer.innerHTML = "";

  if (!hotels.length){
    const hotelDiv = document.createElement("div");
    hotelDiv.innerHTML = `
      <p> No Hotels Available in this city</p>
      `;
      hotelContainer.appendChild(hotelDiv);
  }

  hotels.forEach(hotel => {
    if (checkInDate >= new Date(hotel.date_available)) {
      if (hotel.available_rooms >= roomsRequired) {
      const hotelDiv = document.createElement("div");
      hotelDiv.classList.add("hotel-item");
      hotelDiv.innerHTML = `
        <h3>${hotel.hotel_name} (ID: ${hotel.hotel_id})</h3>
        <p>City: ${hotel.city}</p>
        <p>Rooms Available:${hotel.available_rooms}</p>
        <p>Price per Night: $${hotel.price_per_night}</p>
        <button class="book-button" onclick="addToCart(
          '${hotel.hotel_id}', 
          '${hotel.hotel_name}', 
          '${hotel.city}', 
          '${formattedCheckIn}', 
          '${formattedCheckOut}', 
          ${hotel.price_per_night},
          ${roomsRequired})">Add to Cart</button>
      `;
      hotelContainer.appendChild(hotelDiv);
      } else {
        const hotelDiv = document.createElement("div");
        hotelDiv.innerHTML = `
        <p> Not Enough rooms available </p>
        `;
        hotelContainer.appendChild(hotelDiv);
      } 
  } else {
    const hotelDiv = document.createElement("div");
    hotelDiv.innerHTML = `
      <p> No rooms available for the selected date </p>
      `;
    hotelContainer.appendChild(hotelDiv);
  }
  });
}

// Function to add the selected hotel to the cart
function addToCart(hotelId, hotelName, city, checkIn, checkOut, pricePerNight,roomsRequired) {
  const cart = {
    hotel_id: hotelId,
    name: hotelName,
    city: city,
    check_in_date: checkIn,
    check_out_date: checkOut,
    price_per_night: pricePerNight,
    rooms_required: roomsRequired
  };


  // Save the cart to localStorage
  localStorage.setItem("hotel", JSON.stringify(cart));
  alert("Hotel added to cart!");

  // Reset the form after successful validation
  document.getElementById("stayForm").reset();

  // Redirect to cart page
  window.location.href = "cart.html";
}
