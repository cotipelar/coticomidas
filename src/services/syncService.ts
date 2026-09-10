import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Ingredient, Recipe, Order } from '../types';

interface SyncAction {
  id: string;
  table: 'ingredients' | 'recipes' | 'orders';
  type: 'upsert' | 'delete';
  payload: any;
  timestamp: number;
}

const SYNC_QUEUE_KEY = 'coticomidas_offline_sync_queue';

export const getOfflineQueue = (): SyncAction[] => {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveOfflineQueue = (queue: SyncAction[]) => {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Error saving sync queue', e);
  }
};

export const enqueueAction = (
  table: 'ingredients' | 'recipes' | 'orders',
  type: 'upsert' | 'delete',
  payload: any
) => {
  const queue = getOfflineQueue();
  // Evitar duplicados innecesarios de la misma entidad
  const entityId = payload.id;
  const filtered = queue.filter(
    item => !(item.table === table && item.payload.id === entityId)
  );

  filtered.push({
    id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    table,
    type,
    payload,
    timestamp: Date.now(),
  });

  saveOfflineQueue(filtered);
};

// Conversiones de Formato (CamelCase <-> SnakeCase)
export const mapIngredientToDB = (ing: Ingredient) => ({
  id: ing.id,
  name: ing.name,
  category: ing.category,
  purchase_price: ing.purchasePrice,
  purchase_quantity: ing.purchaseQuantity,
  purchase_unit: ing.purchaseUnit,
  cost_per_base_unit: ing.costPerBaseUnit,
  base_unit: ing.baseUnit,
  notes: ing.notes || null,
  updated_at: ing.updatedAt || new Date().toISOString(),
});

export const mapDBToIngredient = (row: any): Ingredient => ({
  id: row.id,
  name: row.name,
  category: row.category,
  purchasePrice: Number(row.purchase_price),
  purchaseQuantity: Number(row.purchase_quantity),
  purchaseUnit: row.purchase_unit,
  costPerBaseUnit: Number(row.cost_per_base_unit),
  baseUnit: row.base_unit,
  notes: row.notes || undefined,
  updatedAt: row.updated_at,
});

export const mapRecipeToDB = (rec: Recipe) => ({
  id: rec.id,
  name: rec.name,
  category: rec.category,
  description: rec.description || null,
  yield_count: rec.yieldCount,
  yield_unit: rec.yieldUnit,
  sale_price: rec.salePrice,
  ingredients: rec.ingredients,
  packaging: rec.packaging || [],
  notes: rec.notes || null,
  updated_at: new Date().toISOString(),
});

export const mapDBToRecipe = (row: any): Recipe => ({
  id: row.id,
  name: row.name,
  category: row.category,
  description: row.description || undefined,
  yieldCount: Number(row.yield_count) || 1,
  yieldUnit: row.yield_unit,
  salePrice: Number(row.sale_price) || 0,
  ingredients: row.ingredients || [],
  packaging: row.packaging || [],
  notes: row.notes || undefined,
});

export const mapOrderToDB = (order: Order) => ({
  id: order.id,
  customer_name: order.customerName,
  phone: order.phone || null,
  created_at: order.createdAt,
  delivery_date: order.deliveryDate || null,
  status: order.status,
  items: order.items,
  notes: order.notes || null,
  updated_at: new Date().toISOString(),
});

export const mapDBToOrder = (row: any): Order => ({
  id: row.id,
  customerName: row.customer_name,
  phone: row.phone || undefined,
  createdAt: row.created_at,
  deliveryDate: row.delivery_date || undefined,
  status: row.status,
  items: row.items || [],
  notes: row.notes || undefined,
});

