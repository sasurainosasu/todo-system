'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import ContactSteps from '../../components/ContactSteps';

interface FormData {
  name: string;
  email: string;
  message: string;
}

const ContactInputPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    // セッションストレージからのデータ復元
    if (typeof window !== 'undefined') {
      const savedData = sessionStorage.getItem('contactFormData');
      if (savedData) {
        setFormData(JSON.parse(savedData));
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name as keyof FormData]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name as keyof FormData];
        return newErrors;
      });
    }
  };

  const validate = (): Partial<FormData> => {
    const newErrors: Partial<FormData> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'お名前は必須です。';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須です。';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください。';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'お問い合わせ内容は必須です。';
    }
    return newErrors;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && csrfToken) {
      setLoading(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('contactFormData', JSON.stringify(formData));
        sessionStorage.setItem('csrfToken', csrfToken);
      }
      router.push('/contact/confirm');
    } else {
        if (!csrfToken) {
            alert('CSRFトークンの取得に失敗しました。ページを再読み込みしてください。');
        }
    }
  };

  return (
    <>
      <ContactSteps />
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formName">
          <Form.Label>お名前:</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            isInvalid={!!errors?.name}
          />
          <Form.Control.Feedback type="invalid">
            {errors?.name}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>メールアドレス:</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            isInvalid={!!errors?.email}
          />
          <Form.Control.Feedback type="invalid">
            {errors?.email}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-5" controlId="formMessage">
          <Form.Label>お問い合わせ内容:</Form.Label>
          <Form.Control
            as="textarea"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            isInvalid={!!errors?.message}
          />
          <Form.Control.Feedback type="invalid">
            {errors?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <div className="w-100 text-center">
          <Button variant="primary" type="submit" disabled={loading || !csrfToken}>
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
              '確認画面へ'
            )}
          </Button>
        </div>
      </Form>
    </>
  );
};

export default ContactInputPage;