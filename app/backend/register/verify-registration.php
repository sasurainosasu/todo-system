<?php

include_once("../class/Database.php");

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // 本番環境では特定のオリジンに制限する
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => '無効なリクエストメソッドです。']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$token = $input['token'] ?? '';

if (empty($token)) {
    http_response_code(400);
    echo json_encode(['message' => '認証トークンが不足しています。']);
    exit;
}

try {

    $db = new Database();

    // トークンを検証し、仮登録情報を取得
    $results = $db->query("SELECT * FROM temporary_users WHERE token = :token AND expires_at > '".  date("Y-m-d H:i:s")."'",["token" => $token]);

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