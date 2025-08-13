<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// 設置した場所のパスを指定する
require(getenv('PHP_LIB_PASS').'/PHPMailer/src/PHPMailer.php');
require(getenv('PHP_LIB_PASS').'/PHPMailer/src/Exception.php');
require(getenv('PHP_LIB_PASS').'/PHPMailer/src/SMTP.php');

// Composerのオートロードファイルを読み込みます
//require 'vendor/autoload.php';

class MailService {
    private PHPMailer $mailer;
    private string $fromEmail;
    private string $baseUrl;

    /**
     * コンストラクタ
     * @param string $fromEmail 送信元メールアドレス
     * @param bool $useSmtp SMTP設定を使用するかどうか
     */
    public function __construct(string $fromEmail, bool $useSmtp = false) {
        mb_language("Japanese");
        mb_internal_encoding("UTF-8");
        $this->fromEmail = $fromEmail;
        $this->baseUrl = $_SERVER['REQUEST_SCHEME'] . "://" . $_SERVER['HTTP_HOST'];

        // PHPMailerのインスタンスを初期化
        $this->mailer = new PHPMailer(true);

        // $useSmtpの値に応じて、使用するメーラーを切り替える
        if ($useSmtp) {
            $this->mailer->isSMTP();
            $this->smtpSetup();
        } else {
            // SMTPを使わない場合はisMail()を使用する
            $this->mailer->isMail();
        }
    }

    /**
     * SMTP設定を行うメソッド
     * @param bool $enable trueの場合はSMTP設定を有効にする
     */
    private function smtpSetup(): void {
        try {
            $this->mailer->Host       = getenv('SMTP_HOST');
            $this->mailer->SMTPAuth   = true;
            $this->mailer->Username   = getenv('SMTP_USER');
            $this->mailer->Password   = getenv('SMTP_PASS');
            $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $this->mailer->Port       = getenv('SMTP_PORT');
        } catch (Exception $e) {
            // 例外処理（設定エラーなど）
            error_log("PHPMailer SMTP setup failed: " . $e->getMessage());
        }
    }

    /**
     * お問い合わせ完了メールを送信するメソッド
     * @param string $name ユーザー名
     * @param string $toEmail 送信先メールアドレス
     * @param string $message お問い合わせ内容
     * @return bool メール送信に成功したかどうか
     */
    public function sendContactEmail(string $name, string $toEmail, string $message): bool {
        $subject = "【お問い合わせ完了】";
        $messageBody = "{$name}様\r\nお問い合わせありがとうございます。\n\n以下の内容でお問い合わせを受け付けいたしました。\n担当者より改めてご連絡させていただきます。\n\n--------------------\r\nお問い合わせ内容 \n{$message}\n--------------------\n";

        return $this->sendEmail($toEmail, $subject, $messageBody);
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
        $messageBody = "{$name}様\n\nToDo管理システムへのご登録ありがとうございます。\n以下のURLをクリックして本登録を完了してください。\n\n{$confirmUrl}\n\nこのリンクは24時間で無効になります。\n";

        return $this->sendEmail($toEmail, $subject, $messageBody);
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
        $messageBody = "以下のURLをクリックしてパスワードをリセットしてください:\n" . $resetUrl;

        return $this->sendEmail($toEmail, $subject, $messageBody);
    }

    /**
     * メール送信の共通処理
     * @param string $toEmail 送信先メールアドレス
     * @param string $subject 件名
     * @param string $body 本文
     * @return bool メール送信に成功したかどうか
     */
    private function sendEmail(string $toEmail, string $subject, string $body): bool {
        try {
            $this->mailer->setFrom($this->fromEmail);
            $this->mailer->addAddress($toEmail);
            $this->mailer->addBCC($this->fromEmail); // BCCに送信元アドレスを追加

            $this->mailer->CharSet = 'UTF-8';
            $this->mailer->Encoding = 'base64';
            $this->mailer->isHTML(false);
            $this->mailer->Subject = $subject; // ★ ここを修正
            $this->mailer->Body = $body;

            $this->mailer->send();
            $this->mailer->clearAddresses(); // 次回のためにアドレスをクリア
            $this->mailer->clearAttachments();
            return true;
        } catch (Exception $e) {
            error_log("Mail send failed: {$this->mailer->ErrorInfo}");
            return false;
        }
    }
}
