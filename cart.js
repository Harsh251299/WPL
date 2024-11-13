// Function to load the cart and display its details
function loadCart() {
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
            <p><b> Total Stay: </b>${calculateTotalStay(cart.check_in_date, cart.check_out_date)} days</p>
            <p><b>Total Price:</b> $${calculateTotalPrice(cart.check_in_date, cart.check_out_date, cart.price_per_night, cart.rooms_required)}</p>
            <button class="book-button" onclick="bookHotel()">Book Now</button>
        `;
    } else {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    }
}

// Function to calculate the total stay
function calculateTotalStay(checkIn, checkOut) {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const stayDuration = (endDate - startDate) / (1000 * 60 * 60 * 24);
    return stayDuration
}

// Function to calculate the total price for the stay
function calculateTotalPrice(checkIn, checkOut, pricePerNight,roomsRequired) {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const stayDuration = (endDate - startDate) / (1000 * 60 * 60 * 24);
    return (stayDuration * pricePerNight * roomsRequired);
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
        body: JSON.stringify(cart)
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        localStorage.removeItem("hotel");
        window.location.href = "stays.html"; // Redirect to stays page after booking
    })
    .catch(error => console.error("Error booking hotel:", error));
}

loadCart();