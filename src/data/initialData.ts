import { Ingredient, Recipe, Order } from '../types';

export const INITIAL_INGREDIENTS: Ingredient[] = [
  // Carnes
  {
    id: 'carne-picada',
    name: 'Carne picada especial',
    category: 'carnes',
    purchasePrice: 7900,
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    costPerBaseUnit: 7.9,
    baseUnit: 'g',
    notes: 'Para empanadas, pastel de papas y albóndigas',
  },
  {
    id: 'pollo',
    name: 'Pechuga / Pollo desmenuzado',
    category: 'carnes',
    purchasePrice: 7900,
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    costPerBaseUnit: 7.9,
    baseUnit: 'g',
    notes: 'Para empanadas de pollo',
  },
  {
    id: 'jamon',
    name: 'Jamón cocido',
    category: 'carnes',
    purchasePrice: 11990,
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    costPerBaseUnit: 11.99,
    baseUnit: 'g',
  },

  // Lácteos y Huevos
  {
    id: 'queso-mozza',
    name: 'Queso Muzzarella / Barra',
    category: 'lacteos',
    purchasePrice: 10950,
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    costPerBaseUnit: 10.95,
    baseUnit: 'g',
  },
  {
    id: 'queso-crema',
    name: 'Queso crema (balde)',
    category: 'lacteos',
    purchasePrice: 41525,
    purchaseQuantity: 3.5,
    purchaseUnit: 'kg',
    costPerBaseUnit: 41525 / 3500, // ~11.864 / g
    baseUnit: 'g',
    notes: 'Balde de 3.5 kg para Tiramisú',
  },
  {
    id: 'crema-leche',
    name: 'Crema de leche / Chantillí',
    category: 'lacteos',
    purchasePrice: 37015,
    purchaseQuantity: 2.5,
    purchaseUnit: 'kg',
    costPerBaseUnit: 37015 / 2500, // ~14.806 / g
    baseUnit: 'g',
    notes: 'Bidón/sachet de 2.5 kg',
  },
  {
    id: 'dulce-de-leche',
    name: 'Dulce de leche repostero',
    category: 'lacteos',
    purchasePrice: 27280,
    purchaseQuantity: 5,
    purchaseUnit: 'kg',
    costPerBaseUnit: 27280 / 5000, // ~5.456 / g
    baseUnit: 'g',
    notes: 'Pote familiar de 5 kg',
  },
  {
    id: 'huevo',
    name: 'Huevos (maple/unidad)',
    category: 'almacen',
    purchasePrice: 150,
    purchaseQuantity: 1,
    purchaseUnit: 'u',
    costPerBaseUnit: 150,
    baseUnit: 'u',
  },

  // Verdulería
  {
    id: 'cebolla',
    name: 'Cebolla',
    category: 'verduras',
    purchasePrice: 3500,
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    costPerBaseUnit: 3.5,
    baseUnit: 'g',
  },
  {
    id: 'zanahoria',
    name: 'Zanahoria',
    category: 'verduras',
    purchasePrice: 2500,
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    costPerBaseUnit: 2.5,
    baseUnit: 'g',
  },
  {
    id: 'pimiento',
    name: 'Pimiento / Morrón',
    category: 'verduras',
    purchasePrice: 6000,
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    costPerBaseUnit: 6.0,
    baseUnit: 'g',
  },
  {
    id: 'acelga',
    name: 'Acelga fresca',
    category: 'verduras',
    purchasePrice: 790,
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    costPerBaseUnit: 0.79,
    baseUnit: 'g',
    notes: 'Para empanadas de verdura',
  },
  {
    id: 'papas',
    name: 'Papas',
    category: 'verduras',
    purchasePrice: 3000,
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    costPerBaseUnit: 3.0,
    baseUnit: 'g',
    notes: 'Para puré de pastel de papas',
  },
  {
    id: 'aceitunas',
    name: 'Aceitunas descarozadas',
    category: 'verduras',
    purchasePrice: 18324,
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    costPerBaseUnit: 18.324,
    baseUnit: 'g',
  },
  {
    id: 'naranja',
    name: 'Naranja fresca',
    category: 'verduras',
    purchasePrice: 2000,
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    costPerBaseUnit: 2.0,
    baseUnit: 'g',
  },
  {
    id: 'limon',
    name: 'Limón / Mandarina',
    category: 'verduras',
    purchasePrice: 2000,
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    costPerBaseUnit: 2.0,
    baseUnit: 'g',
  },

  // Almacén
  {
    id: 'tapas-empanada',
    name: 'Tapas de empanada (paquete x 12)',
    category: 'almacen',
    purchasePrice: 1600,
    purchaseQuantity: 1,
    purchaseUnit: 'paquete',
    costPerBaseUnit: 1600,
    baseUnit: 'u',
    notes: '1 paquete rinde 1 docena',
  },
  {
    id: 'pan-rallado',
    name: 'Pan rallado',
    category: 'almacen',
    purchasePrice: 3600,
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    costPerBaseUnit: 3.6,
    baseUnit: 'g',
  },
  {
    id: 'azucar',
    name: 'Azúcar común',
    category: 'almacen',
    purchasePrice: 1485,
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    costPerBaseUnit: 1.485,
    baseUnit: 'g',
  },
  {
    id: 'harina',
    name: 'Harina leudante / 0000',
    category: 'almacen',
    purchasePrice: 1629,
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    costPerBaseUnit: 1.629,
    baseUnit: 'g',
  },
  {
    id: 'aceite',
    name: 'Aceite de girasol',
    category: 'almacen',
    purchasePrice: 13637,
    purchaseQuantity: 3,
    purchaseUnit: 'l',
    costPerBaseUnit: 13637 / 3000, // ~4.545 / ml
    baseUnit: 'ml',
    notes: 'Bidón de 3 litros',
  },
  {
    id: 'vainillas',
    name: 'Vainillas (paquete)',
    category: 'almacen',
    purchasePrice: 1700,
    purchaseQuantity: 1,
    purchaseUnit: 'paquete',
    costPerBaseUnit: 1700,
    baseUnit: 'u',
  },
  {
    id: 'cafe',
    name: 'Café soluble / torrado',
    category: 'almacen',
    purchasePrice: 23600,
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    costPerBaseUnit: 23.6,
    baseUnit: 'g',
  },
  {
    id: 'oreo',
    name: 'Galletitas Oreo (paquete)',
    category: 'almacen',
    purchasePrice: 4289,
    purchaseQuantity: 3,
    purchaseUnit: 'paquete',
    costPerBaseUnit: 4289 / 3, // ~1429.67 / paquete
    baseUnit: 'u',
  },
  {
    id: 'chocolinas',
    name: 'Galletitas Chocolinas (paquete)',
    category: 'almacen',
    purchasePrice: 2462,
    purchaseQuantity: 1,
    purchaseUnit: 'paquete',
    costPerBaseUnit: 2462,
    baseUnit: 'u',
  },

  // Packaging & Descartables
  {
    id: 'bandeja-empanada',
    name: 'Bandeja descartable p/ empanadas',
    category: 'packaging',
    purchasePrice: 174,
    purchaseQuantity: 1,
    purchaseUnit: 'u',
    costPerBaseUnit: 174,
    baseUnit: 'u',
  },
  {
    id: 'bolsa-arranque',
    name: 'Bolsa de arranque',
    category: 'packaging',
    purchasePrice: 120,
    purchaseQuantity: 1,
    purchaseUnit: 'u',
    costPerBaseUnit: 120,
    baseUnit: 'u',
  },
  {
    id: 'bolsa-camiseta',
    name: 'Bolsa camiseta / entrega',
    category: 'packaging',
    purchasePrice: 48,
    purchaseQuantity: 1,
    purchaseUnit: 'u',
    costPerBaseUnit: 48,
    baseUnit: 'u',
  },
  {
    id: 'pote-postre',
    name: 'Pote transparente p/ postre',
    category: 'packaging',
    purchasePrice: 207,
    purchaseQuantity: 1,
    purchaseUnit: 'u',
    costPerBaseUnit: 207,
    baseUnit: 'u',
  },
  {
    id: 'molde-budin',
    name: 'Molde descartable p/ budín',
    category: 'packaging',
    purchasePrice: 200,
    purchaseQuantity: 1,
    purchaseUnit: 'u',
    costPerBaseUnit: 200,
    baseUnit: 'u',
  },
];

