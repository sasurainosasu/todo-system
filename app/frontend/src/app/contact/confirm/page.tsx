'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Card, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import type { FormData } from '../../../types/contact';
import ContactSteps from '../../../components/ContactSteps'; // 追加

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
      const response = await fetch('/backend/contact_insert.php', {
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
        const errorData = await response.json();
        alert(errorData.message);
        router.replace('/contact/complete');
      } else {
        const errorData = await response.json();
        setError(`送信に失敗しました: ${errorData.message || '不明なエラー'}`);
      }
    } catch (err) {
      console.error('フォーム送信エラー:', err);
      setError('ネットワークエラーが発生しました。時間を置いて再度お試しください。');
    } finally {

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
      <h2 className="bg-primary p-2 mt-20 text-white">お問い合わせ (確認)</h2>
      <ContactSteps /> {/* ここにステップインジケーターを配置 */}
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

      <Modal show={isLoadingOverlay} centered backdrop="static" keyboard={false}>
        <Modal.Body className="text-center">
          <p>通信中...</p>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ContactConfirmPage;