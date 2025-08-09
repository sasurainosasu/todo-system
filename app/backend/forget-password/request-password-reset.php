<?php

include_once("../class/Database.php");
include_once("../class/MailService.php");

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // 本番環境では特定のオリジンに制限する
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');



try {
    $db = new Database();
} catch (PDOException $e) {
    // 接続に失敗した場合
    die(json_encode(["error" => "データベース接続に失敗しました: " . $e->getMessage()]));
}

// POSTデータの取得
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';

if (empty($email)) {
    echo json_encode(["error" => "メールアドレスを入力してください。"]);
    exit();
}

try {
    // メールアドレスの存在チェック
    $result = $db->select("users",["where" => ["email" => $email]]);
    
    // ユーザーが存在する場合
    if (count($result) > 0) {
        $token = bin2hex(random_bytes(32));
        $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour')); // 1時間有効

        // 既存のトークンを削除し、新しいトークンを保存

        $update_set_array = [
            "reset_token" => $token,
            "reset_token_expires_at" => $expires_at
        ];

        $db->begin();
        $db->update("users",$update_set_array,["email" => $email]);

        $base_url = $_SERVER['REQUEST_SCHEME']."://".$_SERVER['HTTP_HOST'];

        //メールサービスクラスの宣言
        $mail_service = new MailService(getenv("FROM_EMAIL"),$base_url);
        
        if ($mail_service->sendPasswordResetEmail($email,$token)) {
            $db->commit();
            echo json_encode(["message" => "パスワードリセット用のメールを送信しました。"]);
        } else {
            echo json_encode(["error" => "メール送信に失敗しました。"]);
        }

    } else {
        // ユーザーが存在しない場合
        echo json_encode(["error" => "指定されたメールアドレスは登録されていません。"]);
    }
} catch (PDOException $e) {
    // クエリ実行に失敗した場合
    echo json_encode(["error" => "エラーが発生しました: " . $e->getMessage()]);
}

?>