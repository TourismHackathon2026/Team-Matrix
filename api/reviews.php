<?php
// ============================================================
// Reviews API
// GET  /api/reviews.php      → list all reviews
// POST /api/reviews.php      → create a new review
// Body (POST): { place, rating, review, user_name }
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
session_start();

$pdo = getDB();

// ==================== GET: List all reviews ====================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT id, place, rating, review, user_name, created_at FROM reviews ORDER BY id DESC');
    $reviews = $stmt->fetchAll();

    echo json_encode(['success' => true, 'reviews' => $reviews]);
    exit;
}

// ==================== POST: Create a new review ====================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $place    = trim($data['place'] ?? '');
    $rating   = (int)($data['rating'] ?? 0);
    $review   = trim($data['review'] ?? '');
    $userName = trim($data['user_name'] ?? '');

    if (!$place || $rating < 1 || $rating > 5 || !$review || !$userName) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields are required and rating must be 1-5.']);
        exit;
    }

    $userId = $_SESSION['user_id'] ?? null;

    $stmt = $pdo->prepare(
        'INSERT INTO reviews (user_id, place, rating, review, user_name) VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->execute([$userId, $place, $rating, $review, $userName]);

    echo json_encode([
        'success' => true,
        'message' => 'Review submitted successfully.',
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
