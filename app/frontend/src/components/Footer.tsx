import { Container, Row, Col } from 'react-bootstrap';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    // fixed-bottomクラスを追加
    <footer className="bg-primary text-white pt-3">
      <Container>
        <Row className="text-center">
          <Col>
            <p>&copy; {currentYear} Sunfperi. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}