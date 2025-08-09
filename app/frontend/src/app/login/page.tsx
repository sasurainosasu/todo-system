// login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';

interface FormValues {
  email?: string;
  password?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formValues, setFormValues] = useState<FormValues>({});
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [isCheckingLogin, setIsCheckingLogin] = useState<boolean>(true);
  const { isLoggedIn, isLoading, setIsLoggedIn } = useAuth();
  
  useEffect(() => {
    if (!isLoading) {
      if (isLoggedIn) {
        // 既にログインしている場合、sessionStorageからリダイレクト先を読み取る
        const redirectPath = localStorage.getItem('redirectPath');
        if (redirectPath) {
          localStorage.removeItem('redirectPath'); // 読み取ったらクリア
          router.replace(redirectPath);
        } else {
          router.replace('/');
        }
      } else {
        setIsCheckingLogin(false);
      }
    }
  }, [isLoggedIn, isLoading, router, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validationErrors[e.target.name as keyof FormErrors]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: undefined,
      });
    }

    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const handRegister = () => {
    router.push('/register');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors({});

    const errors: FormErrors = {};
    if (!formValues.email) {
      errors.email = 'メールアドレスを入力してください。';
    }
    if (!formValues.password) {
      errors.password = 'パスワードを入力してください。';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/backend/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsLoggedIn(true);
        
        // ログイン成功後、sessionStorageからリダイレクト先を読み取る
        const redirectPath = sessionStorage.getItem('redirectPath');
        if (redirectPath) {
          router.replace(redirectPath);
          sessionStorage.removeItem('redirectPath'); // 読み取ったらクリア
        } else {
          router.replace('/');
        }
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

  return (
    <Container className="my-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          {isCheckingLogin ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">読み込み中...</span>
              </Spinner>
            </div>
          ) : (
            isLoggedIn ? (
              <div className="border rounded-3 p-4 shadow-sm bg-white text-center">
                <h2 className="mb-3">ログインが完了しました。</h2>
                <Button variant="primary" onClick={() => router.push('/')}>
                  ホームに戻る
                </Button>
              </div>
            ) : (
              <>
                <div className="border rounded-3 p-4 shadow-sm bg-white">
                  <h2 className="text-center mb-4">ログイン</h2>
                  {error && <Alert variant="danger">{error}</Alert>}
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                      <Form.Label>メールアドレス</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="メールアドレスを入力"
                        value={formValues.email|| ''}
                        onChange={handleChange}
                        isInvalid={!!validationErrors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.email}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                      <Form.Label>パスワード</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="パスワードを入力"
                        value={formValues.password || ''}
                        onChange={handleChange}
                        isInvalid={!!validationErrors.password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.password}
                      </Form.Control.Feedback>
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
                  <h5 className="text-center mt-2">パスワードを忘れた方は 
                    <Link href="/forget-password">こちら</Link>
                  </h5>
                </div>
                <div className="border rounded-3 p-4 mt-3 shadow-sm bg-white">
                  <h2 className="text-center mb-4">登録がまだの方は・・・</h2>
                  <Button
                    variant="warning"
                    type="button"
                    className="w-100"
                    onClick={handRegister}
                  >
                    新規登録はこちら
                  </Button>
                </div>
              </>
            )
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;