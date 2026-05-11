import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LivresList from '../../pages/livres/LivresList';
import LivresForm from '../../pages/livres/LivresForm';

vi.mock('../../components/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../api/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from '../../api/axios';

const livresList = [
  { id: 1, isbn: '978-0001', titre: 'Clean Code', auteur: 'Martin', editeur: 'Prentice', annee: 2008, stock: 5 },
];

function renderCrudFlow(initialPath = '/livres') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/livres" element={<LivresList />} />
        <Route path="/livres/new" element={<LivresForm />} />
        <Route path="/livres/:id/edit" element={<LivresForm />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Functional — Livres CRUD flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
    api.get.mockResolvedValue({ data: { data: livresList, total: 1, page: 1, limit: 10 } });
  });

  it('lists books on /livres', async () => {
    renderCrudFlow();
    await waitFor(() => {
      expect(screen.getByText('Clean Code')).toBeInTheDocument();
      expect(screen.getByText('Martin')).toBeInTheDocument();
    });
  });

  it('shows create form on /livres/new', async () => {
    renderCrudFlow('/livres/new');
    expect(screen.getByText('Ajouter un livre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/978/i)).toBeInTheDocument();
  });

  it('complete create flow: fill form → submit → navigate to list', async () => {
    api.post.mockResolvedValueOnce({ data: { id: 99, titre: 'Nouveau' } });
    renderCrudFlow('/livres/new');

    await userEvent.type(screen.getByPlaceholderText(/978/i), '978-9999');
    await userEvent.type(screen.getByPlaceholderText(/Le Petit Prince/i), 'Nouveau Livre');
    await userEvent.type(screen.getByPlaceholderText(/Saint-Exupéry/i), 'Auteur Nouveau');
    fireEvent.click(screen.getByText('Ajouter'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/livres', expect.objectContaining({
        isbn: '978-9999',
        titre: 'Nouveau Livre',
      }));
    });
  });

  it('edit form loads book data on /livres/:id/edit', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/api/livres/1') return Promise.resolve({ data: livresList[0] });
      return Promise.resolve({ data: { data: livresList, total: 1, page: 1, limit: 10 } });
    });
    renderCrudFlow('/livres/1/edit');
    await waitFor(() => {
      expect(screen.getByDisplayValue('Clean Code')).toBeInTheDocument();
    });
  });

  it('delete flow: confirm → API call → list refresh', async () => {
    api.delete.mockResolvedValueOnce({});
    renderCrudFlow();
    await waitFor(() => screen.getByText('Supprimer'));
    fireEvent.click(screen.getByText('Supprimer'));
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/api/livres/1');
    });
  });

  it('search filters the list', async () => {
    renderCrudFlow();
    await waitFor(() => screen.getByPlaceholderText(/rechercher/i));
    await userEvent.type(screen.getByPlaceholderText(/rechercher/i), 'Clean');
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/livres', expect.objectContaining({
        params: expect.objectContaining({ q: 'Clean' }),
      }));
    });
  });
});
