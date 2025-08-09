<?php

include_once("../class/Database.php");

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// GETデータの取得
$token = $_GET['token'] ?? '';

if (empty($token)) {
    echo json_encode(["success" => false, "error" => "トークンが提供されていません。"]);
    exit();
}

try {
    $db = new Database();

    // トークンの検証

    $results = $db->query("SELECT id FROM users WHERE reset_token = :token AND reset_token_expires_at > '".date("Y-m-d H:i:s")."'",["token" => $token]);

    if (count($results) > 0) {
        // トークンが有効な場合
        echo json_encode(["success" => true]);
    } else {
        // トークンが無効または有効期限切れの場合
        echo json_encode(["success" => false, "error" => "無効なトークンまたは有効期限切れです。"]);
    }
} catch (PDOException $e) {
    // クエリ実行に失敗した場合
    echo json_encode(["success" => false, "error" => "エラーが発生しました: " . $e->getMessage()]);
}