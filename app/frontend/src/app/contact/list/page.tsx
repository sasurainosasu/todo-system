import { Container } from 'react-bootstrap';
import ContactList from './ContactList';
import { headers } from 'next/headers'; // Next.js 13以降のサーバーコンポーネントでヘッダーにアクセスするためのAPI

// PHPから取得するデータの型を定義
interface Item {
  name: string;
  email: string;
  message: string;
  created_at: string;
}

async function getContactList(): Promise<Item[]> {
  try {
    // headers() を使ってリクエストヘッダーにアクセス
    const cookie = headers().get('cookie') || '';
    
    // Cookieをヘッダーとして直接設定
    const response = await fetch(`http://nginx/backend/contact/contact-list.php`, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'xmlhttprequest',
        'Content-Type': 'application/json',
        'Cookie': cookie, // ここでCookieをヘッダーに追加
      },
      // SSR時に毎回最新のデータを取得するための設定
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }
    
    return data;
  } catch {
    return [];
  }
}

export default async function ContactListPage() {
  const items = await getContactList();

  return (
    <Container className="my-5">
      <ContactList initialItems={items} />
    </Container>
  );
}