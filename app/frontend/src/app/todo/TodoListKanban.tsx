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
// statusプロパティを追加
interface Todo {
  id: string;
  text: string;
  status: '予定' | '進行中' | '完了'; // ステータスを追加
}

// Todoアイテムの型を定義
interface Todo {
  id: string;
  text: string;
  status: '予定' | '進行中' | '完了';
}

const getList = (status: '予定' | '進行中' | '完了', todos: Todo[]) =>
  todos.filter((todo) => todo.status === status);

export default function TodoListContainer() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [input, setInput] = useState('');
  const [networkError, setNetworkError] = useState<string>('');
  const [saveDatabaseLoading, setSaveDatabaseLoading] = useState<boolean>(false);
  const [saveDatabaseMessage, setSaveDatabaseMessage] = useState<string>('');

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

        // ここで取得したデータに`status`を追加
        if (Array.isArray(data)) {
          /*
          // completedプロパティがあればそれを基にstatusを設定
          const transformedData = data.map((item: any) => ({
            ...item,
            status: item.completed ? '完了' : '予定',
          }));
          */
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
      status: '予定', // 新しいタスクは'予定'ステータス
    };
    setTodos([...todos, newTodo]);
    setInput('');
  };

  const handleSaveDatabase = async () => {
    setSaveDatabaseLoading(true);
    setSaveDatabaseMessage('');
    setNetworkError('');
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
        setSaveDatabaseMessage('データベースに保存しました。');
      } else {
        setNetworkError(data.message || 'データベースへの保存に失敗しました。');
      }
    } catch {
      setNetworkError('サーバーとの通信中にエラーが発生しました。');
    } finally {
      setSaveDatabaseLoading(false);
    }
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    // ドラッグ元とドラッグ先が同じ列
    if (source.droppableId === destination.droppableId) {
      const sourceList = getList(source.droppableId as '予定' | '進行中' | '完了', todos);
      const newTodos = Array.from(todos);
      const [movedItem] = sourceList.splice(source.index, 1);
      sourceList.splice(destination.index, 0, movedItem);

      const updatedTodos = newTodos.map(t => {
        if (t.status === source.droppableId) {
          const reorderedItem = sourceList.find(item => item.id === t.id);
          return reorderedItem || t;
        }
        return t;
      });
      
      setTodos(updatedTodos);
    } else {
      // ドラッグ元とドラッグ先が異なる列
      //const startStatus = source.droppableId as '予定' | '進行中' | '完了';
      const endStatus = destination.droppableId as '予定' | '進行中' | '完了';

      const updatedTodos = todos.map((todo) => {
        if (todo.id === result.draggableId) {
          return { ...todo, status: endStatus };
        }
        return todo;
      });
      setTodos(updatedTodos);
    }
  };

  const renderKanbanColumn = (status: '予定' | '進行中' | '完了', title: string, todosInStatus: Todo[]) => (
    <div className="border p-3" style={{ flex: 1, margin: '0 8px' }}>
      <h3 className="text-center">{title}</h3>
      <Droppable droppableId={status}>
        {(provided: DroppableProvided) => (
          <ListGroup
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{ minHeight: '100px', backgroundColor: '#f4f5f7', padding: '8px', borderRadius: '4px' }}
          >
            {todosInStatus.map((todo, index) => (
              <Draggable key={todo.id} draggableId={todo.id} index={index}>
                {(provided: DraggableProvided) => (
                  <ListGroup.Item
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="d-flex justify-content-between align-items-center mb-2"
                    style={{
                      ...provided.draggableProps.style,
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxShadow: '0 1px 0 rgba(9,30,66,.25)',
                    }}
                  >
                    <span>{todo.text}</span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteTodo(todo.id)}
                    >
                      削除
                    </Button>
                  </ListGroup.Item>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ListGroup>
        )}
      </Droppable>
    </div>
  );

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

  const todosInPlans = getList('予定', todos);
  const todosInProgress = getList('進行中', todos);
  const todosInCompleted = getList('完了', todos);

  const getKanbanTitleStyle = () => {
    return {
      borderLeft: '5px solid blue',
      borderRight: '5px solid blue',
      borderTop: '1px solid blue',
      borderBottom: '1px solid blue',
      maxWidth:'600px',
      padding:'5px',
    };
  };

  return (
    <div className="border border-radius px-3 py-5">
        <div style={getKanbanTitleStyle()} className="mx-auto text-center"> {/* 👈 このクラスを追加 */}
          <h1>
            カンバンボード
          </h1>
        </div>

        {saveDatabaseMessage && <Alert variant="success" className="mx-auto mt-4" style={{maxWidth:'600px',}}>{saveDatabaseMessage}</Alert>}
        {networkError && <Alert variant="danger" className="mx-auto mt-4" style={{maxWidth:'600px',}}>{networkError}</Alert>}
        <InputGroup className="my-4 mx-auto" style={{maxWidth:'600px',}}>
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
        <hr />
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }} className="mt-4">
          {renderKanbanColumn('予定', '予定', todosInPlans)}
          {renderKanbanColumn('進行中', '進行中', todosInProgress)}
          {renderKanbanColumn('完了', '完了', todosInCompleted)}
        </div>
      </DragDropContext>

      <div className="text-center mt-5">
        <Button variant="primary" onClick={handleSaveDatabase} disabled={saveDatabaseLoading}>
          データベースに保存する
        </Button>
      </div>
    </div>
  );
}