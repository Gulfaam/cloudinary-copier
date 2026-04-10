'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, ArrowRight, CheckCircle2, AlertCircle, Loader2, KeyRound, FolderTree } from 'lucide-react';

type TransferState = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';

export default function Home() {
  const [targetCloudName, setTargetCloudName] = useState('');
  const [targetApiKey, setTargetApiKey] = useState('');
  const [targetApiSecret, setTargetApiSecret] = useState('');
  
  const [sourceCloudName, setSourceCloudName] = useState('');
  const [sourceApiKey, setSourceApiKey] = useState('');
  const [sourceApiSecret, setSourceApiSecret] = useState('');
  
  const [folderPath, setFolderPath] = useState('');
  const [transferState, setTransferState] = useState<TransferState>('IDLE');
  const [statusMessage, setStatusMessage] = useState('');
  const [copiedAssets, setCopiedAssets] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferState('LOADING');
    setStatusMessage('Initiating transfer and listing assets...');
    setCopiedAssets(0);

    try {
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceCloudName,
          sourceApiKey,
          sourceApiSecret,
          targetCloudName,
          targetApiKey,
          targetApiSecret,
          folderPath,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to transfer folder');
      }

      setTransferState('SUCCESS');
      setStatusMessage('Transfer completed successfully!');
      setCopiedAssets(data.transferredCount || 0);
    } catch (err: any) {
      setTransferState('ERROR');
      setStatusMessage(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[100px] pointer-events-none" />

      <header className="mb-12 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md">
            <Cloud className="w-8 h-8 text-purple-400" />
          </div>
          <ArrowRight className="w-6 h-6 text-white/40" />
          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md">
            <Cloud className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>
        <motion.h1 
          className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Cloudinary Folder Copier
        </motion.h1>
        <motion.p 
          className="text-white/60 max-w-lg mx-auto text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          An elegant way to migrate your assets seamlessly between accounts.
        </motion.p>
      </header>

      <motion.div 
        className="w-full max-w-4xl z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 md:p-10 flex flex-col gap-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Source Account */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
                <Cloud className="text-purple-400 w-5 h-5" />
                <h2 className="text-xl font-semibold">Source Account</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1 block">Cloud Name</label>
                  <input required placeholder="e.g. demo-source" className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none" value={sourceCloudName} onChange={e => setSourceCloudName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1 block">API Key</label>
                  <input required type="text" placeholder="Your API Key" className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none" value={sourceApiKey} onChange={e => setSourceApiKey(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1 block">API Secret</label>
                  <input required type="password" placeholder="••••••••••••" className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none" value={sourceApiSecret} onChange={e => setSourceApiSecret(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Target Account */}
            <div className="space-y-4 md:border-l md:border-white/10 md:pl-8">
              <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
                <Cloud className="text-blue-400 w-5 h-5" />
                <h2 className="text-xl font-semibold">Target Account</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1 block">Cloud Name</label>
                  <input required placeholder="e.g. demo-target" className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" value={targetCloudName} onChange={e => setTargetCloudName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1 block">API Key</label>
                  <input required type="text" placeholder="Your API Key" className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" value={targetApiKey} onChange={e => setTargetApiKey(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1 block">API Secret</label>
                  <input required type="password" placeholder="••••••••••••" className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" value={targetApiSecret} onChange={e => setTargetApiSecret(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-white/10 my-2" />

          {/* Folder Information */}
          <div className="max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-2 mb-3 justify-center">
              <FolderTree className="text-white/60 w-5 h-5" />
              <h2 className="text-xl font-semibold">Folder to Copy</h2>
            </div>
            <div>
              <input required placeholder="e.g. assets/images/campaign-2026" className="w-full px-5 py-4 text-center rounded-2xl bg-black/40 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none text-lg" value={folderPath} onChange={e => setFolderPath(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col items-center mt-4">
            <button
              disabled={transferState === 'LOADING'}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:pointer-events-none disabled:scale-100"
            >
              {transferState === 'LOADING' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Transferring Assets...
                </>
              ) : (
                <>
                  Start Transfer
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            {/* Status Messages */}
            <AnimatePresence mode="wait">
              {transferState !== 'IDLE' && (
                <motion.div
                  key={transferState}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mt-6 px-6 py-3 rounded-2xl flex items-center gap-3 text-sm font-medium ${
                    transferState === 'LOADING' ? 'bg-white/5 text-white/80 border border-white/10' :
                    transferState === 'SUCCESS' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}
                >
                  {transferState === 'SUCCESS' && <CheckCircle2 className="w-5 h-5" />}
                  {transferState === 'ERROR' && <AlertCircle className="w-5 h-5" />}
                  {transferState === 'LOADING' && <Loader2 className="w-5 h-5 animate-spin" />}
                  
                  <span>{statusMessage} {transferState === 'SUCCESS' && `(${copiedAssets} assets copied)`}</span>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </form>
      </motion.div>
    </main>
  );
}
