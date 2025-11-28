import React from 'react';
import { getCardStyle } from './DetectiveBoardUtils';

const BillingCard = ({ patient, isConnected, onClick }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex="0"
      onKeyDown={handleKeyDown}
      onClick={onClick}
      className={getCardStyle(isConnected, 'bg-gradient-to-br from-yellow-500 to-orange-600', 'border-yellow-500')}
      style={{
        transform: isConnected ? 'rotate(1deg)' : 'none',
        boxShadow: isConnected ? '0 0 40px rgba(234, 179, 8, 0.6)' : 'none'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold flex items-center gap-2 ${isConnected ? 'text-white' : 'text-yellow-400'}`}>
          <span className="text-2xl">💰</span>
          Billing Info
        </h3>
        <span className={`text-2xl ${isConnected ? 'text-white' : 'text-yellow-400'}`}>🔗</span>
      </div>

      <div className="space-y-4 mt-4">
        <div>
          <p className={`text-xs font-bold mb-1 ${isConnected ? 'text-white/80' : 'text-gray-400'}`}>
            INVOICE NUMBER
          </p>
          <p className={`text-lg font-bold ${isConnected ? 'text-white' : 'text-yellow-400'}`}>
            {patient.billing.invoice}
          </p>
        </div>

        <div className="h-px" style={{
          background: isConnected ? 'rgba(255,255,255,0.2)' : 'rgba(234, 179, 8, 0.2)'
        }} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className={`text-xs font-bold mb-1 ${isConnected ? 'text-white/80' : 'text-gray-400'}`}>
              TOTAL AMOUNT
            </p>
            <p className={`text-xl font-bold ${isConnected ? 'text-white' : 'text-white'}`}>
              ₹{patient.billing.total}
            </p>
          </div>
          <div>
            <p className={`text-xs font-bold mb-1 ${isConnected ? 'text-white/80' : 'text-gray-400'}`}>
              STATUS
            </p>
            <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded mt-1">
              {String(patient.billing.status || '').toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BillingCard);
