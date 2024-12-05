<?php

include 'db_config.php';

// Check if a file is uploaded
if (isset($_FILES['jsonFile']) && $_FILES['jsonFile']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['jsonFile']['tmp_name'];
    $jsonData = file_get_contents($fileTmpPath);

    // Decode the JSON data
    $hotels = json_decode($jsonData, true);

    if (isset($hotels['hotels'])) {
        try {
            // Check if the table is empty
            $stmt = $pdo->query('SELECT COUNT(*) as count FROM hotels');
            $row = $stmt->fetch();

            if ($row['count'] > 0) {
                echo '<script>alert("Data already exists in the database."); window.location.href = "myaccount.html";</script>';
            } else {
                // Prepare SQL query for inserting data
                $insertStmt = $pdo->prepare(
                    'INSERT INTO hotels (hotel_id, hotel_name, city, available_rooms, date_available, price_per_night) 
                     VALUES (:hotel_id, :hotel_name, :city, :available_rooms, :date_available, :price_per_night)'
                );

                foreach ($hotels['hotels'] as $hotel) {
                    $insertStmt->execute([
                        ':hotel_id' => $hotel['hotel_id'],
                        ':hotel_name' => $hotel['hotel_name'],
                        ':city' => $hotel['city'],
                        ':available_rooms' => $hotel['available_rooms'],
                        ':date_available' => $hotel['date_available'],
                        ':price_per_night' => $hotel['price_per_night'],
                    ]);
                }

                echo '<script>alert("Data successfully added to the database."); window.location.href = "myaccount.html";</script>';
            }
        } catch (PDOException $e) {
            echo '<script>alert("Error: ' . $e->getMessage() . '"); window.location.href = "myaccount.html";</script>';
        }
    } else {
        echo '<script>alert("Invalid JSON file format."); window.location.href = "myaccount.html";</script>';
    }
} else {
    echo '<script>alert("Error uploading file."); window.location.href = "myaccount.html";</script>';
}
?>
