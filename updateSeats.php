<?php
// Ensure you send POST data with the flight ID and number of passengers
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Retrieve data from the POST request
    $flightId = $_POST['flightId'];
    $totalPassengers = $_POST['totalPassengers'];
    $totalPrice = $_POST['totalPrice']; // Retrieve totalPrice from POST data
    $passengers = json_decode($_POST['passengers'], true); // Retrieve passengers array from POST data
    $bookingNumber = $_POST['bookingNumber'];

    // Load the XML file
    $xml = simplexml_load_file('flights.xml');
    if ($xml === false) {
        echo "Failed to load XML file.";
        exit;
    }

    // Find the flight by ID
    $flight = null;
    foreach ($xml->flight as $f) {
        if ((string)$f->{'flight-id'} === $flightId) {
            $flight = $f;
            break;
        }
    }

    if ($flight !== null) {
        // Get the current available seats
        $availableSeats = (int)$flight->{'available-seats'};
        
        // Check if enough seats are available
        if ($availableSeats >= $totalPassengers) {
            // Update the available seats
            $flight->{'available-seats'} = $availableSeats - $totalPassengers;
            
            // Save the updated XML back to the file
            $xml->asXML('flights.xml');

            // Store the booking information to a JSON file
            $bookingInfo = [
                'bookingNumber' => $bookingNumber,
                'flight-id' => $flightId,
                'total-passengers' => $totalPassengers,
                'total-price' => $totalPrice, // Add totalPrice to booking info
                'departure-date' => (string)$flight->{'departure-date'},
                'departure-time' => (string)$flight->{'departure-time'},
                'origin' => (string)$flight->{'origin'},
                'destination' => (string)$flight->{'destination'},
                'passengers' => $passengers // Add passengers array to booking info
            ];

            // Load existing bookings from the JSON file (if any)
            $jsonFile = 'bookings.json';
            if (file_exists($jsonFile)) {
                $bookings = json_decode(file_get_contents($jsonFile), true);
                if ($bookings === null) {
                    $bookings = [];  // Initialize an empty array if decoding fails
                }
            } else {
                $bookings = [];  // Create a new array if the file does not exist
            }

            // Append the new booking to the array
            $bookings[] = $bookingInfo;

            // Save the updated bookings back to the JSON file
            file_put_contents($jsonFile, json_encode($bookings, JSON_PRETTY_PRINT));

            echo "Seats updated successfully and booking saved!";
        } else {
            echo "Not enough available seats.";
        }
    } else {
        echo "Flight not found.";
    }
} else {
    echo "Invalid request.";
}
?>
