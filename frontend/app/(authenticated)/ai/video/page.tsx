'use client';

import React, { useState } from 'react';
import { Download, Loader2, Film, AlertCircle } from 'lucide-react';
import api, { type GenerateVideoResponse } from '@/lib/api';
import { toast } from 'sonner';

const videoModels = [
  { id: 'stable-video', name: 'Stable Video', description: 'Fast, general purpose video generation' },
  { id: 'AnimateDiff', name: 'AnimateDiff', description: 'Smooth motion, good for characters' },
];

const durationOptions = [
  { value: 3, label: '3s', description: 'Short clip' },
  { value: 5, label: '5s', description: 'Standard' },
  { value: 8, label: '8s', description: 'Extended' },
];

export default function AIVideoPage() {
  const [prompt, setPrompt] = useState('A timelapse of a sunset over the ocean with waves crashing on rocks, golden light, cinematic');
  const [model, setModel] = useState('stable-video');
  const [duration, setDuration] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateVideoResponse | null>(null);
  const [history, setHistory] = useState<GenerateVideoResponse[]>([]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post<GenerateVideoResponse>('/ai/generate-video', {
        prompt,
        model,
        duration,
      });
      setResult(res.data);
      setHistory(prev => [res.data, ...prev].slice(0, 10));
      toast.success('Video generated!');
    } catch {
      toast.error('Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (videoUrl: string, name: string) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `${name.replace(/\s+/g, '_')}_${Date.now()}.mp4`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="floating-shell mx-auto ring-1 ring-white/10">
      <div className="px-4 sm:px-8 pt-9 pb-6">
        <div className="font-mono text-xs tracking-[3px] text-white/50">AI STUDIO</div>
        <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">Video Generator</div>
        <div className="text-white/50 text-sm mt-2">Generate short videos for free using Pollinations.ai</div>
      </div>

      <div className="px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        {/* Controls */}
        <div className="glass p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
          <div className="space-y-5">
            <div>
              <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">PROMPT</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-3xl px-4 sm:px-6 py-4 text-sm h-28 resize-none"
                placeholder="Describe the video you want to generate..."
              />
            </div>

            <div>
              <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">MODEL</label>
              <div className="space-y-2">
                {videoModels.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all text-sm ${
                      model === m.id
                        ? 'border-[#7c3aed] bg-[#7c3aed]/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="font-medium">{m.name}</div>
                    <div className="text-white/50 text-xs">{m.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">DURATION</label>
              <div className="grid grid-cols-3 gap-2">
                {durationOptions.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    className={`py-3 rounded-2xl text-sm font-medium border transition-colors ${
                      duration === d.value
                        ? 'border-[#7c3aed] bg-[#7c3aed]/10 text-[#7c3aed]'
                        : 'border-white/10 hover:bg-white/5'
                    }`}
                  >
                    {d.label}
                    <div className="text-[10px] text-white/40 mt-0.5">{d.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-white/40 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-white/50">
                  <div className="font-medium text-white/70 mb-1">Free Video Generation</div>
                  Videos are generated using Pollinations.ai — completely free, no API key required.
                  Generation may take 30-60 seconds.
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="neon-button w-full mt-2"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating video...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Film className="w-4 h-4" /> Generate Video
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="glass p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden min-h-[400px]">
          {!result ? (
            <div className="h-full flex items-center justify-center text-center px-4 min-h-[400px]">
              <div>
                <div className="text-6xl mb-4">🎬</div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">Ready to create</div>
                <div className="text-white/50 mt-2 text-sm">Enter a prompt and click Generate Video</div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="font-mono text-xs text-white/50">RESULT</div>
                <button
                  onClick={() => handleDownload(result.videoUrl, result.prompt)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                <video
                  src={result.videoUrl}
                  controls
                  className="w-full max-h-[400px]"
                  preload="metadata"
                />
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Model</span>
                  <span className="font-mono">{result.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Duration</span>
                  <span className="font-mono">{result.duration}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Provider</span>
                  <span className="font-mono">{result.provider}</span>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="neon-button w-full mt-6"
              >
                {isGenerating ? 'Regenerating...' : 'Regenerate'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      {history.length > 1 && (
        <div className="px-4 sm:px-8 pb-10">
          <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">RECENT GENERATIONS</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {history.slice(1).map((vid, i) => (
              <button
                key={i}
                onClick={() => setResult(vid)}
                className="group relative aspect-video rounded-2xl overflow-hidden border border-white/10 hover:border-[#7c3aed]/40 transition-colors"
              >
                <video src={vid.videoUrl} className="w-full h-full object-cover" preload="metadata" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Film className="w-5 h-5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
