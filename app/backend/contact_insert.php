<?php
// ヘッダー設定: CORS対策とJSONレスポンス
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // 本番環境では特定のドメインに制限してください
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

// OPTIONSリクエストの場合 (CORSプリフライトリクエスト)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['message' => '許可されていないメソッドです。POSTのみが許可されています。']);
    exit();
}



// POSTリクエストの場合のみ処理
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
   
    // リクエストボディからJSONデータを取得
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true); // trueで連想配列にデコード

    // データが存在し、必要なキーが含まれているか検証
    if (json_last_error() !== JSON_ERROR_NONE || !isset($data['name'], $data['email'], $data['message'])) {
        http_response_code(400); // Bad Request
        echo json_encode(['message' => '無効なデータ形式、または必須項目が不足しています。']);
        exit();
    }

    $name = $data['name'];
    $email = $data['email'];
    $message = $data['message'];

    // ここでデータベースにデータを書き込む処理を実装します
    // 例: MySQLへの接続とINSERT
    $servername = getenv("DB_HOST");
    $username = getenv('DB_USER');
    $password = getenv('DB_PASSWORD');
    $dbname = getenv('DB_NAME');

    try {
        $conn = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8mb4", $username, $password);
        // PDOエラーモードを例外に設定
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $stmt = $conn->prepare("BEGIN;");
        $stmt->execute();

        // SQLインジェクション対策のためプリペアドステートメントを使用
        $stmt = $conn->prepare("INSERT INTO contact_message (name, email, message, created_at) VALUES (:name, :email, :message, NOW());");
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':message', $message);
        $stmt->execute();

        mb_language("Japanese");
		mb_internal_encoding("UTF-8");

        $to = $email;
        $subject = "お問い合わせがありました。";
        $content = $name."　様\r\n\r\nお問い合わせを受け付けました。\r\n\r\n";
        $content.= "▽お問い合わせ内容";
        $content.= $message;
        $headers = "From: sunf.peridot.9208@gmail.com";

        //メールの送信に成功した場合
		if(mb_send_mail($to, $subject, $content,$headers)){
            $stmt = $conn->prepare("COMMIT;");
            $stmt->execute();
            // 成功レスポンス
            http_response_code(200); // OK
            echo json_encode(['message' => 'データが正常に保存されました。']);
        }else{
            $stmt = $conn->prepare("ROLLBACK;");
            $stmt->execute();
            http_response_code(500); // Internal Server Error
            echo json_encode(['message' => 'メールの送信に失敗しました。', 'error' => $e->getMessage()]);
		}
            
      
        
     } catch (PDOException $e) {
        // データベースエラー時の処理
        error_log("Database error: " . $e->getMessage()); // エラーログに記録
        http_response_code(500); // Internal Server Error
        echo json_encode(['message' => 'データベースへの書き込みに失敗しました。', 'error' => $e->getMessage()]);
    } finally {
        $conn = null; // 接続を閉じる
    }

} else {
    // POST以外のリクエストは許可しない
    http_response_code(405); // Method Not Allowed
    echo json_encode(['message' => '許可されていないメソッドです。POSTのみが許可されています。']);
}
?>
