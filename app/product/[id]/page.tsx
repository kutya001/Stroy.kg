import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, BadgeCheck, MapPin, Megaphone, Package, Tag, ChevronRight } from 'lucide-react';
import { getProductById as getProductByIdMock, getProductsBySupplierId as getProductsBySupplierIdMock } from '@/lib/mockDb';
import { createClient } from '@/lib/supabase/server';
import { getProductById as getProductByIdDb, getProductsBySupplierId as getProductsBySupplierIdDb } from '@/lib/queries';
import ProductActions from './ProductActions';

const USE_SUPABASE = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function fetchProduct(id: string) {
  if (USE_SUPABASE) {
    const supabase = await createClient();
    return getProductByIdDb(supabase, id);
  }
  return getProductByIdMock(id);
}

async function fetchSupplierProducts(supplierId: string) {
  if (USE_SUPABASE) {
    const supabase = await createClient();
    return getProductsBySupplierIdDb(supabase, supplierId);
  }
  return getProductsBySupplierIdMock(supplierId);
}

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) return { title: 'Товар не найден | Stroy.kg' };

  return {
    title: `${product.name} купить в Бишкеке | Stroy.kg`,
    description: `Закажите ${product.name} за ${product.price.toLocaleString()} KGS от ${product.supplierName}. ${product.description.substring(0, 120)}`,
    openGraph: {
      title: product.name,
      description: product.description.substring(0, 200),
      images: [product.image],
    },
    alternates: {
      canonical: `https://stroy.kg/product/${product.id}`,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12 text-center">
        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-heading font-bold text-secondary mb-2">Товар не найден</h1>
        <p className="text-slate-500 mb-6">Возможно, он был удалён или снят с публикации.</p>
        <Link href="/catalog" className="text-primary font-bold hover:underline">← Вернуться в каталог</Link>
      </main>
    );
  }

  const allSupplierProducts = await fetchSupplierProducts(product.supplierId);
  const otherProducts = allSupplierProducts
    .filter(op => op.id !== product.id && op.isPublished)
    .slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description,
    offers: {
      '@type': 'Offer',
      url: `https://stroy.kg/product/${product.id}`,
      priceCurrency: 'KGS',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: product.supplierName,
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: 10,
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Каталог', item: 'https://stroy.kg/catalog' },
      { '@type': 'ListItem', position: 2, name: product.nomenclatureCategory, item: `https://stroy.kg/catalog?category=${encodeURIComponent(product.nomenclatureCategory)}` },
      { '@type': 'ListItem', position: 3, name: product.nomenclatureType },
      { '@type': 'ListItem', position: 4, name: product.name },
    ],
  };

  return (
    <main className="max-w-5xl mx-auto px-4 pb-24 pt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, '\\u003c') }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/catalog" className="flex items-center gap-1 text-primary hover:underline font-medium">
          <ArrowLeft className="w-4 h-4" /> Каталог
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-400">{product.nomenclatureCategory}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-400">{product.nomenclatureType}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Image + Badges */}
        <div className="lg:col-span-3">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 mb-4">
            <Image src={product.image} alt={product.name} fill priority className="object-cover" />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isPromoted && (
                <span className="px-3 py-1 bg-accent text-secondary text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm">
                  <Megaphone className="w-3 h-3" /> РЕКОМЕНДУЕМ
                </span>
              )}
              {product.isTop && (
                <span className="px-3 py-1 bg-success text-white text-xs font-bold rounded-lg shadow-sm">TOP</span>
              )}
              {product.isNew && (
                <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg shadow-sm">НОВИНКА</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
            <h3 className="font-heading font-bold text-secondary mb-3">Описание</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Characteristics */}
          {Object.keys(product.characteristics).length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
              <h3 className="font-heading font-bold text-secondary mb-4">Характеристики</h3>
              <div className="divide-y divide-slate-100">
                {Object.entries(product.characteristics).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-3">
                    <span className="text-sm text-slate-500">{key}</span>
                    <span className="text-sm font-semibold text-secondary">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Info + Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Price Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
              <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">{product.nomenclatureCategory}</span>
              <span>→</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">{product.nomenclatureType}</span>
              <span>→</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">{product.groupName}</span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-secondary mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="font-bold text-sm">{product.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 text-sm">
                <MapPin className="w-4 h-4" /> {product.region}
              </div>
              {product.constructionStage && (
                <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-xs font-medium">{product.constructionStage}</span>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 mb-4">
              <div className="text-3xl font-heading font-bold text-primary">
                {product.price.toLocaleString()} <span className="text-lg text-slate-500">KGS / {product.unit}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {product.tags.map(tag => (
                <span key={tag} className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs text-slate-600 font-medium flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>

            {/* Action Buttons (Client Component) */}
            <ProductActions productId={product.id} />
          </div>

          {/* Supplier Card */}
          <Link href={`/supplier/${product.supplierId}`} className="block bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {product.supplierName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-secondary truncate">{product.supplierName}</h4>
                  <BadgeCheck className="w-4 h-4 text-success shrink-0" />
                </div>
                <p className="text-xs text-slate-500">Верифицированный поставщик</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="text-lg font-bold text-secondary">{otherProducts.length + 1}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Товаров</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 text-accent fill-accent" />
                  <span className="text-lg font-bold text-secondary">{product.rating}</span>
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Рейтинг</div>
              </div>
            </div>
            <p className="text-xs text-primary font-medium mt-3 text-center group-hover:underline">Открыть страницу поставщика →</p>
          </Link>
        </div>
      </div>

      {/* Other Products from this Supplier */}
      {otherProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-heading font-bold text-secondary mb-6">Другие товары от {product.supplierName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherProducts.map((op) => (
              <Link key={op.id} href={`/product/${op.id}`} className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all border border-slate-100">
                <div className="relative h-40 overflow-hidden">
                  <Image src={op.image} alt={op.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-secondary text-sm mb-1">{op.name}</h4>
                  <p className="text-xs text-slate-500 mb-2">{op.groupName}</p>
                  <p className="text-lg font-bold text-primary">{op.price.toLocaleString()} KGS / {op.unit}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
