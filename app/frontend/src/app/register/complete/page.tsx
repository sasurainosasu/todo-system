'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Button } from 'react-bootstrap';

const RegistrationComplete: React.FC = () => {
  const router = useRouter();

  // コンポーネントがマウントされた際にsessionStorageの値を削除
  useEffect(() => {
    sessionStorage.removeItem('registrationData');
  }, []);

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <div className="text-center border rounded p-4 shadow-sm bg-white">
            <h2 className="mb-4">登録が完了しました！</h2>
            <div className="mb-4">
              <div className="mb-2">ご登録いただいたメールアドレス宛に、確認メールを送信しました。</div>
              <div>メールに記載されたURLをクリックして、本登録を完了してください。</div>
            </div>
            <Button variant="primary" size="lg" onClick={handleGoHome}>
              トップページへ戻る
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default RegistrationComplete;