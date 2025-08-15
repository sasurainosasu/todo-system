import {
  Container,
} from 'react-bootstrap';

// クライアントコンポーネントを直接インポート
import TodoListContainer from './TodoListKanban';

export default function TodoPage() {
  return (
    <Container fluid="xxl" className="my-3">
          {/* 静的なコンテンツはSSRされる */}
          {/* TodoListContainerはクライアント側でデータを取得するため、Suspenseは不要です */}
          <TodoListContainer />
    </Container>
  );
}