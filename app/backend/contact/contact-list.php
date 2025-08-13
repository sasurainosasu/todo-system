<?php


session_start();

//ajax通信かどうかを判断し、そうでない場合（直接URLを入力された場合）はプログラム終了。
if(!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || !strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
   http_response_code(500);
    exit();
} 


//クラスの呼び出し
include_once(getenv("PHP_LIB_PASS")."/class/Database.php");
include_once(getenv("PHP_LIB_PASS")."/class/HeaderManager.php");

//Header関数の呼び出し
$headerManager = new HeaderManager();
$headerManager->setHeaders();

try {
    //データベースクラスの宣言
    $db = new Database();
    $results = array();

    if(isset($_SESSION['email'])){
        // 全てのデータを取得
        $results = $db->select("contact_message",["where"=>["email" => $_SESSION['email']]]);
    }

     // ログには詳細を記録
    // 取得したデータをJSON形式で出力
    http_response_code(200);
    echo json_encode($results);

} catch (PDOException $e) {
    // クエリ実行エラーの場合はJSONでエラーメッセージを返す
    http_response_code(500);
    echo json_encode(["error" => "Query failed."]);
   
}

?>