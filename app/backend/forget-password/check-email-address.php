<?php

//ajax通信かどうかを判断し、そうでない場合（直接URLを入力された場合）はプログラム終了。
if(!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || !strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
    exit();
} 

//クラスの呼び出し
include_once("../class/Database.php");
include("../class/HeaderManager.php");

//Header関数の呼び出し
$headerManager = new HeaderManager();
$headerManager->setHeaders();


// POSTリクエストかどうかを確認
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

// JSONデータを取得
$input = file_get_contents('php://input');
$data = json_decode($input, true);

//セキュリティ対策で特殊文字をエスケープする
foreach($data as $key => $value){
    $data[$key] = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

// メールアドレスがリクエストに含まれているかを確認
if (!isset($data['email'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email is required.']);
    exit;
}

$email = $data['email'];

// ここからデータベース接続とチェックのロジックを実装
// 実際のアプリケーションに合わせて適宜変更してください

// 例: データベース接続設定


try {
    // データベースに接続
    $db = new Database();
    $count = count($db->select("users",["where" => ["email" => $email]]));

    if ($count > 0) {
        // 
        http_response_code(200);
        echo json_encode(['success' => true]);
    } else {
        http_response_code(200); 
        echo json_encode(['success' => false, 'message' => '入力されたメールアドレスは、現在使用されておりません。']);
    };
    
} catch (PDOException $e) {
    // データベース接続エラー
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'データベースエラー: ' . $e->getMessage()]);
}

?>