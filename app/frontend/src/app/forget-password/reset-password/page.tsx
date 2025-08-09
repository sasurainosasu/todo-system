'use client';

import { useState, useEffect } from 'react';
// useRouterは使用しますが、クエリパラメータの取得にはuseSearchParamsを使います
import { useRouter, useSearchParams } from 'next/navigation';
import { Form, Button, Alert, Container,Row,Col } from 'react-bootstrap';

const ResetPasswordPage = () => {
    const router = useRouter();
    // useSearchParamsフックを使用してクエリパラメータを取得
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

    // トークン検証
    useEffect(() => {
        // tokenがnullまたはundefinedでないことを確認
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
                } catch (err: any) {
                    setIsTokenValid(false);
                    setError(err.message || 'トークン検証中にエラーが発生しました。');
                }
            };
            verifyToken();
        } else {
            // tokenがURLに存在しない場合
            setIsTokenValid(false);
            setError('トークンがURLに含まれていません。');
        }
    }, [token]); // tokenを依存配列に含める

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // パスワードのバリデーション
        if (password !== confirmPassword) {
            setError('パスワードが一致しません。');
            return;
        }
        
        setIsLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch('/backend/forget-password/reset-password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'エラーが発生しました。');
            }

            const data = await response.json();
            setMessage(data.message);
            setIsSuccess(true)
        } catch (err: any) {
            setError(err.message || 'ネットワークエラーが発生しました。');
        } finally {
            setIsLoading(false);
        }
    };

    if (isTokenValid === null) {
        return (
            <Container className="my-5 text-center">
                <p>トークンを検証中です...</p>
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
             ):(
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formNewPassword">
                    <Form.Label>新しいパスワード</Form.Label>
                    <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formConfirmPassword">
                    <Form.Label>新しいパスワード（確認）</Form.Label>
                    <Form.Control
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </Form.Group>
                <Button variant="primary" className="w-100" type="submit" disabled={isLoading}>
                    {isLoading ? '更新中...' : 'パスワードを更新'}
                </Button>
            </Form>
             )}
             </div>
             </Col>
             </Row>
        </Container>
    );
};

export default ResetPasswordPage;