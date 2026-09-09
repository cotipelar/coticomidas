import React, { useState } from 'react';
import { 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  UtensilsCrossed, 
  Package, 
  Percent,
  Sparkles,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Recipe } from '../../types';
import { 
  getRecipeFinancials, 
  formatCurrency, 
  formatPercent 
} from '../../utils/calculations';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onEdit }) => {
  const { ingredientsMap, updateRecipe, deleteRecipe } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState(recipe.salePrice);

  const financials = getRecipeFinancials(recipe, ingredientsMap);

  const handleSavePrice = () => {
    updateRecipe({
      ...recipe,
      salePrice: Number(tempPrice) || 0,
    });
    setIsEditingPrice(false);
  };

  const getMarginBadgeClass = (margin: number) => {
    if (margin >= 50) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (margin >= 30) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-rose-100 text-rose-800 border-rose-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
      <div>
        {/* Header de la tarjeta */}
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md inline-block mb-1">
                {recipe.category}
              </span>
              <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                {recipe.name}
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(recipe)}
                title="Editar receta y gramajes"
                className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`¿Eliminar la comida "${recipe.name}"?`)) {
                    deleteRecipe(recipe.id);
                  }
                }}
                title="Eliminar comida"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
            {recipe.description || 'Sin descripción'}
          </p>

          <div className="mt-2 text-[11px] text-slate-400 font-medium">
            Rendimiento del lote: <strong className="text-slate-700">{recipe.yieldCount} {recipe.yieldUnit}</strong>
          </div>
        </div>

        {/* Indicadores Financieros */}
        <div className="bg-slate-50/80 px-5 py-3 border-y border-slate-100 grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Costo Unitario
            </span>
            <span className="text-sm font-black text-rose-600">
              {formatCurrency(financials.unitCost)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Precio Venta
            </span>
            {isEditingPrice ? (
              <div className="flex items-center gap-1 mt-0.5">
                <input
                  type="number"
                  step="100"
                  value={tempPrice}
                  onChange={e => setTempPrice(parseFloat(e.target.value) || 0)}
                  className="w-20 px-1.5 py-0.5 text-xs font-bold bg-white border border-brand-500 rounded focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSavePrice}
                  className="p-1 bg-brand-600 text-white rounded hover:bg-brand-700"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempPrice(recipe.salePrice);
                  setIsEditingPrice(true);
                }}
                className="text-sm font-black text-slate-900 hover:text-brand-600 hover:underline text-left block"
                title="Click para cambiar precio rápidamente"
              >
                {formatCurrency(recipe.salePrice)}
              </button>
            )}
          </div>
        </div>

        {/* Banner de Ganancia & Margen */}
        <div className="px-5 py-3 flex items-center justify-between bg-emerald-50/40">
          <div>
            <span className="text-[10px] text-emerald-700 font-bold uppercase block">
              Ganancia Limpia
            </span>
            <span className="text-base font-black text-emerald-700">
              +{formatCurrency(financials.unitProfit)}
            </span>
          </div>

          <span
            className={`text-xs font-black px-2.5 py-1 rounded-lg border ${getMarginBadgeClass(
              financials.marginPercent
            )}`}
          >
            {formatPercent(financials.marginPercent)} margen
          </span>
        </div>
      </div>

      {/* Desglose de Ingredientes Desplegable */}
      <div>
        {isExpanded && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs space-y-2">
            <h4 className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1">
              <UtensilsCrossed className="w-3 h-3 text-brand-600" />
              Ingredientes ({recipe.ingredients.length})
            </h4>
            <div className="divide-y divide-slate-200/60 bg-white rounded-xl border border-slate-200/80 overflow-hidden">
              {recipe.ingredients.map(item => {
                const ing = ingredientsMap.get(item.ingredientId);
                if (!ing) return null;
                const cost = item.quantity * ing.costPerBaseUnit;
                return (
                  <div
                    key={item.ingredientId}
                    className="px-3 py-1.5 flex items-center justify-between text-[11px]"
                  >
                    <span className="font-medium text-slate-700">
                      {ing.name}{' '}
                      <span className="text-slate-400">
                        ({item.quantity} {ing.baseUnit})
                      </span>
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(cost)}
                    </span>
                  </div>
                );
              })}
            </div>

            {recipe.packaging && recipe.packaging.length > 0 && (
              <>
                <h4 className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1 pt-2">
                  <Package className="w-3 h-3 text-amber-600" />
                  Packaging ({recipe.packaging.length})
                </h4>
                <div className="divide-y divide-slate-200/60 bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                  {recipe.packaging.map(item => {
                    const pkg = ingredientsMap.get(item.ingredientId);
                    if (!pkg) return null;
                    const cost = item.quantity * pkg.costPerBaseUnit;
                    return (
                      <div
                        key={item.ingredientId}
                        className="px-3 py-1.5 flex items-center justify-between text-[11px]"
                      >
                        <span className="font-medium text-slate-700">
                          {pkg.name} ({item.quantity} u)
                        </span>
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(cost)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="pt-1 text-[11px] text-right font-bold text-slate-500">
              Costo total del lote: {formatCurrency(financials.totalBatchCost)}
            </div>
          </div>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-t border-slate-100"
        >
          <span>{isExpanded ? 'Ocultar ingredientes' : 'Ver ingredientes y gramajes'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
