<?php
require 'db_config.php';

header('Content-Type: application/json');

try {
    $query = "SELECT DISTINCT origin AS city FROM flights 
              UNION SELECT DISTINCT destination AS city FROM flights";
    $stmt = $pdo->query($query);
    $cities = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode(['cities' => $cities]);
} catch (Exception $e) {
    echo json_encode(['error' => 'Failed to fetch cities: ' . $e->getMessage()]);
}
?>
