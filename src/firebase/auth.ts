import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/router';
import { auth } from '../firebase/firebaseConfig';

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null); // Update type definition
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null); // Ensure state is updated correctly
        router.push('/auth/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return user;
};

export default useAuth;
