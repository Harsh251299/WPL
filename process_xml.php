<?php

require 'db_config.php';

// Check if a file is uploaded
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['xmlFile'])) {
    $fileTmpPath = $_FILES['xmlFile']['tmp_name'];

    // Validate if the uploaded file exists
    if (file_exists($fileTmpPath)) {
        $xml = simplexml_load_file($fileTmpPath);

        if ($xml === false) {
            echo '<script>alert("Invalid XML file."); window.location.href = "myaccount.html";</script>';
            exit;
        }

        // Check if the table is empty
        $query = "SELECT COUNT(*) AS count FROM flights";
        $stmt = $pdo->query($query);
        $result = $stmt->fetch();

        if ($result['count'] > 0) {
            echo '<script>alert("Data already exists in the table."); window.location.href = "myaccount.html";</script>';
            exit;
        }

        // Prepare and insert data
        $insertQuery = $pdo->prepare("
            INSERT INTO flights 
            (flight_id, origin, destination, departure_date, arrival_date, 
            departure_time, arrival_time, available_seats, price) 
            VALUES 
            (:flight_id, :origin, :destination, :departure_date, :arrival_date, 
            :departure_time, :arrival_time, :available_seats, :price)
        ");

        foreach ($xml->flight as $flight) { // Adjust 'flight' to match your XML structure
            $insertQuery->execute([
                ':flight_id' => (string) $flight->{'flight-id'},
                ':origin' => (string) $flight->origin,
                ':destination' => (string) $flight->destination,
                ':departure_date' => (string) $flight->{'departure-date'},
                ':arrival_date' => (string) $flight->{'arrival-date'},
                ':departure_time' => (string) $flight->{'departure-time'},
                ':arrival_time' => (string) $flight->{'arrival-time'},
                ':available_seats' => (int) $flight->{'available-seats'},
                ':price' => (float) $flight->price,
            ]);
        }

        echo '<script>alert("Data inserted successfully!"); window.location.href = "myaccount.html";</script>';
    } else {
        echo '<script>alert("No file uploaded."); window.location.href = "myaccount.html";</script>';
    }
} else {
    echo '<script>alert("Invalid request."); window.location.href = "myaccount.html";</script>';
}
?>
