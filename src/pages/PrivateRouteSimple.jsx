import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.jsx';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';

function PrivateRoute({ children }) {
  // PAUSAR LOGIN - Permitir acesso direto
  return children;
}

export default PrivateRoute;
