import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '../../../../tests/utils/renderWithProviders'

import { ClientForm } from './ClientForm'

const { mutateAsync } = vi.hoisted(() => ({
  mutateAsync: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../api/useCreateClientMutation', () => ({
  useCreateClientMutation: () => ({
    mutateAsync,
    isPending: false,
  }),
}))

vi.mock('sonner', async (importOriginal) => {
  const actual = await importOriginal<typeof import('sonner')>()
  return {
    ...actual,
    toast: {
      ...actual.toast,
      success: vi.fn(),
      error: vi.fn(),
    },
  }
})

describe('ClientForm', () => {
  it('submits with the expected payload and shows success toast', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ClientForm variant="create" />)

    await user.type(screen.getByLabelText(/nome/i), 'Cliente Teste')
    await user.type(screen.getByLabelText(/e-mail/i), 'cliente@teste.com')
    await user.type(screen.getByLabelText(/documento/i), '12345678901')

    await user.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        name: 'Cliente Teste',
        email: 'cliente@teste.com',
        documentValue: '12345678901',
      })
    })

    expect(toast.success).toHaveBeenCalledWith('Cliente cadastrado.')
  })
})
