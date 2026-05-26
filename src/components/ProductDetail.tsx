'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { OrderConfirmation } from './OrderConfirmation';
import { OrderForm } from './OrderForm';

type ProductImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number | null;
};

type ProductVariant = {
  id: string;
  size: string;
  color: string | null;
  stock: number;
  price?: number | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string | null;
};

type Props = {
  product: Product;
  images: ProductImage[];
  variants: ProductVariant[];
};

type ImageGalleryProps = {
  images: ProductImage[];
  productName: string;
  activeImageIndex: number;
  onActiveImageChange: (index: number) => void;
};

function ImageGallery(props: ImageGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mencegah trigger onScroll saat programmatically scrolling
  const isProgrammaticScroll = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      isProgrammaticScroll.current = true;
      const width = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        left: width * props.activeImageIndex,
        behavior: 'smooth',
      });
      // Reset flag setelah scroll animasi selesai (estimasi 300ms)
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 300);
    }
  }, [props.activeImageIndex]);

  return (
    <div className="flex w-full flex-col gap-[16px] md:w-[55%] md:flex-row-reverse">
      {/* Main Image Slider */}
      <div
        ref={scrollRef}
        className="relative flex aspect-square w-full flex-1 animate-fade-in-up snap-x snap-mandatory overflow-x-auto overflow-y-hidden rounded-[var(--radius-xl)] bg-soft-cloud shadow-sm"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={(e) => {
          if (isProgrammaticScroll.current) {
            return;
          }
          const { currentTarget: target } = e;
          if (!(target instanceof HTMLDivElement)) {
            return;
          }
          const index = Math.round(target.scrollLeft / target.clientWidth);
          if (
            index !== props.activeImageIndex &&
            !Number.isNaN(index) &&
            index >= 0 &&
            index < props.images.length
          ) {
            props.onActiveImageChange(index);
          }
        }}
      >
        {props.images.length > 0 ? (
          props.images.map((img, index) => (
            <div
              key={img.id}
              className="relative flex aspect-square w-full shrink-0 snap-center items-center justify-center"
            >
              <Image
                src={img.imageUrl}
                alt={img.altText ?? props.productName}
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))
        ) : (
          <div className="flex h-full w-full shrink-0 items-center justify-center text-mute">
            Belum ada foto
          </div>
        )}
      </div>

      {/* Thumbnail Rail */}
      {props.images.length > 1 && (
        <div
          className="flex w-full shrink-0 animate-fade-in-up flex-row gap-[12px] overflow-x-auto pb-2 md:w-[80px] md:flex-col md:overflow-y-auto md:pb-0"
          style={{ animationDelay: '100ms' }}
        >
          {props.images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => {
                props.onActiveImageChange(index);
              }}
              className={`relative aspect-square w-[72px] shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-soft-cloud transition-all duration-300 ${props.activeImageIndex === index ? 'shadow-md ring-2 ring-primary ring-offset-2' : 'opacity-60 hover:scale-105 hover:opacity-100'}`}
            >
              <Image
                src={img.imageUrl}
                alt={img.altText ?? `Thumbnail ${index + 1}`}
                fill
                sizes="72px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type SizeSelectorProps = {
  uniqueSizes: string[];
  selectedVariant: { size: string; stock: number } | undefined;
  variants: { size: string; stock: number }[];
  onSelect: (size: string) => void;
};

function SizeSelector(props: SizeSelectorProps) {
  return (
    <div className="mb-[24px] flex flex-col gap-[12px]">
      <span className="text-body-strong text-ink">Pilih Ukuran</span>
      <div className="flex flex-wrap gap-[8px]">
        {props.uniqueSizes.map((size) => {
          const isSelected = props.selectedVariant?.size === size;
          const sizeStock = props.variants
            .filter((v) => v.size === size)
            .reduce((acc, v) => acc + v.stock, 0);
          const isOutOfStock = sizeStock === 0;

          return (
            <button
              key={size}
              type="button"
              disabled={isOutOfStock}
              data-selected={isSelected}
              onClick={() => {
                props.onSelect(size);
              }}
              className="size-pill"
            >
              {size}
            </button>
          );
        })}
      </div>
      {props.selectedVariant && (
        <p className="text-caption-md text-mute">Stok tersedia: {props.selectedVariant.stock}</p>
      )}
    </div>
  );
}

type QuantitySelectorProps = {
  quantity: number;
  minDisabled: boolean;
  maxDisabled: boolean;
  onChange: (diff: number) => void;
};

function QuantitySelector(props: QuantitySelectorProps) {
  return (
    <div className="mb-[28px] flex flex-col gap-[12px]">
      <span className="text-body-strong text-ink">Jumlah</span>
      <div className="qty-stepper w-[136px]">
        <button
          type="button"
          onClick={() => {
            props.onChange(-1);
          }}
          disabled={props.minDisabled}
        >
          &minus;
        </button>
        <span>{props.quantity}</span>
        <button
          type="button"
          onClick={() => {
            props.onChange(1);
          }}
          disabled={props.maxDisabled}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function ProductDetail(props: Props) {
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [orderStep, setOrderStep] = useState<'idle' | 'form' | 'confirmed'>('idle');
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string;
    totalAmount: number;
    whatsappUrl: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    notes?: string;
  } | null>(null);

  const selectedVariant = props.variants.find((v) => v.id === selectedVariantId);
  const hasVariants = props.variants.length > 0;
  const uniqueSizes = [...new Set(props.variants.map((v) => v.size))];

  const currentPrice = selectedVariant?.price ?? props.product.price;
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(currentPrice);

  function handleSizeSelect(size: string) {
    const variantMatch = props.variants.find((v) => v.size === size && v.stock > 0);
    if (variantMatch) {
      setSelectedVariantId(variantMatch.id);
      setQuantity(1);
    } else {
      const anyMatch = props.variants.find((v) => v.size === size);
      if (anyMatch) {
        setSelectedVariantId(anyMatch.id);
      }
    }
  }

  function handleQuantityChange(delta: number) {
    if (!selectedVariant) {
      return;
    }
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= selectedVariant.stock) {
      setQuantity(newQuantity);
    }
  }

  const isQtyPlusDisabled =
    !selectedVariant || (selectedVariant && quantity >= selectedVariant.stock);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[24px] px-[16px] py-[24px] md:flex-row md:gap-[56px] md:px-[40px] md:py-[48px]">
      {/* ── LEFT: Image Gallery ── */}
      <ImageGallery
        images={props.images}
        productName={props.product.name}
        activeImageIndex={activeImageIndex}
        onActiveImageChange={setActiveImageIndex}
      />

      {/* ── RIGHT: Product Info ── */}
      <div className="flex w-full flex-col md:w-[45%] md:py-[8px]">
        <button
          type="button"
          onClick={() => {
            router.back();
          }}
          className="text-caption-md mb-[20px] flex items-center gap-[4px] self-start text-mute transition-colors hover:text-ink"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </button>

        <h1
          className="text-heading-xl animate-fade-in-up leading-tight text-ink"
          style={{ animationDelay: '100ms' }}
        >
          {props.product.name}
        </h1>
        <p
          className="text-heading-lg mt-[12px] animate-fade-in-up font-semibold text-primary"
          style={{ animationDelay: '150ms' }}
        >
          {formattedPrice}
        </p>

        {/* Divider */}
        <div className="my-[24px] h-px w-full bg-hairline-soft" />

        {/* Size Selector */}
        {hasVariants && (
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <SizeSelector
              uniqueSizes={uniqueSizes}
              selectedVariant={selectedVariant}
              variants={props.variants}
              onSelect={handleSizeSelect}
            />
          </div>
        )}

        {/* Quantity */}
        <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <QuantitySelector
            quantity={quantity}
            minDisabled={quantity <= 1 || (hasVariants && !selectedVariant)}
            maxDisabled={isQtyPlusDisabled || (hasVariants && !selectedVariant)}
            onChange={handleQuantityChange}
          />
        </div>

        {/* CTA Flow */}
        <div className="mb-[40px] animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          {orderStep === 'idle' && (
            <button
              type="button"
              onClick={() => {
                if (hasVariants && !selectedVariantId) {
                  toast.error('Silakan pilih ukuran varian terlebih dahulu.');
                  return;
                }
                setOrderStep('form');
              }}
              className="button-primary flex w-full cursor-pointer items-center justify-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              Pesan Sekarang
            </button>
          )}

          {orderStep === 'form' && (
            <OrderForm
              productId={props.product.id}
              variantId={selectedVariantId}
              quantity={quantity}
              onCancel={() => {
                setOrderStep('idle');
              }}
              onSuccess={(data) => {
                setConfirmedOrder(data);
                setOrderStep('confirmed');
              }}
            />
          )}

          {orderStep === 'confirmed' && confirmedOrder && (
            <OrderConfirmation
              orderNumber={confirmedOrder.orderNumber}
              totalAmount={confirmedOrder.totalAmount}
              whatsappUrl={confirmedOrder.whatsappUrl}
              customerName={confirmedOrder.customerName}
              customerPhone={confirmedOrder.customerPhone}
              customerAddress={confirmedOrder.customerAddress}
              notes={confirmedOrder.notes}
              productName={props.product.name}
              selectedSize={selectedVariant?.size}
              selectedColor={selectedVariant?.color ?? undefined}
              quantity={quantity}
            />
          )}
        </div>

        {/* Description Disclosure */}
        <div className="border-t border-hairline-soft pt-[24px]">
          <h3 className="text-body-strong mb-[12px] text-ink">Detail Produk</h3>
          <div className="text-body-md leading-[1.7] text-charcoal">
            {props.product.description ?? 'Tidak ada deskripsi.'}
          </div>
        </div>
      </div>
    </div>
  );
}
