import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import CustomerView from './components/CustomerView';
import { api } from './services/api';

export default function App(){
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('admin'); // admin | customer

  useEffect(()=>{
    const token = localStorage.getItem('kf_token');
    const userJson = localStorage.getItem('kf_user');
    if(token && userJson){
      api.setToken(token);
      setUser(JSON.parse(userJson));
      setMode(JSON.parse(userJson).Role === 'Customer' ? 'customer' : 'admin');
    }
    function onKey(e){
      if(e.ctrlKey && e.key.toLowerCase() === 'a'){
        document.dispatchEvent(new KeyboardEvent('save-voucher'));
        e.preventDefault();
      }
      if(e.key === 'F9'){ document.dispatchEvent(new KeyboardEvent('open-purchase')); e.preventDefault(); }
      if(e.key === 'F8'){ document.dispatchEvent(new KeyboardEvent('open-sales')); e.preventDefault(); }
    }
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[]);

  if(!user) return <Login onLogin={(token, user)=>{ localStorage.setItem('kf_token', token); localStorage.setItem('kf_user', JSON.stringify(user)); api.setToken(token); setUser(user); setMode(user.Role === 'Customer' ? 'customer' : 'admin'); }} />

  return (
    <div>
      <div className="titlebar">
        <div className="company">KARNI FASHIONS</div>
        <div>{user.FullName} — {user.Role}</div>
      </div>
      <div className="toolbar">
        <div className="kbd">F9</div><div>Purchase</div>
        <div className="kbd">F8</div><div>Sales</div>
        <div className="kbd">Ctrl+A</div><div>Save</div>
        <div style={{marginLeft:'auto'}}>
          <button onClick={()=>{
            localStorage.removeItem('kf_token');
            localStorage.removeItem('kf_user');
            api.setToken(null);
            window.location.reload();
          }}>Logout</button>
        </div>
      </div>

      <div className="container">
        <div className="panel">
          {mode === 'admin' && <AdminDashboard user={user} />}
          {mode === 'customer' && <CustomerView user={user} />}
        </div>
      </div>
    </div>
  );
}
