'use client';

import { useEffect } from 'react';

export default function SplashPage() {
  useEffect(() => {
    const id = setTimeout(() => {
      window.location.replace('/login');
    }, 2000);
    return () => clearTimeout(id);
  }, []);
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateY(-12px)' }}>
        <img
          src="/images/tuto-logo.png"
          alt="tuto."
          width={200}
          height={80}
          style={{ filter: 'drop-shadow(0 10px 30px rgba(11,95,255,0.35))', animation: 'zoomIn 2s ease-in-out forwards' }}
        />
        <div style={{ marginTop: 16, fontSize: 12, color: '#6b7280' }}>learn • connect • grow</div>
        <style jsx global>{`
          @keyframes zoomIn {
            0% { transform: scale(0.9); opacity: 0.85; }
            100% { transform: scale(1.0); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}


