import React from 'react';
import { 
  ClipboardList, 
  UtensilsCrossed, 
  ShoppingBag, 
  TrendingUp, 
  RotateCcw, 
  Download, 
  Upload,
  ChefHat
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type ActiveTab = 'orders' | 'recipes' | 'ingredients' | 'dashboard';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onNewOrder: () => void;
  onNewRecipe: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNewOrder,
  onNewRecipe
}) => {
  const { 
    recipes, 
    orders, 
    syncStatus, 
    pendingSyncCount, 
    forceCloudSync, 
    resetToInitialData, 
    exportBackup, 
    importBackup 
  } = useApp();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importBackup(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const navItems = [
    {
      id: 'orders' as ActiveTab,
      label: 'Pedidos & Calculadora',
      icon: ClipboardList,
      badge: orders.length > 0 ? orders.length : undefined,
    },
    {
      id: 'recipes' as ActiveTab,
      label: 'Comidas & Recetas',
      icon: UtensilsCrossed,
      badge: recipes.length,
    },
    {
      id: 'ingredients' as ActiveTab,
      label: 'Despensa de Insumos',
      icon: ShoppingBag,
    },
    {
      id: 'dashboard' as ActiveTab,
      label: 'Rentabilidad & Métricas',
      icon: TrendingUp,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Marca */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('orders')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                  coti<span className="text-brand-600">comidas</span>
                </span>
                
                {/* Badge de estado de sincronización */}
                {syncStatus === 'synced' && (
                  <span
                    title="Conectado a la nube (Supabase) en tiempo real"
                    className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>En la nube</span>
                  </span>
                )}

                {syncStatus === 'syncing' && (
                  <span
                    title="Sincronizando con Supabase..."
                    className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                    <span>Sincronizando...</span>
                  </span>
                )}

                {(syncStatus === 'offline' || syncStatus === 'local_only') && (
                  <button
                    onClick={forceCloudSync}
                    title="Modo local / sin conexión activo. Click para reintentar sincronizar."
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>
                      {pendingSyncCount > 0 ? `${pendingSyncCount} ptes. de subida` : 'Modo local'}
                    </span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Control de costos, recetas y ganancias en tiempo real</p>
            </div>
          </div>

          {/* Botones de acción rápida en el Header */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNewOrder}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Nuevo Pedido</span>
            </button>

            <button
              onClick={onNewRecipe}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              title="Crear nueva comida o receta"
            >
              <UtensilsCrossed className="w-4 h-4 text-brand-600" />
              <span className="hidden md:inline">+ Nueva Comida</span>
            </button>

            {/* Menu de utilidades (Backup, Reset) */}
            <div className="flex items-center border-l border-slate-200 pl-2 ml-1 gap-1">
              <button
                onClick={exportBackup}
                title="Descargar copia de seguridad (JSON)"
                className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                title="Restaurar copia de seguridad"
                className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />

              <button
                onClick={resetToInitialData}
                title="Restaurar datos iniciales de precios coti.xlsx"
                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                      isActive ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
