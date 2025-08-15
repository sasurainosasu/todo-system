<?php
session_start();

// ヘッダーを設定してJSONレスポンスを返す
header('Content-Type: application/json');

// CSRFトークンを生成
if (empty($_SESSION['csrf_token'])) {
    if (function_exists('random_bytes')) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    } else {
        $_SESSION['csrf_token'] = bin2hex(openssl_random_pseudo_bytes(32));
    }
}

// トークンをJSONで返す
echo json_encode(['token' => $_SESSION['csrf_token']]);
?>