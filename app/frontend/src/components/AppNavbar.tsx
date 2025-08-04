'use client'; // Client Componentとしてマーク

import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import Link from 'next/link'; // Next.jsのLinkコンポーネントをインポート

const AppNavbar: React.FC = () => {
  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4 fw-bold">
      <Container>
        {/* 左側にお問い合わせと表示 */}
        <Navbar.Brand as={Link} href="/">
          お問い合わせ
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {/* 右側にナビゲーションリンク */}
          <Nav className="ms-auto"> {/* ms-auto で右寄せ */}
            <Nav.Link as={Link} href="/contact">
              お問い合わせフォーム
            </Nav.Link>
            <Nav.Link as={Link} href="/contact-list">
              お問い合わせ履歴
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;