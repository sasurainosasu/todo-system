'use client';

import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

const EmailSentClient = () => {
  const router = useRouter();

  return (
    <Container className="my-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>確認メールを送信しました</Card.Title>
              <hr />
              <Card.Text>
                ご登録いただいたメールアドレスに、本登録用のリンクを送信しました。
                メールボックスをご確認の上、記載されたURLから登録を完了させてください。
              </Card.Text>
              <Card.Text className="text-muted small">
                メールが届かない場合は、迷惑メールフォルダをご確認ください。
              </Card.Text>
              <Button 
                variant="primary" 
                onClick={() => router.push('/')}
                className="mt-3"
              >
                トップページへ戻る
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EmailSentClient;