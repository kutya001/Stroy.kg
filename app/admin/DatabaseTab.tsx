'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import { Loader2, Plus, Pencil, Trash2, X, Save, Search, ChevronLeft, ChevronDown, Table2, GitBranch, AlertTriangle, RefreshCw } from 'lucide-react';

// ============================================
// Schema definitions for all tables
// ============================================

type TableName = 'profiles' | 'products' | 'requests' | 'notifications' | 'chats' | 'messages' | 'nomenclature_groups';

interface ColumnDef {
  name: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'json' | 'array' | 'datetime' | 'uuid';
  options?: string[];
  required?: boolean;
  readOnly?: boolean;
  pk?: boolean;
}

interface TableSchema {
  name: TableName;
  label: string;
  columns: ColumnDef[];
  orderBy?: string;
  fk?: { column: string; refTable: TableName; refColumn: string }[];
}

const TABLES: TableSchema[] = [
  {
    name: 'profiles',
    label: 'Профили',
    orderBy: 'created_at',
    columns: [
      { name: 'id', label: 'ID', type: 'uuid', pk: true, readOnly: true },
      { name: 'name', label: 'Имя', type: 'text', required: true },
      { name: 'phone', label: 'Телефон', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'role', label: 'Роль', type: 'select', options: ['consumer', 'supplier', 'developer', 'admin'] },
      { name: 'onboarding_completed', label: 'Onboarding', type: 'boolean' },
      { name: 'created_at', label: 'Создан', type: 'datetime', readOnly: true },
      { name: 'verification_level', label: 'Верификация', type: 'number' },
      { name: 'phone_verified', label: 'Тел. подтв.', type: 'boolean' },
      { name: 'email_verified', label: 'Email подтв.', type: 'boolean' },
      { name: 'inn', label: 'ИНН', type: 'text' },
      { name: 'passport_scan', label: 'Скан паспорта', type: 'text' },
      { name: 'company_name', label: 'Компания', type: 'text' },
      { name: 'licenses', label: 'Лицензии', type: 'array' },
      { name: 'certificates', label: 'Сертификаты', type: 'array' },
      { name: 'subscription', label: 'Подписка', type: 'select', options: ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'] },
      { name: 'page_views', label: 'Просмотры', type: 'number' },
      { name: 'chat_requests', label: 'Чат-запросы', type: 'number' },
      { name: 'completed_orders', label: 'Заказы', type: 'number' },
      { name: 'revenue', label: 'Выручка', type: 'number' },
      { name: 'daily_ad_budget', label: 'Рекл. бюджет', type: 'number' },
      { name: 'is_promoted', label: 'Продвижение', type: 'boolean' },
    ],
    fk: [],
  },
  {
    name: 'products',
    label: 'Товары',
    orderBy: 'created_at',
    columns: [
      { name: 'id', label: 'ID', type: 'text', pk: true, readOnly: true },
      { name: 'supplier_id', label: 'ID поставщика', type: 'uuid', required: true },
      { name: 'supplier_name', label: 'Поставщик', type: 'text' },
      { name: 'name', label: 'Название', type: 'text', required: true },
      { name: 'nomenclature_category', label: 'Категория', type: 'select', options: ['Товар', 'Услуга'] },
      { name: 'nomenclature_type', label: 'Тип', type: 'text' },
      { name: 'group_id', label: 'ID группы', type: 'text' },
      { name: 'group_name', label: 'Группа', type: 'text' },
      { name: 'description', label: 'Описание', type: 'text' },
      { name: 'price', label: 'Цена', type: 'number' },
      { name: 'unit', label: 'Ед.', type: 'text' },
      { name: 'region', label: 'Регион', type: 'text' },
      { name: 'rating', label: 'Рейтинг', type: 'number' },
      { name: 'image', label: 'Изображение', type: 'text' },
      { name: 'tags', label: 'Теги', type: 'array' },
      { name: 'characteristics', label: 'Характеристики', type: 'json' },
      { name: 'is_top', label: 'Топ', type: 'boolean' },
      { name: 'is_new', label: 'Новый', type: 'boolean' },
      { name: 'is_published', label: 'Опубликован', type: 'boolean' },
      { name: 'is_promoted', label: 'Реклама', type: 'boolean' },
      { name: 'promotion_budget', label: 'Бюджет рекл.', type: 'number' },
      { name: 'construction_stage', label: 'Этап стройки', type: 'text' },
      { name: 'created_at', label: 'Создан', type: 'datetime', readOnly: true },
    ],
    fk: [
      { column: 'supplier_id', refTable: 'profiles', refColumn: 'id' },
      { column: 'group_id', refTable: 'nomenclature_groups', refColumn: 'id' },
    ],
  },
  {
    name: 'requests',
    label: 'Заявки',
    orderBy: 'created_at',
    columns: [
      { name: 'id', label: 'ID', type: 'text', pk: true, readOnly: true },
      { name: 'author_id', label: 'ID автора', type: 'uuid', required: true },
      { name: 'author_name', label: 'Автор', type: 'text' },
      { name: 'assigned_supplier_id', label: 'ID поставщика', type: 'uuid' },
      { name: 'assigned_supplier_name', label: 'Поставщик', type: 'text' },
      { name: 'title', label: 'Заголовок', type: 'text', required: true },
      { name: 'category', label: 'Категория', type: 'select', options: ['Товар', 'Услуга'] },
      { name: 'type', label: 'Тип', type: 'text' },
      { name: 'group_id', label: 'ID группы', type: 'text' },
      { name: 'group_name', label: 'Группа', type: 'text' },
      { name: 'characteristics', label: 'Характеристики', type: 'json' },
      { name: 'linked_product_id', label: 'ID связ. товара', type: 'text' },
      { name: 'description', label: 'Описание', type: 'text' },
      { name: 'budget', label: 'Бюджет', type: 'number' },
      { name: 'quantity', label: 'Кол-во', type: 'number' },
      { name: 'unit', label: 'Ед.', type: 'text' },
      { name: 'region', label: 'Регион', type: 'text' },
      { name: 'status', label: 'Статус', type: 'select', options: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'] },
      { name: 'created_at', label: 'Создан', type: 'datetime', readOnly: true },
      { name: 'responses_count', label: 'Ответов', type: 'number' },
    ],
    fk: [
      { column: 'author_id', refTable: 'profiles', refColumn: 'id' },
      { column: 'assigned_supplier_id', refTable: 'profiles', refColumn: 'id' },
      { column: 'linked_product_id', refTable: 'products', refColumn: 'id' },
    ],
  },
  {
    name: 'notifications',
    label: 'Уведомления',
    orderBy: 'date',
    columns: [
      { name: 'id', label: 'ID', type: 'text', pk: true, readOnly: true },
      { name: 'user_id', label: 'ID пользователя', type: 'uuid', required: true },
      { name: 'text', label: 'Текст', type: 'text', required: true },
      { name: 'date', label: 'Дата', type: 'datetime', readOnly: true },
      { name: 'read', label: 'Прочитано', type: 'boolean' },
      { name: 'type', label: 'Тип', type: 'select', options: ['request', 'response', 'system', 'verification', 'chat'] },
      { name: 'link', label: 'Ссылка', type: 'text' },
    ],
    fk: [
      { column: 'user_id', refTable: 'profiles', refColumn: 'id' },
    ],
  },
  {
    name: 'chats',
    label: 'Чаты',
    orderBy: 'updated_at',
    columns: [
      { name: 'id', label: 'ID', type: 'text', pk: true, readOnly: true },
      { name: 'participants', label: 'Участники', type: 'array', required: true },
      { name: 'last_message', label: 'Посл. сообщение', type: 'text' },
      { name: 'updated_at', label: 'Обновлён', type: 'datetime' },
      { name: 'unread_count', label: 'Непрочитанных', type: 'number' },
    ],
    fk: [],
  },
  {
    name: 'messages',
    label: 'Сообщения',
    orderBy: 'timestamp',
    columns: [
      { name: 'id', label: 'ID', type: 'text', pk: true, readOnly: true },
      { name: 'chat_id', label: 'ID чата', type: 'text', required: true },
      { name: 'sender_id', label: 'ID отправителя', type: 'uuid', required: true },
      { name: 'text', label: 'Текст', type: 'text', required: true },
      { name: 'timestamp', label: 'Время', type: 'datetime', readOnly: true },
    ],
    fk: [
      { column: 'chat_id', refTable: 'chats', refColumn: 'id' },
      { column: 'sender_id', refTable: 'profiles', refColumn: 'id' },
    ],
  },
  {
    name: 'nomenclature_groups',
    label: 'Номенклатурные группы',
    columns: [
      { name: 'id', label: 'ID', type: 'text', pk: true, readOnly: true },
      { name: 'category', label: 'Категория', type: 'select', options: ['Товар', 'Услуга'], required: true },
      { name: 'type', label: 'Тип', type: 'text', required: true },
      { name: 'name', label: 'Название', type: 'text', required: true },
      { name: 'characteristics', label: 'Характеристики', type: 'array' },
    ],
    fk: [],
  },
];

// ============================================
// ER Diagram data
// ============================================

interface ERNode {
  table: string;
  label: string;
  x: number;
  y: number;
  columns: { name: string; pk?: boolean; fk?: boolean }[];
}

interface EREdge {
  from: string;
  fromCol: string;
  to: string;
  toCol: string;
}

function buildERData(): { nodes: ERNode[]; edges: EREdge[] } {
  const positions: Record<string, { x: number; y: number }> = {
    profiles:             { x: 400, y: 40 },
    products:             { x: 60,  y: 280 },
    requests:             { x: 400, y: 340 },
    notifications:        { x: 740, y: 280 },
    chats:                { x: 740, y: 40 },
    messages:             { x: 960, y: 180 },
    nomenclature_groups:  { x: 60,  y: 60 },
  };

  const nodes: ERNode[] = TABLES.map(t => ({
    table: t.name,
    label: t.label,
    x: positions[t.name]?.x ?? 0,
    y: positions[t.name]?.y ?? 0,
    columns: t.columns.slice(0, 6).map(c => ({
      name: c.name,
      pk: c.pk,
      fk: t.fk?.some(f => f.column === c.name),
    })),
  }));

  const edges: EREdge[] = [];
  TABLES.forEach(t => {
    t.fk?.forEach(f => {
      edges.push({ from: t.name, fromCol: f.column, to: f.refTable, toCol: f.refColumn });
    });
  });

  return { nodes, edges };
}

// ============================================
// ER Diagram Canvas Component
// ============================================

function ERDiagramCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<ERNode[]>([]);
  const [edges, setEdges] = useState<EREdge[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const { nodes: n, edges: e } = buildERData();
    setNodes(n);
    setEdges(e);
  }, []);

  const NODE_W = 220;
  const ROW_H = 22;
  const HEADER_H = 32;

  const getNodeHeight = (node: ERNode) => HEADER_H + node.columns.length * ROW_H + 8;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(scale, scale);

    // Draw edges
    edges.forEach(e => {
      const fromNode = nodes.find(n => n.table === e.from);
      const toNode = nodes.find(n => n.table === e.to);
      if (!fromNode || !toNode) return;

      const fromIdx = fromNode.columns.findIndex(c => c.name === e.fromCol);
      const toIdx = toNode.columns.findIndex(c => c.name === e.toCol);

      const fx = fromNode.x + NODE_W;
      const fy = fromNode.y + HEADER_H + (fromIdx >= 0 ? fromIdx : 0) * ROW_H + ROW_H / 2;
      const tx = toNode.x;
      const ty = toNode.y + HEADER_H + (toIdx >= 0 ? toIdx : 0) * ROW_H + ROW_H / 2;

      ctx.beginPath();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      const cpx = (fx + tx) / 2;
      ctx.moveTo(fx, fy);
      ctx.bezierCurveTo(cpx, fy, cpx, ty, tx, ty);
      ctx.stroke();

      // Arrow
      const arrowSize = 6;
      const angle = Math.atan2(ty - (ty + ty) / 2, tx - cpx);
      ctx.beginPath();
      ctx.fillStyle = '#94a3b8';
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - arrowSize * Math.cos(angle - 0.4), ty - arrowSize * Math.sin(angle - 0.4));
      ctx.lineTo(tx - arrowSize * Math.cos(angle + 0.4), ty - arrowSize * Math.sin(angle + 0.4));
      ctx.fill();
    });

    // Draw nodes
    nodes.forEach(node => {
      const h = getNodeHeight(node);

      // Shadow
      ctx.shadowColor = 'rgba(0,0,0,0.08)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;

      // Card
      ctx.beginPath();
      ctx.roundRect(node.x, node.y, NODE_W, h, 10);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Header
      ctx.beginPath();
      ctx.roundRect(node.x, node.y, NODE_W, HEADER_H, [10, 10, 0, 0]);
      ctx.fillStyle = '#f97316';
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x + 12, node.y + HEADER_H / 2);

      // Columns
      node.columns.forEach((col, i) => {
        const cy = node.y + HEADER_H + i * ROW_H + ROW_H / 2;

        if (i % 2 === 0) {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(node.x + 1, node.y + HEADER_H + i * ROW_H, NODE_W - 2, ROW_H);
        }

        // PK / FK icons
        ctx.font = 'bold 10px system-ui, sans-serif';
        if (col.pk) {
          ctx.fillStyle = '#f59e0b';
          ctx.fillText('PK', node.x + 8, cy);
        } else if (col.fk) {
          ctx.fillStyle = '#3b82f6';
          ctx.fillText('FK', node.x + 8, cy);
        }

        ctx.font = '12px system-ui, sans-serif';
        ctx.fillStyle = '#334155';
        ctx.fillText(col.name, node.x + 32, cy);
      });
    });

    ctx.restore();
  }, [nodes, edges, pan, scale]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => draw());
    observer.observe(container);
    return () => observer.disconnect();
  }, [draw]);

  const screenToCanvas = (sx: number, sy: number) => {
    return { x: (sx - pan.x) / scale, y: (sy - pan.y) / scale };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { x, y } = screenToCanvas(mx, my);

    // Check if clicked on a node
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const h = getNodeHeight(n);
      if (x >= n.x && x <= n.x + NODE_W && y >= n.y && y <= n.y + h) {
        setDragging(n.table);
        setDragOffset({ x: x - n.x, y: y - n.y });
        return;
      }
    }
    // Start panning
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const { x, y } = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
      setNodes(prev => prev.map(n => n.table === dragging ? { ...n, x: x - dragOffset.x, y: y - dragOffset.y } : n));
    } else if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.3, Math.min(3, scale * delta));
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    // Zoom towards cursor
    setPan(prev => ({
      x: mx - (mx - prev.x) * (newScale / scale),
      y: my - (my - prev.y) * (newScale / scale),
    }));
    setScale(newScale);
  };

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      <div className="absolute top-3 right-3 flex gap-1">
        <button onClick={() => setScale(s => Math.min(3, s * 1.2))} className="w-8 h-8 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center">+</button>
        <button onClick={() => setScale(s => Math.max(0.3, s / 1.2))} className="w-8 h-8 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center">−</button>
        <button onClick={() => { setScale(1); setPan({ x: 0, y: 0 }); }} className="h-8 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center">Сброс</button>
      </div>
      <div className="absolute bottom-3 left-3 flex gap-3 text-[10px] font-bold text-slate-400">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-400 rounded-sm inline-block" /> PK</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-sm inline-block" /> FK</span>
        <span>Масштаб: {Math.round(scale * 100)}%</span>
      </div>
    </div>
  );
}

