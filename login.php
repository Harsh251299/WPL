<?php
include 'db_config.php';

// Get data from POST request
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['phoneNumber']) || !isset($data['password'])) {
    echo json_encode(["status" => "error", "message" => "Phone Number and password are required."]);
    exit;
}

$phoneNumber = $data['phoneNumber'];
$password = $data['password'];

try {
    // Prepare SQL query
    $stmt = $pdo->prepare("SELECT firstName, lastName,userType FROM users WHERE phoneNumber = :phoneNumber AND password = :password");
    $stmt->execute([
        ':phoneNumber' => $phoneNumber,
        ':password' => $password
    ]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Generate a random token using the current timestamp
        $token = uniqid() . '_' . time();

        echo json_encode([
            "status" => "success",
            "message" => "Login successful.",
            "firstName" => $user['firstName'],
            "lastName" => $user['lastName'],
            "userType" => $user['userType'],
            "token" => $token
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid phone number or password."]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
}
?>
