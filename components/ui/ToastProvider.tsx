'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#FFFFFF',
          color: '#1A1A1A',
          border: '1px solid #E5E7EB',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          fontSize: '14px',
          fontWeight: '500',
        },
        success: {
          style: {
            background: '#10B981',
            color: '#FFFFFF',
            border: 'none',
          },
          iconTheme: {
            primary: '#FFFFFF',
            secondary: '#10B981',
          },
        },
        error: {
          style: {
            background: '#EF4444',
            color: '#FFFFFF',
            border: 'none',
          },
          iconTheme: {
            primary: '#FFFFFF',
            secondary: '#EF4444',
          },
        },
        loading: {
          style: {
            background: '#F59E0B',
            color: '#FFFFFF',
            border: 'none',
          },
        },
      }}
    />
  );
}