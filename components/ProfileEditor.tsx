'use client';

import React, { useState, useRef } from 'react';
import { X, Loader2, Upload, File as FileIcon, Trash2, Camera } from 'lucide-react';
import Image from 'next/image';

interface ProfileEditorProps {
  user: any;
  userData: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function ProfileEditor({ user, userData, onClose, onSave }: ProfileEditorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // Form state
  const [name, setName] = useState(userData?.name || '');
  const [companyName, setCompanyName] = useState(userData?.companyName || '');
  const [inn, setInn] = useState(userData?.inn || '');
  const [dateOfBirth, setDateOfBirth] = useState(userData?.dateOfBirth || '');
  const [address, setAddress] = useState(userData?.address || '');
  const [housingType, setHousingType] = useState(userData?.housingType || '');
  const [region, setRegion] = useState(userData?.region || '');
  
  // Arrays for files/categories
  const [documents, setDocuments] = useState<{name: string, url: string}[]>(userData?.documents || []);
  const [projects, setProjects] = useState<{name: string, url: string}[]>(userData?.projects || []);
  const [certificates, setCertificates] = useState<{name: string, url: string}[]>(userData?.certificates || []);
  const [categories, setCategories] = useState<string[]>(userData?.categories || []);
  const [photoURL, setPhotoURL] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const role = userData?.role;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate size (5MB for photo)
    if (file.size > 5 * 1024 * 1024) {
      setError('Фото слишком большое. Максимальный размер 5 МБ.');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Недопустимый формат фото. Разрешены JPG, PNG, WEBP.');
      return;
    }

    setError('');
    setUploadingPhoto(true);
    
    try {
      // Mock upload
      setTimeout(() => {
        const fakeUrl = URL.createObjectURL(file);
        setPhotoURL(fakeUrl);
        setUploadingPhoto(false);
      }, 1000);
    } catch (err) {
      console.error('Error initiating photo upload:', err);
      setError('Ошибка при загрузке фото.');
      setUploadingPhoto(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'documents' | 'projects' | 'certificates') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Файл слишком большой. Максимальный размер 10 МБ.');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Недопустимый формат файла. Разрешены JPG, PNG, PDF.');
      return;
    }

    setError('');
    setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
    
    // Mock upload
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
      
      if (progress >= 100) {
        clearInterval(interval);
        const fakeUrl = URL.createObjectURL(file);
        const newFile = { name: file.name, url: fakeUrl };
        
        if (type === 'documents') setDocuments(prev => [...prev, newFile]);
        if (type === 'projects') setProjects(prev => [...prev, newFile]);
        if (type === 'certificates') setCertificates(prev => [...prev, newFile]);
        
        setUploadProgress(prev => {
          const newProg = { ...prev };
          delete newProg[file.name];
          return newProg;
        });
      }
    }, 200);
  };

  const removeFile = (type: 'documents' | 'projects' | 'certificates', index: number) => {
    if (type === 'documents') setDocuments(prev => prev.filter((_, i) => i !== index));
    if (type === 'projects') setProjects(prev => prev.filter((_, i) => i !== index));
    if (type === 'certificates') setCertificates(prev => prev.filter((_, i) => i !== index));
  };

  const handleCategoryToggle = (category: string) => {
    setCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updateData: any = { name, region, photoURL };

      if (role === 'consumer') {
        updateData.dateOfBirth = dateOfBirth;
        updateData.inn = inn;
        updateData.address = address;
        updateData.housingType = housingType;
      } else if (role === 'developer') {
        updateData.companyName = companyName;
        updateData.inn = inn;
        updateData.documents = documents;
        updateData.projects = projects;
      } else if (role === 'supplier') {
        updateData.companyName = companyName;
        updateData.inn = inn;
        updateData.certificates = certificates;
        updateData.categories = categories;
      }

      // Clean up undefined/empty values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) delete updateData[key];
      });

      // Simulate API call
      setTimeout(() => {
        onSave(updateData);
        setLoading(false);
      }, 500);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError('Произошла ошибка при сохранении данных.');
      setLoading(false);
    }
  };

  const availableCategories = ['Стройматериалы', 'Сантехника', 'Электрика', 'Инструменты', 'Отделка', 'Мебель'];

  const renderFileList = (files: {name: string, url: string}[], type: 'documents' | 'projects' | 'certificates') => (
    <div className="space-y-2 mt-2">
      {files.map((file, idx) => (
        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
              {file.name}
            </a>
          </div>
          <button type="button" onClick={() => removeFile(type, idx)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl my-8">
        <div className="flex items-center justify-between border-b p-4 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-xl font-semibold">Редактирование профиля</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Profile Photo */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-6 border-b border-slate-100">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden border-4 border-white shadow-md relative">
                  {photoURL ? (
                    <Image src={photoURL} alt="Avatar" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-3xl font-bold">
                      {name.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-primary-dark transition-colors">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                </label>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-medium text-secondary">Фото профиля</h3>
                <p className="text-sm text-slate-500 mt-1">JPG, PNG или WEBP. Максимум 5 МБ.</p>
              </div>
            </div>

            {/* Common Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Регион</label>
                <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Например, Бишкек" />
              </div>
            </div>

            {/* Consumer Fields */}
            {role === 'consumer' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Дата рождения</label>
                    <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ИНН (опционально)</label>
                    <input type="text" value={inn} onChange={(e) => setInn(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Тип жилья</label>
                  <select value={housingType} onChange={(e) => setHousingType(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                    <option value="">Не выбран</option>
                    <option value="Квартира">Квартира</option>
                    <option value="Частный дом">Частный дом</option>
                    <option value="Коммерческое помещение">Коммерческое помещение</option>
                  </select>
                </div>
              </>
            )}

            {/* Developer & Supplier Common Fields */}
            {(role === 'developer' || role === 'supplier') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название компании</label>
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ИНН</label>
                  <input type="text" value={inn} onChange={(e) => setInn(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            )}

            {/* Developer Specific Fields */}
            {role === 'developer' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Документы компании (PDF, JPG, PNG)</label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium">
                      <Upload className="w-4 h-4" /> Загрузить документ
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'documents')} />
                    </label>
                  </div>
                  {renderFileList(documents, 'documents')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Проекты (Фотографии, PDF)</label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium">
                      <Upload className="w-4 h-4" /> Загрузить проект
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'projects')} />
                    </label>
                  </div>
                  {renderFileList(projects, 'projects')}
                </div>
              </div>
            )}

            {/* Supplier Specific Fields */}
            {role === 'supplier' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Категории деятельности (можно выбрать несколько)</label>
                  <div className="flex flex-wrap gap-2">
                    {availableCategories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategoryToggle(cat)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          categories.includes(cat) 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Сертификаты (PDF, JPG, PNG)</label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium">
                      <Upload className="w-4 h-4" /> Загрузить сертификат
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'certificates')} />
                    </label>
                  </div>
                  {renderFileList(certificates, 'certificates')}
                </div>
              </div>
            )}

            {/* Upload Progress Indicators */}
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="text-sm text-blue-600 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Загрузка {fileName}: {Math.round(progress)}%
              </div>
            ))}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="pt-4 border-t flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                Отмена
              </button>
              <button type="submit" disabled={loading || Object.keys(uploadProgress).length > 0} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
