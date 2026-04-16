import { useState } from 'react';
import axios from 'axios';

export default function Auth({ onLoginSuccess, onCancel, showToast }) {
  const [isLogin, setIsLogin] = useState(true); // Cambia entre Login y Registro
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        // Lógica de Inicio de Sesión
        const res = await axios.post('http://localhost:3000/auth/login', {
          email: formData.email,
          password: formData.password
        });
        
        // Pasamos los datos al componente padre (App.jsx)
        onLoginSuccess(res.data.user, res.data.token);
      } else {
        // Lógica de Registro
        await axios.post('http://localhost:3000/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        });
        
        showToast("Cuenta creada con éxito. Inicia sesión.");
        setIsLogin(true); // Lo regresamos a la vista de login
      }
    } catch (err) {
      setError(err.response?.data?.error || "Ocurrió un error de conexión");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
        
        <button onClick={onCancel} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 font-bold p-2">
          ✕
        </button>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-stone-900">
            {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
          </h2>
          <p className="text-xs text-stone-500 mt-2 font-medium uppercase tracking-widest">
            {isLogin ? 'Gestión de Citas' : 'Únete a Nails.Lab'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 text-[10px] uppercase tracking-widest p-3 rounded-2xl mb-4 text-center font-bold border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Nombre Completo</label>
                <input 
                  type="text" name="name" required={!isLogin}
                  className="w-full p-3 bg-stone-50/50 border border-stone-200 rounded-2xl focus:border-stone-900 outline-none transition font-medium text-stone-900"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Teléfono (WhatsApp)</label>
                <input 
                  type="tel" name="phone" required={!isLogin} pattern="[0-9]{10}" placeholder="Ej. 4491234567"
                  className="w-full p-3 bg-stone-50/50 border border-stone-200 rounded-2xl focus:border-stone-900 outline-none transition font-medium text-stone-900"
                  onChange={handleChange}
                />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Correo Electrónico</label>
            <input 
              type="email" name="email" required
              className="w-full p-3 bg-stone-50/50 border border-stone-200 rounded-2xl focus:border-stone-900 outline-none transition font-medium text-stone-900"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Contraseña</label>
            <input 
              type="password" name="password" required
              className="w-full p-3 bg-stone-50/50 border border-stone-200 rounded-2xl focus:border-stone-900 outline-none transition font-medium text-stone-900"
              onChange={handleChange}
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 font-bold bg-stone-900 text-white rounded-full hover:bg-rose-300 hover:text-stone-900 transition-colors shadow-lg shadow-stone-200 mt-8 uppercase tracking-widest text-[10px]"
          >
            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] uppercase font-bold text-stone-500 tracking-wider">
          {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-stone-900 hover:text-rose-500 transition border-b border-stone-900"
          >
            {isLogin ? 'Regístrate' : 'Inicia Sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}