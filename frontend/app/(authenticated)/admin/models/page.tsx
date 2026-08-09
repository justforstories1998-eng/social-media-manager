'use client';

import React from 'react';

export default function AdminModelsPage() {
  const models = [
    { name: "qwen2.5:7b", size: "4.7 GB", status: "Running", usage: 68, lastUsed: "2 min ago" },
    { name: "llama3.2:1b", size: "1.3 GB", status: "Idle", usage: 12, lastUsed: "3h ago" },
    { name: "gemma:2b", size: "2.1 GB", status: "Idle", usage: 8, lastUsed: "1d ago" },
    { name: "mistral:7b", size: "4.1 GB", status: "Stopped", usage: 0, lastUsed: "5d ago" },
  ];

  return (
    <div className="floating-shell mx-auto ring-1 ring-white/10">
      <div className="px-4 sm:px-8 h-20 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="font-semibold text-2xl tracking-tight">WonderMedia</div>
          <div className="px-3 py-1 text-xs font-mono bg-red-500/10 text-red-400 rounded-full tracking-widest">ADMIN</div>
        </div>
        <button className="neon-button text-sm">Pull New Model</button>
      </div>

      <div className="px-4 sm:px-8 pt-9 pb-6">
        <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">AI Models</div>
      </div>

      <div className="px-4 sm:px-8 pb-12">
        <div className="glass rounded-[2.5rem] overflow-hidden border border-white/10">
          <div className="table-wrapper">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-xs font-mono tracking-[2px] text-white/40">
                  <th className="px-4 sm:px-8 py-5 text-left">MODEL</th>
                  <th className="px-4 sm:px-8 py-5 text-left hidden sm:table-cell">SIZE</th>
                  <th className="px-4 sm:px-8 py-5 text-left">STATUS</th>
                  <th className="px-4 sm:px-8 py-5 text-left hidden md:table-cell">USAGE</th>
                  <th className="px-4 sm:px-8 py-5 text-left hidden lg:table-cell">LAST USED</th>
                </tr>
              </thead>
              <tbody>
                {models.map((model, i) => (
                  <tr key={i} className="border-b border-white/10 hover:bg-white/5 last:border-none">
                    <td className="px-4 sm:px-8 py-6 font-medium font-mono">
                      {model.name}
                      <div className="sm:hidden text-xs text-white/50 mt-1">{model.size}</div>
                    </td>
                    <td className="px-4 sm:px-8 py-6 text-white/70 hidden sm:table-cell">{model.size}</td>
                    <td className="px-4 sm:px-8 py-6">
                      <span className={`status-badge ${model.status === 'Running' ? 'status-published' : model.status === 'Idle' ? 'status-draft' : 'bg-white/5 text-white/40'}`}>
                        {model.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-8 py-6 hidden md:table-cell">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-1.5 bg-gradient-to-r from-[#7c3aed] to-[#ec4899] rounded-full" style={{ width: `${model.usage}%` }} />
                        </div>
                        <span className="text-xs text-white/50">{model.usage}%</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-6 text-sm text-white/60 font-mono hidden lg:table-cell">{model.lastUsed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
