<?php

class HeaderManager {

    private string $origin;

    public function __construct() {
        // コンストラクタで自ドメイン（オリジン）を自動的に生成
        $this->origin = $_SERVER['REQUEST_SCHEME'] . "://" . $_SERVER['HTTP_HOST'];
    }

    public function setHeaders(string $methods = 'POST, OPTIONS'): void {
        // Content-Typeヘッダーは固定
        header('Content-Type: application/json');

        // CORS関連ヘッダー
        header("Access-Control-Allow-Origin: {$this->origin}");
        header("Access-Control-Allow-Methods: {$methods}");
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');
    }
}

?>