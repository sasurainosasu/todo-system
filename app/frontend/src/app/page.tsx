'use client'; // <-- この行を追加

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // App Routerの場合
// import { useRouter } from 'next/router'; // Pages Routerの場合、必要に応じて使い分け

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    // コンポーネントがマウントされたら /contact ページへリダイレクト
    router.replace('/contact'); // replace を使うとブラウザの履歴に残らない
  }, [router]);

  // リダイレクト中であることを示すローディング表示など
  return (
    <div>
      <p>Redirecting to contact page...</p>
    </div>
  );
};

export default Home;

