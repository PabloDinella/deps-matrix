'use client';

import { ReactNode, useEffect, useState } from 'react';

export function AuthenticationLink({ children }: { children: ReactNode }) {
  const [redirectUri, setRedirectUri] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      return setRedirectUri(`&redirect_uri=${window.location.origin}/`);
    }

    return undefined;
  }, []);

  const loginUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}${redirectUri}`;

  return <a href={loginUrl}>{children}</a>;
}
