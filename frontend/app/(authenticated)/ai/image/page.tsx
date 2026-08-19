'use client';

import React, { useState } from 'react';
import { Download, RefreshCw, Loader2, Copy, Maximize2 } from 'lucide-react';
import api, { type GenerateImageResponse } from '@/lib/api';
import { toast } from 'sonner';

const imageModels = [
  { id: 'flux', name: 'FLUX', description: 'Fast, photorealistic, versatile' },
  { id: 'flux-realism', name: 'FLUX Realism', description: 'Hyper-photographic faces and products' },
  { id: 'flux-anime', name: 'FLUX Anime', description: 'Stylised anime / illustration' },
  { id: 'sdxl', name: 'Stable Diffusion XL', description: 'Classic, strong on composition' },
  { id: 'sd3', name: 'Stable Diffusion 3', description: 'Best text rendering inside images' },
];

const sizePresets = [
  { label: 'Square', width: 1024, height: 1024 },
  { label: 'Landscape', width: 1280, height: 720 },
  { label: 'Portrait', width: 720, height: 1280 },
  { label: 'Wide', width: 1536, height: 640 },
  { label: 'Social', width: 1080, height: 1350 },
];

export default function AIImagePage() {
  const [prompt, setPrompt] = useState('A serene Japanese garden with cherry blossoms, koi pond, golden hour lighting, cinematic');
  const [model, setModel] = useState('flux');
  const [size, setSize] = useState(0);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateImageResponse | null>(null);
  const [history, setHistory] = useState<GenerateImageResponse[]>([]);

  const currentSize = sizePresets[size];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post<GenerateImageResponse>('/ai/generate-image', {
        prompt,
        model,
        width: currentSize.width,
        height: currentSize.height,
        seed,
      });
      setResult(res.data);
      setHistory(prev => [res.data, ...prev].slice(0, 20));
      toast.success('Image generated!');
    } catch {
      toast.error('Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageUrl: string, name: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${name.replace(/\s+/g, '_')}_${Date.now()}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  return (
    <div className="floating-shell mx-auto ring-1 ring-white/10">
      <div className="px-4 sm:px-8 pt-9 pb-6">
        <div className="font-mono text-xs tracking-[3px] text-white/50">AI STUDIO</div>
        <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">Image Generator</div>
        <div className="text-white/50 text-sm mt-2">Generate images for free using Pollinations.ai</div>
      </div>

      <div className="px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        {/* Controls */}
        <div className="glass p-6 sm:p-9 rounded-[2.5rem]">
          <div className="space-y-6">
            <div>
              <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">PROMPT</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-sm h-32 resize-none"
                placeholder="Describe the image you want to generate..."
              />
            </div>

            <div>
              <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">MODEL</label>
              <div className="grid grid-cols-1 gap-2">
                {imageModels.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    className={`text-left p-3 rounded-2xl border transition-all ${
                      model === m.id
                        ? 'border-[#7c3aed] bg-[#7c3aed]/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="font-medium text-sm">{m.name}</div>
                    <div className="text-white/50 text-xs">{m.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">SIZE</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sizePresets.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSize(i)}
                    className={`py-3 rounded-2xl text-sm font-medium border transition-colors ${
                      size === i
                        ? 'border-[#7c3aed] bg-[#7c3aed]/10 text-[#7c3aed]'
                        : 'border-white/10 hover:bg-white/5'
                    }`}
                  >
                    {s.label}
                    <div className="text-[10px] text-white/40 mt-0.5">{s.width}x{s.height}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">SEED (OPTIONAL)</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={seed || ''}
                  onChange={e => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Random"
                  className="flex-1"
                />
                <button
                  onClick={handleRandomSeed}
                  className="p-3 rounded-2xl border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="neon-button w-full mt-2"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                </span>
              ) : (
                'Generate Image'
              )}
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="glass p-6 sm:p-9 rounded-[2.5rem]">
          {!result ? (
            <div className="h-full flex items-center justify-center text-center px-4 min-h-[400px]">
              <div>
                <div className="text-6xl mb-4">🎨</div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">Ready to create</div>
                <div className="text-white/50 mt-2 text-sm">Enter a prompt and click Generate</div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="font-mono text-xs text-white/50">RESULT</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(result.imageUrl, result.prompt)}
                    className="p-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.imageUrl);
                      toast.success('URL copied!');
                    }}
                    className="p-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                <img
                  src={result.imageUrl}
                  alt={result.prompt}
                  className="w-full object-contain max-h-[500px]"
                  loading="lazy"
                />
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Model</span>
                  <span className="font-mono">{result.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Size</span>
                  <span className="font-mono">{result.width}x{result.height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Seed</span>
                  <span className="font-mono">{result.seed}</span>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {history.slice(1).map((img, i) => (
              <button
                key={i}
                onClick={() => setResult(img)}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 hover:border-[#7c3aed]/40 transition-colors"
              >
                <img src={img.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="w-5 h-5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
