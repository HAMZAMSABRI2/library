import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';

vi.mock('../../components/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../api/axios', () => ({
  default: { get: vi.fn() },
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

function renderComponent() {
  return render(<MemoryRouter><Dashboard /></MemoryRouter>);
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { prenom: 'Hamza', nom: 'M' } });
    api.get.mockResolvedValue({ data: { total: 0 } });
  });

  it('shows welcome message with user first name', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Bonjour, Hamza/i)).toBeInTheDocument();
    });
  });

  it('renders all 4 stat cards', async () => {
    api.get
      .mockResolvedValueOnce({ data: { total: 42 } })
      .mockResolvedValueOnce({ data: { total: 15 } })
      .mockResolvedValueOnce({ data: { total: 7 } })
      .mockResolvedValueOnce({ data: { total: 30 } });

    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Livres')).toBeInTheDocument();
      expect(screen.getByText('Utilisateurs')).toBeInTheDocument();
      expect(screen.getByText('Emprunts en cours')).toBeInTheDocument();
      expect(screen.getByText('Retours effectués')).toBeInTheDocument();
    });
  });

  it('displays correct stats values', async () => {
    api.get
      .mockResolvedValueOnce({ data: { total: 10 } })
      .mockResolvedValueOnce({ data: { total: 5 } })
      .mockResolvedValueOnce({ data: { total: 3 } })
      .mockResolvedValueOnce({ data: { total: 20 } });

    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
    });
  });

  it('navigates to /livres when livres card is clicked', async () => {
    renderComponent();
    await waitFor(() => screen.getByText('Livres'));
    fireEvent.click(screen.getByText('Livres').closest('button'));
    expect(mockNavigate).toHaveBeenCalledWith('/livres');
  });

  it('navigates to /users when utilisateurs card is clicked', async () => {
    renderComponent();
    await waitFor(() => screen.getByText('Utilisateurs'));
    fireEvent.click(screen.getByText('Utilisateurs').closest('button'));
    expect(mockNavigate).toHaveBeenCalledWith('/users');
  });
});
