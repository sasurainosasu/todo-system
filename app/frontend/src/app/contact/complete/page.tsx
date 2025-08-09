'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Container, Alert, Button } from 'react-bootstrap';
import ContactSteps from '../../../components/ContactSteps'; // 追加 (パスに注意)

const ContactCompletePage: React.FC = () => {
  const router = useRouter();

  const handleBackToTop = () => {
    router.replace('/contact'); // トップページへ戻る
  };

  return (
    <Container>
      <h2 className="mt-5 text-center">お問い合わせ (完了)</h2>
      <ContactSteps /> {/* ここにステップインジケーターを配置 */}
      <Alert variant="success">お問い合わせ完了</Alert>
        <p>お問い合わせいただきありがとうございます。</p>
        <p>内容を確認後、担当者よりご連絡させていただきます。</p>
        <hr />
        <div className="d-flex justify-content-center">
          <Button onClick={handleBackToTop} variant="success">
            トップページへ
          </Button>
        </div>
    </Container>
  );
};

export default ContactCompletePage;