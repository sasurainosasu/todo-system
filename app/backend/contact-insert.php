<?php

include_once("class/Database.php");
include_once("class/MailService.php");

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


    try {
            $db = new Database();
            $db->begin();

           $insert_array = [
                "name" => $name,
                "email" => $email,
                "message" => $message,
                "created_at" => date("Y-m-d H:i:s")
           ];

            $db->insert("contact_message",$insert_array);

            $base_url = $_SERVER['REQUEST_SCHEME']."://".$_SERVER['HTTP_HOST'];
            $mail_service = new MailService(getenv("FROM_EMAIL"),$base_url);

        //メールの送信に成功した場合
		if($mail_service->sendContactEmail($name,$email,$message)){
            $db->commit();
            // 成功レスポンス
            http_response_code(200); // OK
            echo json_encode(['message' => 'データが正常に保存されました。']);
        }else{
            $db->rollback();
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
