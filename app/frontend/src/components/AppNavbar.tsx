'use client';

import React from 'react';
import { Navbar, Nav, Container, Button, Spinner, NavDropdown } from 'react-bootstrap';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // useAuthフックをインポート

const AppNavbar: React.FC = () => {
  // useAuthフックを使ってログイン状態とローディング状態を取得
  const { isLoggedIn, isLoading, setIsLoggedIn } = useAuth();
  const router = useRouter();

  const LOGOUT_API_URL = '/backend/logout.php';

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(LOGOUT_API_URL, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'xmlhttprequest', //APIのURLを直接ブラウザで入力された場合の対処方法
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        setIsLoggedIn(false); // コンテキストの状態を更新
        router.push('/');
      } else {
        throw new Error('ログアウトに失敗しました');
      }
    } catch (error) {
      console.error('ログアウト中にエラーが発生しました:', error);
    }
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="fw-bold">
      <Container fluid>
        <Navbar.Brand as={Link} href="/" className="fs-2">
          ToDo管理システム
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="d-flex ms-auto ">
            {/* 未ログイン時も表示されるメニュー */}
            <Nav.Link as={Link} href="/todo">
              ToDoリスト
            </Nav.Link>
            <Nav.Link as={Link} href="/contact">
              お問い合わせ
            </Nav.Link>

            {/* ローディング状態の表示 */}
            {isLoading ? (
              <Nav.Item className="d-flex align-items-center me-2">
                <Spinner animation="border" size="sm" variant="light" />
              </Nav.Item>
            ) : isLoggedIn ? (
              // ログイン時のメニュー
              <>
                <NavDropdown title="マイページ" id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} href="/profile">
                    登録情報変更
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} href="/contact/list">
                    お問い合わせ履歴
                  </NavDropdown.Item>
                </NavDropdown>
                <Button variant="danger" onClick={handleLogout} className="ms-lg-3">
                  ログアウト
                </Button>
              </>
            ) : (
              // 未ログイン時のメニュー
              <Button variant="light" onClick={handleLogin}>
                ログイン
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;