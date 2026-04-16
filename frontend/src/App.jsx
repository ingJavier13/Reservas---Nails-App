import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminPanel from './components/AdminPanel';
import ServicesPanel from './components/ServicesPanel';
import Auth from './components/Auth'; // Importación correcta
import { MdAccessTime, MdLogout, MdSettings } from 'react-icons/md';

function App() {
  // --- Estados de la Navegación y Datos ---
  const [view, setView] = useState(() => localStorage.getItem('view') || 'servicios');
  const [servicios, setServicios] = useState([]);
  
  // --- Sistema de Notificaciones Elegantes (Toast) ---
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // --- Estados de Autenticación ---
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  }); 
  const [token, setToken] = useState(() => localStorage.getItem('token') || null); 
  const [showAuth, setShowAuth] = useState(false);
  const [showSettings, setShowSettings] = useState(false); 

  // --- Persistencia automática en LocalStorage ---
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
    
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [user, token]);

  useEffect(() => {
    localStorage.setItem('view', view);
  }, [view]);

  // --- Estados del Modal de Citas ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");

  // Carga Inicial de Servicios
  useEffect(() => {
    axios.get('http://localhost:3000/services')
      .then(res => setServicios(res.data))
      .catch(err => console.error(err));
  }, []);

  // Lógica para confirmar la cita
  const confirmarCita = async () => {
  // Verificamos que tengamos al usuario y su token
  if (!user || !token) {
    alert("Debes iniciar sesión para agendar una cita.");
    return;
  }

  try {
    // 1. Preparamos el gafete (Token) en los Headers
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 2. Hacemos el POST y le pasamos la configuración al final
    const res = await axios.post('http://localhost:3000/appointments', {
      date: appointmentDate,
      serviceId: selectedService.id
      // Nota: Ya no enviamos userId desde aquí, porque tu backend ahora es 
      // inteligente y saca el ID directamente del token por seguridad.
    }, config); // <--- ¡AQUÍ ESTÁ LA MAGIA!

    alert(`¡Cita agendada con éxito para el ${new Date(res.data.date).toLocaleString('es-MX')}!`);
    setIsModalOpen(false);
    
    // Al confirmar, mandamos al usuario directo al panel
    setView('admin'); 
  } catch (error) {
    alert("Error al agendar. Revisa la consola.");
    console.error(error);
  }
};

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 relative">
      
      {/* --- 1. Navbar --- */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-2xl font-black bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
            NAILS.LAB
          </span>
          <div className="space-x-6 text-sm font-medium text-slate-600 flex items-center">
            <button 
              onClick={() => setView('servicios')} 
              className={`transition uppercase tracking-widest text-[11px] ${view === 'servicios' ? 'text-stone-900 font-bold border-b border-stone-900 pb-1' : 'text-stone-500 hover:text-stone-900'}`}
            >
              Servicios
            </button>
            <button 
              onClick={() => {
                if(!user) return setShowAuth(true); // Pide login si intenta ir al panel sin cuenta
                setView('admin');
              }} 
              className={`transition uppercase tracking-widest text-[11px] ${view === 'admin' ? 'text-stone-900 font-bold border-b border-stone-900 pb-1' : 'text-stone-500 hover:text-stone-900'}`}
            >
              Mis Citas
            </button>
            {user?.role === 'ADMIN' && (
              <button 
                onClick={() => setView('mis-servicios')} 
                className={`transition uppercase tracking-widest text-[11px] ${view === 'mis-servicios' ? 'text-stone-900 font-bold border-b border-stone-900 pb-1' : 'text-stone-500 hover:text-stone-900'}`}
              >
                Mis Servicios
              </button>
            )}
            
            {/* Botón de Login/Logout Inteligente */}
            {user ? (
              <div className="flex items-center gap-4 ml-4">
                <span className="text-sm font-bold text-stone-800">Hola, {user.name}</span>
                <div className="flex gap-2">
                  <button 
                    title="Ajustes de Perfil"
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-stone-900 transition-colors"
                  >
                    <MdSettings size={16} /> 
                  </button>
                  <button 
                    title="Cerrar sesión"
                    onClick={() => { 
                      setUser(null); 
                      setToken(null); 
                      setView('servicios'); 
                      showToast('Sesión cerrada correctamente'); 
                    }}
                    className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-rose-500 transition-colors"
                  >
                    <MdLogout size={16} /> Cerrar Sesión
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuth(true)}
                className="bg-stone-900 text-white uppercase tracking-widest text-[10px] font-bold px-6 py-2.5 rounded-full hover:bg-rose-300 hover:text-stone-900 transition-all duration-300 ml-4 shadow-md"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* --- 2. Vistas Condicionales --- */}
      {view === 'servicios' ? (
        <>
          {/* Hero Section */}
          <header className="py-16 px-4 text-center bg-gradient-to-b from-stone-200/50 to-transparent">
            <h1 className="text-5xl font-extrabold text-stone-900 mb-4 tracking-tight">
              Diseños que <span className="text-rose-400 font-serif italic font-light">enamoran</span>.
            </h1>
            <p className="text-lg text-stone-500 max-w-2xl mx-auto">
              Reserva tu cita con las mejores especialistas de Aguascalientes. Calidad, higiene y estilo en un solo lugar.
            </p>
          </header>

          {/* Grid de Servicios */}
          <main className="max-w-6xl mx-auto px-4 pb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Servicios Disponibles</h2>
              <span className="text-sm text-slate-500">{servicios.length} opciones encontradas</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicios.map(s => (
                <div key={s.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="h-48 relative overflow-hidden bg-slate-100">
                      {/* Imagen del servicio */}
                      <img 
                        src={s.imageUrl || 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?q=80&w=800&auto=format&fit=crop'} 
                        alt={`Diseño de ${s.name}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                      />
                      
                      {/* Gradiente oscuro para que el texto resalte */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                      
                      {/* Etiqueta de tiempo flotante */}
                      <span className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-rose-600 shadow-sm z-10 flex items-center gap-1">
                        <MdAccessTime size={14} /> {s.duration} min
                      </span>
                    </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                      {s.name}
                    </h3>
                    <p className="text-slate-500 text-sm mt-2 line-clamp-2">
                      {s.description || "Servicio profesional."}
                    </p>
                    
                    <div className="mt-6 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Precio</span>
                        <span className="text-2xl font-black text-slate-900">${s.price}</span>
                      </div>
                      <button 
                        onClick={() => {
                          if (!user) {
                            setShowAuth(true); // Pide login antes de agendar
                          } else {
                            setSelectedService(s);
                            setIsModalOpen(true);
                          }
                        }}
                        className="border border-stone-800 text-stone-900 uppercase tracking-widest text-[10px] font-bold px-6 py-2.5 rounded-full hover:bg-stone-900 hover:text-white transition-all duration-300"
                      >
                        Agendar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </>
      ) : view === 'admin' ? (
        <AdminPanel user={user} token={token} />
      ) : view === 'mis-servicios' ? (
        <ServicesPanel token={token} />
      ) : null}

      {/* --- 3. Modal de Reserva --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-black text-slate-800 mb-2">Confirmar Cita</h2>
            <p className="text-slate-500 mb-6">Vas a agendar: <span className="font-bold text-rose-500">{selectedService?.name}</span></p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Selecciona Fecha y Hora</label>
                <input 
                  type="datetime-local" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition"
                  onChange={(e) => setAppointmentDate(e.target.value)}
                />
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 font-bold text-stone-500 border border-stone-200 hover:bg-stone-100 rounded-full transition uppercase tracking-widest text-xs"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmarCita}
                  className="flex-1 py-4 font-bold bg-stone-900 text-white rounded-full hover:bg-rose-300 hover:text-stone-900 transition-all duration-300 shadow-xl shadow-stone-200 uppercase tracking-widest text-xs"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 4. MODAL DE AUTENTICACIÓN (Mismo nivel que la raíz) --- */}
      {showAuth && (
        <Auth 
          showToast={showToast}
          onCancel={() => setShowAuth(false)} 
          onLoginSuccess={(userData, userToken) => {
            setUser(userData);
            setToken(userToken);
            setShowAuth(false);
            showToast(`¡Bienvenida nuevamente, ${userData.name}!`);
            if(userData.role === 'ADMIN') setView('admin');
          }} 
        />
      )}

      {/* --- 5. MODAL DE AJUSTES --- */}
      {showSettings && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 font-bold p-2">✕</button>
            <h2 className="text-2xl font-black text-stone-900 mb-6">Mis Datos</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              try {
                const res = await axios.put('http://localhost:3000/auth/me', {
                   name: formData.get('name'), phone: formData.get('phone')
                }, { headers: { Authorization: `Bearer ${token}` } });
                setUser({...user, ...res.data});
                setShowSettings(false);
                showToast('Perfil actualizado con éxito.');
              } catch (err) {
                 showToast('Error al actualizar el perfil.', 'error');
              }
            }}>
              <div className="mb-4">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Nombre Completo</label>
                <input required defaultValue={user?.name} name="name" className="w-full p-3 bg-stone-50/50 border border-stone-200 rounded-2xl focus:border-stone-900 outline-none transition font-medium text-stone-900" />
              </div>
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Teléfono (WhatsApp)</label>
                <input required defaultValue={user?.phone || ''} name="phone" type="tel" pattern="[0-9]{10}" placeholder="Ej. 4491234567" className="w-full p-3 bg-stone-50/50 border border-stone-200 rounded-2xl focus:border-stone-900 outline-none transition font-medium text-stone-900" />
              </div>
              <button type="submit" className="w-full py-4 font-bold bg-stone-900 text-white rounded-full hover:bg-rose-300 hover:text-stone-900 transition-colors shadow-lg shadow-stone-200 uppercase tracking-widest text-[10px]">Guardar Cambios</button>
            </form>
          </div>
        </div>
      )}

      {/* --- 6. NOTIFICACIONES GLOBALES TOAST --- */}
      {toast.show && (
        <div className="fixed bottom-8 right-8 z-[100] animate-fade-in">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 ${
            toast.type === 'success' 
              ? 'bg-stone-900/95 border-stone-800 text-stone-50' 
              : 'bg-rose-50/95 border-rose-200 text-rose-800'
          }`}>
             <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-stone-300' : 'bg-rose-500'}`}></div>
             <span className="font-bold uppercase tracking-widest text-[10px]">
               {toast.message}
             </span>
          </div>
        </div>
      )}

    </div>
  )
}

export default App;