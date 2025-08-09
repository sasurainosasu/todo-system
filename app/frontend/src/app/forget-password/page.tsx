'use client';

import { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import Link from 'next/link';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [validationErrors, setValidationErrors] = useState<{ email?: string }>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);

    const checkEmail = async () => {
        try {
            const response = await fetch('/backend/forget-password/check-email-address.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setValidationErrors({ email: data.error || 'エラーが発生しました。' });
                return false;
            }

            if (!data.success) {
                setValidationErrors({ email: data.message });
            }
            return data.success;
        } catch (err: any) {
            setError(err.message || 'ネットワークエラーが発生しました。');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidated(true);
        setMessage('');
        setError('');
        setValidationErrors({});

        if (email.trim() === '') {
            setValidationErrors({ email: 'メールアドレスを入力してください。' });
            return;
        }

        setIsLoading(true);

        if (await checkEmail()) {
            try {
                const response = await fetch('/backend/forget-password/request-password-reset.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setValidationErrors({ email: data.error || 'エラーが発生しました。' });
                    return;
                }

                setMessage(data.message);
                // 成功時はフォームをリセット
                setEmail('');

            } catch (err: any) {
                setError(err.message || 'ネットワークエラーが発生しました。');
            } finally {
                setIsLoading(false);
            }
        } else {
            // checkEmailで失敗した場合、isLoadingをfalseに
            setIsLoading(false);
        }
    };

    // messageステートがセットされているかどうかに応じて表示を切り替える
    if (message) {
        return (
            <Container className="my-5">
                <Row className="justify-content-md-center">
                    <Col md={6}>
                        <div className="border rounded-3 p-4 shadow-sm bg-white text-center">
                            <h2 className="mb-3">パスワードリセットメールを送信しました</h2>
                            <p>{message}</p>
                            <Alert variant="info" className="mt-4">
                                登録されたメールアドレス宛に、パスワード再設定用のURLを送信しました。
                                メールをご確認ください。
                            </Alert>
                            <div className="mt-3">
                                <Link href="/login" passHref legacyBehavior>
                                    <Button variant="primary">ログイン画面に戻る</Button>
                                </Link>
                            </div>
                        </div>
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
                        <h2 className="text-center mb-4">パスワードを忘れた場合</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>メールアドレス</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    placeholder="メールアドレスを入力"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (validationErrors.email) {
                                            setValidationErrors({});
                                        }
                                    }}
                                    isInvalid={!!validationErrors.email}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.email}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Button className="w-100" variant="primary" type="submit" disabled={isLoading}>
                                {isLoading ? '送信中...' : '送信'}
                            </Button>
                        </Form>
                        <div className="mt-3 text-center">
                                <Button variant="primary" onClick={() => router.push('/login')}>
                                ログイン画面に戻る
                                </Button>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ForgotPasswordPage;