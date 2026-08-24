'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Download, Loader2, Film, AlertCircle, Sparkles, Link as LinkIcon, Package, RefreshCw } from 'lucide-react';
import api, { type GenerateVideoResponse, type Product } from '@/lib/api';
import { toast } from 'sonner';
import { TourButton } from '../../../../components/tour/TourButton';

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedProductId = searchParams.get('productId');

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>(preselectedProductId || '');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('stable-video');
  const [duration, setDuration] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<GenerateVideoResponse | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [history, setHistory] = useState<GenerateVideoResponse[]>([]);

  useEffect(() => {
    let cancelled = false;
    const loadProducts = async () => {
      try {
        const res = await api.get<Product[]>('/products');
        if (!cancelled) setProducts(res.data);
      } catch {
        if (!cancelled) setProductsError('Failed to load products');
      } finally {
        if (!cancelled) setIsLoadingProducts(false);
      }
    };
    loadProducts();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (preselectedProductId) {
      setSelectedProductId(preselectedProductId);
    }
  }, [preselectedProductId]);

  useEffect(() => {
    if (selectedProductId && products.length) {
      const p = products.find(pr => pr.id === selectedProductId);
      if (p) {
        setSelectedProduct(p);
        if (!prompt) {
          buildProductPrompt(p);
        }
      }
    }
  }, [selectedProductId, products]);

  const buildProductPrompt = (p: Product) => {
    const parts = [`Product showcase video of ${p.name}`];
    if (p.description) parts.push(p.description);
    if (p.category) parts.push(`Category: ${p.category}`);
    if (p.price) parts.push(`Price: ${p.currency} ${p.price}`);
    parts.push('Style: Cinematic product video, professional lighting, smooth camera movement');
    setPrompt(parts.join(', '));
  };

  const handleSmartPrompt = async () => {
    if (!selectedProduct) return;
    setIsAnalyzing(true);
    try {
      const context = [
        `Product: ${selectedProduct.name}`,
        selectedProduct.description ? `Description: ${selectedProduct.description}` : '',
        selectedProduct.category ? `Category: ${selectedProduct.category}` : '',
        selectedProduct.images?.length ? `Product image: ${selectedProduct.images[0]}` : '',
      ].filter(Boolean).join('\n');

      const res = await api.post<{ content?: string; prompt?: string }>('/ai/generate', {
        prompt: `Generate a video prompt for this product:\n${context}`,
        type: 'video',
      });
      const smartPrompt = res.data.content || res.data.prompt;
      if (smartPrompt) setPrompt(smartPrompt);
      toast.success('Smart video prompt generated! Review and edit below.');
    } catch {
      toast.error('Failed to generate smart prompt');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!selectedProductId) {
      toast.error('Select a product before generating. Your product gives the AI the context it needs.');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await api.post<{ generation: { id: string }; result: GenerateVideoResponse }>('/ai/generate-video', {
        prompt,
        model,
        duration,
        productId: selectedProductId,
      });

      const genId = res.data.generation?.id;
      if (genId) setGenerationId(genId);

      setResult(res.data.result);
      setHistory(prev => [res.data.result, ...prev].slice(0, 10));
      toast.success('Video generated!');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = axiosErr?.response?.data?.message || axiosErr?.message || 'Failed to generate video';
      toast.error(msg);
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

  const handleAttachToPost = async () => {
    if (!result) return;
    try {
      const hashtagsArr = selectedProduct
        ? [`#${selectedProduct.name?.replace(/\s+/g, '')}`, `#${selectedProduct.category || 'product'}`]
        : [];
      const res = await api.post('/posts', {
        caption: `${selectedProduct?.name || 'New product'} — Check out this video!`,
        title: `${selectedProduct?.name || 'New product'} Video Post`,
        hashtags: hashtagsArr,
        platforms: ['Instagram'],
        videoUrl: result.videoUrl,
        productId: selectedProductId || undefined,
      });
      toast.success('Post created with this video!', {
        action: {
          label: 'View Post',
          onClick: () => router.push(`/posts/${res.data.id}`),
        },
      });
    } catch {
      toast.error('Failed to create post');
    }
  };

  return (
    <div className="floating-shell mx-auto ring-1 ring-white/10">
      <div className="px-4 sm:px-8 pt-9 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-xs tracking-[3px] text-white/50">AI STUDIO</div>
            <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">Video Generator</div>
            <div className="text-white/50 text-sm mt-2">Generate short videos for free using Pollinations.ai</div>
          </div>
          <TourButton moduleId="aiVideo" />
        </div>
      </div>

      <div className="px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        {/* Controls */}
        <div className="glass p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
          <div className="space-y-5">
            {/* Product Selection */}
            <div data-tour="video-product">
              <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">
                <Package className="w-3 h-3 inline mr-1" /> PRODUCT (REQUIRED)
              </label>
              {isLoadingProducts ? (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#7c3aed] mx-auto mb-2" />
                  <div className="text-white/50 text-sm">Loading products...</div>
                </div>
              ) : productsError ? (
                <div className="p-4 rounded-2xl bg-white/5 border border-red-500/20 text-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mx-auto mb-2" />
                  <div className="text-white/50 text-sm mb-2">{productsError}</div>
                  <button onClick={() => { setIsLoadingProducts(true); setProductsError(null); api.get<Product[]>('/products').then(res => setProducts(res.data)).catch(() => setProductsError('Failed to load products')).finally(() => setIsLoadingProducts(false)); }} className="text-xs px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors">
                    Retry
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="text-white/50 text-sm mb-2">Add a product first to generate AI videos</div>
                  <button onClick={() => router.push('/products')} className="text-xs px-4 py-2 rounded-full border border-[#7c3aed] text-[#7c3aed] hover:bg-[#7c3aed]/10 transition-colors">
                    + Add Product
                  </button>
                </div>
              ) : (
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl px-4 py-3 text-sm"
                >
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.emoji || '📦'} {p.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Smart Prompt Button */}
            {selectedProduct && (
              <button
                onClick={handleSmartPrompt}
                disabled={isAnalyzing}
                className="w-full py-3 rounded-2xl border border-[#7c3aed]/30 bg-[#7c3aed]/5 text-[#7c3aed] text-sm flex items-center justify-center gap-2 hover:bg-[#7c3aed]/10 transition-colors"
              >
                {isAnalyzing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing product...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Smart Video Prompt</>
                )}
              </button>
            )}

            <div data-tour="video-prompt">
              <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">PROMPT</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-3xl px-4 sm:px-6 py-4 text-sm h-28 resize-none"
                placeholder="Describe the video you want to generate..."
              />
            </div>

            <div data-tour="video-settings">
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
              disabled={isGenerating || !prompt.trim() || !selectedProductId}
              className="neon-button w-full mt-2 disabled:opacity-40"
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
                <div className="text-white/50 mt-2 text-sm">
                  {selectedProductId
                    ? 'Review the prompt and click Generate Video'
                    : 'Select a product first to get started'}
                </div>
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
                {selectedProduct && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Product</span>
                    <span className="font-mono">{selectedProduct.emoji} {selectedProduct.name}</span>
                  </div>
                )}
              </div>

              {selectedProduct && (
                <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="font-mono text-[10px] text-white/40 mb-2">SOURCE</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/50">Product</span>
                      <span>{selectedProduct.emoji} {selectedProduct.name}</span>
                    </div>
                    {generationId && (
                      <div className="flex justify-between">
                        <span className="text-white/50">Generation ID</span>
                        <span className="font-mono text-xs">{generationId}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-white/50">Provider</span>
                      <span className="font-mono">{result.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Prompt</span>
                      <span className="text-right max-w-[60%] text-xs truncate">{result.prompt}</span>
                    </div>
                  </div>
                </div>
              )}

              <div data-tour="video-result" className="flex gap-3 mt-6">
                <button
                  onClick={handleAttachToPost}
                  className="flex-1 py-3 rounded-2xl border border-white/10 hover:bg-white/5 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <LinkIcon className="w-4 h-4" /> Attach to Post
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="neon-button flex-1"
                >
                  {isGenerating ? 'Regenerating...' : 'Regenerate'}
                </button>
              </div>
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
