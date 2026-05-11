import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import UsersForm from '../../pages/users/UsersForm';

vi.mock('../../components/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../api/axios', () => ({
  default: { get: vi.fn(), put: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import api from '../../api/axios';

const fakeUser = { id: 3, email: 'user@test.com', nom: 'Dupont', prenom: 'Paul', role: 'ROLE_USER' };

function renderEdit() {
  return render(
    <MemoryRouter initialEntries={['/users/3/edit']}>
      <Routes>
        <Route path="/users/:id/edit" element={<UsersForm />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('UsersForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: fakeUser });
  });

  it('loads user data into the form', async () => {
    renderEdit();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Dupont')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Paul')).toBeInTheDocument();
      expect(screen.getByDisplayValue('user@test.com')).toBeInTheDocument();
    });
  });

  it('submits PUT with updated data (without password if empty)', async () => {
    api.put.mockResolvedValueOnce({ data: fakeUser });
    renderEdit();
    await waitFor(() => screen.getByDisplayValue('Dupont'));

    fireEvent.change(screen.getByDisplayValue('Dupont'), { target: { value: 'Martin' } });
    fireEvent.click(screen.getByText('Enregistrer'));

    await waitFor(() => {
      const callArgs = api.put.mock.calls[0][1];
      expect(callArgs.nom).toBe('Martin');
      expect(callArgs.password).toBeUndefined();
      expect(mockNavigate).toHaveBeenCalledWith('/users');
    });
  });

  it('includes password in payload when filled', async () => {
    api.put.mockResolvedValueOnce({ data: fakeUser });
    renderEdit();
    await waitFor(() => screen.getByPlaceholderText(/laisser vide/i));

    fireEvent.change(screen.getByPlaceholderText(/laisser vide/i), { target: { value: 'newpass123' } });
    fireEvent.click(screen.getByText('Enregistrer'));

    await waitFor(() => {
      expect(api.put.mock.calls[0][1].password).toBe('newpass123');
    });
  });

  it('shows error when PUT fails', async () => {
    api.put.mockRejectedValueOnce({ response: { data: { error: 'Email déjà utilisé.' } } });
    renderEdit();
    await waitFor(() => screen.getByDisplayValue('Dupont'));
    fireEvent.click(screen.getByText('Enregistrer'));

    await waitFor(() => {
      expect(screen.getByText('Email déjà utilisé.')).toBeInTheDocument();
    });
  });

  it('cancel button navigates back', async () => {
    renderEdit();
    await waitFor(() => screen.getByText('Annuler'));
    fireEvent.click(screen.getByText('Annuler'));
    expect(mockNavigate).toHaveBeenCalledWith('/users');
  });
});
