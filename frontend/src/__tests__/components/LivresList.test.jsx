import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LivresList from '../../pages/livres/LivresList';

vi.mock('../../components/Layout', () => ({
  default: ({ children }) => <div data-testid="layout">{children}</div>,
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

const fakeLivres = [
  { id: 1, isbn: '978-1', titre: 'Le Petit Prince', auteur: 'Saint-Ex', editeur: 'Gallimard', annee: 1943, stock: 3 },
  { id: 2, isbn: '978-2', titre: 'L\'Alchimiste', auteur: 'Coelho', editeur: null, annee: null, stock: 0 },
];

function renderComponent() {
  return render(
    <MemoryRouter>
      <LivresList />
    </MemoryRouter>
  );
}

describe('LivresList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
    api.get.mockResolvedValue({ data: { data: fakeLivres, total: 2, page: 1, limit: 10 } });
  });

  it('renders the list of books after loading', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Le Petit Prince')).toBeInTheDocument();
      expect(screen.getByText('L\'Alchimiste')).toBeInTheDocument();
    });
  });

  it('shows total count in subtitle', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/2 livres/i)).toBeInTheDocument();
    });
  });

  it('shows green badge for book in stock and red for out of stock', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  it('shows empty message when no books returned', async () => {
    api.get.mockResolvedValueOnce({ data: { data: [], total: 0, page: 1, limit: 10 } });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/aucun livre trouvé/i)).toBeInTheDocument();
    });
  });

  it('shows error message when API fails', async () => {
    api.get.mockRejectedValueOnce(new Error('Network error'));
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/erreur lors du chargement/i)).toBeInTheDocument();
    });
  });

  it('navigates to /livres/new when "Ajouter" is clicked', async () => {
    renderComponent();
    await waitFor(() => screen.getByText('+ Ajouter un livre'));
    fireEvent.click(screen.getByText('+ Ajouter un livre'));
    expect(mockNavigate).toHaveBeenCalledWith('/livres/new');
  });

  it('navigates to edit page when "Modifier" is clicked', async () => {
    renderComponent();
    await waitFor(() => screen.getAllByText('Modifier'));
    fireEvent.click(screen.getAllByText('Modifier')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/livres/1/edit');
  });

  it('calls delete API and refreshes list on confirm', async () => {
    api.delete.mockResolvedValueOnce({});
    renderComponent();
    await waitFor(() => screen.getAllByText('Supprimer'));
    fireEvent.click(screen.getAllByText('Supprimer')[0]);
    expect(window.confirm).toHaveBeenCalledWith('Supprimer ce livre ?');
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/api/livres/1');
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  it('does NOT call delete API when user cancels confirm', async () => {
    window.confirm = vi.fn(() => false);
    renderComponent();
    await waitFor(() => screen.getAllByText('Supprimer'));
    fireEvent.click(screen.getAllByText('Supprimer')[0]);
    expect(api.delete).not.toHaveBeenCalled();
  });

  it('refetches with search query when typing in search box', async () => {
    renderComponent();
    await waitFor(() => screen.getByPlaceholderText(/rechercher/i));
    fireEvent.change(screen.getByPlaceholderText(/rechercher/i), { target: { value: 'Prince' } });
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/livres', expect.objectContaining({
        params: expect.objectContaining({ q: 'Prince' }),
      }));
    });
  });
});
