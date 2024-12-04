<?php
include 'db_config.php';

// Get data from POST request
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['phoneNumber']) || !isset($data['password']) || !isset($data['firstName']) || 
    !isset($data['lastName']) || !isset($data['dob']) || !isset($data['email'])) {
    echo json_encode(["status" => "error", "message" => "All fields are required."]);
    exit;
}

if ($data['phoneNumber'] === '222-222-2222') {
    echo json_encode(["status" => "error", "message" => "Phone number 222-222-2222 is reserved for admin user."]);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO users (phoneNumber, password, firstName, lastName, dob, email, gender) 
                           VALUES (:phoneNumber, :password, :firstName, :lastName, :dob, :email, :gender)");
    $stmt->execute([
        ':phoneNumber' => $data['phoneNumber'],
        ':password' => $data['password'],
        ':firstName' => $data['firstName'],
        ':lastName' => $data['lastName'],
        ':dob' => $data['dob'],
        ':email' => $data['email'],
        ':gender' => $data['gender'] ?? null
    ]);

    echo json_encode(["status" => "success", "message" => "Registration successful!"]);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        echo json_encode(["status" => "error", "message" => "Phone number already exists."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
    }
}
?>

