<?php
// Get JSON input from cart
$input = json_decode(file_get_contents('php://input'), true);

$hotel_id = $input['hotel_id'];
$city = $input['city'];
$name = $input['name'];
$check_in_date = $input['check_in_date'];
$check_out_date = $input['check_out_date'];
$price_per_night = $input['price_per_night'];
$rooms_required = $input['rooms_required'];

// Check if HotelBooking.xml exists, if not, create a new XML file
$xmlFile = 'HotelBooking.xml';
if (file_exists($xmlFile)) {
    // Load existing XML file
    $xml = simplexml_load_file($xmlFile);
} else {
    // Create new XML structure if file does not exist
    $xml = new SimpleXMLElement('<bookings/>');
}

// Add the booking details
$booking = $xml->addChild('booking');
$booking->addChild('hotel_id', $hotel_id);
$booking->addChild('hotel_name', $name);
$booking->addChild('city', $city);
$booking->addChild('check_in_date', $check_in_date);
$booking->addChild('check_out_date', $check_out_date);
$booking->addChild('price_per_night', $price_per_night);
$booking->addChild('rooms_required', $rooms_required);

// Save or update the XML file with the new booking
$xml->asXML($xmlFile);

// Update JSON file to reduce available rooms
$jsonFile = 'hotels.json';
$json = file_get_contents($jsonFile);
$data = json_decode($json, true);

$bookingSuccess = false;

foreach ($data['hotels'] as &$hotel) {
    if ($hotel['hotel_id'] == $hotel_id) {
        // Check that available rooms won't go negative
        if ($hotel['available_rooms'] >= $rooms_required) {
            $hotel['available_rooms'] -= $rooms_required;
            $bookingSuccess = true;
        } else {
            echo "Booking failed: Not enough rooms available.";
            exit;
        }
        break;
    }
}

// If booking was successful, save the updated hotel data back to JSON
if ($bookingSuccess) {
    file_put_contents($jsonFile, json_encode($data));
    echo "Booking successful! Your room is reserved.";
} else {
    echo "Booking failed: Hotel not found or insufficient rooms.";
}
?>
