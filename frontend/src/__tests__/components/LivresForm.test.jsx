import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LivresForm from '../../pages/livres/LivresForm';

vi.mock('../../components/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../api/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import api from '../../api/axios';

function renderCreate() {
  return render(
    <MemoryRouter initialEntries={['/livres/new']}>
      <Routes>
        <Route path="/livres/new" element={<LivresForm />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderEdit() {
  return render(
    <MemoryRouter initialEntries={['/livres/5/edit']}>
      <Routes>
        <Route path="/livres/:id/edit" element={<LivresForm />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('LivresForm — création', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders empty create form with correct title', () => {
    renderCreate();
    expect(screen.getByText('Ajouter un livre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/978/i)).toHaveValue('');
  });

  it('submits create form with correct payload', async () => {
    api.post.mockResolvedValueOnce({ data: { id: 99 } });
    renderCreate();

    fireEvent.change(screen.getByPlaceholderText(/978/i), { target: { value: '978-0-06' } });
    fireEvent.change(screen.getByPlaceholderText(/Le Petit Prince/i), { target: { value: 'Mon Livre' } });
    fireEvent.change(screen.getByPlaceholderText(/Saint-Exupéry/i), { target: { value: 'Auteur Test' } });

    fireEvent.click(screen.getByText('Ajouter'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/livres', expect.objectContaining({
        isbn: '978-0-06',
        titre: 'Mon Livre',
        auteur: 'Auteur Test',
      }));
      expect(mockNavigate).toHaveBeenCalledWith('/livres');
    });
  });

  it('shows error message when POST fails', async () => {
    api.post.mockRejectedValueOnce({ response: { data: { error: 'ISBN déjà utilisé.' } } });
    renderCreate();

    fireEvent.change(screen.getByPlaceholderText(/978/i), { target: { value: '978-0-06' } });
    fireEvent.change(screen.getByPlaceholderText(/Le Petit Prince/i), { target: { value: 'Titre' } });
    fireEvent.change(screen.getByPlaceholderText(/Saint-Exupéry/i), { target: { value: 'Auteur' } });
    fireEvent.click(screen.getByText('Ajouter'));

    await waitFor(() => {
      expect(screen.getByText('ISBN déjà utilisé.')).toBeInTheDocument();
    });
  });

  it('cancel button navigates back to /livres', () => {
    renderCreate();
    fireEvent.click(screen.getByText('Annuler'));
    expect(mockNavigate).toHaveBeenCalledWith('/livres');
  });
});

describe('LivresForm — modification', () => {
  const existingLivre = { id: 5, isbn: '978-OLD', titre: 'Vieux Titre', auteur: 'Vieil Auteur', editeur: 'Ed', annee: 2000, stock: 2, image_url: '' };

  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: existingLivre });
  });

  it('loads existing book data into form', async () => {
    renderEdit();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Vieux Titre')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Vieil Auteur')).toBeInTheDocument();
    });
  });

  it('ISBN field is disabled in edit mode', async () => {
    renderEdit();
    await waitFor(() => screen.getByDisplayValue('978-OLD'));
    expect(screen.getByDisplayValue('978-OLD')).toBeDisabled();
  });

  it('submits PUT request on save', async () => {
    api.put.mockResolvedValueOnce({ data: { ...existingLivre, titre: 'Nouveau Titre' } });
    renderEdit();
    await waitFor(() => screen.getByDisplayValue('Vieux Titre'));

    fireEvent.change(screen.getByDisplayValue('Vieux Titre'), { target: { value: 'Nouveau Titre' } });
    fireEvent.click(screen.getByText('Enregistrer'));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/api/livres/5', expect.objectContaining({ titre: 'Nouveau Titre' }));
      expect(mockNavigate).toHaveBeenCalledWith('/livres');
    });
  });
});
