'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';

// フォームの入力値の型を定義
interface FormValues {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

const ConfirmClient: React.FC = () => {
  const router = useRouter();
  const [registrationData, setRegistrationData] = useState<FormValues | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null); // CSRFトークンを管理するstateを追加
  const [isSending, setIsSending] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem('registrationData');
      const storedToken = sessionStorage.getItem('csrfToken'); // セッションストレージからCSRFトークンを取得

      if (storedData && storedToken) {
        setRegistrationData(JSON.parse(storedData));
        setCsrfToken(storedToken);
      } else {
        // データまたはトークンがない場合は、不正なアクセスとみなし、/register にリダイレクト
        router.replace('/register');
      }
    }

    setIsDataLoading(false);
  }, [router]);

  const handleSend = async () => {
    if (!registrationData || !csrfToken) {
      setApiError('送信に必要なデータまたはCSRFトークンが見つかりません。');
      return;
    }

    setIsSending(true);
    setApiError(null);

    try {
      // CSRFトークンを送信データに含める
      const dataWithToken = {
        ...registrationData,
        _csrf_token: csrfToken,
      };

      const response = await fetch('/backend/register/send-register-email.php', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'xmlhttprequest',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataWithToken), // トークンを含んだデータを送信
      });

      const data = await response.json();

      if (response.ok) {
        // 成功したらセッションデータを削除
        sessionStorage.removeItem('registrationData');
        sessionStorage.removeItem('csrfToken'); // CSRFトークンも削除
        router.push('/register/send-email');
      } else {
        setApiError(data.message || 'メールの送信に失敗しました。');
      }
    } catch{
      setApiError('サーバーとの通信中にエラーが発生しました。');
    } finally {
      //setIsSending(false);
    }
  };

  const handleBack = () => {
    // 戻るボタンが押されたときも、トークンはセッションに残しておく
    router.back();
  };

  if (isDataLoading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!registrationData || !csrfToken) {
    // データまたはトークンがない場合は既にリダイレクトされているため、nullを返す
    return null;
  }

  return (
    <Container className="my-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2 className="text-center mb-4">入力内容の確認</h2>
          <Card>
            <Card.Body>
              <Card.Title>以下の内容でよろしいですか？</Card.Title>
              <hr />
              <div className="mb-3">
                <strong>名前</strong><br/>{registrationData.name}
              </div>
              <div className="mb-3">
                <strong>メールアドレス</strong><br/>{registrationData.email}
              </div>
              <div className="mb-3">
                <strong>パスワード</strong><br/>セキュリティの関係で表示しておりません。
              </div>
              {apiError && (
                <div className="alert alert-danger mt-3" role="alert">
                  {apiError}
                </div>
              )}

              <div className="d-flex justify-content-center">
                <Button className="mx-2" variant="secondary" onClick={handleBack} disabled={isSending}>
                  戻る
                </Button>
                <Button className="mx-2" variant="primary" onClick={handleSend} disabled={isSending}>
                  {isSending ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      送信中...
                    </>
                  ) : (
                    '送信'
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ConfirmClient;