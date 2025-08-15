<?php

// CSRF対策のためセッションを開始
session_start();

// AJAX通信かどうかを判断し、そうでない場合（直接URLを入力された場合）はプログラム終了。
if(!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) !== 'xmlhttprequest') {
    exit();
} 

//クラスの呼び出し
include_once(getenv("PHP_LIB_PASS")."/class/Database.php");
include_once(getenv("PHP_LIB_PASS")."/class/MailService.php");
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

// CSRFトークンの検証
if (empty($_SESSION['csrf_token']) || empty($input['_csrf_token']) || $input['_csrf_token'] !== $_SESSION['csrf_token']) {
    http_response_code(403); // Forbidden
    echo json_encode(['message' => 'CSRFトークンが無効です。']);
    exit();
}

// セキュリティ対策で特殊文字をエスケープする
foreach($input as $key => $value){
    $input[$key] = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

$name = $input['name'] ?? '';
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if (empty($name) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['message' => '必要な情報が不足しています。']);
    exit;
}

// トークンは一度使われたら削除する
unset($_SESSION['csrf_token']);

try {
    $db = new Database();

    $db->select("users",["where" => ["email" => $email]]);

    if (count($db->select("users",["where" => ["email" => $email]]))) {
        http_response_code(409); // Conflict
        echo json_encode(['message' => 'このメールアドレスは既に登録されています。']);
        exit;
    }

    // パスワードをハッシュ化
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // 認証トークンを生成
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+24 hours')); // トークンの有効期限を24時間に設定

    // 仮登録テーブルに情報を保存
    // 既存の仮登録情報を削除
    $db->begin();
    $db->delete("temporary_users",["email" => $email]);

    $insert_array = [
        "name" => $name,
        "email" => $email,
        "password" => $hashed_password,
        "token" => $token,
        "expires_at" => $expires
    ];
    
    $db->insert("temporary_users",$insert_array);

    // 登録確認メールを送信
    $subject = "ToDo管理システム - ユーザー登録のご確認";

    //メールサービスクラスの宣言
    $smtp_use_flag = (getenv("SMTP_USE_FLAG") === "true") ? true : false;
    $mail_service = new MailService(getenv("FROM_EMAIL"),$smtp_use_flag);

    if ($mail_service->sendRegistrationEmail($email,$name,$token)) {
        //メール送信が完了したタイミングでコミットする
        $db->commit();
        http_response_code(200);
        echo json_encode(['message' => '確認メールを送信しました。メールボックスをご確認ください。']);
    } else {
        $db->rollback();
        http_response_code(500);
        echo json_encode(['message' => 'メールの送信に失敗しました。']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'データベースエラー: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'サーバーエラー: ' . $e->getMessage()]);
}
?>