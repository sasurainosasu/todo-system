'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';

// フォームの入力値の型を定義
interface FormValues {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

// バリデーションエラーの型を定義
interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

// API呼び出しの型を定義
interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string; // APIからのエラーメッセージも型に含める
}

// メールアドレスチェックAPIのURL
const EMAIL_CHECK_API_URL = '/backend/register/check-email-address.php';

const RegisterClient = () => {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();

  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<string>('');
  const [isEmailChecking, setIsEmailChecking] = useState<boolean>(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null); // CSRFトークンを管理するstateを追加

  useEffect(() => {
    // セッションストレージからのデータ復元
    if (typeof window !== 'undefined') {
      const savedData = sessionStorage.getItem('registrationData');
      if (savedData) {
        setFormValues(JSON.parse(savedData));
      }
    }
    
    // CSRFトークンの取得
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/backend/csrf-token.php'); // PHPのAPIエンドポイント
        if (!response.ok) {
          throw new Error('Failed to fetch CSRF token');
        }
        const data = await response.json();
        setCsrfToken(data.token);
      } catch (error) {
        console.error('CSRFトークンの取得に失敗しました', error);
      }
    };
    fetchCsrfToken();
    
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
    if (errors[name as keyof FormErrors]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: undefined,
      }));
    }
  };

  const handleEmailBlur = async () => {
    if (!formValues.email || !/\S+@\S+\.\S+/.test(formValues.email)) {
      return;
    }
    
    setIsEmailChecking(true);
    setErrors(prevErrors => ({ ...prevErrors, email: undefined }));

    try {
      const response = await fetch(EMAIL_CHECK_API_URL, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'xmlhttprequest',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formValues.email }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        setErrors(prev => ({ ...prev, email: data.error || 'このメールアドレスは既に登録されています' }));
      }
    } catch {
      setErrors(prev => ({ ...prev, email: 'メールアドレスの確認中にエラーが発生しました。' }));
    } finally {
      setIsEmailChecking(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNetworkError('');
    
    const validationErrors = validate(formValues);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setIsSubmitting(false);
      return;
    }
    
    // CSRFトークンが存在しない場合はエラーを表示
    if (!csrfToken) {
        setNetworkError('CSRFトークンの取得に失敗しました。ページを再読み込みしてください。');
        setIsSubmitting(false);
        return;
    }
    
    try {
      // データをセッションストレージに保存
      sessionStorage.setItem('registrationData', JSON.stringify(formValues));
      // CSRFトークンをセッションストレージに保存
      sessionStorage.setItem('csrfToken', csrfToken);
      
      // 確認画面へ遷移
      router.push('/register/confirm');
      
    } catch {
      setNetworkError('サーバーとの通信中にエラーが発生しました');
    } finally {
      //setIsSubmitting(false);
    }
  };

  const validate = (values: FormValues): FormErrors => {
    const newErrors: FormErrors = {};
    if (!values.name) {
      newErrors.name = '名前は必須項目です';
    }
    if (!values.email) {
      newErrors.email = 'メールアドレスは必須項目です';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'メールアドレスの形式が正しくありません';
    }
    if (!values.password) {
      newErrors.password = 'パスワードは必須項目です';
    } else if (values.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください';
    }
    if (!values.confirmPassword) {
      newErrors.confirmPassword = '確認用パスワードは必須項目です';
    } else if (values.password !== values.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }
    return newErrors;
  };

  if (isLoading) {
    return (
      <Container className="my-5 text-center">
        <p>ログイン状態を確認中...</p>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <div className="border rounded-3 p-4 shadow-sm bg-white">
            {isLoggedIn ? (
              <div className="text-center">
                <h2 className="mb-4">ユーザー登録</h2>
                <Alert variant="danger">既にユーザー登録済みです。</Alert>
                <Button variant="primary" onClick={() => router.push('/')}>
                  ホームに戻る
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-center mb-4">ユーザー登録</h2>
                {!!networkError && <Alert variant="danger">{networkError}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>名前</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="名前を入力してください"
                      name="name"
                      value={formValues.name}
                      onChange={handleChange}
                      isInvalid={!!errors.name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>メールアドレス</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="メールアドレスを入力してください"
                      name="email"
                      value={formValues.email}
                      onChange={handleChange}
                      onBlur={handleEmailBlur}
                      isInvalid={!!errors.email}
                      disabled={isEmailChecking}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                    {isEmailChecking && <div className="text-muted mt-2">メールアドレスを確認中...</div>}
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>パスワード</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="パスワードを入力してください"
                      name="password"
                      value={formValues.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formConfirmPassword">
                    <Form.Label>パスワード（確認用）</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="パスワードをもう一度入力してください"
                      name="confirmPassword"
                      value={formValues.confirmPassword}
                      onChange={handleChange}
                      isInvalid={!!errors.confirmPassword}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.confirmPassword}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="text-center">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={isSubmitting || isEmailChecking || !!errors.email || !csrfToken}
                    >
                      {isSubmitting || isEmailChecking ? '確認中...' : '確認画面へ進む'}
                    </Button>
                  </div>
                  <div>
                    <h5 className="text-center mt-2">既に登録済みの方は
                      <Link href="/login">こちら</Link>
                    </h5>
                  </div>
                </Form>
              </>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterClient;