// page.tsx
import { Container } from 'react-bootstrap';
import ContactConfirmPage from './ContactConfirmPage';

const ContactConfirm = () => {
  return (
    <Container className="mb-5">
      <h2 className="mt-5 text-center">お問い合わせ</h2>
      <ContactConfirmPage />
    </Container>
  );
};

export default ContactConfirm;