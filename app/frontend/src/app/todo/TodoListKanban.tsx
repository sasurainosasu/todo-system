'use client';

import { useState, useEffect } from 'react';
import {
  Form,
  InputGroup,
  Button,
  ListGroup,
  Alert,
  Spinner,
  Row,
  Col,
  Modal, // Modalコンポーネントを追加
} from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
} from '@hello-pangea/dnd';

import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ja } from 'date-fns/locale/ja';

registerLocale('ja', ja);

// Todoアイテムの型を定義
interface Todo {
  id: string;
  text: string;
  status: '予定' | '進行中' | '完了';
  date: string; // YYYY-MM-DD形式
}

const getList = (status: '予定' | '進行中' | '完了', todos: Todo[], date: Date) => {
  const formattedDate = date.toISOString().split('T')[0];
  return todos.filter((todo) => todo.status === status && todo.date === formattedDate);
};

export default function TodoListContainer() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [input, setInput] = useState('');
  const [networkError, setNetworkError] = useState<string>('');
  const [saveDatabaseLoading, setSaveDatabaseLoading] = useState<boolean>(false);
  const [saveDatabaseMessage, setSaveDatabaseMessage] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // モーダルの表示・非表示を管理するstate
  const [showCopyModal, setShowCopyModal] = useState<boolean>(false);
  // コピー元のタスクを保持するstate
  const [copyFromDate, setCopyFromDate] = useState<Date>(new Date());
  // コピー先のタスクを保持するstate
  const [copyToDate, setCopyToDate] = useState<Date>(new Date());
  // コピー元とコピー先が同じ日付の場合のエラーメッセージ
  const [copyError, setCopyError] = useState<string>('');

  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
          const transformedData = data.map((item: any) => ({
            ...item,
            date: item.date || new Date().toISOString().split('T')[0],
          }));
          setTodos(transformedData);
        } else {
          throw new Error('サーバーからのデータ形式が不正です。');
        }
      } catch {
        setError('タスクの取得に失敗しました。');
      } finally {
        setLoading(false);
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
      status: '予定',
      date: selectedDate.toISOString().split('T')[0],
    };
    setTodos([...todos, newTodo]);
    setInput('');
  };

  const handleCopyTodos = () => {
    // コピー元とコピー先の日付が同じかチェック
    if (copyFromDate.toISOString().split('T')[0] === copyToDate.toISOString().split('T')[0]) {
      setCopyError('コピー元とコピー先の日付は同じにできません。');
      return;
    }
    setCopyError(''); // エラーをリセット

    const todosToCopy = todos.filter(todo => todo.date === copyFromDate.toISOString().split('T')[0]);
    if (todosToCopy.length === 0) {
      alert('コピーするタスクがありません。');
      return;
    }

    const newTodos = todosToCopy.map(todo => ({
      ...todo,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // IDを完全に新しいものに更新
      date: copyToDate.toISOString().split('T')[0], // 新しい日付をセット
    }));

    setTodos([...todos, ...newTodos]);
    setShowCopyModal(false); // モーダルを閉じる
    setSelectedDate(copyToDate); // コピー先の日付に表示を切り替える
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

    const sourceList = getList(source.droppableId as '予定' | '進行中' | '完了', todos, selectedDate);
    const destinationList = getList(destination.droppableId as '予定' | '進行中' | '完了', todos, selectedDate);

    if (source.droppableId === destination.droppableId) {
      const newTodos = Array.from(sourceList);
      const [movedItem] = newTodos.splice(source.index, 1);
      newTodos.splice(destination.index, 0, movedItem);

      const updatedTodos = todos.map(t => {
        if (t.date === selectedDate.toISOString().split('T')[0] && t.status === source.droppableId) {
          return newTodos.find(item => item.id === t.id) || t;
        }
        return t;
      });
      setTodos(updatedTodos);
    } else {
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

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">タスク取得中...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!isLoggedIn) {
    return (
      <h2 className="text-center my-4">このページは会員登録された方のみ閲覧可能です。</h2>
    );
  }

  const todosInPlans = getList('予定', todos, selectedDate);
  const todosInProgress = getList('進行中', todos, selectedDate);
  const todosInCompleted = getList('完了', todos, selectedDate);

  const getKanbanTitleStyle = () => {
    return {
      borderLeft: '5px solid blue',
      borderRight: '5px solid blue',
      borderTop: '1px solid blue',
      borderBottom: '1px solid blue',
      maxWidth: '600px',
      padding: '5px',
    };
  };

  return (
    <div className="border border-radius px-3 py-5">
      <div style={getKanbanTitleStyle()} className="mx-auto text-center">
        <h1>
          カレンダー付きカンバンボード
        </h1>
      </div>

      {saveDatabaseMessage && <Alert variant="success" className="mx-auto mt-4" style={{ maxWidth: '600px', }}>{saveDatabaseMessage}</Alert>}
      {networkError && <Alert variant="danger" className="mx-auto mt-4" style={{ maxWidth: '600px', }}>{networkError}</Alert>}

      <Row className="mt-4 mb-2">
        <Col md={2} className="my-2">
          <h3 className="mx-auto text-center">表示日</h3>
        </Col>
        <Col md={2} className="my-2">
          <div className="mx-auto text-center">
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date) => setSelectedDate(date)}
              dateFormat="yyyy/MM/dd"
              locale="ja"
              className="form-control"
            />
          </div>
        </Col>
        <Col md={6} className="my-2">
          <InputGroup className="mx-auto">
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
        </Col>
        <Col md={2} className="my-2">
          {/* Todoリストコピー機能のボタン */}
          <div className="text-center">
            <Button variant="info" onClick={() => setShowCopyModal(true)}>
              Todoリストのコピー
            </Button>
          </div>                
        </Col>
      </Row>
      <hr />
      <DragDropContext onDragEnd={onDragEnd} className="mt-2">
        <div style={{ display: 'flex', justifyContent: 'space-between' }} className="mt-4">
          {renderKanbanColumn('予定', '予定', todosInPlans)}
          {renderKanbanColumn('進行中', '進行中', todosInProgress)}
          {renderKanbanColumn('完了', '完了', todosInCompleted)}
        </div>
      </DragDropContext>

      <div className="text-center mt-4">
        <Button variant="primary" onClick={handleSaveDatabase} disabled={saveDatabaseLoading}>
          データベースに保存する
        </Button>
      </div>

      {/* Todoリストコピー用モーダル */}
      <Modal show={showCopyModal} onHide={() => setShowCopyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Todoリストのコピー</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <h5 className="mb-2">コピー元の日付：
            <DatePicker
              selected={copyFromDate}
              onChange={(date: Date) => setCopyFromDate(date)}
              dateFormat="yyyy/MM/dd"
              locale="ja"
              className="form-control"
            />
            </h5>
          </div>
          <div className="mb-3">
            <h5 className="mb-2">コピー先の日付：
            <DatePicker
              selected={copyToDate}
              onChange={(date: Date) => setCopyToDate(date)}
              dateFormat="yyyy/MM/dd"
              locale="ja"
              className="form-control"
            />
            </h5>
          </div>
          {copyError && <Alert variant="danger">{copyError}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCopyModal(false)}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={handleCopyTodos}>
            コピー
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}