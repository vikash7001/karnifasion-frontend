import React, {useEffect, useState} from 'react';
import { api } from '../services/api';

export default function PurchaseVoucher({user}){
  const [products,setProducts] = useState([]);
  const [series,setSeries] = useState([]);
  const [items,setItems] = useState([{ product:'', qty: '' }]);
  const [loading,setLoading] = useState(false);
  const [msg,setMsg] = useState(null);

  useEffect(()=>{
    loadLists();
    function onSave(){ save(); }
    document.addEventListener('save-voucher', onSave);
    return ()=> document.removeEventListener('save-voucher', onSave);
  },[]);

  async function loadLists(){
    try{
      const [pRes,sRes] = await Promise.all([ api.get('/products'), api.get('/series') ]);
      setProducts(pRes.data || []);
      setSeries(sRes.data || []);
    }catch(err){
      console.error(err);
    }
  }

  function updateItem(i, field, value){
    const u = [...items];
    u[i][field] = value;
    setItems(u);
  }

  function addRow(){
    setItems([...items, { product:'', qty:'' }]);
  }

  async function save(){
    setLoading(true); setMsg(null);
    try{
      // NOTE: backend route /purchase/save may not exist in your backend.
      // Replace endpoint if you have a different save API.
      const payload = { supplier: series[0]?.SeriesName || null, items };
      const res = await api.post('/purchase/save', payload);
      setMsg('Saved OK');
      setItems([{ product:'', qty: '' }]);
    }catch(err){
      console.error(err);
      setMsg('Save failed: ' + (err.response?.data?.error || err.message));
    }finally{ setLoading(false); }
  }

  return (
    <div>
      <h3>Purchase Voucher</h3>
      <div className="row">
        <div>Supplier</div>
        <select>
          <option value="">{series[0]?.SeriesName || 'Select supplier'}</option>
        </select>
      </div>
      <table>
        <thead><tr><th>Item</th><th>Qty</th></tr></thead>
        <tbody>
          {items.map((row,idx)=>(
            <tr key={idx}>
              <td>
                <select value={row.product} onChange={e=>updateItem(idx,'product',e.target.value)}>
                  <option value=''>-- choose --</option>
                  {products.map(p=> <option key={p.ProductID} value={p.ProductID}>{p.Item}</option>)}
                </select>
              </td>
              <td><input value={row.qty} onChange={e=>updateItem(idx,'qty',e.target.value)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{marginTop:10}}>
        <button onClick={addRow}>Add Row</button>
        <button onClick={save} style={{marginLeft:8}}>Save (Ctrl+A)</button>
      </div>
      {loading && <div>Saving...</div>}
      {msg && <div>{msg}</div>}
    </div>
  );
}
