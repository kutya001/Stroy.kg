import Image from 'next/image';
import { Star, MessageSquare, BadgeCheck, Phone, FileText } from 'lucide-react';

interface Product {
  id: string;
  type: 'material' | 'service';
  name: string;
  category: string;
  price: number;
  unit?: string;
  minOrder?: number;
  description?: string;
  images?: string[];
  supplierName: string;
  supplierRating: number;
  supplierReviewCount: number;
  supplierVerified: boolean;
  region: string;
  isPromoted?: boolean;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col border border-slate-100 relative">
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            Нет фото
          </div>
        )}

        {product.isPromoted && (
          <div className="absolute top-4 left-4">
            <span className="px-2 py-1 bg-accent text-secondary text-[10px] font-bold rounded">РЕКОМЕНДУЕМ</span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-heading text-xl font-bold text-secondary leading-tight truncate pr-2">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-1 mb-3">
          <span className="text-2xl font-bold text-primary">{product.price.toLocaleString()} ₸</span>
          {product.unit && <span className="text-sm text-slate-500">/ {product.unit}</span>}
        </div>

        {product.minOrder && product.minOrder > 0 && (
          <p className="text-xs text-slate-500 mb-3">Мин. заказ: <span className="font-medium text-secondary">{product.minOrder} {product.unit || 'шт'}</span></p>
        )}

        <div className="w-full h-px bg-slate-100 my-3"></div>

        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-1 overflow-hidden">
            <span className="text-sm font-bold text-secondary truncate">{product.supplierName}</span>
            {product.supplierVerified && <BadgeCheck className="w-4 h-4 text-success shrink-0" />}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3.5 h-3.5 text-accent fill-accent" />
            <span className="text-xs font-bold">{product.supplierRating.toFixed(1)}</span>
            <span className="text-xs text-slate-400">({product.supplierReviewCount})</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-4 truncate">{product.region}</p>

        <div className="mt-auto flex items-center gap-2">
          <button className="flex-1 bg-primary/10 text-primary h-10 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-colors">
            Подробнее
          </button>
          <button className="w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors">
            <MessageSquare className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}
