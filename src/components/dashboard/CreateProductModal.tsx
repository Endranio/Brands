'use client';

import { useState } from 'react';
import { ProductForm } from './ProductForm';

type Props = {
  locale: string;
  createAction: (formData: FormData) => Promise<{ success: boolean; error?: string; id?: string }>;
};

export function CreateProductModal(props: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
        }}
        className="button-primary"
      >
        Tambah Produk
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-[16px] backdrop-blur-sm">
          <div
            className="relative max-h-[90vh] w-full max-w-[800px] overflow-y-auto bg-canvas p-[32px] shadow-xl"
            style={{ border: '1px solid var(--color-hairline-soft)' }}
          >
            <div className="mb-[24px] flex items-start justify-between">
              <div className="flex flex-col gap-[8px]">
                <h2 className="text-heading-xl text-ink">Tambah Produk</h2>
                <p className="text-body-md text-mute">Isi detail produk baru di bawah ini.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                }}
                className="text-[24px] leading-none text-stone hover:text-ink"
              >
                &times;
              </button>
            </div>

            <ProductForm
              mode="create"
              locale={props.locale}
              onSubmit={props.createAction}
              onSuccess={() => {
                setIsOpen(false);
              }}
              onCancel={() => {
                setIsOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
