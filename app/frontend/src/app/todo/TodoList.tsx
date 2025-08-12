'use client';

import { useState, useEffect } from 'react';
import {
  Form,
  InputGroup,
  Button,
  ListGroup,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie'; // js-cookieをインポート

// @hello-pangea/dnd ライブラリから必要な型をインポート
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
} from '@hello-pangea/dnd';

// Todoアイテムの型を定義
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function TodoListContainer() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [input, setInput] = useState('');
  const [networkError, setNetworkError] = useState<string>("");
  const [saveDatabaseLoading, setSaveDatabaseLoading] = useState<boolean>(false);
  const [saveDatabaseMessage, setSaveDatabaseMessage] = useState<string>("");

  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // useEffectで初回データを取得
  useEffect(() => {
    async function getTodos() {
      try {
        const response = await fetch('/backend/todo/select-database.php', {
          method: 'GET',
          headers: {
            'X-Requested-With': 'xmlhttprequest',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: unknown = await response.json();

        if (Array.isArray(data)) {
          setTodos(data);
        } else {
          throw new Error('サーバーからのデータ形式が不正です。');
        }
      } catch {
        setError('タスクの取得に失敗しました。');
      } finally {
        setLoading(false); // 読み込み完了
      }
    }

    if (isLoggedIn) {
      getTodos();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    Cookies.set('redirectPath', pathname, { expires: 7 });
    if (isLoading) return;
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, router, pathname]);

  const handleAddTodo = () => {
    if (input.trim() === '') return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: input,
      completed: false,
    };
    setTodos([...todos, newTodo]);
    setInput('');
  };

  const handleSaveDatabase = async () => {
    setSaveDatabaseLoading(true);
    setSaveDatabaseMessage("");
    setNetworkError("");
    try {
      const response = await fetch('/backend/todo/save-database.php', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'xmlhttprequest',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todos),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSaveDatabaseMessage("データベースに保存しました。");
      } else {
        setNetworkError(data.message || 'データベースへの保存に失敗しました。');
      }
    } catch {
      setNetworkError('サーバーとの通信中にエラーが発生しました。');
    } finally {
      setSaveDatabaseLoading(false);
    }
  };

  const handleToggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const newTodos = Array.from(todos);
    const [reorderedItem] = newTodos.splice(result.source.index, 1);
    newTodos.splice(result.destination.index, 0, reorderedItem);
    setTodos(newTodos);
  };

  // ローディング中のスピナー
  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">タスク取得中...</span>
        </Spinner>
      </div>
    );
  }

  // データ取得エラー
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  // ログインしていない場合
  if (!isLoggedIn) {
    return (
      <h2 className="text-center">このページは会員登録された方のみ閲覧可能です。</h2>
    );
  }

  return (
    <div className="border border-radius p-3">
      <h1 className="text-center mb-4">Todoリスト</h1>
      {saveDatabaseMessage && <Alert variant="success">{saveDatabaseMessage}</Alert>}
      {networkError && <Alert variant="danger">{networkError}</Alert>}

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

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="todos">
          {(provided: DroppableProvided) => (
            <ListGroup
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {todos.map((todo, index) => (
                <Draggable
                  key={todo.id}
                  draggableId={String(todo.id)}
                  index={index}
                >
                  {(provided: DraggableProvided) => (
                    <ListGroup.Item
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
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
                      <div className="d-flex">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteTodo(todo.id)}
                        >
                          削除
                        </Button>
                      </div>
                    </ListGroup.Item>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ListGroup>
          )}
        </Droppable>
      </DragDropContext>

      <div className="text-center mt-3">
        <Button variant="primary" onClick={handleSaveDatabase} disabled={saveDatabaseLoading}>
          データベースに保存する
        </Button>
      </div>
    </div>
  );
}