'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext'; // AuthContextのパスを適宜修正してください

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
}

// メールアドレスチェックAPIのURL
const EMAIL_CHECK_API_URL = '/backend/register/check-email-address.php';

const Register: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth(); // AuthContextからisLoggedInとisLoadingを取得

  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // 送信中状態を追加

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = sessionStorage.getItem('registrationData');
      if (savedData) {
        setFormValues(JSON.parse(savedData));
      }
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true); // 送信中状態を開始
    
    // バリデーションを実行
    const validationErrors = validate(formValues);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setIsSubmitting(false); // エラーがあれば送信中状態を終了
      return;
    }

    try {
      // メールアドレスの存在チェックAPIを呼び出し
      const response = await fetch(EMAIL_CHECK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formValues.email }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        // APIからエラーが返された場合
        setErrors({ ...errors, email: data.message || 'メールアドレスの確認中にエラーが発生しました' });
        setIsSubmitting(false);
        return;
      }
      
      // メールアドレスが利用可能であれば、次のステップへ
      // データをセッションストレージに保存
      sessionStorage.setItem('registrationData', JSON.stringify(formValues));
      // 確認画面へ遷移
      router.push('/register/confirm');

    } catch (error) {
      console.error('API Error:', error);
      setErrors({ ...errors, email: 'サーバーとの通信中にエラーが発生しました' });
      setIsSubmitting(false);
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

  // ログイン状態の確認中はローディング表示
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
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
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

                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? '確認中...' : '確認画面へ進む'}
                  </Button>
                  <h5 className="text-center mt-2">既に登録済みの方は
                    <Link href="/login">こちら</Link>
                  </h5>
                </div>
              </Form>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Register;