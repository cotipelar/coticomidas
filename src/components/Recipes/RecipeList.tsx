import React, { useState } from 'react';
import { Plus, Search, UtensilsCrossed, Sparkles, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Recipe, FoodCategory } from '../../types';
import { RecipeCard } from './RecipeCard';
import { RecipeModal } from './RecipeModal';
import { getRecipeFinancials, formatPercent } from '../../utils/calculations';

interface RecipeListProps {
  onNewRecipeRequest?: () => void;
}

export const RecipeList: React.FC<RecipeListProps> = () => {
  const { recipes, ingredientsMap } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);

  const filteredRecipes = recipes.filter(rec => {
    const matchesCategory = selectedCategory === 'all' || rec.category === selectedCategory;
    const matchesSearch = 
      rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.description && rec.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Margen promedio del menú
  const avgMargin = recipes.length > 0
    ? recipes.reduce((acc, r) => acc + getRecipeFinancials(r, ingredientsMap).marginPercent, 0) / recipes.length
    : 0;

  const handleEditRecipe = (recipe: Recipe) => {
    setRecipeToEdit(recipe);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setRecipeToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header y Botón Nueva Comida */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900">
              Comidas, Recetas y Precios
            </h2>
            <span className="bg-brand-100 text-brand-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {recipes.length} productos
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Margen de ganancia promedio de tu menú: <strong className="text-emerald-600 font-bold">{formatPercent(avgMargin)}</strong>. Modifica recetas o agrega nuevas opciones.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva Comida / Receta</span>
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o ingrediente..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'empanadas', label: '🥟 Empanadas' },
            { id: 'comidas', label: '🍲 Comidas' },
            { id: 'postres', label: '🍰 Postres' },
            { id: 'budines', label: '🍞 Budines' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Recetas */}
      {filteredRecipes.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No se encontraron comidas</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Intenta con otro término de búsqueda o agrega una nueva comida a la lista.
          </p>
          <button
            onClick={handleCreateNew}
            className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            + Crear Nueva Comida
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onEdit={handleEditRecipe}
            />
          ))}
        </div>
      )}

      {/* Modal para Crear/Editar Receta */}
      <RecipeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recipeToEdit={recipeToEdit}
      />
    </div>
  );
};
