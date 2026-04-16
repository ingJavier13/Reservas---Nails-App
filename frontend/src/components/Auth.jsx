import { useState } from 'react';
import axios from 'axios';

export default function Auth({ onLoginSuccess, onCancel }) {
  const [isLogin, setIsLogin] = useState(true); // Cambia entre Login y Registro
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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
          password: formData.password
        });
        
        alert("Cuenta creada con éxito. Ahora inicia sesión.");
        setIsLogin(true); // Lo regresamos a la vista de login
      }
    } catch (err) {
      setError(err.response?.data?.error || "Ocurrió un error de conexión");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
        
        {/* Botón de cerrar */}
        <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold">
          ✕
        </button>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-slate-800">
            {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            {isLogin ? 'Ingresa para gestionar tus citas' : 'Únete a Nails Lab hoy mismo'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl mb-4 text-center font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nombre</label>
              <input 
                type="text" name="name" required={!isLogin}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition"
                onChange={handleChange}
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Correo Electrónico</label>
            <input 
              type="email" name="email" required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Contraseña</label>
            <input 
              type="password" name="password" required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition"
              onChange={handleChange}
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 font-bold bg-slate-900 text-white rounded-xl hover:bg-rose-600 transition shadow-lg mt-6"
          >
            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="font-bold text-rose-500 hover:text-rose-600"
          >
            {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
          </button>
        </div>

      </div>
    </div>
  );
}