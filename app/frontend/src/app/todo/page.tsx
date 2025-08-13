import {
  Container,
  Row,
  Col,
} from 'react-bootstrap';

// クライアントコンポーネントを直接インポート
import TodoListContainer from './TodoListKanban';

export default function TodoPage() {
  return (
    <Container fluid="xxl" className="my-3">
      {/*
      <Row className="justify-content-md-center">
        <Col md={12}>
        */}
          {/* 静的なコンテンツはSSRされる */}
          {/* TodoListContainerはクライアント側でデータを取得するため、Suspenseは不要です */}
          <TodoListContainer />
         { /*
        </Col>
      </Row>
      */}
    </Container>
  );
}