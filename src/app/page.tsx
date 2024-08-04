// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/login'); // Redirect to the login page
  }, [router]);

  return null; // The component does not need to render anything
};

export default Home;
