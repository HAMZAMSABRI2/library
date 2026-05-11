import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import UsersList from '../../pages/users/UsersList';

vi.mock('../../components/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../api/axios', () => ({
  default: { get: vi.fn(), delete: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import api from '../../api/axios';

const fakeUsers = [
  { id: 1, nom: 'Dupont', prenom: 'Sophie', email: 'admin@app.com', role: 'ROLE_ADMIN' },
  { id: 2, nom: 'Martin', prenom: 'Jean', email: 'jean@app.com', role: 'ROLE_USER' },
];

function renderComponent() {
  return render(<MemoryRouter><UsersList /></MemoryRouter>);
}

describe('UsersList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
    api.get.mockResolvedValue({ data: { data: fakeUsers, total: 2, page: 1, limit: 10 } });
  });

  it('renders the list of users', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Dupont')).toBeInTheDocument();
      expect(screen.getByText('Martin')).toBeInTheDocument();
    });
  });

  it('shows correct role badges', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Membre')).toBeInTheDocument();
    });
  });

  it('shows total count', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/2 utilisateurs/i)).toBeInTheDocument();
    });
  });

  it('shows empty message when no users', async () => {
    api.get.mockResolvedValueOnce({ data: { data: [], total: 0, page: 1, limit: 10 } });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/aucun utilisateur trouvé/i)).toBeInTheDocument();
    });
  });

  it('navigates to edit page when "Modifier" is clicked', async () => {
    renderComponent();
    await waitFor(() => screen.getAllByText('Modifier'));
    fireEvent.click(screen.getAllByText('Modifier')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/users/1/edit');
  });

  it('calls delete API on confirm', async () => {
    api.delete.mockResolvedValueOnce({});
    renderComponent();
    await waitFor(() => screen.getAllByText('Supprimer'));
    fireEvent.click(screen.getAllByText('Supprimer')[0]);
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/api/users/1');
    });
  });

  it('does NOT delete when user cancels confirm', async () => {
    window.confirm = vi.fn(() => false);
    renderComponent();
    await waitFor(() => screen.getAllByText('Supprimer'));
    fireEvent.click(screen.getAllByText('Supprimer')[0]);
    expect(api.delete).not.toHaveBeenCalled();
  });
});
