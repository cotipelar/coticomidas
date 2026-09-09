import React, { useState } from 'react';
import { X, Check, Copy, ShoppingCart, Tag } from 'lucide-react';
import { ShoppingListItem, formatCurrency } from '../../utils/calculations';

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: ShoppingListItem[];
}

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({
  isOpen,
  onClose,
  title,
  items,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalCost = items.reduce((acc, curr) => acc + curr.estimatedCost, 0);

  // Agrupar por categoría
  const grouped = items.reduce((acc, curr) => {
    const cat = curr.ingredient.category || 'otros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  const categoryNames: Record<string, string> = {
    carnes: '🥩 Carnicería',
    verduras: '🥬 Verdulería',
    lacteos: '🧀 Lácteos',
    almacen: '🥫 Almacén',
    packaging: '📦 Descartables y Packaging',
    otros: '🏷️ Otros',
  };

  const handleCopy = () => {
    let text = `🛒 *LISTA DE COMPRAS - ${title.toUpperCase()}*\n`;
    text += `Total estimado: ${formatCurrency(totalCost)}\n\n`;

    Object.entries(grouped).forEach(([cat, list]) => {
      text += `*${categoryNames[cat] || cat.toUpperCase()}*\n`;
      list.forEach(item => {
        text += `• ${item.ingredient.name}: ${item.displayQuantity} (~${formatCurrency(item.estimatedCost)})\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Lista de Compras e Insumos</h3>
              <p className="text-xs text-slate-500">{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cost Summary Bar */}
        <div className="px-6 py-3 bg-brand-50/70 border-b border-brand-100 flex items-center justify-between text-sm">
          <span className="font-medium text-brand-900">
            Costo total estimado en insumos:
          </span>
          <span className="font-bold text-lg text-brand-700">
            {formatCurrency(totalCost)}
          </span>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {items.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              No hay productos con cantidades en este pedido.
            </p>
          ) : (
            Object.entries(grouped).map(([category, catItems]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  {categoryNames[category] || category}
                </h4>
                <div className="bg-slate-50/70 rounded-xl divide-y divide-slate-100 border border-slate-200/80">
                  {catItems.map(item => (
                    <div
                      key={item.ingredient.id}
                      className="px-4 py-2.5 flex items-center justify-between hover:bg-white transition-colors"
                    >
                      <div>
                        <span className="font-semibold text-slate-800 text-sm">
                          {item.ingredient.name}
                        </span>
                        {item.ingredient.notes && (
                          <span className="text-xs text-slate-400 ml-2">
                            ({item.ingredient.notes})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <span className="font-mono font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md text-xs sm:text-sm">
                          {item.displayQuantity}
                        </span>
                        <span className="text-xs font-medium text-slate-500 min-w-[70px]">
                          ~{formatCurrency(item.estimatedCost)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {items.length} insumos requeridos
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={items.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-all disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar para WhatsApp</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
