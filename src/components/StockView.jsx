import React, {useEffect, useState} from 'react';
import { api } from '../services/api';

export default function StockView({user}){
  const [stock,setStock] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{ load(); }, []);

  async function load(){
    setLoading(true);
    try{
      const res = await api.post('/stock', { role: user.Role, customerType: user.CustomerType });
      setStock(res.data || []);
    }catch(err){
      console.error(err);
    }finally{ setLoading(false); }
  }

  return (
    <div>
      <h3>Stock Summary</h3>
      {loading && <div>Loading...</div>}
      <table>
        <thead><tr><th>Product</th><th>Series</th><th>Category</th><th>Jaipur</th><th>Kolkata</th><th>Total</th></tr></thead>
        <tbody>
          {stock.map(s=> <tr key={s.ProductID}><td>{s.Item}</td><td>{s.SeriesName}</td><td>{s.CategoryName}</td><td>{s.JaipurQty}</td><td>{s.KolkataQty}</td><td>{s.TotalQty}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
