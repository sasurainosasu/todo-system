'use client';

import { useState, useEffect, ChangeEvent} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Form, Button, Alert, Container, Row, Col, Spinner } from 'react-bootstrap';

// フォームの入力値の型を定義
interface FormValues {
  password: string;
  confirmPassword: string;
}

// バリデーションエラーの型を定義
interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

const ResetPasswordClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formValues, setFormValues] = useState<FormValues>({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const [message, setMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (token) {
      const verifyToken = async () => {
        try {
          const response = await fetch(`/backend/forget-password/verify-token.php?token=${token}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'トークンが無効です。');
          }
          const data = await response.json();
          if (data.success) {
            setIsTokenValid(true);
          } else {
            setIsTokenValid(false);
            setError(data.error || 'トークンが無効です。');
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            setError(err.message || 'トークン検証中にエラーが発生しました。');
          } else {
            setError('予期せぬエラーが発生しました。');
          }
          setIsTokenValid(false);
        }
      };
      verifyToken();
    } else {
      setIsTokenValid(false);
      setError('トークンがURLに含まれていません。');
    }
  }, [token]);

  // 修正箇所: handleChange 関数
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
    
    // 入力があったフィールドのエラーをクリア
    if (errors[name as keyof FormErrors]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: undefined,
      }));
    }
  };

  const validate = (values: FormValues): FormErrors => {
    const newErrors: FormErrors = {};
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setMessage('');
    setError('');

    const validationErrors = validate(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }
    setErrors({});

    try {
      const response = await fetch('/backend/forget-password/reset-password.php', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'xmlhttprequest',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: formValues.password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'エラーが発生しました。');
      }

      const data = await response.json();
      setMessage(data.message);
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'ネットワークエラーが発生しました。');
      } else {
        setError('予期せぬエラーが発生しました。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isTokenValid === null) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">読み込み中...</span>
        </Spinner>
        <p className="mt-3">トークンを検証中です...</p>
      </Container>
    );
  }

  if (isTokenValid === false) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
        <p>無効なURLです。パスワードリセットを再度行ってください。</p>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <div className="border rounded-3 p-4 shadow-sm bg-white">
            <h2 className="text-center">新しいパスワードを設定</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {isSuccess ? (
              <>
                <Alert variant="success">{message}</Alert>
                <div className="w-100 text-center">
                  <Button variant="primary" onClick={() => router.push('/login')}>
                    ログイン画面に戻る
                  </Button>
                </div>
              </>
            ) : (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formNewPassword">
                  <Form.Label>新しいパスワード</Form.Label>
                  <Form.Control
                    type="password"
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
                  <Form.Label>新しいパスワード（確認）</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formValues.confirmPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.confirmPassword}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
                <Button variant="primary" className="w-100" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">更新中...</span>
                    </>
                  ) : (
                    'パスワードを更新'
                  )}
                </Button>
              </Form>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPasswordClient;