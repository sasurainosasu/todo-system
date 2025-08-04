<?php
// php-api/api/get_items.php

// CORS（Cross-Origin Resource Sharing）ヘッダーを設定
// 開発環境ではすべてのオリジンからのアクセスを許可
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Docker Composeで設定した環境変数を取得
$host = getenv('DB_HOST');
$db = getenv('DB_NAME');
$user = getenv('DB_USER');
$password = getenv('DB_PASSWORD');

// データベース接続
try {
    $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    // 接続エラーの場合はJSONでエラーメッセージを返す
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit();
}

// サンプルのSQLクエリ：以下のSQLをMySQLで実行してデータを準備してください。
/*
CREATE TABLE contact_message (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO items (name, email, message) VALUES
('山田 太郎', 'yamada@example.com', 'これはテスト投稿です。'),
('鈴木 花子', 'suzuki@example.com', '商品を出品しました。'),
('佐藤 健', 'sato@example.com', '質問があります。');
*/

// SQL文の準備
$stmt = $pdo->prepare("SELECT name, email, message, created_at FROM contact_message ORDER BY created_at DESC");

try {
    // クエリ実行
    $stmt->execute();
    // 全てのデータを取得
    $results = $stmt->fetchAll();

    // 取得したデータをJSON形式で出力
    echo json_encode($results);

} catch (PDOException $e) {
    // クエリ実行エラーの場合はJSONでエラーメッセージを返す
    http_response_code(500);
    echo json_encode(["error" => "Query failed: " . $e->getMessage()]);
}

?>
