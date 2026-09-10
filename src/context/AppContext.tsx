import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Ingredient, Recipe, Order } from '../types';
import { INITIAL_INGREDIENTS, INITIAL_RECIPES, INITIAL_ORDERS } from '../data/initialData';
import { calculateCostPerBaseUnit } from '../utils/calculations';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  syncService, 
  mapDBToIngredient, 
  mapDBToRecipe, 
  mapDBToOrder,
  getOfflineQueue 
} from '../services/syncService';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'local_only';

interface AppContextType {
  ingredients: Ingredient[];
  recipes: Recipe[];
  orders: Order[];
  ingredientsMap: Map<string, Ingredient>;
  recipesMap: Map<string, Recipe>;
  syncStatus: SyncStatus;
  pendingSyncCount: number;

  // Insumos
  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'costPerBaseUnit'>) => void;
  updateIngredient: (ingredient: Ingredient) => void;
  deleteIngredient: (id: string) => void;

  // Recetas / Comidas
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;

  // Pedidos
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;

  // Utilidades de datos
  forceCloudSync: () => Promise<void>;
  resetToInitialData: () => void;
  exportBackup: () => void;
  importBackup: (file: File) => Promise<boolean>;
}

const STORAGE_KEYS = {
  INGREDIENTS: 'coti_ingredients_v1',
  RECIPES: 'coti_recipes_v1',
  ORDERS: 'coti_orders_v1',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
      return saved ? JSON.parse(saved) : INITIAL_INGREDIENTS;
    } catch {
      return INITIAL_INGREDIENTS;
    }
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECIPES);
      return saved ? JSON.parse(saved) : INITIAL_RECIPES;
    } catch {
      return INITIAL_RECIPES;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => {
    if (!isSupabaseConfigured) return 'local_only';
    return navigator.onLine ? 'synced' : 'offline';
  });

  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => {
    return getOfflineQueue().length;
  });

  // Guardar en localStorage siempre de forma inmediata (local-first)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  // Sincronización con Supabase (descarga inicial y vaciado de cola offline)
  const forceCloudSync = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setSyncStatus('local_only');
      return;
    }

    if (!navigator.onLine) {
      setSyncStatus('offline');
      return;
    }

    try {
      setSyncStatus('syncing');

      // 1. Vaciar cualquier mutación offline pendiente
      await syncService.syncOfflineQueue();
      setPendingSyncCount(getOfflineQueue().length);

      // 2. Traer datos remotos
      const remoteData = await syncService.fetchAllRemote();
      if (remoteData) {
        if (
          remoteData.ingredients.length > 0 ||
          remoteData.recipes.length > 0 ||
          remoteData.orders.length > 0
        ) {
          setIngredients(remoteData.ingredients);
          setRecipes(remoteData.recipes);
          setOrders(remoteData.orders);
        } else {
          // La base remota está vacía, subir baseline
          await syncService.uploadInitialIfEmpty(ingredients, recipes, orders);
        }
        setSyncStatus('synced');
      } else {
        setSyncStatus('offline');
      }
    } catch (e) {
      console.warn('Error durante forceCloudSync', e);
      setSyncStatus('offline');
    }
  }, [ingredients, recipes, orders]);

  // Manejo de eventos de red y Realtime de Supabase
  useEffect(() => {
    const handleOnline = () => {
      if (isSupabaseConfigured) {
        forceCloudSync();
      }
    };
    const handleOffline = () => {
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Ejecutar sincronización al inicio
    forceCloudSync();

    // Configurar suscripción Realtime si Supabase está activo
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel('coticomidas-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'ingredients' },
          payload => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const updated = mapDBToIngredient(payload.new);
              setIngredients(prev => {
                const idx = prev.findIndex(i => i.id === updated.id);
                if (idx >= 0) {
                  const copy = [...prev];
                  copy[idx] = updated;
                  return copy;
                }
                return [updated, ...prev];
              });
            } else if (payload.eventType === 'DELETE') {
              setIngredients(prev => prev.filter(i => i.id !== payload.old.id));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'recipes' },
          payload => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const updated = mapDBToRecipe(payload.new);
              setRecipes(prev => {
                const idx = prev.findIndex(r => r.id === updated.id);
                if (idx >= 0) {
                  const copy = [...prev];
                  copy[idx] = updated;
                  return copy;
                }
                return [updated, ...prev];
              });
            } else if (payload.eventType === 'DELETE') {
              setRecipes(prev => prev.filter(r => r.id !== payload.old.id));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          payload => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const updated = mapDBToOrder(payload.new);
              setOrders(prev => {
                const idx = prev.findIndex(o => o.id === updated.id);
                if (idx >= 0) {
                  const copy = [...prev];
                  copy[idx] = updated;
                  return copy;
                }
                return [updated, ...prev];
              });
            } else if (payload.eventType === 'DELETE') {
              setOrders(prev => prev.filter(o => o.id !== payload.old.id));
            }
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [forceCloudSync]);

  // Mapas para acceso O(1) rápido
  const ingredientsMap = useMemo(() => {
    const map = new Map<string, Ingredient>();
    ingredients.forEach(ing => map.set(ing.id, ing));
    return map;
  }, [ingredients]);

  const recipesMap = useMemo(() => {
    const map = new Map<string, Recipe>();
    recipes.forEach(rec => map.set(rec.id, rec));
    return map;
  }, [recipes]);

  // Manejadores de Insumos
  const addIngredient = (item: Omit<Ingredient, 'id' | 'costPerBaseUnit'>) => {
    const costPerBaseUnit = calculateCostPerBaseUnit(
      item.purchasePrice,
      item.purchaseQuantity,
      item.purchaseUnit,
      item.baseUnit
    );

    const newIng: Ingredient = {
      ...item,
      id: `ing-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      costPerBaseUnit,
      updatedAt: new Date().toISOString(),
    };

    setIngredients(prev => [newIng, ...prev]);
    syncService.upsertIngredient(newIng);
    setPendingSyncCount(getOfflineQueue().length);
  };

  const updateIngredient = (updated: Ingredient) => {
    const costPerBaseUnit = calculateCostPerBaseUnit(
      updated.purchasePrice,
      updated.purchaseQuantity,
      updated.purchaseUnit,
      updated.baseUnit
    );

    const normalized: Ingredient = {
      ...updated,
      costPerBaseUnit,
      updatedAt: new Date().toISOString(),
    };

    setIngredients(prev => prev.map(item => (item.id === updated.id ? normalized : item)));
    syncService.upsertIngredient(normalized);
    setPendingSyncCount(getOfflineQueue().length);
  };

  const deleteIngredient = (id: string) => {
    setIngredients(prev => prev.filter(item => item.id !== id));
    syncService.deleteIngredient(id);
    setPendingSyncCount(getOfflineQueue().length);
  };

  // Manejadores de Recetas / Comidas
  const addRecipe = (recipeData: Omit<Recipe, 'id'>) => {
    const newRecipe: Recipe = {
      ...recipeData,
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setRecipes(prev => [newRecipe, ...prev]);
    syncService.upsertRecipe(newRecipe);
    setPendingSyncCount(getOfflineQueue().length);
  };

  const updateRecipe = (updated: Recipe) => {
    setRecipes(prev => prev.map(rec => (rec.id === updated.id ? updated : rec)));
    syncService.upsertRecipe(updated);
    setPendingSyncCount(getOfflineQueue().length);
  };

  const deleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(rec => rec.id !== id));
    syncService.deleteRecipe(id);
    setPendingSyncCount(getOfflineQueue().length);
  };

  // Manejadores de Pedidos
  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ped-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setOrders(prev => [newOrder, ...prev]);
    syncService.upsertOrder(newOrder);
    setPendingSyncCount(getOfflineQueue().length);
    return newOrder;
  };

  const updateOrder = (updated: Order) => {
    setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
    syncService.upsertOrder(updated);
    setPendingSyncCount(getOfflineQueue().length);
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    syncService.deleteOrder(id);
    setPendingSyncCount(getOfflineQueue().length);
  };

  // Utilidades
  const resetToInitialData = () => {
    if (window.confirm('¿Seguro que deseas restaurar las recetas e insumos originales del archivo Excel? Los pedidos guardados se mantendrán.')) {
      setIngredients(INITIAL_INGREDIENTS);
      setRecipes(INITIAL_RECIPES);
      localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(INITIAL_INGREDIENTS));
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(INITIAL_RECIPES));
      
      if (isSupabaseConfigured && supabase) {
        INITIAL_INGREDIENTS.forEach(i => syncService.upsertIngredient(i));
        INITIAL_RECIPES.forEach(r => syncService.upsertRecipe(r));
      }
    }
  };

  const exportBackup = () => {
    const data = {
      ingredients,
      recipes,
      orders,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coticomidas_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed.ingredients && parsed.recipes) {
        setIngredients(parsed.ingredients);
        setRecipes(parsed.recipes);
        if (parsed.orders) setOrders(parsed.orders);

        if (isSupabaseConfigured && supabase) {
          parsed.ingredients.forEach((i: any) => syncService.upsertIngredient(i));
          parsed.recipes.forEach((r: any) => syncService.upsertRecipe(r));
          if (parsed.orders) parsed.orders.forEach((o: any) => syncService.upsertOrder(o));
        }

        alert('Copia de seguridad restaurada correctamente.');
        return true;
      } else {
        alert('El archivo no tiene el formato esperado.');
        return false;
      }
    } catch (e) {
      alert('Error al leer el archivo de copia de seguridad.');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        ingredients,
        recipes,
        orders,
        ingredientsMap,
        recipesMap,
        syncStatus,
        pendingSyncCount,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        addOrder,
        updateOrder,
        deleteOrder,
        forceCloudSync,
        resetToInitialData,
        exportBackup,
        importBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
