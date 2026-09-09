import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ShoppingBag, 
  Edit3, 
  Trash2, 
  Check, 
  Sparkles,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Ingredient, IngredientCategory } from '../../types';
import { IngredientModal } from './IngredientModal';
import { formatCurrency } from '../../utils/calculations';

export const IngredientList: React.FC = () => {
  const { ingredients, recipes, updateIngredient, deleteIngredient } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ingredientToEdit, setIngredientToEdit] = useState<Ingredient | null>(null);

  // Edición rápida de precio inline
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  const categoryLabels: Record<string, string> = {
    all: 'Todos',
    carnes: '🥩 Carnes',
    verduras: '🥬 Verduras',
    lacteos: '🧀 Lácteos',
    almacen: '🥫 Almacén',
    packaging: '📦 Descartables',
    otros: '🏷️ Otros',
  };

  const filteredIngredients = ingredients.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleStartEditingPrice = (ing: Ingredient) => {
    setEditingPriceId(ing.id);
    setTempPrice(ing.purchasePrice);
  };

  const handleSavePrice = (ing: Ingredient) => {
    updateIngredient({
      ...ing,
      purchasePrice: Number(tempPrice) || 0,
    });
    setEditingPriceId(null);
  };

  const handleCreateNew = () => {
    setIngredientToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditFull = (ing: Ingredient) => {
    setIngredientToEdit(ing);
    setIsModalOpen(true);
  };

  const handleDelete = (ing: Ingredient) => {
    // Comprobar si se usa en alguna receta
    const usedIn = recipes.filter(r =>
      r.ingredients.some(i => i.ingredientId === ing.id) ||
      (r.packaging && r.packaging.some(p => p.ingredientId === ing.id))
    );

    if (usedIn.length > 0) {
      const names = usedIn.map(r => r.name).join(', ');
      if (!window.confirm(`Este insumo se usa en: ${names}. ¿Estás seguro de que deseas eliminarlo?`)) {
        return;
      }
    } else {
      if (!window.confirm(`¿Eliminar el insumo "${ing.name}"?`)) return;
    }

    deleteIngredient(ing.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900">
              Despensa e Insumos de Compra
            </h2>
            <span className="bg-brand-100 text-brand-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {ingredients.length} insumos
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Actualiza los precios de compra aquí para que se recalculen automáticamente los costos de todas las comidas.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo Insumo</span>
        </button>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar insumo (ej: carne, queso, pote)..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1 sm:pb-0">
          {Object.entries(categoryLabels).map(([catKey, label]) => (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === catKey
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Insumos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Insumo</th>
                <th className="py-3.5 px-4">Rubro</th>
                <th className="py-3.5 px-4">Presentación de Compra</th>
                <th className="py-3.5 px-4">Precio Pagado</th>
                <th className="py-3.5 px-4">Costo Normalizado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIngredients.map(ing => {
                const isEditing = editingPriceId === ing.id;
                const normalizedFactor = ing.baseUnit === 'g' || ing.baseUnit === 'ml' ? 1000 : 1;
                const normalizedCost = ing.costPerBaseUnit * normalizedFactor;
                const normalizedUnitLabel = ing.baseUnit === 'g' ? 'kg' : ing.baseUnit === 'ml' ? 'L' : 'unidad';

                return (
                  <tr key={ing.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Nombre y notas */}
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                      <div>
                        <span>{ing.name}</span>
                        {ing.notes && (
                          <span className="block text-[11px] text-slate-400 font-normal">
                            {ing.notes}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Rubro */}
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-700">
                        {ing.category}
                      </span>
                    </td>

                    {/* Presentación */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {ing.purchaseQuantity} {ing.purchaseUnit}
                    </td>

                    {/* Precio de Compra (con edición inline) */}
                    <td className="py-3.5 px-4 font-bold">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 font-bold">$</span>
                          <input
                            type="number"
                            step="any"
                            value={tempPrice}
                            onChange={e => setTempPrice(parseFloat(e.target.value) || 0)}
                            className="w-24 px-2 py-1 text-xs font-bold border border-brand-500 rounded-lg focus:outline-none"
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSavePrice(ing);
                              if (e.key === 'Escape') setEditingPriceId(null);
                            }}
                          />
                          <button
                            onClick={() => handleSavePrice(ing)}
                            className="p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-sm"
                            title="Guardar nuevo precio"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEditingPrice(ing)}
                          className="font-extrabold text-slate-900 hover:text-brand-600 hover:underline inline-flex items-center gap-1 group"
                          title="Click para modificar precio rápidamente"
                        >
                          <span>{formatCurrency(ing.purchasePrice)}</span>
                          <Edit3 className="w-3 h-3 text-slate-300 group-hover:text-brand-600" />
                        </button>
                      )}
                    </td>

                    {/* Costo normalizado por kg/L/u */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">
                        {formatCurrency(normalizedCost)}
                      </span>
                      <span className="text-slate-400 text-xs ml-1">
                        / {normalizedUnitLabel}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditFull(ing)}
                          title="Editar detalles del insumo"
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ing)}
                          title="Eliminar insumo"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Insumo */}
      <IngredientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ingredientToEdit={ingredientToEdit}
      />
    </div>
  );
};
