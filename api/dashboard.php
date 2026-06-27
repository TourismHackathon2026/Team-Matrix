<?php
// ============================================================
// Dashboard API (Admin Only)
// GET /api/dashboard.php
// Returns stats and complaint list for the admin dashboard.
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
session_start();

// ============================================================
// ACCESS CONTROL: Only admins can view dashboard data
// ============================================================
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Access denied. Admin only.']);
    exit;
}

$pdo = getDB();

// Stats
$total   = $pdo->query("SELECT COUNT(*) FROM complaints")->fetchColumn();
$pending = $pdo->query("SELECT COUNT(*) FROM complaints WHERE status = 'pending'")->fetchColumn();
$resolved = $pdo->query("SELECT COUNT(*) FROM complaints WHERE status = 'resolved'")->fetchColumn();

// Average resolution days (for resolved complaints)
$avgDays = 0;
$stmt = $pdo->query("
    SELECT AVG(DATEDIFF(COALESCE(updated_at, created_at), created_at)) 
    FROM complaints WHERE status = 'resolved'
");
$avgResult = $stmt->fetchColumn();
$avgDays = $avgResult ? round((float)$avgResult, 1) : 0;

// All complaints
$stmt = $pdo->query('SELECT id, name, place, title, description, status, created_at FROM complaints ORDER BY id DESC');
$complaints = $stmt->fetchAll();

echo json_encode([
    'success' => true,
    'stats'   => [
        'total'         => (int)$total,
        'pending'       => (int)$pending,
        'resolved'      => (int)$resolved,
        'avg_days'      => $avgDays,
    ],
    'complaints' => $complaints,
]);
