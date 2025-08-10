// app/login/page.tsx
import React, { Suspense } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import LoginPageClient from './LoginPageClient';

const LoginPage: React.FC = () => {
  return (
    <Container className="my-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Suspense fallback={
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">読み込み中...</span>
              </Spinner>
            </div>
          }>
            <LoginPageClient />
          </Suspense>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;