'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import ContactSteps from '../../../components/ContactSteps';

// FormData型定義はそのまま使用
interface FormData {
  name: string;
  email: string;
  message: string;
}

const ContactConfirmPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null); // CSRFトークンを管理するためのstateを追加

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = sessionStorage.getItem('contactFormData');
      const savedToken = sessionStorage.getItem('csrfToken'); // セッションストレージからCSRFトークンを取得
      
      if (savedData && savedToken) {
        setFormData(JSON.parse(savedData));
        setCsrfToken(savedToken); // stateにトークンをセット
      } else {
        // データまたはトークンがない場合は入力画面に戻す
        router.replace('/contact');
      }
    }
  }, [router]);

  const handleBack = () => {
    setLoading(true);
    setTimeout(() => {
      router.push('/contact');
    }, 300);
  };

  const handleSubmit = async () => {
    if (!formData || !csrfToken) {
      setError('送信に必要なデータまたはCSRFトークンが見つかりません。');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // CSRFトークンを送信データに含める
      const dataWithToken = {
        ...formData,
        _csrf_token: csrfToken,
      };

      const response = await fetch('/backend/contact/contact-insert.php', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'xmlhttprequest',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataWithToken), // トークンを含んだデータを送信
      });

      if (response.ok) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('contactFormData');
          sessionStorage.removeItem('csrfToken'); // 送信成功後にトークンを削除
        }
        router.replace('/contact/complete');
      } else {
        const errorData = await response.json();
        setError(`送信に失敗しました: ${errorData.message || '不明なエラー'}`);
      }
    } catch {
      setError('ネットワークエラーが発生しました。時間を置いて再度お試しください。');
    } finally {
      //setLoading(false);
    }
  };

  if (!formData || !csrfToken) {
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
    <>
      <ContactSteps />
      {error && <Alert variant="danger">{error}</Alert>}
      <Card className="mb-5">
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
      <div className="d-flex justify-content-center">
        <Button className="mx-2" variant="secondary" onClick={handleBack} disabled={loading}>
          戻る
        </Button>
        <Button className="mx-2" variant="primary" onClick={handleSubmit} disabled={loading || !csrfToken}>
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
              <span className="ms-2">送信中...</span>
            </>
          ) : (
            '送信'
          )}
        </Button>
      </div>
    </>
  );
};

export default ContactConfirmPage;