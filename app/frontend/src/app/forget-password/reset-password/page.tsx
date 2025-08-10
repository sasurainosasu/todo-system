import React, { Suspense } from 'react';
import ResetPasswordClient from './ResetPasswordClient';
import { Container } from 'react-bootstrap';

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={
      <Container className="my-5 text-center">
        <p>読み込み中...</p>
      </Container>
    }>
      <ResetPasswordClient />
    </Suspense>
  );
};

export default ResetPasswordPage;