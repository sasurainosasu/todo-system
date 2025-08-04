<?php
// セッションを開始
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000'); // Next.jsのオリジンを明示
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true'); // クッキー（セッションID）の送受信を許可

// OPTIONSリクエストへの対応
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

// ユーザー名とパスワードの検証
if ($username === 'admin' && $password === 'password123') {
    // 認証成功
    $_SESSION['user_id'] = $username; // セッションにユーザーIDを保存
    
    echo json_encode([
        'success' => true,
        'message' => 'ログインに成功しました。',
        'user' => [
            'id' => $username,
            'name' => '管理者'
        ]
    ]);
} else {
    // 認証失敗
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'ユーザー名またはパスワードが間違っています。'
    ]);
}
?>