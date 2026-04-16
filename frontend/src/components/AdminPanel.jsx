import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminPanel({ user, token }) {
  const [appointments, setAppointments] = useState([]);
  
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

  const cancelarCita = async (id) => {
    const confirmar = window.confirm("¿Estás seguro de que deseas cancelar esta cita?");
    if (!confirmar) return;

    try {
      await axios.delete(`http://localhost:3000/appointments/${id}`, config);
      setAppointments(appointments.filter(cita => cita.id !== id));
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

  return (
    <section className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-2 bg-rose-500 rounded-full"></div>
          <h2 className="text-2xl font-black text-slate-800">
            {user?.role === 'ADMIN' ? 'Panel de Control: Todas las Citas' : 'Mis Citas Agendadas'}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {appointments.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No hay citas programadas en este momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 font-bold">Fecha y Hora</th>
                  {user?.role === 'ADMIN' && <th className="p-4 font-bold">Cliente</th>}
                  <th className="p-4 font-bold">Servicio</th>
                  <th className="p-4 font-bold">Precio</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map(cita => (
                  <tr key={cita.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <span className="block font-bold text-slate-800">
                        {new Date(cita.date).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-sm text-slate-500">
                        {new Date(cita.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    {user?.role === 'ADMIN' && (
                      <td className="p-4 font-medium text-slate-700">{cita.user?.name || 'Cliente'}</td>
                    )}
                    <td className="p-4">
                      <span className="font-bold text-rose-600">{cita.service?.name}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      ${cita.service?.price}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase shadow-sm ${cita.status === 'CONFIRMADA' ? 'bg-emerald-100 text-emerald-700' : cita.status === 'CANCELADA' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {cita.status || 'PENDIENTE'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center flex-wrap gap-2">
                        {user?.role === 'ADMIN' && (!cita.status || cita.status === 'PENDIENTE') && (
                          <button 
                            onClick={() => aceptarCita(cita.id)}
                            className="text-emerald-600 hover:text-white border border-emerald-500 hover:bg-emerald-500 font-bold px-3 py-1 rounded-lg text-sm transition"
                          >
                            Aceptar
                          </button>
                        )}
                        <button 
                          onClick={() => cancelarCita(cita.id)}
                          className="text-white bg-slate-900 border border-slate-900 hover:bg-rose-600 hover:border-rose-600 font-bold px-3 py-1 rounded-lg text-sm transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}