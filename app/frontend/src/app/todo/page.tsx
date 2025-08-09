// todo/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Button,
  ListGroup,
  Spinner,
} from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

// Todoアイテムの型を定義
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    localStorage.setItem('redirectPath', pathname);
    if (isLoading) {
      return;
    }

    //ログインしているかチェック
    //ログインされていない場合はトップページに遷移
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    }
  }, [isLoggedIn, isLoading, router, pathname]);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos, isLoggedIn]);

  const handleAddTodo = () => {
    if (input.trim() === '') return;
    const newTodo: Todo = {
      id: Date.now(),
      text: input,
      completed: false,
    };
    setTodos([...todos, newTodo]);
    setInput('');
  };

  const handleToggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Card>
            <Card.Body>
              {isLoading ? (
                <div className="text-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : isLoggedIn ? (
                <>
                  <h1 className="text-center mb-4">Todoリスト</h1>
                  <InputGroup className="mb-3">
                    <Form.Control
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="新しいタスクを入力"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddTodo();
                      }}
                    />
                    <Button variant="primary" onClick={handleAddTodo}>
                      追加
                    </Button>
                  </InputGroup>
                  <ListGroup>
                    {todos.map((todo) => (
                      <ListGroup.Item
                        key={todo.id}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <Form.Check
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleToggleTodo(todo.id)}
                          label={
                            <span
                              style={{
                                textDecoration: todo.completed ? 'line-through' : 'none',
                                color: todo.completed ? '#888' : '#333',
                                marginLeft: '10px',
                              }}
                            >
                              {todo.text}
                            </span>
                          }
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteTodo(todo.id)}
                        >
                          削除
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </>
              ) : (
                <h2 className="text-center">このページは会員登録された方のみ閲覧可能です。</h2>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}