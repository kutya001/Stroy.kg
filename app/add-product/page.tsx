'use client';

import { Building2, Wrench, Camera, Save, Package, ChevronRight, Shield, ToggleLeft, ToggleRight, Megaphone } from 'lucide-react';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { createMockProduct, nomenclatureGroups, constructionStages, type NomenclatureCategory, type NomenclatureType } from '@/lib/mockDb';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const [category, setCategory] = useState<NomenclatureCategory>('Товар');
  const [nomType, setNomType] = useState<NomenclatureType | ''>('');
  const [groupId, setGroupId] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('шт');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isPromoted, setIsPromoted] = useState(false);
  const [promotionBudget, setPromotionBudget] = useState(1);
  const [charValues, setCharValues] = useState<Record<string, string>>({});

  if (!user || (userData?.role !== 'supplier' && userData?.role !== 'developer' && userData?.role !== 'admin')) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-24 text-center">
        <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-secondary mb-4">Доступ запрещен</h1>
        <p className="text-slate-600 mb-6">Только поставщики могут добавлять товары и услуги.</p>
        <Link href="/" className="text-primary font-bold hover:underline">Вернуться на главную</Link>
      </div>
    );
  }

  // Filtered types based on selected category
  const availableTypes = useMemo(() => {
    const types = new Set<NomenclatureType>();
    nomenclatureGroups.filter(g => g.category === category).forEach(g => types.add(g.type));
    return Array.from(types);
  }, [category]);

  // Filtered groups based on selected type
  const availableGroups = useMemo(() => {
    if (!nomType) return [];
    return nomenclatureGroups.filter(g => g.category === category && g.type === nomType);
  }, [category, nomType]);

  // Selected group's characteristics
  const selectedGroup = useMemo(() => {
    return nomenclatureGroups.find(g => g.id === groupId);
  }, [groupId]);

  const handleCategoryChange = (cat: NomenclatureCategory) => {
    setCategory(cat);
    setNomType('');
    setGroupId('');
    setCharValues({});
  };

  const handleTypeChange = (type: NomenclatureType) => {
    setNomType(type);
    setGroupId('');
    setCharValues({});
  };

  const handleGroupChange = (gId: string) => {
    setGroupId(gId);
    setCharValues({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !description || !groupId) {
      alert('Заполните обязательные поля (наименование, группа, цена, описание)');
      return;
    }

    const group = nomenclatureGroups.find(g => g.id === groupId);
    createMockProduct({
      supplierId: user?.uid,
      supplierName: userData?.companyName || userData?.name || 'Поставщик',
      name,
      nomenclatureCategory: category,
      nomenclatureType: nomType as NomenclatureType,
      groupId,
      groupName: group?.name || '',
      description,
      price: Number(price) || 0,
      unit,
      region: 'Бишкек',
      characteristics: charValues,
      constructionStage: stage || undefined,
      isPublished,
      isPromoted,
      promotionBudget: isPromoted ? promotionBudget : 0,
      tags: [],
    });

    router.push('/catalog');
  };

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-heading font-bold text-secondary">Добавить товар или услугу</h1>
        <p className="text-slate-600">Разместите ваше предложение в каталоге по номенклатуре.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8">
        {/* Step 1: Category */}
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
            <Building2 className="w-4 h-4" /> 1. Категория
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => handleCategoryChange('Товар')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${category === 'Товар' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-slate-50 hover:border-slate-200 text-slate-600'}`}>
              <Package className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Товар</span>
            </button>
            <button type="button" onClick={() => handleCategoryChange('Услуга')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${category === 'Услуга' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-slate-50 hover:border-slate-200 text-slate-600'}`}>
              <Wrench className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Услуга</span>
            </button>
          </div>
        </div>

        {/* Step 2: Type */}
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
            <ChevronRight className="w-4 h-4" /> 2. Вид
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTypes.map(t => (
              <button key={t} type="button" onClick={() => handleTypeChange(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${nomType === t ? 'bg-primary text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Group */}
        {nomType && (
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
              <ChevronRight className="w-4 h-4" /> 3. Группа*
            </label>
            <div className="flex flex-wrap gap-2">
              {availableGroups.map(g => (
                <button key={g.id} type="button" onClick={() => handleGroupChange(g.id)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${groupId === g.id ? 'bg-secondary text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Characteristics (dynamic) */}
        {selectedGroup && selectedGroup.characteristics.length > 0 && (
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
              <ChevronRight className="w-4 h-4" /> 4. Характеристики ({selectedGroup.name})
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedGroup.characteristics.map(ch => (
                <div key={ch} className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 px-1">{ch}</label>
                  <input
                    type="text"
                    value={charValues[ch] || ''}
                    onChange={(e) => setCharValues(prev => ({ ...prev, [ch]: e.target.value }))}
                    placeholder={ch}
                    className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Name & details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 px-1">Наименование*</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Напр: Кирпич жженый М150" className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 px-1">Цена (KGS)*</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="12" className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 px-1">Единица измерения*</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-700">
              <option value="шт">шт</option>
              <option value="м³">м³</option>
              <option value="тонн">тонн</option>
              <option value="м²">м²</option>
              <option value="услуга">услуга</option>
              <option value="час">час</option>
              <option value="проект">проект</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 px-1">Этап строительства</label>
            <select value={stage} onChange={(e) => setStage(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-700">
              <option value="">Не привязан</option>
              {constructionStages.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 px-1">Описание*</label>
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Опишите характеристики товара, условия доставки..." className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all resize-none outline-none"></textarea>
        </div>

        {/* Photos */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 px-1">Фотографии товара</label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            <div className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 transition-colors group">
              <Camera className="w-6 h-6 text-slate-400 group-hover:text-primary" />
              <span className="text-[10px] text-slate-500 font-medium">Добавить</span>
            </div>
          </div>
        </div>

        {/* Publish & Promote toggles */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-700">Опубликовать на доску</span>
              <p className="text-xs text-slate-500">Товар будет виден покупателям в каталоге</p>
            </div>
            <button type="button" onClick={() => setIsPublished(!isPublished)} className="text-primary">
              {isPublished ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-400" />}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-1"><Megaphone className="w-4 h-4" /> Продвижение</span>
              <p className="text-xs text-slate-500">Рекламный бюджет 1–20 сом/день</p>
            </div>
            <button type="button" onClick={() => setIsPromoted(!isPromoted)} className="text-primary">
              {isPromoted ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-400" />}
            </button>
          </div>
          {isPromoted && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Бюджет: <span className="font-bold text-secondary">{promotionBudget} сом/день</span></span>
              </div>
              <input type="range" min={1} max={20} value={promotionBudget} onChange={(e) => setPromotionBudget(Number(e.target.value))} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-slate-400">
                <span>1 сом</span>
                <span>20 сом</span>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button type="submit" className="w-full bg-primary text-white font-heading font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark active:scale-95 transition-all flex items-center justify-center gap-2">
          <Save className="w-5 h-5" />
          Добавить в каталог
        </button>
      </form>
    </main>
  );
}
