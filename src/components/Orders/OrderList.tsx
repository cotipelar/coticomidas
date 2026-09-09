import React, { useState } from 'react';
import { 
  ClipboardList, 
  Calendar, 
  Phone, 
  Trash2, 
  Edit3, 
  ShoppingCart, 
  Share2, 
  Check, 
  Search, 
  ChevronDown, 
  ChevronUp,
  TrendingUp,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { 
  calculateOrderTotals, 
  formatCurrency, 
  formatPercent,
  calculateShoppingList 
} from '../../utils/calculations';
import { ShoppingListModal } from './ShoppingListModal';

interface OrderListProps {
  onEditOrder: (order: Order) => void;
  onNewOrder: () => void;
}

export const OrderList: React.FC<OrderListProps> = ({ onEditOrder, onNewOrder }) => {
  const { orders, recipesMap, ingredientsMap, updateOrder, deleteOrder } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Selección múltiple para lista de compras consolidada
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [shoppingModalTitle, setShoppingModalTitle] = useState('');
  const [shoppingItemsList, setShoppingItemsList] = useState<any[]>([]);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
    pendiente: { label: 'Pendiente', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
    preparando: { label: 'En Preparación', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Package },
    listo: { label: 'Listo p/ Entrega', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: CheckCircle2 },
    entregado: { label: 'Entregado', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Truck },
    cobrado: { label: 'Cobrado', color: 'bg-green-100 text-green-800 border-green-200', icon: DollarSign },
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.notes && order.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Totales acumulados de los pedidos filtrados
  const aggregatedTotals = filteredOrders.reduce(
    (acc, order) => {
      const tot = calculateOrderTotals(order.items, recipesMap, ingredientsMap);
      acc.revenue += tot.totalRevenue;
      acc.cost += tot.totalCost;
      acc.profit += tot.totalProfit;
      return acc;
    },
    { revenue: 0, cost: 0, profit: 0 }
  );

  const handleStatusChange = (order: Order, newStatus: OrderStatus) => {
    updateOrder({ ...order, status: newStatus });
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    }
  };

  // Abrir lista de compras para un pedido específico
  const viewOrderShoppingList = (order: Order) => {
    const list = calculateShoppingList(order.items, recipesMap, ingredientsMap);
    setShoppingItemsList(list);
    setShoppingModalTitle(`Pedido de ${order.customerName}`);
    setShowShoppingList(true);
  };

  // Abrir lista de compras consolidada de los seleccionados
  const viewConsolidatedShoppingList = () => {
    const allSelectedItems: { recipeId: string; quantity: number }[] = [];
    orders
      .filter(o => selectedOrderIds.includes(o.id))
      .forEach(o => {
        o.items.forEach(item => allSelectedItems.push(item));
      });

    const list = calculateShoppingList(allSelectedItems, recipesMap, ingredientsMap);
    setShoppingItemsList(list);
    setShoppingModalTitle(`${selectedOrderIds.length} Pedidos Seleccionados`);
    setShowShoppingList(true);
  };

  const copyClientMessage = (order: Order) => {
    const tot = calculateOrderTotals(order.items, recipesMap, ingredientsMap);
    let text = `🥟 *PEDIDO - COTICOMIDAS*\n`;
    text += `Cliente: *${order.customerName}*\n`;
    if (order.deliveryDate) text += `Fecha de entrega: ${order.deliveryDate}\n`;
    text += `\n*Detalle del pedido:*\n`;

    order.items.forEach(item => {
      const rec = recipesMap.get(item.recipeId);
      if (rec) {
        const lineTotal = rec.salePrice * item.quantity;
        text += `• ${item.quantity}x ${rec.name} (${rec.yieldUnit}): ${formatCurrency(lineTotal)}\n`;
      }
    });

    text += `\n*TOTAL A ABONAR: ${formatCurrency(tot.totalRevenue)}*\n`;
    if (order.notes) text += `\n_Notas: ${order.notes}_\n`;
    text += `\n¡Muchas gracias por tu compra! ❤️`;

    navigator.clipboard.writeText(text);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Barra de Estadísticas Generales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">
              Ventas Filtradas ({filteredOrders.length})
            </span>
            <span className="text-2xl font-black text-slate-900">
              {formatCurrency(aggregatedTotals.revenue)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">
              Costo de Producción
            </span>
            <span className="text-2xl font-bold text-rose-600">
              {formatCurrency(aggregatedTotals.cost)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-emerald-900 text-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-300 block uppercase">
              Ganancia Neta Total
            </span>
            <span className="text-2xl font-black text-emerald-300">
              +{formatCurrency(aggregatedTotals.profit)}
            </span>
            <span className="text-xs text-emerald-400 ml-1">
              (
              {aggregatedTotals.revenue > 0
                ? formatPercent((aggregatedTotals.profit / aggregatedTotals.revenue) * 100)
                : '0%'}
              )
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Controles de Filtro y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente o notas..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        {/* Filtro por estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'pendiente', label: 'Pendientes' },
            { id: 'preparando', label: 'En Prep.' },
            { id: 'listo', label: 'Listos' },
            { id: 'entregado', label: 'Entregados' },
            { id: 'cobrado', label: 'Cobrados' },
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Acciones de Selección Múltiple */}
      {filteredOrders.length > 0 && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="select-all"
              checked={
                selectedOrderIds.length > 0 &&
                selectedOrderIds.length === filteredOrders.length
              }
              onChange={selectAll}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="select-all" className="cursor-pointer font-medium">
              Seleccionar todos ({selectedOrderIds.length} seleccionados)
            </label>
          </div>

          {selectedOrderIds.length > 0 && (
            <button
              onClick={viewConsolidatedShoppingList}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 font-bold transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-amber-700" />
              <span>Lista de Compras Consolidada ({selectedOrderIds.length})</span>
            </button>
          )}
        </div>
      )}

      {/* Lista de Pedidos */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No hay pedidos registrados</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'No hay resultados para los filtros seleccionados.'
              : 'Empieza registrando tu primer pedido o tanda de cocina.'}
          </p>
          <button
            onClick={onNewOrder}
            className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            + Crear Primer Pedido
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => {
            const tot = calculateOrderTotals(order.items, recipesMap, ingredientsMap);
            const isExpanded = expandedOrderId === order.id;
            const isSelected = selectedOrderIds.includes(order.id);
            const statusInfo = statusConfig[order.status] || statusConfig.pendiente;
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  isSelected ? 'border-brand-400 ring-1 ring-brand-300' : 'border-slate-200 shadow-sm'
                }`}
              >
                {/* Fila Principal */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOrder(order.id)}
                      className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-slate-900 text-base">
                          {order.customerName}
                        </h3>

                        {/* Dropdown / Badge de estado */}
                        <select
                          value={order.status}
                          onChange={e =>
                            handleStatusChange(order, e.target.value as OrderStatus)
                          }
                          className={`text-xs font-bold rounded-lg px-2 py-0.5 border focus:outline-none ${statusInfo.color}`}
                        >
                          <option value="pendiente">🟡 Pendiente</option>
                          <option value="preparando">🔵 En Preparación</option>
                          <option value="listo">🟣 Listo p/ Entrega</option>
                          <option value="entregado">🟢 Entregado</option>
                          <option value="cobrado">💰 Cobrado</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                        {order.deliveryDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Entrega: {order.deliveryDate}
                          </span>
                        )}
                        {order.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {order.phone}
                          </span>
                        )}
                        <span className="text-slate-400">
                          {tot.itemCount} {tot.itemCount === 1 ? 'unidad' : 'unidades'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cifras y Acciones */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-slate-400 font-medium">Venta / Ganancia</div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-extrabold text-slate-900 text-base">
                          {formatCurrency(tot.totalRevenue)}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          +{formatCurrency(tot.totalProfit)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyClientMessage(order)}
                        title="Copiar mensaje de WhatsApp para el cliente"
                        className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                      >
                        {copiedId === order.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => viewOrderShoppingList(order)}
                        title="Ver lista de compras de este pedido"
                        className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onEditOrder(order)}
                        title="Editar pedido"
                        className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar el pedido de ${order.customerName}?`)) {
                            deleteOrder(order.id);
                          }
                        }}
                        title="Eliminar pedido"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          setExpandedOrderId(isExpanded ? null : order.id)
                        }
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Detalle Desplegable */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 bg-slate-50/70 border-t border-slate-100 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Detalle de Comidas Pedidas
                    </h4>
                    <div className="divide-y divide-slate-200/60 bg-white rounded-xl border border-slate-200/80 overflow-hidden text-xs">
                      {order.items.map(item => {
                        const rec = recipesMap.get(item.recipeId);
                        if (!rec) return null;
                        const lineRev = rec.salePrice * item.quantity;
                        return (
                          <div
                            key={item.recipeId}
                            className="px-4 py-2.5 flex items-center justify-between"
                          >
                            <span className="font-semibold text-slate-800">
                              {item.quantity}x {rec.name}{' '}
                              <span className="text-slate-400 font-normal">
                                ({rec.yieldUnit})
                              </span>
                            </span>
                            <span className="font-bold text-slate-900">
                              {formatCurrency(lineRev)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {order.notes && (
                      <p className="text-xs text-slate-600 italic bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60">
                        Nota: {order.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Lista de Compras */}
      <ShoppingListModal
        isOpen={showShoppingList}
        onClose={() => setShowShoppingList(false)}
        title={shoppingModalTitle}
        items={shoppingItemsList}
      />
    </div>
  );
};
