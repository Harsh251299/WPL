<?php
require 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $flightId = $_POST['flightId'];
    $totalPassengers = $_POST['totalPassengers'];
    $totalPrice = $_POST['totalPrice'];
    $passengers = json_decode($_POST['passengers'], true);
    $bookingNumber = $_POST['bookingNumber'];

    try {
        // Start transaction
        $pdo->beginTransaction();

        // Step 1: Check if the flight has enough available seats
        $stmt = $pdo->prepare("SELECT available_seats FROM flights WHERE flight_id = :flightId");
        $stmt->execute([':flightId' => $flightId]);
        $flight = $stmt->fetch();

        if (!$flight || $flight['available_seats'] < $totalPassengers) {
            echo "Not enough available seats.";
            $pdo->rollBack();
            exit;
        }

        // Step 2: Update available seats in the flights table
        $newAvailableSeats = $flight['available_seats'] - $totalPassengers;
        $stmt = $pdo->prepare("UPDATE flights SET available_seats = :availableSeats WHERE flight_id = :flightId");
        $stmt->execute([
            ':availableSeats' => $newAvailableSeats,
            ':flightId' => $flightId
        ]);

        // Step 3: Insert flight booking into flight-booking table
        $stmt = $pdo->prepare("INSERT INTO flight_bookings (flight_booking_id, flight_id, total_price) 
                                VALUES (:bookingId, :flightId, :totalPrice)");
        $stmt->execute([
            ':bookingId' => $bookingNumber,
            ':flightId' => $flightId,
            ':totalPrice' => $totalPrice
        ]);

        // Step 4: Insert passengers into passengers table and tickets into tickets table
        foreach ($passengers as $passenger) {
            // Insert into passengers table (Ignore duplicates)
            $stmt = $pdo->prepare("INSERT IGNORE INTO passengers (ssn, first_name, last_name, date_of_birth, category) 
                                    VALUES (:ssn, :firstName, :lastName, :dob, :category)");
            $stmt->execute([
                ':ssn' => $passenger['ssn'],
                ':firstName' => $passenger['firstName'],
                ':lastName' => $passenger['lastName'],
                ':dob' => $passenger['dob'],
                ':category' => $passenger['category']
            ]);

            // Insert into tickets table (Ignore duplicates)
            $stmt = $pdo->prepare("INSERT IGNORE INTO tickets (ticket_id, flight_booking_id, ssn, price) 
                                    VALUES (:ticketId, :bookingId, :ssn, :price)");
            $stmt->execute([
                ':ticketId' => $passenger['ticketID'],
                ':bookingId' => $bookingNumber,
                ':ssn' => $passenger['ssn'],
                ':price' => $totalPrice
            ]);
        }

        // Commit the transaction
        $pdo->commit();

        echo "Seats updated successfully, and booking saved!";
    } catch (Exception $e) {
        // Rollback on error
        $pdo->rollBack();
        echo "An error occurred: " . $e->getMessage();
    }
} else {
    echo "Invalid request.";
}
?>
