<?php

// セッションを開始
session_start();

//ajax通信かどうかを判断し、そうでない場合（直接URLを入力された場合）はプログラム終了。
if(!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || !strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
    session_destroy();
    exit();
} 

//クラスの読み取り
include("class/Database.php");
include("class/HeaderManager.php");

//Header関数の呼び出し
$headerManager = new HeaderManager();
$headerManager->setHeaders();

// HTTPメソッドがPOSTか確認
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$email = htmlspecialchars($input['email'], ENT_QUOTES, 'UTF-8') ?? '';
$password = htmlspecialchars($input['password'], ENT_QUOTES, 'UTF-8')  ?? '';



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

if(count($results) == 0){
        // 認証失敗
   // http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'ユーザー名またはパスワードが間違っています。'
    ]);
}
else{


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
}
?>