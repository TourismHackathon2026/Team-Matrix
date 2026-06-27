<?php
// ============================================================
// Resolve Complaint API (Admin Only)
// POST /api/resolve.php
// Body: { id: complaint_id }
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
session_start();

// ============================================================
// ACCESS CONTROL: Only admins can resolve complaints
// ============================================================
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Access denied. Admin only.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id = (int)($data['id'] ?? 0);

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Complaint ID is required.']);
    exit;
}

$pdo = getDB();

$stmt = $pdo->prepare("UPDATE complaints SET status = 'resolved', updated_at = NOW() WHERE id = ?");
$stmt->execute([$id]);

if ($stmt->rowCount() === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Complaint not found.']);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Complaint resolved successfully.',
]);
