import React from 'react';
import { 
  TrendingUp, 
  Award, 
  Percent, 
  DollarSign, 
  Flame, 
  Sparkles, 
  Lightbulb,
  ArrowUpRight,
  ClipboardCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  getRecipeFinancials, 
  formatCurrency, 
  formatPercent,
  calculateOrderTotals 
} from '../../utils/calculations';

export const MetricsSummary: React.FC = () => {
  const { recipes, orders, recipesMap, ingredientsMap } = useApp();

  // Calcular métricas de cada receta
  const recipeStats = recipes.map(r => getRecipeFinancials(r, ingredientsMap));

  // Ordenar por mayor ganancia en $
  const topProfitPesos = [...recipeStats].sort((a, b) => b.unitProfit - a.unitProfit);

  // Ordenar por mayor margen en %
  const topMarginPercent = [...recipeStats].sort((a, b) => b.marginPercent - a.marginPercent);

  // Totales históricos
  const historicalTotals = orders.reduce(
    (acc, order) => {
      const tot = calculateOrderTotals(order.items, recipesMap, ingredientsMap);
      acc.revenue += tot.totalRevenue;
      acc.cost += tot.totalCost;
      acc.profit += tot.totalProfit;
      acc.orderCount += 1;
      return acc;
    },
    { revenue: 0, cost: 0, profit: 0, orderCount: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-600" />
          Tablero de Rentabilidad & Métricas
        </h2>
        <p className="text-xs text-slate-500">
          Descubre cuáles son los platos estrella de tu cocina y analiza los resultados acumulados.
        </p>
      </div>

      {/* Tarjetas de Totales Acumulados */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Facturación Total</span>
            <DollarSign className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(historicalTotals.revenue)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {historicalTotals.orderCount} pedidos registrados
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Costo Invertido</span>
            <ClipboardCheck className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {formatCurrency(historicalTotals.cost)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            En insumos y descartables
          </span>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-md">
          <div className="flex items-center justify-between text-emerald-100 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Ganancia Neta Total</span>
            <Award className="w-4 h-4 text-emerald-200" />
          </div>
          <div className="text-3xl font-black text-white">
            +{formatCurrency(historicalTotals.profit)}
          </div>
          <span className="text-xs text-emerald-100 mt-1 block font-medium">
            Margen promedio acumulado:{' '}
            {historicalTotals.revenue > 0
              ? formatPercent((historicalTotals.profit / historicalTotals.revenue) * 100)
              : '0%'}
          </span>
        </div>
      </div>

      {/* Rankings de Productos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 3 Más Rentables en Dinero ($) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Mayor Ganancia en Dinero ($)
              </h3>
            </div>
            <span className="text-xs text-slate-400">Por unidad vendida</span>
          </div>

          <div className="space-y-3">
            {topProfitPesos.slice(0, 5).map((item, idx) => (
              <div
                key={item.recipeId}
                className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl flex items-center justify-between transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                      idx === 0
                        ? 'bg-amber-400 text-amber-950 shadow-sm'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-800'
                        : idx === 2
                        ? 'bg-amber-700/30 text-amber-900'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-800 block text-xs sm:text-sm">
                      {item.name}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Venta: {formatCurrency(item.salePrice)} | Costo: {formatCurrency(item.unitCost)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-emerald-600 text-sm block">
                    +{formatCurrency(item.unitProfit)}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-500">
                    {formatPercent(item.marginPercent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 Mayor Margen de Ganancia (%) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Percent className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Mayor Margen de Ganancia (%)
              </h3>
            </div>
            <span className="text-xs text-slate-400">Eficiencia de costos</span>
          </div>

          <div className="space-y-3">
            {topMarginPercent.slice(0, 5).map((item, idx) => (
              <div
                key={item.recipeId}
                className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl flex items-center justify-between transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                      idx === 0
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-800 block text-xs sm:text-sm">
                      {item.name}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Ganancia: +{formatCurrency(item.unitProfit)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md text-xs sm:text-sm inline-block">
                    {formatPercent(item.marginPercent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Consejos Estratégicos para el Negocio */}
      <div className="bg-amber-50/70 rounded-2xl border border-amber-200/80 p-5 space-y-3">
        <div className="flex items-center gap-2 text-amber-900">
          <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <h4 className="font-bold text-sm">Consejos para maximizar la ganancia de Coti</h4>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-amber-950/80">
          <li className="bg-white/80 p-3 rounded-xl border border-amber-200/50">
            🥟 <strong>Empanadas de Verdura:</strong> Tienen el margen porcentual más alto (~72%). Conviene armar promociones "Docena Mixta" que incluyan verdura para equilibrar costos con carne o jamón y queso.
          </li>
          <li className="bg-white/80 p-3 rounded-xl border border-amber-200/50">
            🍰 <strong>Postres en Pote:</strong> El pote y la bolsa suman ~$255 por unidad. Comprando descartables al por mayor (paquete x 100) pueden reducir notablemente ese costo directo.
          </li>
          <li className="bg-white/80 p-3 rounded-xl border border-amber-200/50">
            🥩 <strong>Efecto Carne:</strong> La carne picada impacta directamente en empanadas de carne, pastel de papas y albóndigas. Al actualizar su precio en la Despensa, revisa de inmediato el margen resultante en esas comidas.
          </li>
          <li className="bg-white/80 p-3 rounded-xl border border-amber-200/50">
            🍞 <strong>Budines:</strong> Gran margen unitario (~66%). Son ideales para ofrecer como "adicional dulce" al entregar pedidos de empanadas o comidas saladas.
          </li>
        </ul>
      </div>
    </div>
  );
};
