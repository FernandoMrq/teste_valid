import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '../../../../tests/utils/renderWithProviders'

const { mutateAsync } = vi.hoisted(() => ({ mutateAsync: vi.fn() }))

vi.mock('../api/useUpdateStatusMutation', () => ({
  useUpdateStatusMutation: () => ({ mutateAsync, isPending: false }),
}))

vi.mock('sonner', async (importOriginal) => {
  const actual = await importOriginal<typeof import('sonner')>()
  return {
    ...actual,
    toast: { ...actual.toast, success: vi.fn(), error: vi.fn() },
  }
})

import { ServiceOrderStatusDialog } from './ServiceOrderStatusDialog'

beforeEach(() => {
  mutateAsync.mockReset()
  vi.mocked(toast.success).mockClear()
  vi.mocked(toast.error).mockClear()
})

describe('ServiceOrderStatusDialog', () => {
  it('confirms status update and closes on success', async () => {
    mutateAsync.mockResolvedValue(undefined)
    const onOpenChange = vi.fn()
    const onUpdated = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <ServiceOrderStatusDialog
        orderId="so-1"
        currentStatus="Open"
        open
        onOpenChange={onOpenChange}
        onUpdated={onUpdated}
      />
    )

    await user.click(screen.getByRole('button', { name: /confirmar/i }))

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({ id: 'so-1', status: 'Open' })
    )
    expect(toast.success).toHaveBeenCalledWith('Status atualizado.')
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onUpdated).toHaveBeenCalled()
  })

  it('shows generic error toast on failure', async () => {
    mutateAsync.mockRejectedValue(new Error('x'))
    const user = userEvent.setup()

    renderWithProviders(
      <ServiceOrderStatusDialog
        orderId="so-1"
        currentStatus="Open"
        open
        onOpenChange={() => undefined}
      />
    )

    await user.click(screen.getByRole('button', { name: /confirmar/i }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Não foi possível alterar o status.')
    )
  })

  it('closes on cancel', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <ServiceOrderStatusDialog
        orderId="so-1"
        currentStatus="Open"
        open
        onOpenChange={onOpenChange}
      />
    )

    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
