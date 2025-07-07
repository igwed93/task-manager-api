'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';


interface User {
  id: string;
  email: string;
  name: string;
}

export default function useAuth() {
    const [user, setUser] = useState<User | null | undefined>(undefined);

    useEffect(() => {
        api.get<User>('/auth/me')
            .then((res: { data: User }) => setUser(res.data))
            .catch(() => setUser(null));
    }, []);

    return user;
}