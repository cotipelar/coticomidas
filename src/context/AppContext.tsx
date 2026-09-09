import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Ingredient, Recipe, Order } from '../types';
import { INITIAL_INGREDIENTS, INITIAL_RECIPES, INITIAL_ORDERS } from '../data/initialData';
import { calculateCostPerBaseUnit } from '../utils/calculations';

interface AppContextType {
  ingredients: Ingredient[];
  recipes: Recipe[];
  orders: Order[];
  ingredientsMap: Map<string, Ingredient>;
  recipesMap: Map<string, Recipe>;

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

  // Guardar en localStorage ante cambios
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

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
  };

  const updateIngredient = (updated: Ingredient) => {
    const costPerBaseUnit = calculateCostPerBaseUnit(
      updated.purchasePrice,
      updated.purchaseQuantity,
      updated.purchaseUnit,
      updated.baseUnit
    );

    setIngredients(prev =>
      prev.map(item =>
        item.id === updated.id
          ? { ...updated, costPerBaseUnit, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const deleteIngredient = (id: string) => {
    setIngredients(prev => prev.filter(item => item.id !== id));
  };

  // Manejadores de Recetas / Comidas
  const addRecipe = (recipeData: Omit<Recipe, 'id'>) => {
    const newRecipe: Recipe = {
      ...recipeData,
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setRecipes(prev => [newRecipe, ...prev]);
  };

  const updateRecipe = (updated: Recipe) => {
    setRecipes(prev => prev.map(rec => (rec.id === updated.id ? updated : rec)));
  };

  const deleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(rec => rec.id !== id));
  };

  // Manejadores de Pedidos
  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ped-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrder = (updated: Order) => {
    setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  // Utilidades
  const resetToInitialData = () => {
    if (window.confirm('¿Seguro que deseas restaurar las recetas e insumos originales del archivo Excel? Los pedidos guardados se mantendrán.')) {
      setIngredients(INITIAL_INGREDIENTS);
      setRecipes(INITIAL_RECIPES);
      localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(INITIAL_INGREDIENTS));
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(INITIAL_RECIPES));
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
        addIngredient,
        updateIngredient,
        deleteIngredient,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        addOrder,
        updateOrder,
        deleteOrder,
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
