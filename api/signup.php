<?php
// ============================================================
// Signup API
// POST /api/signup.php
// Body: { name, email, password, role, admin_code? }
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

$name     = trim($data['name'] ?? '');
$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$role     = $data['role'] ?? 'user';
$adminCode = $data['admin_code'] ?? '';

// Validation
if (!$name || !$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Name, email, and password are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email format.']);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 6 characters.']);
    exit;
}

// Admin code protection
if ($role === 'admin') {
    $validCode = 'ADMIN2024';
    if ($adminCode !== $validCode) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid admin secret code.']);
        exit;
    }
}

$pdo = getDB();

// Check if email already exists
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'An account with this email already exists.']);
    exit;
}

// Hash password and insert
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
$stmt = $pdo->prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
$stmt->execute([$name, $email, $hashedPassword, $role]);

// Start session and log user in
session_start();
$_SESSION['user_id']    = (int)$pdo->lastInsertId();
$_SESSION['user_name']  = $name;
$_SESSION['user_email'] = $email;
$_SESSION['user_role']  = $role;

http_response_code(201);
echo json_encode([
    'success' => true,
    'message' => 'Account created successfully.',
    'user'    => [
        'id'    => (int)$pdo->lastInsertId(),
        'name'  => $name,
        'email' => $email,
        'role'  => $role,
    ]
]);
