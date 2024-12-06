<?php
require 'db_config.php';

// Parse JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required keys
if (!isset($input['hotel'], $input['guests'], $input['bookingID'])) {
    echo "Invalid request: Missing data.";
    exit;
}

// Extract data from input
$hotelData = $input['hotel'];
$guests = $input['guests'];
$bookingID = $input['bookingID'];

$hotelID = $hotelData['hotel_id'];
$hotelName = $hotelData['hotel_name'];
$city = $hotelData['city'];
$checkInDate = $hotelData['check_in_date'];
$checkOutDate = $hotelData['check_out_date'];
$pricePerNight = $hotelData['price_per_night'];
$roomsRequired = $hotelData['rooms_required'];

// Begin transaction
$pdo->beginTransaction();

try {
    // Update the hotels table to decrement available rooms
    $updateHotelQuery = "UPDATE hotels 
                         SET available_rooms = available_rooms - :rooms 
                         WHERE hotel_id = :hotel_id AND available_rooms >= :rooms";
    $updateStmt = $pdo->prepare($updateHotelQuery);
    $updateStmt->execute([
        ':rooms' => $roomsRequired,
        ':hotel_id' => $hotelID
    ]);

    if ($updateStmt->rowCount() === 0) {
        throw new Exception("Booking failed: Not enough rooms available.");
    }

    // Insert into hotel_booking table
    $totalPrice = $pricePerNight * $roomsRequired;
    $insertBookingQuery = "INSERT INTO hotel_booking 
                           (hotel_booking_id, hotel_id, check_in_date, check_out_date, number_of_rooms, price_per_night, total_price) 
                           VALUES 
                           (:booking_id, :hotel_id, :check_in_date, :check_out_date, :rooms, :price_per_night, :total_price)";
    $insertBookingStmt = $pdo->prepare($insertBookingQuery);
    $insertBookingStmt->execute([
        ':booking_id' => $bookingID,
        ':hotel_id' => $hotelID,
        ':check_in_date' => $checkInDate,
        ':check_out_date' => $checkOutDate,
        ':rooms' => $roomsRequired,
        ':price_per_night' => $pricePerNight,
        ':total_price' => $totalPrice
    ]);

    // Insert guests into guests table
    $insertGuestQuery = "INSERT INTO guests 
                         (ssn, hotel_booking_id, first_name, last_name, date_of_birth, category) 
                         VALUES 
                         (:ssn, :booking_id, :first_name, :last_name, :dob, :category)";
    $insertGuestStmt = $pdo->prepare($insertGuestQuery);

    foreach ($guests as $guest) {
        $insertGuestStmt->execute([
            ':ssn' => $guest['ssn'],
            ':booking_id' => $bookingID,
            ':first_name' => $guest['firstName'],
            ':last_name' => $guest['lastName'],
            ':dob' => $guest['dob'],
            ':category' => $guest['category']
        ]);
    }

    // Commit the transaction
    $pdo->commit();
    echo "Booking successful!";
} catch (Exception $e) {
    // Roll back the transaction if anything goes wrong
    $pdo->rollBack();
    echo "Booking failed: " . $e->getMessage();
}
?>
