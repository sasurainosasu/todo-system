import {
  Container,
  Row,
  Col,
  Spinner,
} from 'react-bootstrap';

// クライアントコンポーネントを直接インポート
import TodoListContainer from './TodoList';

export default function TodoPage() {
  return (
    <Container className="my-5">
      <Row className="justify-content-md-center">
        <Col md={8}>
          {/* 静的なコンテンツはSSRされる */}
          {/* TodoListContainerはクライアント側でデータを取得するため、Suspenseは不要です */}
          <TodoListContainer />
        </Col>
      </Row>
    </Container>
  );
}