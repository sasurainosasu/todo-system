'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button } from 'react-bootstrap';
import ContactSteps from '../../../components/ContactSteps';

const ContactCompleteComponent: React.FC = () => {
  const router = useRouter();

  const handleBackToTop = () => {
    router.replace('/contact');
  };

  return (
    <>
      <ContactSteps />
      <Alert variant="success">お問い合わせ完了</Alert>
      <p>お問い合わせいただきありがとうございます。</p>
      <p>内容を確認後、担当者よりご連絡させていただきます。</p>
      <hr />
      <div className="d-flex justify-content-center mt-4">
        <Button onClick={handleBackToTop} variant="success">
          トップページへ
        </Button>
      </div>
    </>
  );
};

export default ContactCompleteComponent;