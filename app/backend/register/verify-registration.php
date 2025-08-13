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




if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => '無効なリクエストメソッドです。']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$token = htmlspecialchars($input['token'], ENT_QUOTES, 'UTF-8') ?? '';

if (empty($token)) {
    http_response_code(400);
    echo json_encode(['message' => '認証トークンが不足しています。']);
    exit;
}

try {

    $db = new Database();

    // トークンを検証し、仮登録情報を取得
    $select_array = [
        "where" => [
            "token" => $token,
            "expires_at" => [">",date("Y-m-d H:i:s")]
        ]
    ];

    $results =  $db->selectCompare("temporary_users",$select_array);
    
    if (count($results) == 0) {
        http_response_code(400);
        echo json_encode(['message' => '無効な認証トークン、または有効期限が切れています。']);
        exit;
    }
    $temp_user = $results[0];

    // 既に本登録済みのメールアドレスか最終確認（二重登録防止）
    if (count($db->select("users",["where" => ["email" => $temp_user['email']]]))) {
        // 仮登録情報を削除して、既に登録済みであることを通知
        $db->delete("temporary_users",["id" => $temp_user['id']]);
        http_response_code(409); // Conflict
        echo json_encode(['message' => 'このメールアドレスは既に登録されています。ログインしてください。']);
        exit;
    }

   $db->begin(); 
    // users テーブルに本登録
    $insert_array=[
        "name" => $temp_user['name'],
        "email" => $temp_user['email'],
        "password" => $temp_user['password']
    ];

    $db->insert("users",$insert_array);


    // temporary_users テーブルから仮登録情報を削除
    $db->delete("temporary_users",["id" => $temp_user['id']]);
    $db->commit();
    http_response_code(200);
    echo json_encode(['message' => 'ユーザー登録が正常に完了しました！']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'データベースエラー: ' . $e->getMessage()]);
        // ログには詳細を記録
    error_log("Query failed: " . $e->getMessage());
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'サーバーエラー: ' . $e->getMessage()]);
        // ログには詳細を記録
    error_log("Error: " . $e->getMessage());
}
?>