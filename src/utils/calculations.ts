import { Ingredient, Recipe, Order, OrderTotals, ProductFinancials } from '../types';

export function calculateCostPerBaseUnit(
  purchasePrice: number,
  purchaseQuantity: number,
  purchaseUnit: string,
  baseUnit: 'g' | 'ml' | 'u'
): number {
  if (!purchaseQuantity || purchaseQuantity <= 0) return 0;
  
  if (purchaseUnit === 'kg' && baseUnit === 'g') {
    return purchasePrice / (purchaseQuantity * 1000);
  }
  if (purchaseUnit === 'l' && baseUnit === 'ml') {
    return purchasePrice / (purchaseQuantity * 1000);
  }
  return purchasePrice / purchaseQuantity;
}

export function getRecipeFinancials(
  recipe: Recipe,
  ingredientsMap: Map<string, Ingredient>
): ProductFinancials {
  let ingredientsCost = 0;
  let packagingCost = 0;

  recipe.ingredients.forEach(item => {
    const ing = ingredientsMap.get(item.ingredientId);
    if (ing) {
      ingredientsCost += (item.quantity * ing.costPerBaseUnit);
    }
  });

  (recipe.packaging || []).forEach(item => {
    const ing = ingredientsMap.get(item.ingredientId);
    if (ing) {
      packagingCost += (item.quantity * ing.costPerBaseUnit);
    }
  });

  const totalBatchCost = ingredientsCost + packagingCost;
  const yieldCount = recipe.yieldCount > 0 ? recipe.yieldCount : 1;
  const unitCost = totalBatchCost / yieldCount;
  const salePrice = recipe.salePrice || 0;
  const unitProfit = salePrice - unitCost;
  const marginPercent = salePrice > 0 ? (unitProfit / salePrice) * 100 : 0;
  const markupPercent = unitCost > 0 ? (unitProfit / unitCost) * 100 : 0;

  return {
    recipeId: recipe.id,
    name: recipe.name,
    totalBatchCost,
    unitCost,
    salePrice,
    unitProfit,
    marginPercent,
    markupPercent,
  };
}

export function calculateOrderTotals(
  items: { recipeId: string; quantity: number; customPrice?: number }[],
  recipesMap: Map<string, Recipe>,
  ingredientsMap: Map<string, Ingredient>
): OrderTotals {
  let totalRevenue = 0;
  let totalCost = 0;
  let itemCount = 0;

  items.forEach(item => {
    if (item.quantity <= 0) return;
    const recipe = recipesMap.get(item.recipeId);
    if (!recipe) return;

    const fin = getRecipeFinancials(recipe, ingredientsMap);
    const unitPrice = item.customPrice !== undefined ? item.customPrice : fin.salePrice;

    totalRevenue += unitPrice * item.quantity;
    totalCost += fin.unitCost * item.quantity;
    itemCount += item.quantity;
  });

  const totalProfit = totalRevenue - totalCost;
  const marginPercent = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalCost,
    totalProfit,
    marginPercent,
    itemCount,
  };
}

export interface ShoppingListItem {
  ingredient: Ingredient;
  totalQuantityRequired: number; // En baseUnit
  displayQuantity: string;
  estimatedCost: number;
  isPackaging: boolean;
}

export function calculateShoppingList(
  items: { recipeId: string; quantity: number }[],
  recipesMap: Map<string, Recipe>,
  ingredientsMap: Map<string, Ingredient>
): ShoppingListItem[] {
  const reqMap = new Map<string, { qty: number; isPackaging: boolean }>();

  items.forEach(orderItem => {
    if (orderItem.quantity <= 0) return;
    const recipe = recipesMap.get(orderItem.recipeId);
    if (!recipe) return;

    // Cada receta produce `recipe.yieldCount` porciones/unidades en una tanda.
    // Si un cliente pide `quantity` unidades/porciones, necesitamos (quantity / yieldCount) tandas.
    const batches = orderItem.quantity / (recipe.yieldCount || 1);

    recipe.ingredients.forEach(ingItem => {
      const current = reqMap.get(ingItem.ingredientId) || { qty: 0, isPackaging: false };
      current.qty += ingItem.quantity * batches;
      reqMap.set(ingItem.ingredientId, current);
    });

    (recipe.packaging || []).forEach(pkgItem => {
      const current = reqMap.get(pkgItem.ingredientId) || { qty: 0, isPackaging: true };
      current.qty += pkgItem.quantity * batches;
      current.isPackaging = true;
      reqMap.set(pkgItem.ingredientId, current);
    });
  });

  const result: ShoppingListItem[] = [];

  reqMap.forEach((data, ingId) => {
    const ing = ingredientsMap.get(ingId);
    if (!ing) return;

    const totalQty = Math.round(data.qty * 100) / 100;
    let display = `${totalQty} ${ing.baseUnit}`;

    if (ing.baseUnit === 'g') {
      if (totalQty >= 1000) {
        display = `${(totalQty / 1000).toFixed(2).replace(/\.00$/, '')} kg`;
      } else {
        display = `${Math.round(totalQty)} g`;
      }
    } else if (ing.baseUnit === 'ml') {
      if (totalQty >= 1000) {
        display = `${(totalQty / 1000).toFixed(2).replace(/\.00$/, '')} L`;
      } else {
        display = `${Math.round(totalQty)} ml`;
      }
    } else if (ing.baseUnit === 'u') {
      display = `${Math.ceil(totalQty)} u`;
    }

    const estimatedCost = totalQty * ing.costPerBaseUnit;

    result.push({
      ingredient: ing,
      totalQuantityRequired: totalQty,
      displayQuantity: display,
      estimatedCost,
      isPackaging: data.isPackaging,
    });
  });

  // Ordenar por costo estimado descendente
  return result.sort((a, b) => b.estimatedCost - a.estimatedCost);
}

export function formatCurrency(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return '$0';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatPercent(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return '0%';
  return `${value.toFixed(1)}%`;
}
