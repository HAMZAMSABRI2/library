import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import EmpruntsForm from '../../pages/emprunts/EmpruntsForm';

vi.mock('../../components/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../api/axios', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import api from '../../api/axios';

const fakeUsers = [
  { id: 1, prenom: 'Hamza', nom: 'M', email: 'h@m.com' },
  { id: 2, prenom: 'Sara', nom: 'K', email: 's@k.com' },
];
const fakeLivres = [
  { id: 10, titre: 'Livre A', auteur: 'Auteur A', stock: 2 },
  { id: 11, titre: 'Livre B', auteur: 'Auteur B', stock: 0 },
];

function renderComponent() {
  return render(<MemoryRouter><EmpruntsForm /></MemoryRouter>);
}

describe('EmpruntsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === '/api/users') return Promise.resolve({ data: { data: fakeUsers } });
      if (url === '/api/livres') return Promise.resolve({ data: { data: fakeLivres } });
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('loads users and livres into dropdowns', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Hamza M/)).toBeInTheDocument();
      expect(screen.getByText(/Sara K/)).toBeInTheDocument();
    });
  });

  it('shows only books with stock > 0 in livres dropdown', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Livre A/)).toBeInTheDocument();
      expect(screen.queryByText(/Livre B/)).not.toBeInTheDocument();
    });
  });

  it('shows "aucun livre disponible" when all books are out of stock', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/api/users') return Promise.resolve({ data: { data: fakeUsers } });
      if (url === '/api/livres') return Promise.resolve({ data: { data: [{ ...fakeLivres[1] }] } });
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/aucun livre disponible/i)).toBeInTheDocument();
    });
  });

  it('submits POST with selected user and livre IDs', async () => {
    api.post.mockResolvedValueOnce({ data: { id: 99 } });
    renderComponent();
    await waitFor(() => screen.getByText(/Hamza M/));

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '1' } });
    fireEvent.change(selects[1], { target: { value: '10' } });
    fireEvent.click(screen.getByText("Créer l'emprunt"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/emprunts', { user_id: 1, livre_id: 10 });
      expect(mockNavigate).toHaveBeenCalledWith('/emprunts');
    });
  });

  it('shows error when POST fails', async () => {
    api.post.mockRejectedValueOnce({ response: { data: { error: 'Livre déjà emprunté.' } } });
    renderComponent();
    await waitFor(() => screen.getByText(/Hamza M/));

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '1' } });
    fireEvent.change(selects[1], { target: { value: '10' } });
    fireEvent.click(screen.getByText("Créer l'emprunt"));

    await waitFor(() => {
      expect(screen.getByText('Livre déjà emprunté.')).toBeInTheDocument();
    });
  });

  it('cancel button navigates back', async () => {
    renderComponent();
    await waitFor(() => screen.getByText('Annuler'));
    fireEvent.click(screen.getByText('Annuler'));
    expect(mockNavigate).toHaveBeenCalledWith('/emprunts');
  });
});
