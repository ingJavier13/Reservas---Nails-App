import { useEffect, useState } from 'react';
import axios from 'axios';
import { MdAdd, MdClose, MdWarningAmber, MdInventory2 } from 'react-icons/md';

export default function InventoryPanel({ token }) {
  const [materials, setMaterials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    name: '', currentStock: '', minStock: '', unit: 'PIEZA', costPerUnit: ''
  });
  
  // Para el modal rápido de "Resurtir"
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [restockAmount, setRestockAmount] = useState('');
  const [activeMaterial, setActiveMaterial] = useState(null);

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const loadMaterials = async () => {
    try {
      const res = await axios.get('http://localhost:3000/inventory', config);
      setMaterials(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadMaterials(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.patch(`http://localhost:3000/inventory/${editingId}`, form, config);
      } else {
        await axios.post('http://localhost:3000/inventory', form, config);
      }
      setIsModalOpen(false);
      setEditingId(null);
      loadMaterials();
    } catch (e) {
      alert("Error al guardar material.");
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    if (!restockAmount || restockAmount <= 0) return;
    
    try {
      await axios.patch(`http://localhost:3000/inventory/${activeMaterial.id}`, {
        isRestock: true,
        quantityAdded: parseFloat(restockAmount),
        currentStock: activeMaterial.currentStock + parseFloat(restockAmount)
      }, config);
      
      setRestockModalOpen(false);
      setRestockAmount('');
      setActiveMaterial(null);
      loadMaterials();
    } catch (error) {
       alert("Error al intentar resurtir.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar el material?")) return;
    try {
      await axios.delete(`http://localhost:3000/inventory/${id}`, config);
      loadMaterials();
    } catch (e) {
      alert("Error al eliminar.");
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-2 bg-slate-800 rounded-full"></div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <MdInventory2 className="text-teal-800" /> Inventario de Almacén
          </h2>
        </div>
        <button 
          onClick={() => {
            setForm({ name: '', currentStock: '', minStock: '', unit: 'PIEZA', costPerUnit: '' });
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="bg-slate-900 text-white font-bold px-6 py-2.5 rounded-full hover:bg-teal-800 uppercase text-xs tracking-widest transition-all shadow-sm flex items-center gap-1"
        >
          <MdAdd size={18} /> Nuevo Ítem
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest border-b border-slate-100">
              <th className="p-4 font-bold">Material / Insumo</th>
              <th className="p-4 font-bold">Stock Actual</th>
              <th className="p-4 font-bold">Mínimo</th>
              <th className="p-4 font-bold">Costo Unit.</th>
              <th className="p-4 font-bold text-center">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {materials.map(m => {
              const isLow = m.currentStock <= m.minStock;
              return (
                <tr key={m.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                    {isLow && <MdWarningAmber className="text-rose-600 animate-pulse" title="Stock bajo" size={18} />}
                    {m.name}
                  </td>
                  <td className="p-4 font-black">
                    <span className={isLow ? 'text-rose-600' : 'text-teal-800'}>
                      {m.currentStock} {m.unit}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-500">{m.minStock} {m.unit}</td>
                  <td className="p-4 font-bold text-slate-600">${m.costPerUnit}</td>
                  <td className="p-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={() => {
                          setActiveMaterial(m);
                          setRestockModalOpen(true);
                        }}
                        className="bg-amber-400 text-slate-900 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow hover:bg-amber-500 transition"
                      >
                       + Surtir
                      </button>
                      <button 
                        onClick={() => {
                          setForm(m);
                          setEditingId(m.id);
                          setIsModalOpen(true);
                        }}
                        className="text-slate-500 hover:text-slate-900 uppercase font-bold text-[10px] transition"
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR/EDITAR MATERIAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900">
              <MdClose size={20} />
            </button>
            <h2 className="text-2xl font-black text-slate-900 mb-6">{editingId ? 'Editar Ítem' : 'Añadir Material'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nombre</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 outline-none text-slate-900 font-medium" />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Stock Actual</label>
                  <input required type="number" step="0.01" value={form.currentStock} onChange={e => setForm({...form, currentStock: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 outline-none text-slate-900 font-medium" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mínimo</label>
                  <input required type="number" step="0.01" value={form.minStock} onChange={e => setForm({...form, minStock: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 outline-none text-slate-900 font-medium" />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Unidad</label>
                  <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 outline-none text-slate-900 font-bold uppercase text-[10px]">
                    <option value="PIEZA">Piezas</option>
                    <option value="MILILITROS">Mililitros (ml)</option>
                    <option value="GRAMOS">Gramos (g)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Costo Unit. ($)</label>
                  <input required type="number" step="0.01" value={form.costPerUnit} onChange={e => setForm({...form, costPerUnit: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 outline-none text-slate-900 font-medium" />
                </div>
              </div>

              <button type="submit" className="w-full py-4 font-bold bg-slate-900 text-white rounded-full hover:bg-teal-800 transition shadow-xl mt-4 uppercase tracking-widest text-[10px]">
                Guardar Material
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RESURTIR */}
      {restockModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
             <button onClick={() => setRestockModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"><MdClose size={20} /></button>
             <h3 className="text-2xl font-black text-slate-900 mb-2">Comprar / Resurtir</h3>
             <p className="text-xs text-slate-500 mb-6 font-medium">Registraremos el gasto financiero y aumentará tu stock de <span className="font-bold text-amber-500">{activeMaterial?.name}</span>.</p>
             <form onSubmit={handleRestock}>
               <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">¿Cuánto vas a añadir? ({activeMaterial?.unit})</label>
               <input required type="number" step="0.01" value={restockAmount} onChange={e => setRestockAmount(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 outline-none text-slate-900 text-lg font-black mb-6" autoFocus />
               <button type="submit" className="w-full py-4 font-bold bg-amber-400 text-slate-900 rounded-full hover:bg-amber-500 transition shadow-xl uppercase tracking-widest text-[10px]">
                 Confirmar Resurtido
               </button>
             </form>
          </div>
        </div>
      )}

    </section>
  );
}
