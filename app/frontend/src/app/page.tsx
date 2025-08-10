'use client';

import { Container, Row, Col, Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();
  
  // 登録ページに遷移する関数
  const handleRegisterClick = () => {
    router.push('/register');
  };

  return (
    <Container fluid className="px-0 mb-5">
      {/* ヒーローセクション */}
      <Row className="text-center align-items-center">
        <Col>
          <div
            style={{
              background: 'url("/top-hero.jpg") no-repeat center center/cover',
              height: '400px', // 背景画像が表示されるように高さを指定
              color: '#000', // テキストの色を白に変更（任意）
              padding: '70px 0', // テキストのパディングを指定（任意）
            }}
          >
            <h1 className="display-4 fw-bold"
              style={{
                textShadow: '1px 1px 0 #fff, -1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff'
              }}
            >
              日々のタスクを、もっとシンプルに。
            </h1>
            <h4 className="mt-3 fw-bold"
              style={{
                textShadow: '1px 1px 0 #fff, -1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff'
              }}>
              あなたのTo Doを整理し、生産性を向上させるためのシンプルなツールです。
            </h4>
            <div className="mt-4">
              <Button variant="primary" size="lg" onClick={handleRegisterClick}>
                無料で始める
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <hr />

      {/* 機能紹介セクション */}
      <Row className="text-center my-5 px-3">
        <Col>
          <h2 className="mb-4">主な機能</h2>
          <Row>
            <Col md={4} className="mb-4">
              <div className="h-100 p-4 border rounded shadow-sm">
                <div style={{ position: 'relative', height: '150px' }}>
                  <Image src="/task.jpg" fill alt="タスク" style={{ objectFit: 'cover', borderRadius: '0.25rem' }} />
                </div>
                <h5 className="fw-bold mt-3">簡単なタスク管理</h5>
                <p className="mt-2">
                  直感的なインターフェースで、誰でも簡単にタスクを追加、編集、削除できます。
                </p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="h-100 p-4 border rounded shadow-sm">
                <div style={{ position: 'relative', height: '150px' }}>
                  <Image src="/progress.jpg" fill alt="進捗" style={{ objectFit: 'cover', borderRadius: '0.25rem' }} />
                </div>
                <h5 className="fw-bold mt-3">進捗状況を追跡</h5>
                <p className="mt-2">
                  タスクの完了状況をチェックボックスで管理し、進捗状況が一目でわかります。
                </p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="h-100 p-4 border rounded shadow-sm">
                <div style={{ position: 'relative', height: '150px' }}>
                  <Image src="/access.jpg" fill alt="アクセス" style={{ objectFit: 'cover', borderRadius: '0.25rem' }} />
                </div>
                <h5 className="fw-bold mt-3">いつでもどこでもアクセス</h5>
                <p className="mt-2">
                  モバイルデバイスにも対応しており、いつでもどこでもあなたのタスクにアクセスできます。
                </p>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>

      <hr />

      {/* 行動喚起セクション */}
      <Row className="text-center my-5 px-3">
        <Col>
          <div className="p-4 bg-light rounded shadow-sm">
            <h2>さあ、始めましょう！</h2>
            <p className="lead mt-3">
              今すぐ無料でアカウントを作成して、あなたの生産性を最大化しましょう。
            </p>
            <div className="mt-4">
              <Button variant="primary" size="lg" onClick={handleRegisterClick}>
                新規登録はこちら
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}