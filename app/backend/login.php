<?php

include("class/Database.php");

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

$email = $input['email'] ?? '';
$password = $input['password'] ?? '';



// データベース接続
try {
    $db = new Database();

} catch (PDOException $e) {
    // 接続エラーの場合はJSONでエラーメッセージを返す
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit();
}

//結果を格納する変数の初期化
$results = array();

try {

    // 全てのデータを取得
    $results = $db->select("users",["where"=>['email' => $email]]);

} catch (PDOException $e) {
    // クエリ実行エラーの場合はJSONでエラーメッセージを返す
    http_response_code(500);
    echo json_encode(["error" => "Query failed: " . $e->getMessage()]);
        exit();
}


// ユーザー名とパスワードの検証
if(password_verify($password, $results[0]['password'])){
    // 認証成功
    $_SESSION['user_id'] = $results[0]['id']; // セッションにユーザーIDを保存
    $_SESSION['email'] = $results[0]['email'];
    
    echo json_encode([
        'success' => true,
        'message' => 'ログインに成功しました。',
        'user' => [
            'id' =>  $_SESSION['user_id'],
            'name' => $results[0]['name'],
            'email' => $results[0]['email']
        ]
    ]);
} else {
    // 認証失敗
   // http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'ユーザー名またはパスワードが間違っています。'
    ]);
}

?>