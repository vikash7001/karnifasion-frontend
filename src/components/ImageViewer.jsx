import React, {useEffect, useState} from 'react';
import { api } from '../services/api';

export default function ImageViewer(){
  const [series,setSeries] = useState([]);
  const [images,setImages] = useState([]);
  const [sel, setSel] = useState('');

  useEffect(()=>{ loadSeries(); }, []);

  async function loadSeries(){
    try{
      const res = await api.get('/series');
      setSeries(res.data || []);
    }catch(err){ console.error(err); }
  }

  async function loadImages(){
    try{
      if(!sel) return;
      const res = await api.get(`/images/series/${encodeURIComponent(sel)}`);
      setImages(res.data || []);
    }catch(err){ console.error(err); }
  }

  return (
    <div>
      <h3>Image Viewer</h3>
      <div className="row">
        <select value={sel} onChange={e=>setSel(e.target.value)}>
          <option value=''>-- select series --</option>
          {series.map(s=> <option key={s.SeriesName} value={s.SeriesName}>{s.SeriesName}</option>)}
        </select>
        <button onClick={loadImages}>Load</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginTop:12}}>
        {images.map(img => (
          <div key={img.ProductID} style={{border:'1px solid #eee',padding:6}}>
            <img src={img.ImageURL} alt="" style={{width:'100%'}} />
          </div>
        ))}
      </div>
    </div>
  );
}
