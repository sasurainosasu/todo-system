'use client';

import { useState, useEffect, createElement } from 'react';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Pagination from 'react-bootstrap/Pagination';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// PHPから取得するデータの型を定義
interface Item {
  name: string;
  email: string;
  message: string;
  created_at: string;
}

// 汎用的な日付表示コンポーネント
// タグ名（'div' または 'span'）を受け取り、動的に要素を生成します
const ClientSideDateDisplay = ({ dateString, as }: { dateString: string; as: 'div' | 'span' }) => {
  const [formattedDate, setFormattedDate] = useState('');
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();


  useEffect(() => {
    setFormattedDate(new Date(dateString).toLocaleString());
  }, [dateString]);

  useEffect(() => {
    //ログインしているかチェック
    //ログインされていない場合はトップページに遷移
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
  }, [isLoggedIn,router]);

  // 受け取ったタグ名で要素を動的に作成して返します
  return createElement(as, null, formattedDate);
};

// メインのページコンポーネント
// メインのページコンポーネント
export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const { isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 認証情報がロード中なら何もしない
    if (isAuthLoading) {
      return;
    }
    // ログインしていなければログインページにリダイレクト
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    const apiUrl = '/backend/contact-list.php';
    async function fetchItems() {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCurrentPage(1);
        setItems(data);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchItems();
  }, [isLoggedIn, isAuthLoading, router]); // 依存配列にisLoggedIn, isAuthLoading, routerを追加

  // 認証情報のロード中、またはデータ取得中
  if (isAuthLoading || isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  // 認証エラー
  if (!isLoggedIn) {
    return (
      <Container className="my-5 text-center">
        <h2>このページは会員登録された方のみ閲覧可能です。</h2>
      </Container>
    );
  }

  // データ取得エラー
  if (error) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Alert variant="danger">
          エラーが発生しました: {error}
        </Alert>
      </Container>
    );
  }

  // データ取得成功後の処理
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
        {number}
      </Pagination.Item>,
    );
  }

  const handleShowModal = (item: Item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const contact_list = () => {
    return(
      <>
       <Row className="mb-4">
        <Col>
          <h1 className="text-center">
            お問い合わせ一覧
          </h1>
          <hr />
        </Col>
      </Row>
      <Row>
        <Col>
          {items.length === 0 ? (
            <Alert variant="info" className="text-center">
              データがありません。
            </Alert>
          ) : (
            <>
              {/* PC・タブレット向けのFlexboxレイアウト (md以上) */}
              <div className="d-none d-md-block border rounded">
                {/* ヘッダー部分 */}
                <div className="row g-0 py-2 text-white bg-primary rounded-top border-bottom">
                  <div className="col-1 text-center">#</div>
                  <div className="col-2">名前</div>
                  <div className="col-3">メールアドレス</div>
                  <div className="col-3">内容</div>
                  <div className="col-2">作成日時</div>
                  <div className="col-1"></div>
                </div>

                {/* データ行 */}
                {currentItems.map((item, index) => (
                  <div key={indexOfFirstItem + index} className="row g-0 py-2 border-bottom align-items-center">
                    <div className="col-1 text-center">{indexOfFirstItem + index + 1}</div>
                    <div className="col-2">{item.name}</div>
                    <div className="col-3 text-truncate">{item.email}</div>
                    <div className="col-3 text-truncate">{item.message.length > 50 ? `${item.message.substring(0, 50)}...` : item.message}</div>
                    <div className="col-2"><ClientSideDateDisplay dateString={item.created_at} as="div" /></div>
                    <div className="col-1 d-flex justify-content-center">
                      <Button variant="primary" size="sm" onClick={() => handleShowModal(item)}>
                        詳細
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* スマホ向けのフレックスボックス表示 (md未満) */}
              <div className="d-md-none">
                {currentItems.map((item, index) => (
                  <Card key={indexOfFirstItem + index} className="mb-3">
                    <Card.Body>
                      <Card.Title>#{indexOfFirstItem + index + 1} - {item.name}</Card.Title>
                      <Card.Text>
                        <strong>メールアドレス:</strong> {item.email}
                      </Card.Text>
                      <Card.Text>
                        <strong>作成日時:</strong> <ClientSideDateDisplay dateString={item.created_at} as="span" />
                      </Card.Text>
                      <Card.Text>
                        <strong>内容:</strong> {item.message.length > 50 ? `${item.message.substring(0, 50)}...` : item.message}
                      </Card.Text>
                      <Button variant="primary" onClick={() => handleShowModal(item)}>
                        詳細を見る
                      </Button>
                    </Card.Body>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                    {paginationItems}
                    <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>

      {selectedItem && (
        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>お問い合わせ詳細</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-2"><strong>名前:</strong> {selectedItem.name}</div>
            <div className="mb-2"><strong>メールアドレス:</strong> {selectedItem.email}</div>
            <div className="mb-2"><strong>作成日時:</strong> <ClientSideDateDisplay dateString={selectedItem.created_at} as="span" /></div>
            <hr />
            <div className="mb-2"><strong>内容:</strong></div>
            <pre className="p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {selectedItem.message}
            </pre>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              閉じる
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      </>

    );
  }

  return (
    <Container className="my-5">
      {contact_list()}
    </Container>
  );
}