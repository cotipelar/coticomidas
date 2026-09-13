import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Save, 
  ShoppingCart, 
  Share2, 
  Check, 
  User, 
  Calendar, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  PackageCheck,
  Search,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderItem, OrderStatus, FoodCategory } from '../../types';
import { 
  calculateOrderTotals, 
  getRecipeFinancials, 
  formatCurrency, 
  formatPercent,
  calculateShoppingList 
} from '../../utils/calculations';
import { ShoppingListModal } from './ShoppingListModal';

interface OrderCalculatorProps {
  editingOrder?: Order | null;
  onFinished: () => void;
}

export const OrderCalculator: React.FC<OrderCalculatorProps> = ({
  editingOrder,
  onFinished,
}) => {
  const { recipes, recipesMap, ingredientsMap, addOrder, updateOrder } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<OrderStatus>('pendiente');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [copiedType, setCopiedType] = useState<'client' | 'internal' | null>(null);

  // Inicializar si estamos editando
  useEffect(() => {
    if (editingOrder) {
      setCustomerName(editingOrder.customerName || '');
      setPhone(editingOrder.phone || '');
      setDeliveryDate(editingOrder.deliveryDate || new Date().toISOString().split('T')[0]);
      setStatus(editingOrder.status);
      setNotes(editingOrder.notes || '');
      setItems(editingOrder.items || []);
    } else {
      setCustomerName('');
      setPhone('');
      setDeliveryDate(new Date().toISOString().split('T')[0]);
      setStatus('pendiente');
      setNotes('');
      setItems([]);
    }
  }, [editingOrder]);

  const setItemQuantity = (recipeId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.recipeId !== recipeId));
    } else {
      setItems(prev => {
        const existing = prev.find(i => i.recipeId === recipeId);
        if (existing) {
          return prev.map(i => (i.recipeId === recipeId ? { ...i, quantity } : i));
        }
        return [...prev, { recipeId, quantity }];
      });
    }
  };

  const incrementItem = (recipeId: string) => {
    const current = items.find(i => i.recipeId === recipeId)?.quantity || 0;
    setItemQuantity(recipeId, current + 1);
  };

  const decrementItem = (recipeId: string) => {
    const current = items.find(i => i.recipeId === recipeId)?.quantity || 0;
    if (current > 0) {
      setItemQuantity(recipeId, current - 1);
    }
  };

  // Calcular totales
  const totals = calculateOrderTotals(items, recipesMap, ingredientsMap);

  const filteredRecipes = recipes.filter(rec => {
    const matchesCategory = selectedCategory === 'all' || rec.category === selectedCategory;
    const matchesSearch = rec.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Agrega al menos una comida o postre al pedido.');
      return;
    }

    const orderPayload = {
      customerName: customerName.trim() || 'Cliente Sin Nombre',
      phone: phone.trim(),
      deliveryDate,
      status,
      notes: notes.trim(),
      items,
    };

    if (editingOrder) {
      updateOrder({
        ...orderPayload,
        id: editingOrder.id,
        createdAt: editingOrder.createdAt,
      });
    } else {
      addOrder(orderPayload);
    }

    onFinished();
  };

  const handleResetOrder = () => {
    if (items.length > 0 || customerName || notes) {
      if (!window.confirm('¿Deseas reiniciar el pedido y volver todas las cantidades a 0?')) {
        return;
      }
    }
    setCustomerName('');
    setPhone('');
    setDeliveryDate(new Date().toISOString().split('T')[0]);
    setStatus('pendiente');
    setNotes('');
    setItems([]);
  };

  // Copiar resumen para el cliente (sin revelar costos ni ganancias)
  const copyClientWhatsApp = () => {
    let text = `🥟 *PEDIDO - COTICOMIDAS*\n`;
    if (customerName) text += `Cliente: *${customerName}*\n`;
    if (deliveryDate) text += `Fecha de entrega: ${deliveryDate}\n`;
    text += `\n*Detalle del pedido:*\n`;

    items.forEach(item => {
      const rec = recipesMap.get(item.recipeId);
      if (rec && item.quantity > 0) {
        const lineTotal = rec.salePrice * item.quantity;
        text += `• ${item.quantity}x ${rec.name} (${rec.yieldUnit}): ${formatCurrency(lineTotal)}\n`;
      }
    });

    text += `\n*TOTAL A ABONAR: ${formatCurrency(totals.totalRevenue)}*\n`;
    if (notes) text += `\n_Notas: ${notes}_\n`;
    text += `\n¡Muchas gracias por tu compra! ❤️`;

    navigator.clipboard.writeText(text);
    setCopiedType('client');
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Copiar resumen interno (con ganancia y costo)
  const copyInternalSummary = () => {
    let text = `📊 *RESUMEN INTERNO DE PEDIDO*\n`;
    text += `Cliente/Tanda: ${customerName || 'Sin Nombre'}\n`;
    text += `Fecha: ${deliveryDate} | Estado: ${status.toUpperCase()}\n\n`;

    items.forEach(item => {
      const rec = recipesMap.get(item.recipeId);
      if (rec && item.quantity > 0) {
        const fin = getRecipeFinancials(rec, ingredientsMap);
        const itemRev = fin.salePrice * item.quantity;
        const itemCost = fin.unitCost * item.quantity;
        const itemProfit = itemRev - itemCost;
        text += `• ${item.quantity}x ${rec.name}\n`;
        text += `   Venta: ${formatCurrency(itemRev)} | Costo: ${formatCurrency(itemCost)} | Ganancia: ${formatCurrency(itemProfit)}\n`;
      }
    });

    text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💰 *VENTA TOTAL:* ${formatCurrency(totals.totalRevenue)}\n`;
    text += `🧾 *COSTO INSUMOS:* ${formatCurrency(totals.totalCost)}\n`;
    text += `📈 *GANANCIA NETA:* ${formatCurrency(totals.totalProfit)} (${formatPercent(totals.marginPercent)})\n`;

    navigator.clipboard.writeText(text);
    setCopiedType('internal');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const shoppingList = calculateShoppingList(items, recipesMap, ingredientsMap);

  return (
    <div className="space-y-6">
      {/* Header del creador / editor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            {editingOrder ? '✏️ Modificar Pedido' : '🛒 Nuevo Pedido o Tanda'}
          </h2>
          <p className="text-xs text-slate-500">
            Selecciona las comidas y cantidades para ver el cálculo instantáneo de costos, venta y ganancias.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowShoppingList(true)}
            disabled={items.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50"
          >
            <ShoppingCart className="w-4 h-4 text-amber-600" />
            <span>Lista de Compras</span>
          </button>

          <button
            type="button"
            onClick={copyClientWhatsApp}
            disabled={items.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
            title="Copiar mensaje de WhatsApp para el cliente"
          >
            {copiedType === 'client' ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-emerald-600" />}
            <span>WhatsApp Cliente</span>
          </button>

          <button
            type="button"
            onClick={copyInternalSummary}
            disabled={items.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
            title="Copiar detalle interno con costos y ganancias"
          >
            {copiedType === 'internal' ? <Check className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 text-brand-600" />}
            <span className="hidden sm:inline">Detalle Ganancia</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Selección de Comidas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filtros de Comida */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar comida, empanadas, postres..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'empanadas', label: '🥟 Empanadas' },
                { id: 'comidas', label: '🍲 Comidas' },
                { id: 'postres', label: '🍰 Postres' },
                { id: 'budines', label: '🍞 Budines' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Tarjetas de Productos disponibles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1">
            {filteredRecipes.map(recipe => {
              const fin = getRecipeFinancials(recipe, ingredientsMap);
              const orderItem = items.find(i => i.recipeId === recipe.id);
              const qty = orderItem?.quantity || 0;

              return (
                <div
                  key={recipe.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    qty > 0
                      ? 'bg-brand-50/40 border-brand-300 shadow-sm ring-1 ring-brand-400/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">
                        {recipe.name}
                      </h4>
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded capitalize">
                        {recipe.yieldUnit}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                      {recipe.description || 'Receta artesanal'}
                    </p>

                    {/* Precios y Costos: Costo, Venta y Ganancia de cada comida */}
                    <div className="grid grid-cols-3 gap-1.5 text-xs bg-slate-50 p-2 rounded-xl mb-3 border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Costo U.
                        </span>
                        <span className="font-bold text-rose-600">
                          {formatCurrency(fin.unitCost)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Venta U.
                        </span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(recipe.salePrice)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Ganancia
                        </span>
                        <span className="font-bold text-emerald-600">
                          +{formatCurrency(fin.unitProfit)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stepper de Cantidad */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">
                        Cantidad:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decrementItem(recipe.id)}
                          disabled={qty === 0}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-700 transition-colors font-bold"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={qty}
                          onChange={e =>
                            setItemQuantity(recipe.id, parseInt(e.target.value) || 0)
                          }
                          className="w-12 text-center font-bold text-sm bg-white border border-slate-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => incrementItem(recipe.id)}
                          className="w-7 h-7 rounded-lg bg-brand-600 hover:bg-brand-700 flex items-center justify-center text-white transition-colors font-bold shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotales en vivo cuando la cantidad es mayor a 0 */}
                    {qty > 0 && (
                      <div className="bg-white p-2 rounded-xl border border-brand-200 flex items-center justify-between text-[11px] shadow-xs">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Costo {qty}x</span>
                          <span className="font-extrabold text-rose-600">{formatCurrency(fin.unitCost * qty)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Venta {qty}x</span>
                          <span className="font-extrabold text-slate-900">{formatCurrency(recipe.salePrice * qty)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Ganancia</span>
                          <span className="font-extrabold text-emerald-600">+{formatCurrency(fin.unitProfit * qty)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Datos del Pedido & Panel de Rentabilidad (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleSave} className="space-y-4">
            {/* Formulario de Datos */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-brand-600" />
                Datos del Cliente y Entrega
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cliente / Tanda
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Ej. Martín / Tanda Sábado"
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Ej. 351 123 4567"
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha de Entrega
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={e => setDeliveryDate(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold"
                  >
                    <option value="pendiente">🟡 Pendiente</option>
                    <option value="preparando">🟠 En preparación</option>
                    <option value="listo">🟢 Listo para entregar</option>
                    <option value="entregado">📦 Entregado</option>
                    <option value="cobrado">💰 Cobrado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas / Aclaraciones
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ej: Empanadas horneadas, postres bien fríos..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Desglose de costos y ventas por comida seleccionada */}
            {items.length > 0 && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Costo y Ganancia por Comida
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {items.length} {items.length === 1 ? 'plato' : 'platos'}
                  </span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {items.map(it => {
                    const rec = recipesMap.get(it.recipeId);
                    if (!rec || it.quantity <= 0) return null;
                    const fin = getRecipeFinancials(rec, ingredientsMap);
                    return (
                      <div key={it.recipeId} className="py-2 flex items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {it.quantity}x {rec.name}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Costo u: <strong className="text-rose-600">{formatCurrency(fin.unitCost)}</strong> | Venta u: {formatCurrency(rec.salePrice)}
                          </span>
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <span className="text-rose-600 font-bold block text-xs">
                            Costo: {formatCurrency(fin.unitCost * it.quantity)}
                          </span>
                          <span className="text-emerald-600 font-extrabold text-xs bg-emerald-50 px-1.5 py-0.5 rounded">
                            +{formatCurrency(fin.unitProfit * it.quantity)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Resumen Financiero en Vivo del Pedido */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Resumen Económico del Pedido
                </span>
                <span className="text-xs font-semibold bg-slate-700 px-2.5 py-0.5 rounded-full text-slate-200">
                  {totals.itemCount} {totals.itemCount === 1 ? 'unidad' : 'unidades'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Total Venta</span>
                  <span className="text-2xl font-black text-white">
                    {formatCurrency(totals.totalRevenue)}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Costo de Insumos</span>
                  <span className="text-xl font-bold text-rose-300">
                    {formatCurrency(totals.totalCost)}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 block">
                    Ganancia Limpia
                  </span>
                  <span className="text-2xl font-black text-emerald-300">
                    +{formatCurrency(totals.totalProfit)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-400/80 block">Margen</span>
                  <span className="text-lg font-bold text-emerald-200">
                    {formatPercent(totals.marginPercent)}
                  </span>
                </div>
              </div>

              {/* Botones de Guardar, Reiniciar y Cancelar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="submit"
                  disabled={items.length === 0}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingOrder ? 'Guardar Cambios' : 'Registrar Pedido'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetOrder}
                  disabled={items.length === 0 && !customerName && !notes}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-30"
                  title="Reiniciar pedido y volver cantidades a 0"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reiniciar (a 0)</span>
                </button>

                {editingOrder && (
                  <button
                    type="button"
                    onClick={onFinished}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl font-semibold text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Lista de Compras */}
      <ShoppingListModal
        isOpen={showShoppingList}
        onClose={() => setShowShoppingList(false)}
        title={customerName ? `Pedido: ${customerName}` : 'Pedido Actual'}
        items={shoppingList}
      />
    </div>
  );
};
