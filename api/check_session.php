<?php
// ============================================================
// Check Auth Session API
// GET /api/check_session.php
// Returns the current logged-in user info (if any).
// Used by the frontend to restore session on page load.
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'logged_in' => true,
        'user'      => [
            'id'    => $_SESSION['user_id'],
            'name'  => $_SESSION['user_name'],
            'email' => $_SESSION['user_email'],
            'role'  => $_SESSION['user_role'],
        ],
    ]);
} else {
    echo json_encode([
        'logged_in' => false,
        'user'      => null,
    ]);
}