// ============================================
// Cell Editor
// ============================================

function CellEditor({ col, value, onChange }: { col: ColumnDef; value: unknown; onChange: (v: unknown) => void }) {
  const base = 'w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20';

  if (col.readOnly) {
    return <span className="text-sm text-slate-500 truncate block">{formatValue(col, value)}</span>;
  }

  switch (col.type) {
    case 'boolean':
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} className="rounded accent-primary" />
          <span className="text-sm">{value ? 'Да' : 'Нет'}</span>
        </label>
      );
    case 'select':
      return (
        <select value={String(value ?? '')} onChange={e => onChange(e.target.value)} className={base}>
          <option value="">—</option>
          {col.options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    case 'number':
      return <input type="number" value={value as number ?? ''} onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))} className={base} />;
    case 'json':
      return <textarea value={typeof value === 'string' ? value : JSON.stringify(value ?? {}, null, 2)} onChange={e => { try { onChange(JSON.parse(e.target.value)); } catch { onChange(e.target.value); } }} className={`${base} min-h-[60px] font-mono text-xs`} />;
    case 'array':
      return <input type="text" value={Array.isArray(value) ? value.join(', ') : String(value ?? '')} onChange={e => onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="через запятую" className={base} />;
    default:
      return <input type="text" value={String(value ?? '')} onChange={e => onChange(e.target.value)} className={base} />;
  }
}

