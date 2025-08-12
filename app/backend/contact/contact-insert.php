<?php

//ajax通信かどうかを判断し、そうでない場合（直接URLを入力された場合）はプログラム終了。
if(!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || !strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
    exit();
} 

//クラスの呼び出し
include_once("../class/Database.php");
include_once("../class/MailService.php");
include("../class/HeaderManager.php");

//Header関数の呼び出し
$headerManager = new HeaderManager();
$headerManager->setHeaders();

// POSTリクエストの場合のみ処理
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
   
    // リクエストボディからJSONデータを取得
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true); // trueで連想配列にデコード

    //セキュリティ対策で特殊文字をエスケープする
    foreach($data as $key => $value){
        $data[$key] = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
    }
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

            
            $mail_service = new MailService(getenv("FROM_EMAIL"));

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
