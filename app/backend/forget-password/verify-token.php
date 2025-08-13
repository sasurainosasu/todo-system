<?php

//クラスの呼び出し
include_once(getenv("PHP_LIB_PASS")."/class/Database.php");
include_once(getenv("PHP_LIB_PASS")."/class/HeaderManager.php");

//Header関数の呼び出し
$headerManager = new HeaderManager();
$headerManager->setHeaders("GET");

// GETデータの取得
$token = htmlspecialchars($_GET['token'], ENT_QUOTES, 'UTF-8') ?? '';

if (empty($token)) {
    echo json_encode(["success" => false, "error" => "トークンが提供されていません。"]);
    exit();
}

try {
    $db = new Database();

    // トークンの検証
    $select_array = [
        "where" => [
            "reset_token" => $token,
            "reset_token_expires_at" => [">",date("Y-m-d H:i:s")]
        ]
    ];

    $results = $db->selectCompare("users",$select_array);

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