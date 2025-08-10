// app/register/verify/page.tsx
import React, { Suspense } from 'react';
import RegisterVerifyClient from './RegisterVerifyClient';
import { Container } from 'react-bootstrap'; // これだけにして試してみる

const RegisterVerifyPage: React.FC = () => {
  return (
    <Container className="my-5">
      <Suspense fallback={<p>読み込み中...</p>}>
        <RegisterVerifyClient />
      </Suspense>
    </Container>
  );
};

export default RegisterVerifyPage;