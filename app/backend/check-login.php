<?php

// セッションを開始
session_start();

//ajax通信かどうかを判断し、そうでない場合（直接URLを入力された場合）はプログラム終了。
if(!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || !strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
    exit();
} 


//クラスの呼び出し
include_once(getenv("PHP_LIB_PASS")."/class/HeaderManager.php");

//Header関数の呼び出し
$headerManager = new HeaderManager();
$headerManager->setHeaders();

// OPTIONSリクエストへの対応
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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