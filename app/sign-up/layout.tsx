import { ReactNode } from 'react';

export default function SignUpLayout({ children }: { children: ReactNode }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f2f5',
      }}
    >
      {children}
    </main>
  );
}
