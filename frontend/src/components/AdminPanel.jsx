import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminPanel({ user, token }) {
  const [appointments, setAppointments] = useState([]);
  const [cancelingCitaId, setCancelingCitaId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const cargarCitas = async () => {
    try {
      const res = await axios.get('http://localhost:3000/appointments', config);
      setAppointments(res.data);
    } catch (error) {
      console.error("Error al cargar citas", error);
    }
  };

  useEffect(() => {
    if (token) cargarCitas();
  }, [token]);

  const iniciarCancelacion = (id) => {
    setCancelingCitaId(id);
    setCancellationReason("");
  };

  const confirmarCancelacion = async (e) => {
    e.preventDefault();
    if (!cancellationReason.trim()) return alert("El motivo es obligatorio.");

    try {
      await axios.patch(`http://localhost:3000/appointments/${cancelingCitaId}/cancel`, { reason: cancellationReason }, config);
      
      setAppointments(appointments.map(cita => 
        cita.id === cancelingCitaId ? { ...cita, status: 'CANCELADA', cancellationReason } : cita
      ));
      
      setCancelingCitaId(null);
      alert("Cita cancelada correctamente.");
    } catch (error) {
      console.error("Error al cancelar la cita", error);
      alert("Hubo un error al intentar cancelar la cita.");
    }
  };

  const aceptarCita = async (id) => {
    try {
      await axios.patch(`http://localhost:3000/appointments/${id}/status`, { status: 'CONFIRMADA' }, config);
      setAppointments(appointments.map(cita => 
        cita.id === id ? { ...cita, status: 'CONFIRMADA' } : cita
      ));
      alert("Cita aceptada satisfactoriamente.");
    } catch (error) {
      console.error("Error al aceptar la cita", error);
      alert("Hubo un error al intentar aceptar la cita.");
    }
  };

  const filteredAppointments = appointments.filter(cita => {
    const clientName = cita.user?.name || '';
    const serviceName = cita.service?.name || '';
    const matchSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) || serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Comparar las fechas en formato YYYY-MM-DD
    const citaDateStr = new Date(cita.date).toISOString().split('T')[0];
    const matchDate = filterDate ? citaDateStr === filterDate : true;
    
    const statusVal = cita.status || 'PENDIENTE';
    const matchStatus = filterStatus ? statusVal === filterStatus : true;

    return matchSearch && matchDate && matchStatus;
  });

  // Derived data for KPIs (Only if ADMIN)
  const todayStr = new Date().toISOString().split('T')[0];
  const citasHoy = appointments.filter(cita => {
    return new Date(cita.date).toISOString().split('T')[0] === todayStr && cita.status !== 'CANCELADA';
  });
  const proximasHoy = [...citasHoy].sort((a,b) => new Date(a.date) - new Date(b.date));
  const ingresosHoy = citasHoy.filter(c => c.status === 'CONFIRMADA' || c.status === 'COMPLETADA')
                              .reduce((sum, cita) => sum + (cita.service?.price || 0), 0);
  const pendientesHoy = citasHoy.filter(c => c.status === 'PENDIENTE' || !c.status).length;

  return (
    <section className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-2 bg-stone-800 rounded-full"></div>
          <h2 className="text-2xl font-black text-stone-900">
            {user?.role === 'ADMIN' ? 'Panel de Control: Todas las Citas' : 'Mis Citas Agendadas'}
          </h2>
        </div>
      </div>

      {/* KPIs para ADMIN */}
      {user?.role === 'ADMIN' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors"></div>
             <h3 className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-2">Citas para Hoy</h3>
             <div className="flex items-end gap-3">
               <span className="text-4xl font-black text-rose-300">{citasHoy.length}</span>
               <span className="text-xs text-stone-400 mb-1 pb-1">programadas</span>
             </div>
             {proximasHoy.length > 0 ? (
               <div className="mt-4 pt-4 border-t border-stone-800">
                 <p className="text-[10px] uppercase tracking-widest text-stone-500 mb-2">Próxima cita:</p>
                 <p className="text-sm font-medium text-stone-200">
                   {new Date(proximasHoy[0].date).toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})} - <span className="font-bold text-rose-300">{proximasHoy[0].user?.name}</span>
                 </p>
               </div>
             ) : (
               <div className="mt-4 pt-4 border-t border-stone-800">
                 <p className="text-[10px] uppercase tracking-widest text-stone-600">Día completamente libre</p>
               </div>
             )}
          </div>
          
          <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
             <h3 className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-2">Ingresos Seguros Hoy</h3>
             <div className="flex items-end gap-3">
               <span className="text-4xl font-black text-stone-800">${ingresosHoy}</span>
               <span className="text-xs text-stone-400 mb-1 pb-1">MXN</span>
             </div>
             <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-4 pt-4 border-t border-stone-50">(Solo confirmadas o completadas)</p>
          </div>

          <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
             <h3 className="text-[10px] uppercase tracking-widest text-rose-400 font-bold mb-2">Acción Requerida Hoy</h3>
             <div className="flex items-end gap-3">
               <span className={`text-4xl font-black ${pendientesHoy > 0 ? 'text-rose-600' : 'text-stone-300'}`}>{pendientesHoy}</span>
               <span className="text-xs text-rose-400 mb-1 pb-1">citas</span>
             </div>
             <p className="text-[10px] uppercase tracking-widest text-rose-600 mt-4 pt-4 border-t border-rose-200/50">Pendientes por confirmar</p>
          </div>
        </div>
      )}

      {/* Barra de Filtros Elegante */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 mb-6 flex flex-wrap gap-4 items-center animate-fade-in">
         <input 
           type="text" 
           placeholder={user?.role === 'ADMIN' ? "Buscar cliente o servicio..." : "Buscar servicio..."}
           className="flex-1 min-w-[200px] p-3 bg-stone-50 border border-stone-100 rounded-2xl focus:border-stone-900 outline-none transition text-xs font-medium text-stone-900 shadow-inner" 
           value={searchTerm} 
           onChange={(e) => setSearchTerm(e.target.value)}
         />
         <input 
           type="date"
           className="p-3 bg-stone-50 border border-stone-100 rounded-2xl focus:border-stone-900 outline-none transition text-xs font-medium text-stone-500 shadow-inner uppercase tracking-wider" 
           value={filterDate}
           onChange={(e) => setFilterDate(e.target.value)}
         />
         <select 
           className="p-3 bg-stone-50 border border-stone-100 rounded-2xl focus:border-stone-900 outline-none transition text-xs font-bold uppercase tracking-widest text-stone-600 shadow-inner" 
           value={filterStatus}
           onChange={(e) => setFilterStatus(e.target.value)}
         >
           <option value="">TODOS</option>
           <option value="PENDIENTE">PENDIENTES</option>
           <option value="CONFIRMADA">CONFIRMADAS</option>
           <option value="CANCELADA">CANCELADAS</option>
         </select>
         {(searchTerm || filterDate || filterStatus) && (
           <button 
             onClick={() => { setSearchTerm(''); setFilterDate(''); setFilterStatus(''); }}
             className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-2xl transition-colors"
           >
             Limpiar
           </button>
         )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="p-8 text-center text-sm font-bold uppercase tracking-widest text-stone-400">
            No se encontraron citas con esos filtros.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-[10px] uppercase tracking-widest border-b border-stone-100">
                  <th className="p-4 font-bold">Fecha y Hora</th>
                  {user?.role === 'ADMIN' && <th className="p-4 font-bold">Cliente</th>}
                  <th className="p-4 font-bold">Servicio</th>
                  <th className="p-4 font-bold">Precio</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredAppointments.map(cita => (
                  <tr key={cita.id} className="hover:bg-stone-50 transition">
                    <td className="p-4">
                      <span className="block font-bold text-stone-800">
                        {new Date(cita.date).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-sm text-stone-500">
                        {new Date(cita.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    {user?.role === 'ADMIN' && (
                      <td className="p-4">
                        <span className="block font-medium text-stone-700">{cita.user?.name || 'Cliente'}</span>
                        {cita.user?.phone && (
                          <a href={`https://wa.me/52${cita.user.phone}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-stone-400 hover:text-stone-900 font-bold tracking-widest uppercase mt-1 transition-colors">
                            📞 {cita.user.phone}
                          </a>
                        )}
                      </td>
                    )}
                    <td className="p-4">
                      <span className="font-bold text-rose-400">{cita.service?.name}</span>
                    </td>
                    <td className="p-4 font-bold text-stone-800">
                      ${cita.service?.price}
                    </td>
                    <td className="p-4 relative">
                      <span className={`px-3 py-1 inline-block rounded-full text-[10px] uppercase font-bold tracking-widest shadow-sm ${cita.status === 'CONFIRMADA' ? 'bg-stone-800 text-stone-100' : cita.status === 'CANCELADA' ? 'bg-rose-100 text-rose-700' : 'border border-stone-200 text-stone-600'}`}>
                        {cita.status || 'PENDIENTE'}
                      </span>
                      {cita.status === 'CANCELADA' && cita.cancellationReason && (
                        <p className="text-[10px] text-stone-400 mt-2 italic max-w-[200px]">" {cita.cancellationReason} "</p>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center flex-wrap gap-2">
                        {user?.role === 'ADMIN' && (!cita.status || cita.status === 'PENDIENTE') && (
                          <button 
                            onClick={() => aceptarCita(cita.id)}
                            className="text-stone-900 border border-stone-900 hover:bg-stone-900 hover:text-white font-bold px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest transition-all duration-300"
                          >
                            Aceptar
                          </button>
                        )}
                        {cita.status !== 'CANCELADA' && (
                          <button 
                            onClick={() => iniciarCancelacion(cita.id)}
                            className="text-stone-500 border border-transparent hover:border-rose-400 hover:text-rose-600 font-bold px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest transition-all duration-300"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Premium de Cancelación */}
      {cancelingCitaId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative">
            <h2 className="text-2xl font-black text-rose-600 mb-2">Cancelar Cita</h2>
            
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl mb-6 shadow-inner">
              <span className="text-[10px] uppercase font-black tracking-widest text-rose-600 block mb-1">¡Aviso Importante!</span>
              <p className="text-sm text-rose-800/80 font-medium leading-relaxed">
                Podrás reagendar esta cita más adelante, pero en caso de no asistir o reagendar oportunamente, <strong className="font-extrabold text-rose-900">perderás tu anticipo ya realizado.</strong>
              </p>
            </div>

            <form onSubmit={confirmarCancelacion}>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Motivo de Cancelación</label>
              <textarea 
                required 
                className="w-full p-4 bg-stone-50/50 border border-stone-200 focus:border-stone-900 outline-none transition rounded-2xl font-medium text-stone-900 resize-none shadow-sm" 
                rows="3"
                placeholder="Por favor, cuéntanos qué pasó para poder apoyarte..."
                value={cancellationReason} 
                onChange={e => setCancellationReason(e.target.value)}
              ></textarea>
              
              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setCancelingCitaId(null)}
                  className="flex-1 py-4 font-bold text-stone-500 border border-stone-200 hover:bg-stone-50 hover:text-stone-900 rounded-full transition-all uppercase tracking-widest text-[10px]"
                >
                  Regresar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 font-bold bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 uppercase tracking-widest text-[10px]"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}