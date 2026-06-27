<?php
// ============================================================
// Database Configuration & Connection
// ============================================================

$DB_HOST = 'localhost';
$DB_NAME = 'travelvoice';
$DB_USER = 'root';
$DB_PASS = ''; // default XAMPP MySQL has no password

function getDB(): PDO {
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS;
    static $pdo = null;

    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
                $DB_USER,
                $DB_PASS,
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit;
        }
    }

    return $pdo;
}
