import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, AlertTriangle } from 'lucide-react';

const RetiroModal = ({ isOpen, onClose, wallet, onSubmit }) => {
    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');

    if (!isOpen || !wallet) return null;

    // Determinar Red automáticamente
    const getNetwork = (symbol) => {
        if (symbol === 'BTC') return 'Bitcoin Network';
        if (symbol === 'ETH') return 'ERC-20 (Ethereum)';
        if (symbol === 'USDT') return 'TRC-20 (Tron)';
        if (symbol === 'DOGE') return 'DOGE';
        if (symbol === 'XRP') return 'XRP (XRP Ledger)';
        return 'Cadena Principal';
    };

    const network = getNetwork(wallet.simbolo);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (parseFloat(amount) > parseFloat(wallet.balance)) {
            setError('Saldo insuficiente para realizar este retiro.');
            return;
        }
        if (parseFloat(amount) <= 0) {
            setError('La cantidad debe ser mayor a 0.');
            return;
        }
        if (address.length < 10) {
            setError('La dirección parece inválida.');
            return;
        }

        onSubmit({
            wallet_id: wallet.id, // O wallet.currency_id según venga tu backend
            amount_crypto: amount,
            address: address,
            network: network
        });
        
        // Reset y cerrar
        setAmount('');
        setAddress('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                
                {/* Header */}
                <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <ArrowUpRight className="text-red-400" /> Retirar {wallet.simbolo}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Aviso */}
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg flex gap-3 items-start">
                        <AlertTriangle className="text-yellow-500 w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-200/80">
                            Asegúrate de que la dirección soporte la red <span className="font-bold text-yellow-400">{network}</span>. 
                            Las transacciones en blockchain son irreversibles.
                        </p>
                    </div>

                    {/* Inputs */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Dirección de Destino</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-red-500 focus:outline-none font-mono"
                            placeholder={`Ej: Dirección ${wallet.simbolo}...`}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-slate-400">Cantidad</label>
                            <span className="text-xs text-slate-500">Disp: {parseFloat(wallet.balance).toFixed(6)} {wallet.simbolo}</span>
                        </div>
                        <input 
                            type="number" 
                            step="0.00000001"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-lg font-bold focus:border-red-500 focus:outline-none"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}

                    <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-red-900/20">
                        Confirmar Retiro
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RetiroModal;