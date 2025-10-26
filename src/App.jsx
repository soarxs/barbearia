import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth.jsx';
import Inicio from './pages/Inicio.jsx';
import NaoEncontrado from './pages/NaoEncontrado.jsx';
import PrivateRoute from './pages/PrivateRouteSimple.jsx';
import Login from './componentes/AuthAdmin/Login.jsx';
import AdminClean from './components/admin/AdminClean.tsx';
import AguardandoAprovacao from './pages/AguardandoAprovacao.jsx';
import AcessoNegado from './pages/AcessoNegado.jsx';
import ThankYouPage from './components/ThankYouPage.tsx';
import PWAInstallPrompt from './components/PWAInstallPrompt.tsx';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/obrigado" element={<ThankYouPage />} />
                <Route path="/admin/login" element={<Login />} />
                <Route path="/aguardando-aprovacao" element={<AguardandoAprovacao />} />
                <Route path="/acesso-negado" element={<AcessoNegado />} />
                <Route
                  path="/admin"
                  element={
                    <PrivateRoute>
                      <AdminClean />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<NaoEncontrado />} />
              </Routes>
          <PWAInstallPrompt />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

