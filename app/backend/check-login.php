<?php

//ajax通信かどうかを判断し、そうでない場合（直接URLを入力された場合）はプログラム終了。
if(!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || !strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
    exit();
} 

// セッションを開始
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Next.jsのオリジンを明示
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// OPTIONSリクエストへの対応
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// セッションにユーザーIDが存在するかチェック
if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'isLoggedIn' => true,
        'userId' => $_SESSION['user_id']
    ]);
} else {
    echo json_encode([
        'isLoggedIn' => false
    ]);
}
?>