export const INITIAL_RECIPES: Recipe[] = [
  // Empanadas
  {
    id: 'emp-jyq',
    name: 'Empanadas de Jamón y Queso',
    category: 'empanadas',
    description: '12 empanadas cargadas con jamón cocido y abundante muzzarella.',
    yieldCount: 1,
    yieldUnit: 'docena',
    salePrice: 16000,
    ingredients: [
      { ingredientId: 'tapas-empanada', quantity: 1 },
      { ingredientId: 'jamon', quantity: 300 }, // 300g
      { ingredientId: 'queso-mozza', quantity: 300 }, // 300g
    ],
    packaging: [
      { ingredientId: 'bandeja-empanada', quantity: 1 },
      { ingredientId: 'bolsa-arranque', quantity: 1 },
      { ingredientId: 'bolsa-camiseta', quantity: 1 },
    ],
    notes: 'Rinde 1 docena completa con empaque incluido.',
  },
  {
    id: 'emp-carne',
    name: 'Empanadas de Carne',
    category: 'empanadas',
    description: '12 empanadas con carne picada especial, cebolla rehogada, aceitunas, morrón y zanahoria.',
    yieldCount: 1,
    yieldUnit: 'docena',
    salePrice: 16000,
    ingredients: [
      { ingredientId: 'tapas-empanada', quantity: 1 },
      { ingredientId: 'carne-picada', quantity: 667 }, // 667g
      { ingredientId: 'aceitunas', quantity: 40 }, // 40g
      { ingredientId: 'cebolla', quantity: 500 }, // 500g
      { ingredientId: 'zanahoria', quantity: 150 }, // 150g
      { ingredientId: 'pimiento', quantity: 100 }, // 100g
    ],
    packaging: [
      { ingredientId: 'bandeja-empanada', quantity: 1 },
      { ingredientId: 'bolsa-arranque', quantity: 1 },
      { ingredientId: 'bolsa-camiseta', quantity: 1 },
    ],
  },
  {
    id: 'emp-verdura',
    name: 'Empanadas de Verdura',
    category: 'empanadas',
    description: '12 empanadas de acelga fresca cocida con cebollita rehogada.',
    yieldCount: 1,
    yieldUnit: 'docena',
    salePrice: 16000,
    ingredients: [
      { ingredientId: 'tapas-empanada', quantity: 1 },
      { ingredientId: 'acelga', quantity: 1330 }, // 1.33 kg en el excel
      { ingredientId: 'cebolla', quantity: 500 }, // 500g
    ],
    packaging: [
      { ingredientId: 'bandeja-empanada', quantity: 1 },
      { ingredientId: 'bolsa-arranque', quantity: 1 },
      { ingredientId: 'bolsa-camiseta', quantity: 1 },
    ],
  },
  {
    id: 'emp-pollo',
    name: 'Empanadas de Pollo',
    category: 'empanadas',
    description: '12 empanadas de pollo desmenuzado con cebolla, morrón y condimentos.',
    yieldCount: 1,
    yieldUnit: 'docena',
    salePrice: 16000,
    ingredients: [
      { ingredientId: 'tapas-empanada', quantity: 1 },
      { ingredientId: 'pollo', quantity: 667 }, // 667g
      { ingredientId: 'aceitunas', quantity: 40 },
      { ingredientId: 'cebolla', quantity: 500 },
      { ingredientId: 'zanahoria', quantity: 150 },
      { ingredientId: 'pimiento', quantity: 100 },
    ],
    packaging: [
      { ingredientId: 'bandeja-empanada', quantity: 1 },
      { ingredientId: 'bolsa-arranque', quantity: 1 },
      { ingredientId: 'bolsa-camiseta', quantity: 1 },
    ],
  },

  // Comidas
  {
    id: 'albondigas-kg',
    name: 'Albóndigas de Carne (x kg)',
    category: 'comidas',
    description: '1 kg de albóndigas caseras listas para cocinar o congelar.',
    yieldCount: 1,
    yieldUnit: 'kg',
    salePrice: 15000,
    ingredients: [
      { ingredientId: 'carne-picada', quantity: 1000 }, // 1 kg
      { ingredientId: 'cebolla', quantity: 250 }, // 250g
      { ingredientId: 'zanahoria', quantity: 100 }, // 100g
      { ingredientId: 'pimiento', quantity: 100 }, // 100g
      { ingredientId: 'pan-rallado', quantity: 100 }, // 100g
      { ingredientId: 'huevo', quantity: 1 }, // 1 u
    ],
    packaging: [
      { ingredientId: 'bolsa-arranque', quantity: 1 },
      { ingredientId: 'bolsa-camiseta', quantity: 1 },
    ],
  },
  {
    id: 'pastel-papas',
    name: 'Pastel de Papas (porción individual)',
    category: 'comidas',
    description: 'Porción individual generosa con puré de papas casero y relleno de carne condimentado.',
    yieldCount: 1,
    yieldUnit: 'porción',
    salePrice: 7500,
    ingredients: [
      { ingredientId: 'papas', quantity: 375 }, // 375g
      { ingredientId: 'carne-picada', quantity: 340 }, // 340g
      { ingredientId: 'aceitunas', quantity: 15 }, // 15g
      { ingredientId: 'cebolla', quantity: 175 }, // 175g
      { ingredientId: 'zanahoria', quantity: 50 }, // 50g
      { ingredientId: 'pimiento', quantity: 33 }, // 33g
    ],
    packaging: [
      { ingredientId: 'bandeja-empanada', quantity: 1 },
      { ingredientId: 'bolsa-arranque', quantity: 1 },
    ],
  },

  // Postres
  {
    id: 'tiramisu',
    name: 'Tiramisú en Pote',
    category: 'postres',
    description: 'Receta italiana tradicional con queso crema, crema de leche, café y vainillas. Rinde 5 potes.',
    yieldCount: 5, // Lote rinde 5 potes
    yieldUnit: 'pote',
    salePrice: 6000, // Precio por pote
    ingredients: [
      { ingredientId: 'queso-crema', quantity: 500 }, // 500g
      { ingredientId: 'crema-leche', quantity: 300 }, // 300g
      { ingredientId: 'azucar', quantity: 110 }, // 110g
      { ingredientId: 'vainillas', quantity: 3 }, // 3 paquetes
      { ingredientId: 'cafe', quantity: 10 }, // 10g
    ],
    packaging: [
      { ingredientId: 'pote-postre', quantity: 5 }, // 1 x pote
      { ingredientId: 'bolsa-camiseta', quantity: 1 },
    ],
  },
  {
    id: 'postre-oreo',
    name: 'Postre Oreo en Pote',
    category: 'postres',
    description: 'Capas de galletitas Oreo trituradas, dulce de leche repostero y crema chantillí. Rinde 4 potes.',
    yieldCount: 4,
    yieldUnit: 'pote',
    salePrice: 7000,
    ingredients: [
      { ingredientId: 'oreo', quantity: 4 }, // 4 paquetes
      { ingredientId: 'dulce-de-leche', quantity: 750 }, // 750g
      { ingredientId: 'crema-leche', quantity: 600 }, // 600g chantillí
    ],
    packaging: [
      { ingredientId: 'pote-postre', quantity: 4 },
      { ingredientId: 'bolsa-camiseta', quantity: 1 },
    ],
  },
  {
    id: 'chocotorta',
    name: 'Chocotorta en Pote',
    category: 'postres',
    description: 'Clásico postre argentino con galletitas de chocolate, dulce de leche y crema chantillí. Rinde 4 potes.',
    yieldCount: 4,
    yieldUnit: 'pote',
    salePrice: 7000,
    ingredients: [
      { ingredientId: 'chocolinas', quantity: 4 }, // 4 paquetes en el cálculo
      { ingredientId: 'dulce-de-leche', quantity: 750 },
      { ingredientId: 'crema-leche', quantity: 600 },
    ],
    packaging: [
      { ingredientId: 'pote-postre', quantity: 4 },
      { ingredientId: 'bolsa-camiseta', quantity: 1 },
    ],
  },

  // Budines
  {
    id: 'budin-naranja',
    name: 'Budín Casero de Naranja',
    category: 'budines',
    description: 'Budín esponjoso con jugo y ralladura natural de naranja. La tanda rinde 2 budines.',
    yieldCount: 2,
    yieldUnit: 'budín',
    salePrice: 4500,
    ingredients: [
      { ingredientId: 'naranja', quantity: 350 }, // 350g
      { ingredientId: 'harina', quantity: 250 }, // 250g
      { ingredientId: 'azucar', quantity: 100 }, // 100g
      { ingredientId: 'huevo', quantity: 3 }, // 3 huevos
      { ingredientId: 'aceite', quantity: 240 }, // 240 ml
    ],
    packaging: [
      { ingredientId: 'molde-budin', quantity: 2 },
    ],
  },
  {
    id: 'budin-limon',
    name: 'Budín Casero de Limón / Mandarina',
    category: 'budines',
    description: 'Budín cítrico aromático de limón o mandarina. La tanda rinde 2 budines.',
    yieldCount: 2,
    yieldUnit: 'budín',
    salePrice: 4500,
    ingredients: [
      { ingredientId: 'limon', quantity: 300 }, // 300g
      { ingredientId: 'harina', quantity: 250 },
      { ingredientId: 'azucar', quantity: 100 },
      { ingredientId: 'huevo', quantity: 3 },
      { ingredientId: 'aceite', quantity: 240 },
    ],
    packaging: [
      { ingredientId: 'molde-budin', quantity: 2 },
    ],
  },
];

// Pedido de ejemplo tomado del Excel (fila 2 a 12 de precios coti.xlsx)
export const INITIAL_ORDERS: Order[] = [
  {
    id: 'pedido-ejemplo-excel',
    customerName: 'Tanda Semana 1 (Ejemplo Excel)',
    phone: '351-1234567',
    createdAt: new Date().toISOString(),
    deliveryDate: '2026-09-12',
    status: 'preparando',
    notes: 'Tanda completa registrada en precios coti.xlsx con $75.542 de ganancia proyectada.',
    items: [
      { recipeId: 'emp-jyq', quantity: 3 },
      { recipeId: 'emp-carne', quantity: 2 },
      { recipeId: 'emp-pollo', quantity: 4 },
      { recipeId: 'pastel-papas', quantity: 2 },
      { recipeId: 'tiramisu', quantity: 3 },
      { recipeId: 'chocotorta', quantity: 3 },
      { recipeId: 'budin-naranja', quantity: 1 },
    ],
  }
];
