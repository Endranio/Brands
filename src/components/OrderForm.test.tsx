import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi, describe, afterEach } from 'vitest';
import * as ordersActions from '@/actions/orders';
import { OrderForm } from './OrderForm';

vi.mock(import('@/actions/orders'), () => ({
  submitOrder: vi.fn<
    () => Promise<{
      success: boolean;
      orderId: string;
      orderNumber: string;
      totalAmount: number;
      whatsappUrl: string;
    }>
  >(),
}));

describe(OrderForm, () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });
  test('renders form fields correctly', () => {
    render(
      <OrderForm
        productId="123e4567-e89b-12d3-a456-426614174000"
        variantId={null}
        quantity={1}
        onSuccess={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByLabelText(/Nama Lengkap/iu)).toBeDefined();
    expect(screen.getByLabelText(/Nomor WhatsApp/iu)).toBeDefined();
    expect(screen.getByLabelText(/Alamat Lengkap Pengiriman/iu)).toBeDefined();
    expect(screen.getByRole('button', { name: /Simpan & Lanjutkan/iu })).toBeDefined();
  });

  test('calls submitOrder with correct data when form is valid', async () => {
    const mockOnSuccess = vi.fn<() => void>();
    const mockSubmitOrder = vi.mocked(ordersActions.submitOrder).mockResolvedValue({
      success: true,
      orderId: 'ord-123',
      orderNumber: 'AMPM-123',
      totalAmount: 100_000,
      whatsappUrl: 'https://wa.me/6281234567890',
    });

    render(
      <OrderForm
        productId="123e4567-e89b-12d3-a456-426614174000"
        variantId={null}
        quantity={1}
        onSuccess={mockOnSuccess}
      />,
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Nama Lengkap/iu), 'Budi');
    await user.type(screen.getByLabelText(/Nomor WhatsApp/iu), '081234567890');
    await user.type(screen.getByLabelText(/Alamat Lengkap Pengiriman/iu), 'Jl. Merdeka No 1');

    await user.click(screen.getByRole('button', { name: /Simpan & Lanjutkan/iu }));

    await waitFor(() => {
      expect(mockSubmitOrder).toHaveBeenCalledWith({
        customerName: 'Budi',
        customerPhone: '081234567890',
        customerAddress: 'Jl. Merdeka No 1',
        notes: '',
        productId: '123e4567-e89b-12d3-a456-426614174000',
        variantId: undefined,
        quantity: 1,
      });

      expect(mockOnSuccess).toHaveBeenCalledWith({
        orderNumber: 'AMPM-123',
        totalAmount: 100_000,
        whatsappUrl: 'https://wa.me/6281234567890',
        customerName: 'Budi',
        customerPhone: '081234567890',
        customerAddress: 'Jl. Merdeka No 1',
        notes: '',
      });
    });
  });
});
