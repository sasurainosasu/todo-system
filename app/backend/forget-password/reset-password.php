<?php

//ajax通信かどうかを判断し、そうでない場合（直接URLを入力された場合）はプログラム終了。
if(!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || !strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
    exit();
} 

//クラスの呼び出し
include_once(getenv("PHP_LIB_PASS")."/class/Database.php");
include_once(getenv("PHP_LIB_PASS")."/class/HeaderManager.php");

//Header関数の呼び出し
$headerManager = new HeaderManager();
$headerManager->setHeaders();



// POSTデータの取得
$data = json_decode(file_get_contents('php://input'), true);

foreach($data as $key => $value){
    $data[$key] = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

$token = $data['token'] ?? '';
$new_password = $data['password'] ?? '';

if (empty($token) || empty($new_password)) {
    echo json_encode(["error" => "トークンまたは新しいパスワードが提供されていません。"]);
    exit();
}

try {
    $db = new Database();
    // トークンを検証し、ユーザー情報を取得
    $results = $db->query("SELECT id FROM users WHERE reset_token = :token AND reset_token_expires_at > '".date("Y-m-d H:i:s")."'",["token" => $token]);
    $user = $results[0];
    if ($user) {
        $user_id = $user['id'];
        
        // パスワードをハッシュ化
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

        // パスワードを更新し、トークンをクリア

        $update_set_array = [
            "password" => $hashed_password,
            "reset_token" => NULL,
            "reset_token_expires_at" => NULL
        ];
        $update_result = $db->update("users",$update_set_array,["id" => $user_id]);

        if ($update_result) {
            echo json_encode(["message" => "パスワードが正常に更新されました。"]);
        } else {
            echo json_encode(["error" => "パスワードの更新に失敗しました。"]);
        }

    } else {
        echo json_encode(["error" => "無効なトークンまたは有効期限切れです。"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => "エラーが発生しました: " . $e->getMessage()]);
}