import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Login from '../../pages/Login';

vi.mock('../../api/axios', () => ({
  default: {
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

import api from '../../api/axios';

function renderLoginFlow() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('Functional — Auth flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the login form', () => {
    renderLoginFlow();
    expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
  });

  it('successful login navigates to /dashboard', async () => {
    const fakeData = { token: 'tok-123', user: { prenom: 'Hamza', nom: 'M', role: 'ROLE_USER' } };
    api.post.mockResolvedValueOnce({ data: fakeData });

    renderLoginFlow();

    await userEvent.type(screen.getByLabelText(/email/i), 'hamza@test.com');
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'motdepasse');
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
    expect(localStorage.getItem('token')).toBe('tok-123');
  });

  it('wrong credentials shows error message', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: 'Email ou mot de passe incorrect.' } },
    });

    renderLoginFlow();

    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@test.com');
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'badpass');
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText('Email ou mot de passe incorrect.')).toBeInTheDocument();
    });
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('shows spinner while login request is pending', async () => {
    let resolve;
    api.post.mockReturnValueOnce(new Promise(r => { resolve = r; }));

    renderLoginFlow();

    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'pass');
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(screen.getByRole('button').querySelector('span')).toBeInTheDocument();
    });

    resolve({ data: { token: 't', user: { prenom: 'X', nom: 'Y', role: 'ROLE_USER' } } });
  });

  it('submit button is disabled while loading', async () => {
    let resolve;
    api.post.mockReturnValueOnce(new Promise(r => { resolve = r; }));

    renderLoginFlow();

    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'pass');
    const btn = screen.getByRole('button', { name: /se connecter/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled();
    });

    resolve({ data: { token: 't', user: { prenom: 'X', nom: 'Y', role: 'ROLE_USER' } } });
  });
});
