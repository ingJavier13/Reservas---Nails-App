import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminPanel({ user, token }) {
  // --- ESTADOS DE LA VISTA ---
  const [activeTab, setActiveTab] = useState('citas'); // 'citas' o 'servicios'
  const [appointments, setAppointments] = useState([]);
  
  // --- ESTADOS DEL NUEVO SERVICIO ---
  const [isAddingService, setIsAddingService] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newService, setNewService] = useState({ name: '', description: '', price: '', duration: '' });
  const [imageFile, setImageFile] = useState(null);

  // Configuración de seguridad para Axios
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // ==========================================
  // LÓGICA DE CITAS
  // ==========================================
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

  // ==========================================
  // LÓGICA DE SERVICIOS (CLOUDINARY)
  // ==========================================
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleCrearServicio = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("Por favor, selecciona una imagen.");
    
    setIsUploading(true);

    try {
      // 1. Empaquetar imagen
      const formData = new FormData();
      formData.append('image', imageFile);

      // 2. Subir a Cloudinary
      const uploadRes = await axios.post('http://localhost:3000/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      
      const cloudinaryUrl = uploadRes.data.imageUrl;

      // 3. Guardar en Base de Datos
      await axios.post('http://localhost:3000/services', {
        ...newService,
        imageUrl: cloudinaryUrl
      }, config);

      alert("¡Servicio creado con éxito y foto subida a la nube!");
      setIsAddingService(false);
      setImageFile(null);
      setNewService({ name: '', description: '', price: '', duration: '' });
      
    } catch (error) {
      console.error(error);
      alert("Error al subir el servicio. Revisa la consola.");
    } finally {
      setIsUploading(false);
    }
  };

  // ==========================================
  // RENDERIZADO (INTERFAZ VISUAL)
  // ==========================================
  return (
    <section className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      
      {/* NAVEGACIÓN DE PESTAÑAS */}
      <div className="flex gap-4 mb-8 border-b border-slate-200 pb-4">
        <button 
          onClick={() => setActiveTab('citas')}
          className={`font-bold px-4 py-2 rounded-lg transition ${activeTab === 'citas' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          Gestión de Citas
        </button>
        {user?.role === 'ADMIN' && (
          <button 
            onClick={() => setActiveTab('servicios')}
            className={`font-bold px-4 py-2 rounded-lg transition ${activeTab === 'servicios' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            Mis Servicios
          </button>
        )}
      </div>

      {/* ========================================= */}
      {/* VISTA 1: TABLA DE CITAS                   */}
      {/* ========================================= */}
      {activeTab === 'citas' && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-2 bg-rose-500 rounded-full"></div>
            <h2 className="text-2xl font-black text-slate-800">
              {user?.role === 'ADMIN' ? 'Panel de Control: Todas las Citas' : 'Mis Citas Agendadas'}
            </h2>
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
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => cancelarCita(cita.id)}
                            className="text-red-500 hover:text-white border border-red-500 hover:bg-red-500 font-bold px-3 py-1 rounded-lg text-sm transition"
                          >
                            Cancelar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* VISTA 2: CATÁLOGO DE SERVICIOS            */}
      {/* ========================================= */}
      {activeTab === 'servicios' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-800">Catálogo de Servicios</h2>
            <button 
              onClick={() => setIsAddingService(!isAddingService)}
              className="bg-rose-500 text-white font-bold px-6 py-2 rounded-xl hover:bg-rose-600 transition shadow-sm"
            >
              {isAddingService ? 'Cancelar' : '➕ Nuevo Servicio'}
            </button>
          </div>

          {isAddingService && (
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 mb-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Agregar Nuevo Diseño/Servicio</h3>
              
              <form onSubmit={handleCrearServicio} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Servicio</label>
                    <input type="text" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition"
                      value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})}
                      placeholder="Ej. Uñas Esculturales"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Precio ($ MXN)</label>
                    <input type="number" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition"
                      value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})}
                      placeholder="Ej. 450"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Duración (Minutos)</label>
                    <input type="number" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition"
                      value={newService.duration} onChange={e => setNewService({...newService, duration: e.target.value})}
                      placeholder="Ej. 90"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Foto Real (Sube tu diseño)</label>
                    <input 
                      type="file" accept="image/*" required onChange={handleFileChange}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Descripción</label>
                  <textarea required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition" rows="3"
                    value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})}
                    placeholder="Describe los detalles de este servicio..."
                  ></textarea>
                </div>

                <button 
                  type="submit" disabled={isUploading}
                  className={`w-full py-4 font-bold text-white rounded-xl transition shadow-lg mt-4 ${isUploading ? 'bg-slate-400 cursor-wait' : 'bg-slate-900 hover:bg-rose-600 shadow-rose-200'}`}
                >
                  {isUploading ? '⏳ Subiendo foto a Cloudinary y guardando...' : 'Guardar Servicio en el Catálogo'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </section>
  );
}