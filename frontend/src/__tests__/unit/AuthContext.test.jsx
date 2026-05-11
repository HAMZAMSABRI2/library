import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../../context/AuthContext';

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

function TestConsumer() {
  const { user, token, isAuth, login, register, logout } = useAuth();
  return (
    <div>
      <span data-testid="isAuth">{String(isAuth)}</span>
      <span data-testid="user">{user ? `${user.prenom} ${user.nom}` : 'null'}</span>
      <span data-testid="token">{token ?? 'null'}</span>
      <button onClick={() => login('test@test.com', 'pass')}>login</button>
      <button onClick={() => register({ email: 'n@n.com', password: 'p', nom: 'N', prenom: 'P' })}>register</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initial state is unauthenticated when localStorage is empty', () => {
    renderWithProvider();
    expect(screen.getByTestId('isAuth').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('token').textContent).toBe('null');
  });

  it('initial state loads from localStorage', () => {
    localStorage.setItem('token', 'saved-token');
    localStorage.setItem('user', JSON.stringify({ prenom: 'Hamza', nom: 'M', role: 'ROLE_USER' }));
    renderWithProvider();
    expect(screen.getByTestId('isAuth').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('Hamza M');
    expect(screen.getByTestId('token').textContent).toBe('saved-token');
  });

  it('login() saves token/user and updates state', async () => {
    const fakeData = { token: 'jwt-abc', user: { prenom: 'Ali', nom: 'B', role: 'ROLE_USER' } };
    api.post.mockResolvedValueOnce({ data: fakeData });

    renderWithProvider();

    await act(async () => {
      screen.getByText('login').click();
    });

    expect(api.post).toHaveBeenCalledWith('/api/auth/login', { email: 'test@test.com', password: 'pass' });
    expect(screen.getByTestId('isAuth').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('Ali B');
    expect(localStorage.getItem('token')).toBe('jwt-abc');
    expect(JSON.parse(localStorage.getItem('user')).prenom).toBe('Ali');
  });

  it('login() keeps isAuth false when API returns error', async () => {
    let loginFn;
    function HookCapture() {
      const ctx = useAuth();
      loginFn = ctx.login;
      return null;
    }
    render(<AuthProvider><HookCapture /><TestConsumer /></AuthProvider>);

    api.post.mockRejectedValueOnce(new Error('Unauthorized'));

    await expect(act(() => loginFn('bad@test.com', 'wrong'))).rejects.toThrow('Unauthorized');
    expect(screen.getByTestId('isAuth').textContent).toBe('false');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('register() saves token/user and updates state', async () => {
    const fakeData = { token: 'jwt-reg', user: { prenom: 'Sara', nom: 'K', role: 'ROLE_USER' } };
    api.post.mockResolvedValueOnce({ data: fakeData });
    renderWithProvider();

    await act(async () => {
      screen.getByText('register').click();
    });

    expect(api.post).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({ email: 'n@n.com' }));
    expect(screen.getByTestId('isAuth').textContent).toBe('true');
    expect(localStorage.getItem('token')).toBe('jwt-reg');
  });

  it('logout() clears localStorage and resets state', async () => {
    localStorage.setItem('token', 'existing-token');
    localStorage.setItem('user', JSON.stringify({ prenom: 'Test', nom: 'User', role: 'ROLE_USER' }));
    renderWithProvider();

    expect(screen.getByTestId('isAuth').textContent).toBe('true');

    await act(async () => {
      screen.getByText('logout').click();
    });

    expect(screen.getByTestId('isAuth').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
