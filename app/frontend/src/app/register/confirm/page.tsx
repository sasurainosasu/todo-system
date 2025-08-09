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

const Confirm: React.FC = () => {
  const router = useRouter();
  const [registrationData, setRegistrationData] = useState<FormValues | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true); // データの読み込み状態を追加

  useEffect(() => {
    // sessionStorageからデータを取得
    const storedData = sessionStorage.getItem('registrationData');
    
    if (storedData) {
      setRegistrationData(JSON.parse(storedData));
    } else {
      // データがない場合は、不正なアクセスとみなし、/register にリダイレクト
      // router.replaceを使用することで、ブラウザの「戻る」ボタンでこのページに戻るのを防ぐ
      router.replace('/register');
    }
    
    setIsDataLoading(false); // データの読み込み完了
  }, [router]); // routerが変更された場合のみ実行

  const handleSend = async () => {
    if (!registrationData) return;

    setIsSending(true);
    setApiError(null);

    try {
      const response = await fetch('/backend/register/send-register-email.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData), 
      });

      const data = await response.json();

      if (response.ok) {
        // 成功したらセッションデータを削除
        sessionStorage.removeItem('registrationData');
        router.push('/register/send-email');
      } else {
        setApiError(data.message || 'メールの送信に失敗しました。');
      }
    } catch (error) {
      setApiError('サーバーとの通信中にエラーが発生しました。');
      console.error('API Error:', error);
    } finally {
      setIsSending(false);
    }
  };

  // データの読み込み中はローディング表示
  if (isDataLoading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  // registrationDataがない場合は既にリダイレクトされているため、何も表示しない
  if (!registrationData) {
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

              <div className="d-grid gap-2 mt-4">
                <Button variant="primary" size="lg" onClick={handleSend} disabled={isSending}>
                  {isSending ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      送信中...
                    </>
                  ) : (
                    '送信'
                  )}
                </Button>
                <Button variant="secondary" size="lg" onClick={() => router.back()}>
                  戻る
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Confirm;