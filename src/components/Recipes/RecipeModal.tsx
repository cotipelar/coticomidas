import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  UtensilsCrossed, 
  Package, 
  DollarSign, 
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Recipe, RecipeIngredient, FoodCategory } from '../../types';
import { 
  getRecipeFinancials, 
  formatCurrency, 
  formatPercent 
} from '../../utils/calculations';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeToEdit?: Recipe | null;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  recipeToEdit,
}) => {
  const { ingredients, ingredientsMap, addRecipe, updateRecipe } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('comidas');
  const [description, setDescription] = useState('');
  const [yieldCount, setYieldCount] = useState<number>(1);
  const [yieldUnit, setYieldUnit] = useState('porción');
  const [salePrice, setSalePrice] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [packagingItems, setPackagingItems] = useState<RecipeIngredient[]>([]);

  // Estados para agregar un ingrediente nuevo a la lista de la receta
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState<number>(100);

  // Estados para agregar packaging
  const [selectedPackagingId, setSelectedPackagingId] = useState('');
  const [packagingQuantity, setPackagingQuantity] = useState<number>(1);

  useEffect(() => {
    if (recipeToEdit) {
      setName(recipeToEdit.name);
      setCategory(recipeToEdit.category);
      setDescription(recipeToEdit.description || '');
      setYieldCount(recipeToEdit.yieldCount || 1);
      setYieldUnit(recipeToEdit.yieldUnit || 'porción');
      setSalePrice(recipeToEdit.salePrice || 0);
      setNotes(recipeToEdit.notes || '');
      setRecipeIngredients(recipeToEdit.ingredients || []);
      setPackagingItems(recipeToEdit.packaging || []);
    } else {
      setName('');
      setCategory('empanadas');
      setDescription('');
      setYieldCount(1);
      setYieldUnit('docena');
      setSalePrice(16000);
      setNotes('');
      setRecipeIngredients([]);
      setPackagingItems([]);
    }
  }, [recipeToEdit, isOpen]);

  if (!isOpen) return null;

  // Filtros de ingredientes según categoría
  const packagingAvailable = ingredients.filter(i => i.category === 'packaging');
  const ingredientsAvailable = ingredients.filter(i => i.category !== 'packaging');

  // Construir objeto temporal para calcular en vivo
  const tempRecipe: Recipe = {
    id: recipeToEdit?.id || 'temp',
    name: name || 'Nueva Comida',
    category,
    description,
    yieldCount: yieldCount > 0 ? yieldCount : 1,
    yieldUnit,
    salePrice: Number(salePrice) || 0,
    ingredients: recipeIngredients,
    packaging: packagingItems,
    notes,
  };

  const financials = getRecipeFinancials(tempRecipe, ingredientsMap);

  const handleAddIngredient = () => {
    if (!selectedIngredientId) return;
    const qty = Number(ingredientQuantity) || 0;
    if (qty <= 0) return;

    setRecipeIngredients(prev => {
      const existing = prev.find(i => i.ingredientId === selectedIngredientId);
      if (existing) {
        return prev.map(i =>
          i.ingredientId === selectedIngredientId
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { ingredientId: selectedIngredientId, quantity: qty }];
    });

    setSelectedIngredientId('');
    setIngredientQuantity(100);
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setRecipeIngredients(prev => prev.filter(i => i.ingredientId !== ingredientId));
  };

  const handleUpdateIngredientQty = (ingredientId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveIngredient(ingredientId);
    } else {
      setRecipeIngredients(prev =>
        prev.map(i => (i.ingredientId === ingredientId ? { ...i, quantity: newQty } : i))
      );
    }
  };

  const handleAddPackaging = () => {
    if (!selectedPackagingId) return;
    const qty = Number(packagingQuantity) || 0;
    if (qty <= 0) return;

    setPackagingItems(prev => {
      const existing = prev.find(i => i.ingredientId === selectedPackagingId);
      if (existing) {
        return prev.map(i =>
          i.ingredientId === selectedPackagingId
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { ingredientId: selectedPackagingId, quantity: qty }];
    });

    setSelectedPackagingId('');
    setPackagingQuantity(1);
  };

  const handleRemovePackaging = (ingredientId: string) => {
    setPackagingItems(prev => prev.filter(i => i.ingredientId !== ingredientId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor ingresa un nombre para la comida.');
      return;
    }

    const payload = {
      name: name.trim(),
      category,
      description: description.trim(),
      yieldCount: Number(yieldCount) > 0 ? Number(yieldCount) : 1,
      yieldUnit: yieldUnit.trim() || 'unidad',
      salePrice: Number(salePrice) || 0,
      ingredients: recipeIngredients,
      packaging: packagingItems,
      notes: notes.trim(),
    };

    if (recipeToEdit) {
      updateRecipe({ ...payload, id: recipeToEdit.id });
    } else {
      addRecipe(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">
                {recipeToEdit ? 'Modificar Receta y Precios' : 'Nueva Comida o Receta'}
              </h3>
              <p className="text-xs text-slate-500">
                Ajusta ingredientes, rendimiento y precio de venta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen Financiero Dinámico Superior */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-3.5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-[11px] text-slate-400 block uppercase font-semibold">
              Costo por {yieldUnit}
            </span>
            <span className="text-xl font-black text-rose-300">
              {formatCurrency(financials.unitCost)}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block uppercase font-semibold">
              Precio de Venta
            </span>
            <span className="text-xl font-black text-white">
              {formatCurrency(financials.salePrice)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-emerald-400 block uppercase font-semibold">
              Ganancia por {yieldUnit}
            </span>
            <span className="text-xl font-black text-emerald-300">
              +{formatCurrency(financials.unitProfit)}
              <span className="text-xs font-semibold text-emerald-400 ml-1.5">
                ({formatPercent(financials.marginPercent)})
              </span>
            </span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Datos Básicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre de la Comida / Plato *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. Empanadas de Jamón y Queso / Tiramisú Especial"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as FoodCategory)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 font-medium"
              >
                <option value="empanadas">🥟 Empanadas</option>
                <option value="comidas">🍲 Comidas por porción / kg</option>
                <option value="postres">🍰 Postres en pote</option>
                <option value="budines">🍞 Budines</option>
                <option value="otros">🏷️ Otros</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Precio de Venta al Público ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={salePrice || ''}
                  onChange={e => setSalePrice(parseFloat(e.target.value) || 0)}
                  placeholder="16000"
                  className="w-full pl-7 pr-3.5 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rendimiento de la Receta (Cantidad)
              </label>
              <input
                type="number"
                min="1"
                required
                value={yieldCount}
                onChange={e => setYieldCount(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-200 font-medium"
              />
              <span className="text-[10px] text-slate-400">
                Ej: 1 si es 1 docena o 1 kg; 4 si el lote rinde 4 potes; 2 si rinde 2 budines.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Unidad de Venta
              </label>
              <input
                type="text"
                required
                value={yieldUnit}
                onChange={e => setYieldUnit(e.target.value)}
                placeholder="docena, porción, kg, pote, budín"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-200 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Descripción / Presentación
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Breve detalle de los ingredientes o preparación..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          {/* Sección de Ingredientes */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <UtensilsCrossed className="w-4 h-4 text-brand-600" />
                Ingredientes del Lote
              </h4>
              <span className="text-xs text-slate-500 font-medium">
                {recipeIngredients.length} ingredientes cargados
              </span>
            </div>

            {/* Agregar nuevo ingrediente */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-2">
              <select
                value={selectedIngredientId}
                onChange={e => setSelectedIngredientId(e.target.value)}
                className="w-full sm:w-1/2 px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 font-medium"
              >
                <option value="">Seleccionar ingrediente de la despensa...</option>
                {ingredientsAvailable.map(ing => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} ({formatCurrency(ing.costPerBaseUnit * (ing.baseUnit === 'g' || ing.baseUnit === 'ml' ? 1000 : 1))}/{ing.baseUnit === 'u' ? 'u' : ing.baseUnit === 'g' ? 'kg' : 'L'})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={ingredientQuantity}
                  onChange={e => setIngredientQuantity(parseFloat(e.target.value) || 0)}
                  placeholder="Cant."
                  className="w-24 px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 font-semibold"
                />
                <span className="text-xs text-slate-500 font-semibold min-w-[30px]">
                  {selectedIngredientId ? ingredientsMap.get(selectedIngredientId)?.baseUnit : 'cant'}
                </span>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  disabled={!selectedIngredientId}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-1 transition-colors disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </button>
              </div>
            </div>

            {/* Tabla de ingredientes de la receta */}
            {recipeIngredients.length > 0 ? (
              <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
                {recipeIngredients.map(item => {
                  const ing = ingredientsMap.get(item.ingredientId);
                  if (!ing) return null;
                  const itemCost = item.quantity * ing.costPerBaseUnit;

                  return (
                    <div
                      key={item.ingredientId}
                      className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1">
                        <span className="font-bold text-slate-800">{ing.name}</span>
                        <span className="text-slate-400 block text-[10px]">
                          Costo base: {formatCurrency(ing.costPerBaseUnit * (ing.baseUnit === 'g' || ing.baseUnit === 'ml' ? 1000 : 1))} por {ing.baseUnit === 'g' ? 'kg' : ing.baseUnit === 'ml' ? 'L' : 'u'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={item.quantity}
                            onChange={e =>
                              handleUpdateIngredientQty(
                                item.ingredientId,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-20 px-2 py-1 text-center font-bold bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                          <span className="font-semibold text-slate-600 text-[11px]">
                            {ing.baseUnit}
                          </span>
                        </div>

                        <span className="font-extrabold text-slate-900 min-w-[70px] text-right">
                          {formatCurrency(itemCost)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(item.ingredientId)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-3 italic">
                Aún no has agregado ingredientes. Selecciona uno arriba.
              </p>
            )}
          </div>

          {/* Sección de Packaging & Descartables */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-600" />
                Packaging y Descartables
              </h4>
              <span className="text-xs text-slate-500 font-medium">
                Bandejas, potes, bolsas, moldes
              </span>
            </div>

            <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-200/60 flex flex-col sm:flex-row items-center gap-2">
              <select
                value={selectedPackagingId}
                onChange={e => setSelectedPackagingId(e.target.value)}
                className="w-full sm:w-1/2 px-3 py-2 text-xs bg-white rounded-xl border border-amber-200 font-medium"
              >
                <option value="">Seleccionar descartable...</option>
                {packagingAvailable.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} ({formatCurrency(pkg.costPerBaseUnit)} c/u)
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                <input
                  type="number"
                  min="1"
                  value={packagingQuantity}
                  onChange={e => setPackagingQuantity(parseInt(e.target.value) || 1)}
                  placeholder="Cant."
                  className="w-20 px-3 py-2 text-xs bg-white rounded-xl border border-amber-200 font-semibold"
                />
                <span className="text-xs text-slate-600 font-medium">unidades</span>
                <button
                  type="button"
                  onClick={handleAddPackaging}
                  disabled={!selectedPackagingId}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1 transition-colors disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </button>
              </div>
            </div>

            {packagingItems.length > 0 && (
              <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
                {packagingItems.map(item => {
                  const pkg = ingredientsMap.get(item.ingredientId);
                  if (!pkg) return null;
                  const itemCost = item.quantity * pkg.costPerBaseUnit;

                  return (
                    <div
                      key={item.ingredientId}
                      className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50"
                    >
                      <span className="font-bold text-slate-800">{pkg.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-600 font-medium">
                          {item.quantity} u ({formatCurrency(pkg.costPerBaseUnit)} c/u)
                        </span>
                        <span className="font-extrabold text-slate-900 min-w-[60px] text-right">
                          {formatCurrency(itemCost)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePackaging(item.ingredientId)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{recipeToEdit ? 'Guardar Cambios' : 'Crear Comida'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
