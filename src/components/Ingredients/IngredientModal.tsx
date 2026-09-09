import React, { useState, useEffect } from 'react';
import { X, Save, ShoppingBag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Ingredient, IngredientCategory, UnitType } from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredientToEdit?: Ingredient | null;
}

export const IngredientModal: React.FC<IngredientModalProps> = ({
  isOpen,
  onClose,
  ingredientToEdit,
}) => {
  const { addIngredient, updateIngredient } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<IngredientCategory>('almacen');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);
  const [purchaseUnit, setPurchaseUnit] = useState<UnitType>('kg');
  const [baseUnit, setBaseUnit] = useState<'g' | 'ml' | 'u'>('g');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (ingredientToEdit) {
      setName(ingredientToEdit.name);
      setCategory(ingredientToEdit.category);
      setPurchasePrice(ingredientToEdit.purchasePrice);
      setPurchaseQuantity(ingredientToEdit.purchaseQuantity);
      setPurchaseUnit(ingredientToEdit.purchaseUnit);
      setBaseUnit(ingredientToEdit.baseUnit);
      setNotes(ingredientToEdit.notes || '');
    } else {
      setName('');
      setCategory('almacen');
      setPurchasePrice(1000);
      setPurchaseQuantity(1);
      setPurchaseUnit('kg');
      setBaseUnit('g');
      setNotes('');
    }
  }, [ingredientToEdit, isOpen]);

  // Si cambia purchaseUnit a 'kg', sugerir baseUnit 'g'
  const handlePurchaseUnitChange = (unit: UnitType) => {
    setPurchaseUnit(unit);
    if (unit === 'kg') setBaseUnit('g');
    else if (unit === 'l') setBaseUnit('ml');
    else if (unit === 'g') setBaseUnit('g');
    else if (unit === 'ml') setBaseUnit('ml');
    else setBaseUnit('u');
  };

  if (!isOpen) return null;

  // Costo por unidad base estimado
  let estimatedBaseCost = 0;
  if (purchaseQuantity > 0) {
    if (purchaseUnit === 'kg' && baseUnit === 'g') {
      estimatedBaseCost = purchasePrice / (purchaseQuantity * 1000);
    } else if (purchaseUnit === 'l' && baseUnit === 'ml') {
      estimatedBaseCost = purchasePrice / (purchaseQuantity * 1000);
    } else {
      estimatedBaseCost = purchasePrice / purchaseQuantity;
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Ingresa el nombre del insumo.');
      return;
    }

    const payload = {
      name: name.trim(),
      category,
      purchasePrice: Number(purchasePrice) || 0,
      purchaseQuantity: Number(purchaseQuantity) || 1,
      purchaseUnit,
      baseUnit,
      notes: notes.trim(),
    };

    if (ingredientToEdit) {
      updateIngredient({ ...ingredientToEdit, ...payload });
    } else {
      addIngredient(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">
                {ingredientToEdit ? 'Editar Precio de Insumo' : 'Nuevo Insumo / Ingrediente'}
              </h3>
              <p className="text-xs text-slate-500">
                Al modificar el precio, se actualizan todas las comidas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen de cálculo base */}
        <div className="bg-brand-50/80 px-6 py-3 border-b border-brand-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-brand-950">
            Costo calculado por {baseUnit === 'g' ? 'kg' : baseUnit === 'ml' ? 'L' : 'unidad'}:
          </span>
          <span className="text-base font-black text-brand-700">
            {formatCurrency(estimatedBaseCost * (baseUnit === 'g' || baseUnit === 'ml' ? 1000 : 1))}
          </span>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombre del Insumo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej. Carne picada especial, Queso crema, Bandeja..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rubro / Categoría
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as IngredientCategory)}
                className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200"
              >
                <option value="carnes">🥩 Carnicería</option>
                <option value="verduras">🥬 Verdulería</option>
                <option value="lacteos">🧀 Lácteos</option>
                <option value="almacen">🥫 Almacén</option>
                <option value="packaging">📦 Descartables</option>
                <option value="otros">🏷️ Otros</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Precio de Compra ($) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={purchasePrice || ''}
                onChange={e => setPurchasePrice(parseFloat(e.target.value) || 0)}
                placeholder="7900"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cantidad Comprada
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                value={purchaseQuantity || ''}
                onChange={e => setPurchaseQuantity(parseFloat(e.target.value) || 1)}
                placeholder="1"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-200 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Unidad del Paquete
              </label>
              <select
                value={purchaseUnit}
                onChange={e => handlePurchaseUnitChange(e.target.value as UnitType)}
                className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 font-semibold"
              >
                <option value="kg">kg (Kilos)</option>
                <option value="g">g (Gramos)</option>
                <option value="l">L (Litros)</option>
                <option value="ml">ml (Mililitros)</option>
                <option value="u">u (Unidades)</option>
                <option value="paquete">paquete</option>
                <option value="docena">docena</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Notas / Proveedor (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ej: Mayorista Distribuidora, Balde de 3.5kg, etc."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{ingredientToEdit ? 'Guardar Cambios' : 'Crear Insumo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
