'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = {
  material: ['Бетон и ЖБИ', 'Арматура и металл', 'Кирпич и блоки', 'Лес и пиломатериалы', 'Кровля и фасад', 'Отделочные материалы', 'Инженерные системы', 'Окна и двери'],
  service: ['Проектирование', 'Земляные работы', 'Фундаментные работы', 'Монолитные работы', 'Кладочные работы', 'Кровельные работы', 'Отделка', 'Электромонтаж', 'Сантехника']
};

export default function EditProductPage() {
  const { id } = useParams();
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [type, setType] = useState<'material' | 'service'>('material');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(CATEGORIES.material[0]);
  const [isActive, setIsActive] = useState(true);

  // Image states
  const [images, setImages] = useState<{url: string, file?: File}[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!authLoading && (!userData || userData.verificationStatus !== 'verified')) {
      router.push('/profile/products');
    }
  }, [userData, authLoading, router]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!user || !id) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('supplierId', user.id)
        .single();

      if (error || !data) {
        console.error('Error fetching product:', error);
        alert('Товар не найден или у вас нет прав на редактирование');
        router.push('/profile/products');
        return;
      }

      setName(data.name);
      setDescription(data.description || '');
      setPrice(data.price.toString());
      setType(data.type);
      setCategory(data.category);
      setIsActive(data.isActive);
      setImages(data.images ? data.images.map((url: string) => ({ url })) : []);

      setFetching(false);
    };

    fetchProduct();
  }, [user, id, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    setUploadingImage(true);

    try {
      const newImages: {url: string, file: File}[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          alert(`Файл ${file.name} слишком большой. Максимум 5 МБ.`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/products/${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('user_files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('user_files')
          .getPublicUrl(fileName);

        newImages.push({ url: publicUrl, file });
      }

      setImages(prev => [...prev, ...newImages]);
    } catch (err) {
      console.error('Error uploading images:', err);
      alert('Ошибка при загрузке изображений.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;

    setLoading(true);

    try {
      const updatedProduct = {
        name,
        description,
        price: parseFloat(price),
        type,
        category,
        isActive,
        images: images.map(img => img.url)
      };

      const { error } = await supabase
        .from('products')
        .update(updatedProduct)
        .eq('id', id);

      if (error) throw error;

      alert('Изменения сохранены');
      router.push('/profile/products');
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Ошибка при обновлении товара/услуги');
      setLoading(false);
    }
  };

  if (authLoading || fetching || !userData) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24 space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link href="/profile/products" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary">Редактировать позицию</h1>
          <p className="text-slate-500 text-sm">Обновление информации в каталоге</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-8">

        {/* Type Toggle */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setType('material')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${type === 'material' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Материал
          </button>
          <button
            type="button"
            onClick={() => setType('service')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${type === 'service' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Услуга
          </button>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Название*</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Например: Цемент М400" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Категория*</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none">
                {CATEGORIES[type].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Цена (сом)*</label>
              <input required value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Описание</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Подробное описание товара или услуги..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none resize-none"></textarea>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">Изображения (макс. 5МБ)</label>
          <div className="flex flex-wrap gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-24 h-24 rounded-xl border border-slate-200 overflow-hidden group">
                <img src={img.url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {images.length < 5 && (
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 hover:border-primary/50 transition-colors group relative">
                {uploadingImage ? (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                    <span className="text-[10px] text-slate-500 font-medium">Добавить</span>
                  </>
                )}
                <input type="file" multiple accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
              </label>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="flex items-center gap-3 py-4 border-t border-slate-100">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
          <div>
            <span className="text-sm font-semibold text-slate-700 block">Показывать в каталоге</span>
            <span className="text-xs text-slate-500">Скрытые товары не будут видны клиентам</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button disabled={loading} type="submit" className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Сохранить изменения'}
          </button>
        </div>

      </form>
    </main>
  );
}
