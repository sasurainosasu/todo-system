'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import type { FormData } from '../../../types/contact';
import ContactSteps from '../../../components/ContactSteps';
import LoadingOverlay from '../../../components/LoadingOverlay'; // 追加

const ContactConfirmPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = sessionStorage.getItem('contactFormData');
      if (savedData) {
        setFormData(JSON.parse(savedData));
      } else {
        router.replace('/contact');
      }
    }
  }, [router]);

  const handleBack = () => {
    setIsLoadingOverlay(true);
    setTimeout(() => {
      router.push('/contact');
    }, 300);
  };

  const handleSubmit = async () => {
    if (!formData) return;
    setIsLoadingOverlay(true);
    setError(null);

    try {
      const response = await fetch('/backend/contact-insert.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('contactFormData');
        }
        router.replace('/contact/complete');
      } else {
        const errorData = await response.json();
        setError(`送信に失敗しました: ${errorData.message || '不明なエラー'}`);
      }
    } catch (err) {
      console.error('フォーム送信エラー:', err);
      setError('ネットワークエラーが発生しました。時間を置いて再度お試しください。');
    } finally {
      //setIsLoadingOverlay(false); // 通信が完了したら必ずローディングを非表示にする
    }
  };

  if (!formData) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>データを読み込み中...</p>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mt-5 text-center">お問い合わせ (確認)</h2>
      <ContactSteps />
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>入力内容をご確認ください</Card.Title>
          <hr />
          <Card.Text>
            <strong>お名前:</strong> <br/>{formData.name}
          </Card.Text>
          <Card.Text>
            <strong>メールアドレス:</strong><br/>{formData.email}
          </Card.Text>
          <Card.Text className="mb-2">
            <strong>お問い合わせ内容:</strong>
          </Card.Text>
          <pre className="p-2 border bg-light" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {formData.message}
          </pre>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="d-flex justify-content-center">
        <Button className="mx-2" variant="primary" onClick={handleSubmit} disabled={isLoadingOverlay}>
          送信
        </Button>
        <Button className="mx-2" variant="secondary" onClick={handleBack} disabled={isLoadingOverlay}>
          戻る
        </Button>
      </div>
      
      {/* 外部コンポーネントとして通信中オーバーレイを呼び出す */}
      <LoadingOverlay show={isLoadingOverlay} />

    </Container>
  );
};

export default ContactConfirmPage;