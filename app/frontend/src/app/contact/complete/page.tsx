import { Container } from 'react-bootstrap';
import ContactCompleteComponent from './ContactCompleteComponent';

const ContactCompletePage = () => {
  return (
    <Container>
      <h2 className="mt-5 text-center">お問い合わせ</h2>
      <ContactCompleteComponent />
    </Container>
  );
};

export default ContactCompletePage;