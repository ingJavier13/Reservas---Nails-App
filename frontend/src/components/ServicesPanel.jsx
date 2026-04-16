import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ServicesPanel({ token }) {
  const [servicios, setServicios] = useState([]);
  const [isAddingService, setIsAddingService] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: '', duration: '' });
  const [imageFile, setImageFile] = useState(null);

  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Cargar servicios al iniciar
  const cargarServicios = async () => {
    try {
      const res = await axios.get('http://localhost:3000/services');
      setServicios(res.data);
    } catch (error) {
      console.error("Error al cargar servicios", error);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingServiceId && !imageFile) return alert("Por favor, selecciona una imagen.");
    
    setIsUploading(true);

    try {
      let cloudinaryUrl = null;
      
      // Si hay imagen seleccionada, subir a Cloudinary
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await axios.post('http://localhost:3000/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
        });
        cloudinaryUrl = uploadRes.data.imageUrl;
      }

      const payload = {
        ...serviceForm,
        ...(cloudinaryUrl && { imageUrl: cloudinaryUrl })
      };

      // Si hay un ID en edición, hacemos PUT. Sino, POST.
      if (editingServiceId) {
        await axios.put(`http://localhost:3000/services/${editingServiceId}`, payload, config);
        alert("¡Servicio modificado con éxito!");
      } else {
        await axios.post('http://localhost:3000/services', payload, config);
        alert("¡Servicio creado con éxito!");
      }

      cancelarEdicion();
      cargarServicios(); // Refrescar lista visualmente
      
    } catch (error) {
      console.error(error);
      alert("Error al procesar el servicio. Revisa la consola.");
    } finally {
      setIsUploading(false);
    }
  };

  const iniciarEdicion = (servicio) => {
    setEditingServiceId(servicio.id);
    setServiceForm({ 
      name: servicio.name, 
      description: servicio.description || '', 
      price: servicio.price, 
      duration: servicio.duration 
    });
    setIsAddingService(true);
  };

  const cancelarEdicion = () => {
    setIsAddingService(false);
    setEditingServiceId(null);
    setImageFile(null);
    setServiceForm({ name: '', description: '', price: '', duration: '' });
  };

  const eliminarServicio = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esto permanentemente?")) return;
    try {
      await axios.delete(`http://localhost:3000/services/${id}`, config);
      alert("Servicio borrado correctamente.");
      cargarServicios();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar.");
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-2 bg-rose-500 rounded-full"></div>
          <h2 className="text-3xl font-black text-slate-800">Mi Catálogo de Servicios</h2>
        </div>
        {!isAddingService && (
          <button 
            onClick={() => setIsAddingService(true)}
            className="bg-rose-500 text-white font-bold px-6 py-2 rounded-xl hover:bg-rose-600 transition shadow-sm"
          >
            ➕ Nuevo Servicio
          </button>
        )}
      </div>

      {isAddingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/90 backdrop-blur-md z-10 pb-4 border-b border-slate-100">
              <h3 className="text-2xl font-black text-slate-800">
                {editingServiceId ? 'Editando Servicio' : 'Agregar Nuevo Diseño/Servicio'}
              </h3>
              <button 
                onClick={cancelarEdicion} 
                className="text-slate-500 hover:text-rose-600 font-bold text-sm bg-slate-100 hover:bg-rose-50 px-4 py-2 rounded-full transition"
              >
                ✕ Cerrar
              </button>
            </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nombre</label>
                <input type="text" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition"
                  value={serviceForm.name} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Precio ($ MXN)</label>
                <input type="number" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition"
                  value={serviceForm.price} onChange={e => setServiceForm({...serviceForm, price: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Duración (Minutos)</label>
                <input type="number" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition"
                  value={serviceForm.duration} onChange={e => setServiceForm({...serviceForm, duration: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Foto Real {editingServiceId && <span className="text-rose-500 font-normal text-xs">(Opcional)</span>}
                </label>
                <input type="file" accept="image/*" onChange={handleFileChange}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Descripción</label>
              <textarea required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition" rows="3"
                value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})}></textarea>
            </div>

            <button type="submit" disabled={isUploading}
              className={`w-full py-4 font-bold text-white rounded-xl transition shadow-lg mt-6 ${isUploading ? 'bg-slate-400 cursor-wait' : 'bg-slate-900 hover:bg-rose-600 shadow-rose-200'}`}>
              {isUploading ? '⏳ Guardando en la nube...' : (editingServiceId ? 'Guardar Cambios' : 'Crear y Publicar Servicio')}
            </button>
          </form>
        </div>
        </div>
      )}

      {/* Grid de servicios existentes (Modo Admin) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicios.map(s => (
          <div key={s.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col">
            <div className="h-40 relative">
              <img src={s.imageUrl || 'https://via.placeholder.com/400'} alt={s.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 flex gap-2">
                <button onClick={() => iniciarEdicion(s)} className="bg-amber-100 text-amber-700 hover:bg-amber-200 font-bold px-3 py-1 text-xs rounded-full shadow-sm backdrop-blur transition">
                  ✏️ Editar
                </button>
                <button onClick={() => eliminarServicio(s.id)} className="bg-rose-100/90 text-rose-700 hover:bg-rose-500 hover:text-white font-bold px-3 py-1 text-xs rounded-full shadow-sm backdrop-blur transition">
                  🗑️ Borrar
                </button>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-lg leading-tight">{s.name}</h3>
                <p className="text-slate-500 text-sm mt-1 mb-4 line-clamp-2">{s.description}</p>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-black text-slate-900">${s.price}</span>
                <span className="text-xs font-bold text-slate-500">⏱ {s.duration} min</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
