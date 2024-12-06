<?php
require 'db_config.php';

header('Content-Type: application/json');

// Get query parameters
$city = $_GET['city'] ?? '';
$checkInDate = $_GET['check_in_date'] ?? '';
$checkOutDate = $_GET['check_out_date'] ?? '';
$roomsRequired = $_GET['rooms_required'] ?? 0;

try {
    $query = "SELECT * FROM hotels WHERE city = :city";
    $params = [':city' => $city];

    if ($roomsRequired > 0) {
        $query .= " AND available_rooms >= :rooms_required";
        $params[':rooms_required'] = $roomsRequired;
    }

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);

    $hotels = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['hotels' => $hotels]);
} catch (Exception $e) {
    echo json_encode(['error' => 'Failed to fetch hotels: ' . $e->getMessage()]);
}
?>
