import { useEffect, useState } from 'react';
import axios from 'axios';
import { MdMonetizationOn, MdTrendingUp, MdTrendingDown, MdAccountBalanceWallet, MdAdd } from 'react-icons/md';

export default function FinancePanel({ token }) {
  const [metrics, setMetrics] = useState({ income: 0, expensesTotal: 0, profit: 0 });
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '' });

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const loadFinances = async () => {
    try {
      const res = await axios.get('http://localhost:3000/finance/dashboard', config);
      setMetrics(res.data.metrics);
      setExpenses(res.data.expenses);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadFinances(); }, []);

  const handleManualExpense = async (e) => {
    e.preventDefault();
    if (!form.description || form.amount <= 0) return;
    try {
      await axios.post('http://localhost:3000/finance/expense', form, config);
      setIsModalOpen(false);
      setForm({ description: '', amount: '' });
      loadFinances();
    } catch (e) {
      alert("Error al guardar gasto.");
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-2 bg-slate-800 rounded-full"></div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <MdMonetizationOn className="text-amber-500" /> Resumen Financiero
          </h2>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-50 text-rose-500 font-bold px-6 py-2.5 rounded-full hover:bg-rose-100 uppercase text-xs tracking-widest transition border border-rose-200 flex items-center gap-1"
        >
          <MdAdd size={18} /> Gasto Manual
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         {/* INGRESOS */}
         <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute right-[-20px] top-[-20px] opacity-5 group-hover:opacity-10 transition-opacity">
              <MdTrendingUp size={120} className="text-teal-800" />
            </div>
            <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Ingresos (Citas)</h3>
            <span className="text-5xl font-black text-teal-800">${metrics.income}</span>
         </div>
         
         {/* GASTOS */}
         <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute right-[-20px] top-[-20px] opacity-5 group-hover:opacity-10 transition-opacity">
              <MdTrendingDown size={120} className="text-rose-600" />
            </div>
            <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Gastos e Inventario</h3>
            <span className="text-5xl font-black text-rose-600">${metrics.expensesTotal}</span>
         </div>
         
         {/* PROFIT NETA */}
         <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
              <MdAccountBalanceWallet size={120} className="text-amber-400" />
            </div>
            <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Ganancia Neta</h3>
            <span className={`text-5xl font-black ${metrics.profit < 0 ? 'text-rose-500' : 'text-amber-400'}`}>${metrics.profit}</span>
         </div>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-6">Historial de Salidas / Gastos</h3>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest border-b border-slate-100">
              <th className="p-4 font-bold">Fecha</th>
              <th className="p-4 font-bold">Concepto</th>
              <th className="p-4 font-bold text-right">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.length === 0 ? (
              <tr><td colSpan="3" className="p-8 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">No hay gastos registrados.</td></tr>
            ) : expenses.map(e => (
              <tr key={e.id} className="hover:bg-slate-50 transition">
                <td className="p-4 text-xs text-slate-500 font-medium">
                  {new Date(e.date).toLocaleDateString('es-MX', {day: 'numeric', month: 'short', hour:'2-digit', minute:'2-digit'})}
                </td>
                <td className="p-4 font-bold text-slate-700">{e.description}</td>
                <td className="p-4 font-black text-rose-500 text-right">- ${e.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL GASTO MANUAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Registrar Gasto</h2>
            <form onSubmit={handleManualExpense} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Motivo / Concepto</label>
                <input required type="text" placeholder="Ej. Pago de Renta, Luz..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 outline-none text-slate-900 font-medium" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Monto ($)</label>
                <input required type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 outline-none text-slate-900 font-medium" />
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-full transition uppercase tracking-widest text-[10px]">Cancelar</button>
                <button type="submit" className="flex-1 py-4 font-bold bg-rose-50 border border-rose-200 text-rose-500 hover:bg-rose-100 rounded-full transition uppercase tracking-widest text-[10px]">Registrar Salida</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
