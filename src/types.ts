export type UnitType = 'g' | 'kg' | 'ml' | 'l' | 'u' | 'paquete' | 'docena';

export type IngredientCategory = 
  | 'carnes'
  | 'verduras'
  | 'lacteos'
  | 'almacen'
  | 'packaging'
  | 'otros';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  purchasePrice: number;       // Precio que pagó por el paquete/bulto
  purchaseQuantity: number;    // Cantidad del paquete (ej: 3.5, 1, 500)
  purchaseUnit: UnitType;      // Unidad del paquete ('kg', 'g', 'l', 'u', 'paquete')
  costPerBaseUnit: number;     // Costo normalizado por gramo, ml o unidad
  baseUnit: 'g' | 'ml' | 'u';  // Unidad base de cálculo
  notes?: string;
  updatedAt?: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;            // Cantidad en baseUnit (ej. 300g, 1u, etc.)
  notes?: string;
}

export type FoodCategory = 
  | 'empanadas'
  | 'comidas'
  | 'postres'
  | 'budines'
  | 'otros';

export interface Recipe {
  id: string;
  name: string;
  category: FoodCategory;
  description?: string;
  yieldCount: number;          // Rendimiento de la receta (ej: 1 docena, 4 potes, 2 budines)
  yieldUnit: string;           // 'docena', 'porción', 'kg', 'unidad', 'pote', 'budín'
  salePrice: number;           // Precio de venta por unidad de rendimiento
  ingredients: RecipeIngredient[];
  packaging: RecipeIngredient[];
  notes?: string;
}

export interface OrderItem {
  recipeId: string;
  quantity: number;            // Cantidad de yieldUnits pedidos (ej. 3 docenas)
  customPrice?: number;        // Por si se hace precio especial
}

export type OrderStatus = 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cobrado';

export interface Order {
  id: string;
  customerName: string;
  phone?: string;
  createdAt: string;
  deliveryDate?: string;
  status: OrderStatus;
  items: OrderItem[];
  notes?: string;
}

export interface ProductFinancials {
  recipeId: string;
  name: string;
  totalBatchCost: number;
  unitCost: number;
  salePrice: number;
  unitProfit: number;
  marginPercent: number;       // (Ganancia / Venta) * 100
  markupPercent: number;       // (Ganancia / Costo) * 100
}

export interface OrderTotals {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  marginPercent: number;
  itemCount: number;
}
