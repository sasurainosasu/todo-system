'use client'; // クライアントコンポーネントであることを明示

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Row, Col, Card, Spinner, Button } from 'react-bootstrap';

const RegisterVerifyClient: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('認証トークンが見つかりません。');
      return;
    }

    const verifyRegistration = async () => {
      try {
        const response = await fetch('/backend/register/verify-registration.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'ユーザー登録が完了しました！');
        } else {
          setStatus('error');
          setMessage(data.message || 'ユーザー登録に失敗しました。');
        }
      } catch (error) {
        setStatus('error');
        setMessage('サーバーとの通信中にエラーが発生しました。');
        console.error('Registration verification API Error:', error);
      }
    };

    verifyRegistration();
  }, [searchParams]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p>登録情報を確認しています...</p>
          </>
        );
      case 'success':
        return (
          <>
            <Card.Title className="text-success mb-3">登録完了！</Card.Title>
            <Card.Text>{message}</Card.Text>
            <Button variant="primary" onClick={() => router.push('/login')} className="mt-3">
              ログインページへ
            </Button>
          </>
        );
      case 'error':
        return (
          <>
            <Card.Title className="text-danger mb-3">登録失敗</Card.Title>
            <Card.Text>{message}</Card.Text>
            <Button variant="secondary" onClick={() => router.push('/register')} className="mt-3">
              再登録する
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Card className="text-center">
            <Card.Body>
              {renderContent()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterVerifyClient;