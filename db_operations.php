<?php
include 'db_config.php';
header('Content-Type: application/json');

// Get data from POST request
$data = json_decode(file_get_contents("php://input"), true);

// Function to execute query and return results
function executeQuery($pdo, $query, $params = []) {
    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ["status" => "error", "message" => "Database error: " . $e->getMessage()];
    }
}

try {
    $action = $data['action'] ?? '';
    // $action = $_GET['action'] ?? '';

        // Define city arrays
    $texasCitiesData = [
        "Dallas", "Houston", "Austin", "San Antonio", "Fort Worth",
        "El Paso", "Arlington", "Corpus Christi", "Plano", "Lubbock",
        "Laredo", "Irving", "Garland", "Frisco", "McKinney",
        "Amarillo", "Brownsville", "Grand Prairie", "Pasadena", "Mesquite"
    ];

    $californiaCitiesData = [
        "Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose",
        "Fresno", "Long Beach", "Oakland", "Bakersfield", "Anaheim",
        "Santa Ana", "Riverside", "Stockton", "Chula Vista", "Irvine",
        "Fremont", "San Bernardino", "Modesto", "Fontana", "Oxnard"
    ];

    $californiaPlaceholders = "'" . implode("','", $californiaCitiesData) . "'";
    $texasPlaceholders = "'" . implode("','", $texasCitiesData) . "'";

    switch($action) {
        case 'searchBooking':
            $bookingId = $data['bookingId'] ?? '';
            $bookingType = $data['bookingType'] ?? '';
            
            if ($bookingType === 'flight') {
                $query = "SELECT f.*, fb.*, t.* 
                         FROM flights f 
                         JOIN flight_bookings fb ON f.flight_id = fb.flight_id 
                         JOIN tickets t ON fb.flight_booking_id = t.flight_booking_id 
                         WHERE fb.flight_booking_id = :bookingId";
                echo json_encode(executeQuery($pdo, $query, [':bookingId' => $bookingId]));
            } else {
                $query = "SELECT h.*, hb.*, g.* 
                         FROM hotels h 
                         JOIN hotel_booking hb ON h.hotel_id = hb.hotel_id 
                         JOIN guests g ON hb.hotel_booking_id = g.hotel_booking_id 
                         WHERE hb.hotel_booking_id = :bookingId";
                echo json_encode(executeQuery($pdo, $query, [':bookingId' => $bookingId]));
            }
            break;

        case 'searchPassengers':
            $flightBookingId = $data['flightBookingId'] ?? '';
            $query = "SELECT DISTINCT p.* 
                     FROM passengers p 
                     JOIN tickets t ON p.ssn = t.ssn 
                     WHERE t.flight_booking_id = :flightBookingId";
            echo json_encode(executeQuery($pdo, $query, [':flightBookingId' => $flightBookingId]));
            break;

        case 'septemberBookings':
            $query = "SELECT f.*, fb.* 
                     FROM flights f 
                     JOIN flight_bookings fb ON f.flight_id = fb.flight_id 
                     WHERE MONTH(f.departure_date) = 9 AND YEAR(f.departure_date) = 2024";
            echo json_encode(executeQuery($pdo, $query));
            break;

        case 'searchFlightsBySSN':
            $ssn = $data['ssn'] ?? '';
            if (empty($ssn)) {
                echo json_encode(["status" => "error", "message" => "SSN is required"]);
                break;
            }
            
            $query = "SELECT DISTINCT 
                        f.*,
                        fb.*,
                        p.*,
                        t.*
                    FROM flights f 
                    JOIN flight_bookings fb ON f.flight_id = fb.flight_id 
                    JOIN tickets t ON fb.flight_booking_id = t.flight_booking_id 
                    JOIN passengers p ON t.ssn = p.ssn 
                    WHERE p.ssn = :ssn
                    ORDER BY f.departure_date DESC";
            
            $result = executeQuery($pdo, $query, [':ssn' => $ssn]);
            
            if (empty($result)) {
                echo json_encode([]);
            } else {
                echo json_encode($result);
            }
            break;

        case 'texasFlights':
            $query = "SELECT f.*, fb.* 
                     FROM flights f 
                     JOIN flight_bookings fb ON f.flight_id = fb.flight_id 
                     WHERE f.origin IN ($texasPlaceholders)
                     AND f.departure_date BETWEEN '2024-09-01' AND '2024-10-31'";
            echo json_encode(executeQuery($pdo, $query));
            break;

        case 'texasHotels':
            $query = "SELECT h.*, hb.* 
                     FROM hotels h 
                     JOIN hotel_booking hb ON h.hotel_id = hb.hotel_id 
                     WHERE h.city IN ($texasPlaceholders) 
                     AND hb.check_in_date BETWEEN '2024-09-01' AND '2024-10-31'";
            echo json_encode(executeQuery($pdo, $query));
            break;

        case 'expensiveHotels':
            // First, get the hotel booking ID of the most expensive booking
            $subquery = "SELECT hotel_booking_id 
                        FROM hotel_booking 
                        ORDER BY total_price DESC 
                        LIMIT 1";
            
            // Then use this ID to get both hotel/booking details and guest details
            $query1 = "SELECT h.*, hb.* 
                    FROM hotels h 
                    JOIN hotel_booking hb ON h.hotel_id = hb.hotel_id 
                    WHERE hb.hotel_booking_id = ($subquery)";
            
            $query2 = "SELECT g.* 
                    FROM guests g 
                    WHERE g.hotel_booking_id = ($subquery)";
            
            $hotelData = executeQuery($pdo, $query1);
            $guestData = executeQuery($pdo, $query2);
            
            echo json_encode([
                'hotel' => $hotelData,
                'guests' => $guestData
            ]);
            break;

        case 'expensiveFlights':
            // First, get the flight booking ID of the most expensive booking
            $subquery = "SELECT flight_booking_id 
                        FROM flight_bookings 
                        ORDER BY total_price DESC 
                        LIMIT 1";
            
            // Then use this ID to get both flight/booking details and passenger details
            $query1 = "SELECT f.*, fb.* 
                    FROM flights f 
                    JOIN flight_bookings fb ON f.flight_id = fb.flight_id 
                    WHERE fb.flight_booking_id = ($subquery)";
            
            $query2 = "SELECT DISTINCT p.* 
                    FROM passengers p 
                    JOIN tickets t ON p.ssn = t.ssn 
                    WHERE t.flight_booking_id = ($subquery)";
            
            $flightData = executeQuery($pdo, $query1);
            $passengerData = executeQuery($pdo, $query2);
            
            echo json_encode([
                'flight' => $flightData,
                'passengers' => $passengerData
            ]);
            break;

        case 'infantFlights':
            $query = "SELECT DISTINCT f.*, fb.* 
                     FROM flights f 
                     JOIN flight_bookings fb ON f.flight_id = fb.flight_id 
                     JOIN tickets t ON fb.flight_booking_id = t.flight_booking_id 
                     JOIN passengers p ON t.ssn = p.ssn 
                     WHERE p.category = 'Infant'";
            echo json_encode(executeQuery($pdo, $query));
            break;

        case 'infantChildrenFlights':
            $query = "SELECT f.*, fb.* 
                     FROM flights f 
                     JOIN flight_bookings fb ON f.flight_id = fb.flight_id 
                     WHERE fb.flight_booking_id IN (
                         SELECT t.flight_booking_id 
                         FROM tickets t 
                         JOIN passengers p ON t.ssn = p.ssn 
                         WHERE p.category = 'Infant'
                     ) AND fb.flight_booking_id IN (
                         SELECT t.flight_booking_id 
                         FROM tickets t 
                         JOIN passengers p ON t.ssn = p.ssn 
                         WHERE p.category = 'Children'
                         GROUP BY t.flight_booking_id 
                         HAVING COUNT(*) >= 2
                     )";
            echo json_encode(executeQuery($pdo, $query));
            break;

        case 'californiaArrivals':
            $query = "SELECT COUNT(*) as count 
                     FROM flights f 
                     JOIN flight_bookings fb ON f.flight_id = fb.flight_id 
                     WHERE f.destination IN ($californiaPlaceholders)
                     AND (MONTH(f.arrival_date) = 9 OR MONTH(f.arrival_date) = 10) 
                     AND YEAR(f.arrival_date) = 2024";
            echo json_encode(executeQuery($pdo, $query));
            break;

        case 'noInfantTexasFlights':
            $query = "SELECT f.*, fb.* 
                     FROM flights f 
                     JOIN flight_bookings fb ON f.flight_id = fb.flight_id 
                     WHERE f.origin IN ($texasPlaceholders)
                     AND fb.flight_booking_id NOT IN (
                         SELECT t.flight_booking_id 
                         FROM tickets t 
                         JOIN passengers p ON t.ssn = p.ssn 
                         WHERE p.category = 'Infant'
                     )";
            echo json_encode(executeQuery($pdo, $query));
            break;

        default:
            echo json_encode(["status" => "error", "message" => "Invalid action"]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}
?>