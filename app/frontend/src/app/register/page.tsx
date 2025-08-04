'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

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

const Register: React.FC = () => {
  const router = useRouter();
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate(formValues);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // データをセッションストレージに保存
      sessionStorage.setItem('registrationData', JSON.stringify(formValues));
      // 確認画面へ遷移
      router.push('/register/confirm');
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

  return (
    <Container className="my-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
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
              <Button variant="primary" type="submit" size="lg">
                確認画面へ進む
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;