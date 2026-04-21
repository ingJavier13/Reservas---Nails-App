import { useEffect, useState } from 'react';
import axios from 'axios';
import { MdAdd, MdClose, MdEdit, MdDelete, MdAccessTime, MdCloudUpload } from 'react-icons/md';

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
          <div className="h-8 w-2 bg-slate-800 rounded-full"></div>
          <h2 className="text-3xl font-black text-slate-900">Mi Catálogo de Servicios</h2>
        </div>
        {!isAddingService && (
          <button 
            onClick={() => setIsAddingService(true)}
            className="bg-slate-900 text-white font-bold px-6 py-2.5 rounded-full hover:bg-teal-800 uppercase text-xs tracking-widest transition-all duration-300 shadow-sm flex items-center gap-1"
          >
            <MdAdd size={18} /> Nuevo Servicio
          </button>
        )}
      </div>

      {isAddingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/90 backdrop-blur-md z-10 pb-4 border-b border-slate-100">
              <h3 className="text-2xl font-black text-slate-900">
                {editingServiceId ? 'Editando Servicio' : 'Agregar Nuevo Servicio'}
              </h3>
              <button 
                onClick={cancelarEdicion} 
                className="text-slate-500 hover:text-slate-900 font-bold text-[10px] uppercase tracking-widest bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full transition flex items-center gap-1"
              >
                <MdClose size={14} /> Cerrar
              </button>
            </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Nombre</label>
                <input type="text" required className="w-full p-2 bg-transparent border-b border-slate-200 focus:border-slate-900 outline-none transition rounded-none font-medium text-slate-900"
                  value={serviceForm.name} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Precio ($ MXN)</label>
                <input type="number" required className="w-full p-2 bg-transparent border-b border-slate-200 focus:border-slate-900 outline-none transition rounded-none font-medium text-slate-900"
                  value={serviceForm.price} onChange={e => setServiceForm({...serviceForm, price: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Duración (Minutos)</label>
                <input type="number" required className="w-full p-2 bg-transparent border-b border-slate-200 focus:border-slate-900 outline-none transition rounded-none font-medium text-slate-900"
                  value={serviceForm.duration} onChange={e => setServiceForm({...serviceForm, duration: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Foto Real {editingServiceId && <span className="text-slate-400 font-normal text-[10px]">(Opcional)</span>}
                </label>
                <input type="file" accept="image/*" onChange={handleFileChange}
                  className="w-full p-2 text-slate-500 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Descripción</label>
              <textarea required className="w-full p-2 bg-transparent border-b border-slate-200 focus:border-slate-900 outline-none transition rounded-none font-medium text-slate-900" rows="2"
                value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})}></textarea>
            </div>

            <button type="submit" disabled={isUploading}
              className={`w-full py-4 font-bold text-white rounded-full uppercase tracking-widest text-[10px] transition-all shadow-xl mt-8 flex items-center justify-center gap-2 ${isUploading ? 'bg-slate-400 cursor-wait' : 'bg-slate-900 hover:bg-teal-800 shadow-slate-200'}`}>
              {isUploading ? <><MdCloudUpload size={22} className="animate-pulse" /> Guardando en la nube...</> : (editingServiceId ? 'Guardar Cambios' : 'Crear y Publicar Servicio')}
            </button>
          </form>
        </div>
        </div>
      )}

      {/* Grid de servicios existentes (Modo Admin) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicios.map(s => (
          <div key={s.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col hover:shadow-xl transition-all duration-300">
            <div className="h-48 relative">
              <img src={s.imageUrl || 'https://via.placeholder.com/400'} alt={s.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 flex gap-2">
                <button onClick={() => iniciarEdicion(s)} className="bg-white/90 text-slate-800 hover:bg-teal-800 hover:text-white font-bold px-4 py-1.5 text-[10px] uppercase tracking-widest rounded-full shadow-sm backdrop-blur transition-all flex items-center gap-1">
                  <MdEdit size={14} /> Editar
                </button>
                <button onClick={() => eliminarServicio(s.id)} className="bg-white/90 text-rose-500 hover:bg-rose-600 hover:text-white font-bold px-4 py-1.5 text-[10px] uppercase tracking-widest rounded-full shadow-sm backdrop-blur transition-all flex items-center gap-1">
                  <MdDelete size={14} /> Borrar
                </button>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-xl leading-tight">{s.name}</h3>
                <p className="text-slate-500 text-sm mt-2 mb-6 line-clamp-2">{s.description}</p>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="font-black text-slate-900 text-xl">${s.price}</span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><MdAccessTime size={14} /> {s.duration} min</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
