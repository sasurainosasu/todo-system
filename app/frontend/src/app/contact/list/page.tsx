import { Container } from 'react-bootstrap';
import ContactList from './ContactList';
import { headers } from 'next/headers';

interface Item {
  name: string;
  email: string;
  message: string;
  created_at: string;
}

async function getContactList(): Promise<Item[]> {
// try {
    // headers()をawaitして使用
    const headerStore = await headers();
    const cookie = headerStore.get('cookie') || '';

    // Cookieをヘッダーとして直接設定
    const response = await fetch(`https://nginx/backend/contact/contact-list.php`, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'xmlhttprequest',
        'Content-Type': 'application/json',
        'Cookie': cookie,
      },
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
  /*
  } catch {
    return [];
  }
  */
}

export default async function ContactListPage() {
  const items = await getContactList();

  return (
    <Container className="my-5">
      <ContactList initialItems={items} />
    </Container>
  );
}