function formatValue(col: ColumnDef, value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (col.type === 'boolean') return value ? 'Да' : 'Нет';
  if (col.type === 'datetime') {
    try { return new Date(value as string).toLocaleString('ru-RU'); } catch { return String(value); }
  }
  if (col.type === 'json') return JSON.stringify(value).slice(0, 80);
  if (col.type === 'array') return Array.isArray(value) ? value.join(', ') : String(value);
  return String(value);
}

// ============================================
// Main DatabaseTab component
// ============================================

export default function DatabaseTab() {
  const [activeTable, setActiveTable] = useState<TableName>('profiles');
  const [view, setView] = useState<'table' | 'diagram'>('table');
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // CRUD state
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Detail view
  const [detailRow, setDetailRow] = useState<Record<string, unknown> | null>(null);

  const schema = TABLES.find(t => t.name === activeTable)!;
  const pkCol = schema.columns.find(c => c.pk)!;
  const displayCols = schema.columns.slice(0, 7);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      // profiles has restricted password column
      const selectCols = activeTable === 'profiles'
        ? schema.columns.map(c => c.name).join(', ')
        : '*';
      let query = supabase.from(activeTable).select(selectCols, { count: 'exact' });
      if (schema.orderBy) {
        query = query.order(schema.orderBy, { ascending: false });
      }
      const { data, error: err, count } = await query.limit(200);
      if (err) throw new Error(err.message);
      setRows((data as Record<string, unknown>[]) ?? []);
      setTotalCount(count ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [activeTable, schema]);

  useEffect(() => {
    if (view === 'table') fetchRows();
  }, [fetchRows, view]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      if (isCreating) {
        const { error: err } = await supabase.from(activeTable).insert(formData as never);
        if (err) throw new Error(err.message);
      } else if (editingRow) {
        const pkValue = editingRow[pkCol.name];
        const { error: err } = await supabase.from(activeTable).update(formData as never).eq(pkCol.name, pkValue as string);
        if (err) throw new Error(err.message);
      }
      setEditingRow(null);
      setIsCreating(false);
      setFormData({});
      await fetchRows();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pkValue: string) => {
    if (!confirm(`Удалить запись ${pkValue}?`)) return;
    setDeleting(pkValue);
    setError(null);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.from(activeTable).delete().eq(pkCol.name, pkValue);
      if (err) throw new Error(err.message);
      if (detailRow && detailRow[pkCol.name] === pkValue) setDetailRow(null);
      await fetchRows();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка удаления');
    } finally {
      setDeleting(null);
    }
  };

  const startEdit = (row: Record<string, unknown>) => {
    setEditingRow(row);
    setIsCreating(false);
    const data: Record<string, unknown> = {};
    schema.columns.forEach(c => {
      if (!c.readOnly) data[c.name] = row[c.name];
    });
    setFormData(data);
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingRow(null);
    setDetailRow(null);
    const data: Record<string, unknown> = {};
    schema.columns.forEach(c => {
      if (!c.readOnly && !c.pk) data[c.name] = c.type === 'boolean' ? false : c.type === 'number' ? 0 : c.type === 'array' ? [] : c.type === 'json' ? {} : '';
    });
    setFormData(data);
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setIsCreating(false);
    setFormData({});
  };

  const filteredRows = searchQuery
    ? rows.filter(r => Object.values(r).some(v => String(v ?? '').toLowerCase().includes(searchQuery.toLowerCase())))
    : rows;

  // Detail/edit panel
  if (detailRow && !isCreating && !editingRow) {
    return (
      <div>
        <button onClick={() => setDetailRow(null)} className="flex items-center gap-2 text-primary font-bold text-sm mb-6 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Назад к таблице {schema.label}
        </button>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-bold text-secondary">Запись: {String(detailRow[pkCol.name])}</h3>
            <div className="flex gap-2">
              <button onClick={() => startEdit(detailRow)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
                <Pencil className="w-4 h-4" /> Редактировать
              </button>
              <button onClick={() => handleDelete(String(detailRow[pkCol.name]))} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors">
                <Trash2 className="w-4 h-4" /> Удалить
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schema.columns.map(col => (
              <div key={col.name} className="p-3 bg-slate-50 rounded-xl">
                <div className="text-xs font-bold text-slate-400 uppercase mb-1">{col.label}</div>
                <div className="text-sm text-secondary break-all">{formatValue(col, detailRow[col.name])}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Edit/Create form
  if (editingRow || isCreating) {
    return (
      <div>
        <button onClick={cancelEdit} className="flex items-center gap-2 text-primary font-bold text-sm mb-6 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Назад
        </button>
        <div className="bg-white rounded-2xl shadow-sm border border-primary/30 p-6">
          <h3 className="font-heading font-bold text-secondary mb-6 flex items-center gap-2">
            {isCreating ? <><Plus className="w-5 h-5 text-primary" /> Новая запись в {schema.label}</> : <><Pencil className="w-5 h-5 text-primary" /> Редактирование записи</>}
          </h3>
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
            {schema.columns.filter(c => isCreating ? !c.readOnly && !c.pk : !c.readOnly).map(col => (
              <div key={col.name} className={col.type === 'json' ? 'sm:col-span-2' : ''}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {col.label}
                  {col.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                <CellEditor
                  col={col}
                  value={formData[col.name]}
                  onChange={v => setFormData(prev => ({ ...prev, [col.name]: v }))}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-6">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {isCreating ? 'Создать' : 'Сохранить'}
            </button>
            <button onClick={cancelEdit} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">Отмена</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          <button onClick={() => setView('table')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${view === 'table' ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <Table2 className="w-4 h-4" /> Таблицы
          </button>
          <button onClick={() => setView('diagram')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${view === 'diagram' ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <GitBranch className="w-4 h-4" /> ER-диаграмма
          </button>
        </div>
      </div>

      {view === 'diagram' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" style={{ height: '70vh' }}>
          <ERDiagramCanvas />
        </div>
      ) : (
        <>
          {/* Table selector */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {TABLES.map(t => (
              <button key={t.name} onClick={() => { setActiveTable(t.name); setDetailRow(null); setSearchQuery(''); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTable === t.name ? 'bg-secondary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Search + Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Поиск по всем полям..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={startCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors whitespace-nowrap">
                <Plus className="w-4 h-4" /> Добавить
              </button>
              <button onClick={fetchRows} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-secondary">{schema.label}</h2>
              <span className="text-xs text-slate-500">{filteredRows.length} из {totalCount} записей</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      {displayCols.map(c => (
                        <th key={c.name} className="px-4 py-3 whitespace-nowrap">{c.label}</th>
                      ))}
                      <th className="px-4 py-3 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.map(row => {
                      const pk = String(row[pkCol.name]);
                      return (
                        <tr key={pk} className="hover:bg-slate-50 cursor-pointer" onClick={() => setDetailRow(row)}>
                          {displayCols.map(c => (
                            <td key={c.name} className="px-4 py-3 max-w-[200px] truncate">
                              {c.pk ? (
                                <span className="font-mono text-xs bg-slate-50 px-1.5 py-0.5 rounded text-slate-600">{formatValue(c, row[c.name])}</span>
                              ) : c.type === 'boolean' ? (
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${row[c.name] ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{row[c.name] ? 'Да' : 'Нет'}</span>
                              ) : c.type === 'select' ? (
                                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-700">{String(row[c.name] ?? '—')}</span>
                              ) : (
                                <span className="text-slate-600">{formatValue(c, row[c.name])}</span>
                              )}
                            </td>
                          ))}
                          <td className="px-4 py-3 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                            <button onClick={() => startEdit(row)} className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Редактировать">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(pk)} disabled={deleting === pk} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors ml-1" title="Удалить">
                              {deleting === pk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredRows.length === 0 && !loading && (
                      <tr><td colSpan={displayCols.length + 1} className="px-4 py-12 text-center text-slate-500">{searchQuery ? 'Ничего не найдено' : 'Таблица пуста'}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
