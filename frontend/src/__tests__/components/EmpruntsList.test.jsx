import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import EmpruntsList from '../../pages/emprunts/EmpruntsList';

vi.mock('../../components/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../api/axios', () => ({
  default: { get: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import api from '../../api/axios';

const fakeEmprunts = [
  {
    id: 1, user_prenom: 'Hamza', user_nom: 'M',
    livre_titre: 'Le Petit Prince', livre_auteur: 'Saint-Ex',
    date_emprunt: '2026-04-01', date_retour: null, statut: 'en_cours',
  },
  {
    id: 2, user_prenom: 'Sara', user_nom: 'K',
    livre_titre: 'L\'Alchimiste', livre_auteur: 'Coelho',
    date_emprunt: '2026-03-15', date_retour: '2026-03-25', statut: 'rendu',
  },
];

function renderComponent() {
  return render(<MemoryRouter><EmpruntsList /></MemoryRouter>);
}

describe('EmpruntsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
    api.get.mockResolvedValue({ data: { data: fakeEmprunts, total: 2, page: 1, limit: 10 } });
  });

  it('renders the list of emprunts', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Le Petit Prince')).toBeInTheDocument();
      expect(screen.getByText('L\'Alchimiste')).toBeInTheDocument();
    });
  });

  it('shows "En cours" badge for active loans', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getAllByText('En cours').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows "Rendu" badge for returned loans', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Rendu')).toBeInTheDocument();
    });
  });

  it('shows "Retour" button only for en_cours loans', async () => {
    renderComponent();
    await waitFor(() => {
      const retourBtns = screen.getAllByText('Retour');
      expect(retourBtns).toHaveLength(1);
    });
  });

  it('calls PATCH /retour and refreshes on confirm', async () => {
    api.patch.mockResolvedValueOnce({});
    renderComponent();
    await waitFor(() => screen.getByText('Retour'));
    fireEvent.click(screen.getByText('Retour'));
    expect(window.confirm).toHaveBeenCalledWith('Marquer ce livre comme rendu ?');
    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/api/emprunts/1/retour');
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  it('does NOT call PATCH when user cancels retour', async () => {
    window.confirm = vi.fn(() => false);
    renderComponent();
    await waitFor(() => screen.getByText('Retour'));
    fireEvent.click(screen.getByText('Retour'));
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('calls delete API and refreshes on confirm', async () => {
    api.delete.mockResolvedValueOnce({});
    renderComponent();
    await waitFor(() => screen.getAllByText('Supprimer'));
    fireEvent.click(screen.getAllByText('Supprimer')[0]);
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/api/emprunts/1');
    });
  });

  it('filters by statut when select changes', async () => {
    renderComponent();
    await waitFor(() => screen.getByRole('combobox'));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'en_cours' } });
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/emprunts', expect.objectContaining({
        params: expect.objectContaining({ statut: 'en_cours' }),
      }));
    });
  });

  it('navigates to /emprunts/new when "Nouvel emprunt" is clicked', async () => {
    renderComponent();
    await waitFor(() => screen.getByText('+ Nouvel emprunt'));
    fireEvent.click(screen.getByText('+ Nouvel emprunt'));
    expect(mockNavigate).toHaveBeenCalledWith('/emprunts/new');
  });
});
