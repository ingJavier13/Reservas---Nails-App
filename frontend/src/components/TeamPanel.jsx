import { useEffect, useState } from 'react';
import axios from 'axios';
import { MdBadge, MdSupervisedUserCircle } from 'react-icons/md';

export default function TeamPanel({ token }) {
  const [users, setUsers] = useState([]);
  
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const loadUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/users', config);
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      alert("Error al cargar lista de usuarios.");
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const changeRole = async (userId, newRole) => {
    try {
      await axios.patch(`http://localhost:3000/users/${userId}/role`, { role: newRole }, config);
      // Actualizamos UI en vivo
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (e) {
      alert("No se pudo cambiar el rol.");
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-2 bg-slate-800 rounded-full"></div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <MdSupervisedUserCircle className="text-teal-800" /> Mi Equipo (Personal)
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
        <p className="text-sm text-slate-500 mb-2">Aquí puedes dar de alta a tus manicuristas. Diles que se registren gratis desde la pantalla principal, luego búscalas en esta lista y asígnales el rol de <strong className="text-slate-800">TRABAJADOR</strong>.</p>
        <p className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">Advertencia: Los administradores tienen acceso a finanzas, inventario y todas las citas.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest border-b border-slate-100">
              <th className="p-4 font-bold">Registro</th>
              <th className="p-4 font-bold">Datos del Usuario</th>
              <th className="p-4 font-bold text-center">Rango / Permisos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition">
                <td className="p-4 text-xs font-semibold text-slate-400">
                  {new Date(u.createdAt).toLocaleDateString('es-MX')}
                </td>
                <td className="p-4">
                  <span className="block font-bold text-slate-800 text-sm">{u.name}</span>
                  <span className="block text-xs font-medium text-slate-500 mt-1">{u.email}</span>
                  {u.phone && <span className="block text-[10px] font-bold text-teal-700 tracking-widest mt-1">📞 {u.phone}</span>}
                </td>
                <td className="p-4 text-center">
                  <div className="inline-flex items-center gap-2 bg-slate-100 p-2 rounded-xl">
                    <MdBadge className={u.role === 'ADMIN' ? 'text-amber-500' : u.role === 'TRABAJADOR' ? 'text-teal-600' : 'text-slate-400'} size={18} />
                    <select 
                      value={u.role} 
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      className={`text-xs font-black uppercase tracking-widest bg-transparent outline-none cursor-pointer ${
                        u.role === 'ADMIN' ? 'text-amber-600' : 
                        u.role === 'TRABAJADOR' ? 'text-teal-700' : 'text-slate-600'
                      }`}
                    >
                      <option value="CLIENTE">CLIENTE (Básico)</option>
                      <option value="TRABAJADOR">TRABAJADOR (Manicurista)</option>
                      <option value="ADMIN">ADMINISTRADOR (Dueño)</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
