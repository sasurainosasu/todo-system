<?php
// php-api/api/get_items.php

session_start();

// CORS（Cross-Origin Resource Sharing）ヘッダーを設定
// 本番環境ではセキュリティのため、許可するオリジンを限定することを推奨
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: no-cache, must-revalidate");

// セッションは使用していないため削除

include_once("class/Database.php");

// データベース接続
try {
    $db = new Database();

} catch (Exception $e) {
    // 接続エラーや環境変数未設定のエラーをJSONで返す
    http_response_code(500);
    echo json_encode(["error" => "Configuration or connection error."]);
    // ログには詳細を記録
    error_log("Database connection failed: " . $e->getMessage());
    exit();
}


try {
    $results = array();

    if(isset($_SESSION["email"])){
        // 全てのデータを取得
        $results = $db->select("contact_message",["where"=>["email" => $_SESSION["email"]]]);
    }
     // ログには詳細を記録
    // 取得したデータをJSON形式で出力
    http_response_code(200);
    echo json_encode($results);

} catch (PDOException $e) {
    // クエリ実行エラーの場合はJSONでエラーメッセージを返す
    http_response_code(500);
    echo json_encode(["error" => "Query failed."]);
   
}

?>