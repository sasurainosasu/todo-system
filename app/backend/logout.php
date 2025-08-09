<?php

// CORSヘッダーを設定
// Next.jsアプリケーションのオリジンに合わせてURLを変更してください
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// HTTPメソッドがPOSTか確認
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

// セッションを開始
// セッションが既に開始されている場合は何もしません
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// セッション変数をすべてクリア
$_SESSION = array();

// セッションクッキーを削除
// セッションIDを含むクッキーの名前を取得
$session_cookie_name = session_name();
if (isset($_COOKIE[$session_cookie_name])) {
    // クッキーの有効期限を過去に設定して削除
    setcookie($session_cookie_name, '', time() - 3600, '/');
}

// セッションを完全に破棄
session_destroy();

// ログアウト成功のレスポンスを返す
http_response_code(200);
echo json_encode(['success' => true, 'message' => 'Logged out successfully.']);

?>