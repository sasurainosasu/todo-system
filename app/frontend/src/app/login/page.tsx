'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';

interface FormValues {
  username?: string;
  password?: string;
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formValues, setFormValues] = useState<FormValues>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [redirectPath, setRedirectPath] = useState<string>('/');
  const [isCheckingLogin, setIsCheckingLogin] = useState<boolean>(true);

  // ページ読み込み時にログイン状態をチェック
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/backend/check_login.php', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        const data = await response.json();
        
        if (data.isLoggedIn) {
          // 既にログインしている場合はトップページにリダイレクト
          router.push('/');
        } else {
          // ログインしていない場合はフォームを表示
          //setIsCheckingLogin(false);
          const redirect = searchParams.get('redirect');
          if (redirect) {
            setRedirectPath(redirect);
          }
        }
      } catch (err) {
        console.error('ログイン状態チェック中にエラーが発生しました:', err);
        setIsCheckingLogin(false);
      }
    };

    checkLoginStatus();
  }, [router, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost/api/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message);
        router.push(redirectPath);
      } else {
        setError(data.message || 'ログインに失敗しました。');
      }
    } catch (err) {
      setError('サーバーとの通信中にエラーが発生しました。');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingLogin) {
    return (
      <Container className="my-5">
        <Row className="justify-content-md-center">
          <Col md={6} className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">読み込み中...</span>
            </Spinner>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <div className="border rounded-3 p-4 shadow-sm bg-white">
            <h2 className="text-center mb-4">ログイン</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicUsername">
                <Form.Label>ユーザー名</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="ユーザー名を入力"
                  value={formValues.username || ''}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>パスワード</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="パスワードを入力"
                  value={formValues.password || ''}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span className="ms-2">ログイン中...</span>
                  </>
                ) : (
                  'ログイン'
                )}
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;