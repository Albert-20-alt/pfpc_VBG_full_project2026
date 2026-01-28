import React from 'react';
import { render } from '@testing-library/react';
import ProtectedRoute from '../ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock useLocation from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({ pathname: '/dashboard' }),
  Navigate: ({ to }) => <div>Navigate to {to}</div>,
}));

// Mock useAuth context
jest.mock('@/contexts/AuthContext', () => {
  const actual = jest.requireActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({ user: null, loading: true }),
  };
});

describe('ProtectedRoute', () => {
  it('affiche le loader si loading', () => {
    const { container } = render(
      <AuthProvider>
        <ProtectedRoute>
          <div>Contenu protégé</div>
        </ProtectedRoute>
      </AuthProvider>
    );
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
