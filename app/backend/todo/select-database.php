<?php

session_Start();

//ajax通信かどうかを判断し、そうでない場合（直接URLを入力された場合）はプログラム終了。
if(!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || !strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
    exit();
} 

include_once("../class/Database.php");


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
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
   
    try {
            $db = new Database();

            $results = $db->select("todos",["where" => ["user_id" => $_SESSION['user_id']]]);
            
            http_response_code(200);
             echo json_encode($results);   
     } catch (PDOException $e) {
        http_response_code(500); // Internal Server Error
        echo json_encode(['message' => 'データベースへの書き込みに失敗しました。', 'error' => $e->getMessage()]);
    } 

} else {
    // POST以外のリクエストは許可しない
    http_response_code(405); // Method Not Allowed
    echo json_encode(['message' => '許可されていないメソッドです。POSTのみが許可されています。']);
}
?>
