import { BrowserRouter, useRoutes } from 'react-router-dom';
import { Suspense } from 'react';
import appRoutes from './router/routes';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';

function AppRoutes() {
  return useRoutes(appRoutes);
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

        <Suspense fallback={<div>Loading...</div>}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
