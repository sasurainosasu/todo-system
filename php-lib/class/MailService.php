<?php

class MailService {
    private string $fromEmail;
    private string $baseUrl;

    /**
     * コンストラクタ
     * @param string $fromEmail 送信元メールアドレス
     */
    public function __construct(string $fromEmail) {
        mb_language("Japanese");
        mb_internal_encoding("UTF-8");
        $this->fromEmail = $fromEmail;
        // コンストラクタ内でベースURLを自動的に生成
        $this->baseUrl = $_SERVER['REQUEST_SCHEME'] . "://" . $_SERVER['HTTP_HOST'];
    }

    /**
     * お問い合わせ完了メールを送信するメソッド
     * @param string $toEmail 送信先メールアドレス
     * @param string $subject お問い合わせ件名
     * @param string $messageBody お問い合わせ内容
     * @return bool メール送信に成功したかどうか
     */
    public function sendContactEmail(string $name, string $toEmail, string $message): bool {
        $subject = "【お問い合わせ完了】";
        $message = "{$name}様\r\nお問い合わせありがとうございます。\n\n以下の内容でお問い合わせを受け付けいたしました。\n担当者より改めてご連絡させていただきます。\n\n--------------------\r\nお問い合わせ内容 \n{$message}\n--------------------\n";

        $headers = [
            'From' => $this->fromEmail,
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Content-Transfer-Encoding' => '8bit',
            'Bcc' => $this->fromEmail
        ];

        return mb_send_mail($toEmail, $subject, $message, $headers);
    }

    /**
     * 登録確認メールを送信するメソッド
     * @param string $toEmail 送信先メールアドレス
     * @param string $name ユーザー名
     * @param string $token 確認用トークン
     * @return bool メール送信に成功したかどうか
     */
    public function sendRegistrationEmail(string $toEmail, string $name, string $token): bool {
        $subject = "ToDo管理システム - ユーザー登録のご確認";
        $confirmUrl = $this->baseUrl . "/register/verify?token=" . $token;
        $message = "{$name}様\n\nToDo管理システムへのご登録ありがとうございます。\n以下のURLをクリックして本登録を完了してください。\n\n{$confirmUrl}\n\nこのリンクは24時間で無効になります。\n";

        $headers = [
            'From' => $this->fromEmail,
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Content-Transfer-Encoding' => '8bit',
            'Bcc' => $this->fromEmail
        ];

        return mb_send_mail($toEmail, $subject, $message, $headers);
    }

    /**
     * パスワードリセットメールを送信するメソッド
     * @param string $toEmail 送信先メールアドレス
     * @param string $token パスワードリセット用トークン
     * @return bool メール送信に成功したかどうか
     */
    public function sendPasswordResetEmail(string $toEmail, string $token): bool {
        $subject = "パスワードリセットのご案内";
        $resetUrl = $this->baseUrl . "/forget-password/reset-password?token=" . $token;
        $message = "以下のURLをクリックしてパスワードをリセットしてください:\n" . $resetUrl;

        $headers = [
            'From' => $this->fromEmail,
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Content-Transfer-Encoding' => '8bit',
            'Bcc' => $this->fromEmail
        ];

        return mb_send_mail($toEmail, $subject, $message, $headers);
    }
}