// Sincronización en la nube con Supabase
export const syncService = {
  async fetchAllRemote() {
    if (!supabase || !isSupabaseConfigured) return null;

    try {
      const [ingRes, recRes, ordRes] = await Promise.all([
        supabase.from('ingredients').select('*'),
        supabase.from('recipes').select('*'),
        supabase.from('orders').select('*'),
      ]);

      if (ingRes.error || recRes.error || ordRes.error) {
        console.warn('Error al leer datos remotos de Supabase', {
          ingRes: ingRes.error,
          recRes: recRes.error,
          ordRes: ordRes.error,
        });
        return null;
      }

      return {
        ingredients: (ingRes.data || []).map(mapDBToIngredient),
        recipes: (recRes.data || []).map(mapDBToRecipe),
        orders: (ordRes.data || []).map(mapDBToOrder),
      };
    } catch (e) {
      console.warn('Fallo de conexión al buscar datos en Supabase (Modo Offline activo)', e);
      return null;
    }
  },

  async syncOfflineQueue() {
    if (!supabase || !isSupabaseConfigured || !navigator.onLine) return;

    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    const remaining: SyncAction[] = [];

    for (const action of queue) {
      try {
        if (action.type === 'upsert') {
          let row: any;
          if (action.table === 'ingredients') row = mapIngredientToDB(action.payload);
          else if (action.table === 'recipes') row = mapRecipeToDB(action.payload);
          else if (action.table === 'orders') row = mapOrderToDB(action.payload);

          const { error } = await supabase.from(action.table).upsert(row);
          if (error) throw error;
        } else if (action.type === 'delete') {
          const { error } = await supabase
            .from(action.table)
            .delete()
            .eq('id', action.payload.id);
          if (error) throw error;
        }
      } catch (e) {
        console.warn(`No se pudo sincronizar acción ${action.table}:${action.type}`, e);
        remaining.push(action);
      }
    }

    saveOfflineQueue(remaining);
  },

  async uploadInitialIfEmpty(
    ingredients: Ingredient[],
    recipes: Recipe[],
    orders: Order[]
  ) {
    if (!supabase || !isSupabaseConfigured || !navigator.onLine) return;

    try {
      const { count, error } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true });

      if (!error && (count === 0 || count === null)) {
        console.log('Inicializando base de datos remota con los datos base...');
        await Promise.all([
          supabase.from('ingredients').upsert(ingredients.map(mapIngredientToDB)),
          supabase.from('recipes').upsert(recipes.map(mapRecipeToDB)),
          supabase.from('orders').upsert(orders.map(mapOrderToDB)),
        ]);
      }
    } catch (e) {
      console.warn('No se pudo verificar/subir la carga inicial', e);
    }
  },

  async upsertIngredient(ing: Ingredient) {
    if (supabase && isSupabaseConfigured && navigator.onLine) {
      try {
        const { error } = await supabase.from('ingredients').upsert(mapIngredientToDB(ing));
        if (!error) return;
      } catch {}
    }
    enqueueAction('ingredients', 'upsert', ing);
  },

  async deleteIngredient(id: string) {
    if (supabase && isSupabaseConfigured && navigator.onLine) {
      try {
        const { error } = await supabase.from('ingredients').delete().eq('id', id);
        if (!error) return;
      } catch {}
    }
    enqueueAction('ingredients', 'delete', { id });
  },

  async upsertRecipe(rec: Recipe) {
    if (supabase && isSupabaseConfigured && navigator.onLine) {
      try {
        const { error } = await supabase.from('recipes').upsert(mapRecipeToDB(rec));
        if (!error) return;
      } catch {}
    }
    enqueueAction('recipes', 'upsert', rec);
  },

  async deleteRecipe(id: string) {
    if (supabase && isSupabaseConfigured && navigator.onLine) {
      try {
        const { error } = await supabase.from('recipes').delete().eq('id', id);
        if (!error) return;
      } catch {}
    }
    enqueueAction('recipes', 'delete', { id });
  },

  async upsertOrder(order: Order) {
    if (supabase && isSupabaseConfigured && navigator.onLine) {
      try {
        const { error } = await supabase.from('orders').upsert(mapOrderToDB(order));
        if (!error) return;
      } catch {}
    }
    enqueueAction('orders', 'upsert', order);
  },

  async deleteOrder(id: string) {
    if (supabase && isSupabaseConfigured && navigator.onLine) {
      try {
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (!error) return;
      } catch {}
    }
    enqueueAction('orders', 'delete', { id });
  },
};
