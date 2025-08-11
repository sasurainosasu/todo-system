'use client';

import { Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

export default function ActionButtons({ cta = false }) {
  const router = useRouter();

  const handleRegisterClick = () => {
    router.push('/register');
  };

  const handleTodoClick = () => {
    router.push('/todo');
  };

  if (cta) {
    return (
      <div className="mt-4">
        <Button variant="primary" size="lg" onClick={handleRegisterClick}>
          新規登録はこちら
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <Button variant="primary" size="lg" onClick={handleTodoClick}>
        無料で始める
      </Button>
    </div>
  );
}