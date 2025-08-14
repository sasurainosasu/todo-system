import { Container } from 'react-bootstrap';
import ContactList from './ContactList';
import { cookies } from 'next/headers'; // Next.js 13以降のサーバーコンポーネントでヘッダーにアクセスするためのAPI

// PHPから取得するデータの型を定義
interface Item {
  name: string;
  email: string;
  message: string;
  created_at: string;
}

async function getContactList(): Promise<Item[]> {
  try {

    // cookies() を使って、特定の名前のCookieだけを取得
    // Promiseが解決されるのを待って、sessionIDを取得
    const sessionID = await cookies().get('PHPSESSID');

    let phpSessionIdValue = "";
    // sessionIDが存在する場合のみ処理
    if (sessionID) {
      // sessionID.valueを使ってCookieの値にアクセス
      phpSessionIdValue = sessionID.value;
      // ... 取得した値を使って処理を続ける ...
    } else {
    // Cookieが存在しない場合の処理
      return [];
    }
    
    // Cookieをヘッダーとして直接設定
    const response = await fetch(`http://nginx/backend/contact/contact-list.php`, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'xmlhttprequest',
        'Content-Type': 'application/json',
        'Cookie': `PHPSESSID=${phpSessionIdValue}`, // ここでCookieをヘッダーに追加
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