import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import EmpruntsList from '../../pages/emprunts/EmpruntsList';
import EmpruntsForm from '../../pages/emprunts/EmpruntsForm';

vi.mock('../../components/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../api/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from '../../api/axios';

const empruntEnCours = {
  id: 1, user_prenom: 'Hamza', user_nom: 'M',
  livre_titre: 'Clean Code', livre_auteur: 'Martin',
  date_emprunt: '2026-05-01', date_retour: null, statut: 'en_cours',
};

const fakeUsers = [{ id: 1, prenom: 'Hamza', nom: 'M', email: 'h@m.com' }];
const fakeLivres = [{ id: 10, titre: 'Clean Code', auteur: 'Martin', stock: 3 }];

function renderFlow(path = '/emprunts') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/emprunts" element={<EmpruntsList />} />
        <Route path="/emprunts/new" element={<EmpruntsForm />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Functional — Emprunts flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
    api.get.mockResolvedValue({ data: { data: [empruntEnCours], total: 1, page: 1, limit: 10 } });
  });

  it('displays active loan with "En cours" badge', async () => {
    renderFlow();
    await waitFor(() => {
      expect(screen.getByText('Clean Code')).toBeInTheDocument();
      expect(screen.getAllByText('En cours').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('retour flow: click Retour → confirm → PATCH → refresh', async () => {
    api.patch.mockResolvedValueOnce({});
    renderFlow();
    await waitFor(() => screen.getByText('Retour'));
    fireEvent.click(screen.getByText('Retour'));
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Marquer ce livre comme rendu ?');
      expect(api.patch).toHaveBeenCalledWith('/api/emprunts/1/retour');
    });
  });

  it('new emprunt form shows users and livres dropdowns', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/api/users') return Promise.resolve({ data: { data: fakeUsers } });
      if (url === '/api/livres') return Promise.resolve({ data: { data: fakeLivres } });
    });
    renderFlow('/emprunts/new');
    await waitFor(() => {
      expect(screen.getByText(/Hamza M/)).toBeInTheDocument();
      expect(screen.getByText(/Clean Code/)).toBeInTheDocument();
    });
  });

  it('create emprunt flow: select user + livre → submit → success', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/api/users') return Promise.resolve({ data: { data: fakeUsers } });
      if (url === '/api/livres') return Promise.resolve({ data: { data: fakeLivres } });
    });
    api.post.mockResolvedValueOnce({ data: { id: 55, statut: 'en_cours' } });

    renderFlow('/emprunts/new');
    await waitFor(() => screen.getByText(/Hamza M/));

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '1' } });
    fireEvent.change(selects[1], { target: { value: '10' } });
    fireEvent.click(screen.getByText("Créer l'emprunt"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/emprunts', { user_id: 1, livre_id: 10 });
    });
  });

  it('filter by statut "rendu" sends correct params', async () => {
    renderFlow();
    await waitFor(() => screen.getByRole('combobox'));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'rendu' } });
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/emprunts', expect.objectContaining({
        params: expect.objectContaining({ statut: 'rendu' }),
      }));
    });
  });

  it('delete emprunt flow: confirm → DELETE → refresh', async () => {
    api.delete.mockResolvedValueOnce({});
    renderFlow();
    await waitFor(() => screen.getByText('Supprimer'));
    fireEvent.click(screen.getByText('Supprimer'));
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/api/emprunts/1');
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });
});
