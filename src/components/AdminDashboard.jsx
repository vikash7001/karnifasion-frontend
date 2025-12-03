import React, {useState} from 'react';
import PurchaseVoucher from './PurchaseVoucher';
import StockView from './StockView';
import ImageViewer from './ImageViewer';

export default function AdminDashboard({user}){
  const [screen, setScreen] = useState('purchase'); // purchase, stock, images

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:10}}>
        <button onClick={()=>setScreen('purchase')}>Purchase</button>
        <button onClick={()=>setScreen('stock')}>Stock</button>
        <button onClick={()=>setScreen('images')}>Images</button>
      </div>

      {screen === 'purchase' && <PurchaseVoucher user={user} />}
      {screen === 'stock' && <StockView user={user} />}
      {screen === 'images' && <ImageViewer />}
    </div>
  );
}
