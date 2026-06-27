<?php
// ============================================================
// Public Stats API
// GET /api/stats.php
// Returns public stats for the hero section (no auth needed).
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

$pdo = getDB();

$reviewsCount   = $pdo->query("SELECT COUNT(*) FROM reviews")->fetchColumn();
$complaintsCount = $pdo->query("SELECT COUNT(*) FROM complaints")->fetchColumn();
$resolvedCount  = $pdo->query("SELECT COUNT(*) FROM complaints WHERE status = 'resolved'")->fetchColumn();
$totalComplaints = $pdo->query("SELECT COUNT(*) FROM complaints")->fetchColumn();

$resolutionRate = $totalComplaints > 0
    ? round(($resolvedCount / $totalComplaints) * 100)
    : 0;

echo json_encode([
    'success' => true,
    'stats'   => [
        'reviews'   => number_format($reviewsCount) . '+',
        'complaints' => number_format($complaintsCount),
        'resolved'  => $resolutionRate . '%',
    ],
]);
