<?php
require 'db_config.php';

header('Content-Type: application/json');

$origin = $_GET['origin'] ?? '';
$destination = $_GET['destination'] ?? '';
$date = $_GET['date'] ?? '';
$totalPassengers = $_GET['total_passengers'] ?? 0;

try {
    // Prepare SQL query
    $query = "
        SELECT * 
        FROM flights 
        WHERE origin = :origin 
          AND destination = :destination 
          AND ABS(DATEDIFF(departure_date, :date)) <= 3 
          AND available_seats >= :total_passengers
    ";
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':origin' => $origin,
        ':destination' => $destination,
        ':date' => $date,
        ':total_passengers' => $totalPassengers,
    ]);

    $flights = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['flights' => $flights]);
} catch (Exception $e) {
    echo json_encode(['error' => 'Failed to search flights: ' . $e->getMessage()]);
}
?>
