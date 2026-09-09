import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { OrderCalculator } from './components/Orders/OrderCalculator';
import { OrderList } from './components/Orders/OrderList';
import { RecipeList } from './components/Recipes/RecipeList';
import { RecipeModal } from './components/Recipes/RecipeModal';
import { IngredientList } from './components/Ingredients/IngredientList';
import { MetricsSummary } from './components/Dashboard/MetricsSummary';
import { Order, Recipe } from './types';
import { Plus, ListFilter, ClipboardCheck, Sparkles, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { orders, recipes } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('orders');
  const [ordersSubView, setOrdersSubView] = useState<'calculator' | 'list'>('calculator');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Modal para crear nueva comida desde cualquier botón
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);

  const handleNewOrder = () => {
    setEditingOrder(null);
    setOrdersSubView('calculator');
    setActiveTab('orders');
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setOrdersSubView('calculator');
    setActiveTab('orders');
  };

  const handleNewRecipe = () => {
    setRecipeToEdit(null);
    setIsRecipeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-brand-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewOrder={handleNewOrder}
        onNewRecipe={handleNewRecipe}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Pestaña de Pedidos */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Sub-navegación entre Calculadora y Lista de Pedidos */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingOrder(null);
                    setOrdersSubView('calculator');
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    ordersSubView === 'calculator'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingOrder ? 'Editando Pedido' : 'Armar Pedido / Tanda'}</span>
                </button>

                <button
                  onClick={() => setOrdersSubView('list')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    ordersSubView === 'list'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <ListFilter className="w-4 h-4" />
                  <span>Historial de Pedidos</span>
                  <span
                    className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full ${
                      ordersSubView === 'list'
                        ? 'bg-white text-brand-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {orders.length}
                  </span>
                </button>
              </div>

              {ordersSubView === 'calculator' && (
                <button
                  onClick={() => setOrdersSubView('list')}
                  className="text-xs font-semibold text-slate-500 hover:text-brand-600 hidden sm:block"
                >
                  Ver todos los pedidos guardados →
                </button>
              )}
            </div>

            {ordersSubView === 'calculator' ? (
              <OrderCalculator
                editingOrder={editingOrder}
                onFinished={() => {
                  setEditingOrder(null);
                  setOrdersSubView('list');
                }}
              />
            ) : (
              <OrderList
                onEditOrder={handleEditOrder}
                onNewOrder={handleNewOrder}
              />
            )}
          </div>
        )}

        {/* Pestaña de Comidas & Recetas */}
        {activeTab === 'recipes' && (
          <RecipeList onNewRecipeRequest={handleNewRecipe} />
        )}

        {/* Pestaña de Despensa e Insumos */}
        {activeTab === 'ingredients' && <IngredientList />}

        {/* Pestaña de Rentabilidad & Métricas */}
        {activeTab === 'dashboard' && <MetricsSummary />}
      </main>

      {/* Modal global de nueva comida */}
      <RecipeModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        recipeToEdit={recipeToEdit}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <span>Hecho con</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>para el emprendimiento gastronómico coticomidas</span>
          </div>
          <div className="text-slate-400">
            Los datos se guardan de forma segura y automática en tu navegador.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
