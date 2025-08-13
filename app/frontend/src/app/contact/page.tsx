// page.tsx
import { Container } from 'react-bootstrap';
import ContactInputPage from './ContactInputPage';

const ContactPage = () => {
  return (
    <Container className="mb-5">
      <h2 className="mt-5 text-center">お問い合わせ</h2>
      <ContactInputPage />
    </Container>
  );
};

export default ContactPage;