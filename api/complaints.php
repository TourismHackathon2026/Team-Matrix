<?php
// ============================================================
// Complaints API
// GET  /api/complaints.php      → list all complaints
// POST /api/complaints.php      → create a new complaint
// Body (POST): { name, place, title, description }
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

// ==================== GET: List all complaints ====================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT id, name, place, title, description, status, created_at FROM complaints ORDER BY id DESC');
    $complaints = $stmt->fetchAll();

    echo json_encode(['success' => true, 'complaints' => $complaints]);
    exit;
}

// ==================== POST: Create a new complaint ====================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $name        = trim($data['name'] ?? '');
    $place       = trim($data['place'] ?? '');
    $title       = trim($data['title'] ?? '');
    $description = trim($data['description'] ?? '');

    if (!$name || !$place || !$title || !$description) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields are required.']);
        exit;
    }

    $userId = $_SESSION['user_id'] ?? null;

    $stmt = $pdo->prepare(
        'INSERT INTO complaints (user_id, name, place, title, description) VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->execute([$userId, $name, $place, $title, $description]);

    $newId = $pdo->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => 'Complaint submitted successfully.',
        'complaint' => [
            'id'          => (int)$newId,
            'name'        => $name,
            'place'       => $place,
            'title'       => $title,
            'description' => $description,
            'status'      => 'pending',
        ]
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
