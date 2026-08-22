'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Download, RefreshCw, Loader2, Copy, Maximize2, Sparkles, Image as ImageIcon, Link as LinkIcon, Package, AlertCircle } from 'lucide-react';
import api, { type GenerateImageResponse, type Product } from '@/lib/api';
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedProductId = searchParams.get('productId');

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>(preselectedProductId || '');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('flux');
  const [size, setSize] = useState(0);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<GenerateImageResponse | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [history, setHistory] = useState<GenerateImageResponse[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);

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
    if (selectedProductId) {
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
    const parts = [`Product: ${p.name}`];
    if (p.description) parts.push(`Description: ${p.description}`);
    if (p.category) parts.push(`Category: ${p.category}`);
    if (p.features?.length) parts.push(`Features: ${p.features.join(', ')}`);
    if (p.price) parts.push(`Price: ${p.currency} ${p.price}`);
    parts.push('Style: Professional product photography, clean background, studio lighting, high detail');
    setPrompt(parts.join('\n'));
  };

  const handleSmartPrompt = async () => {
    if (!selectedProduct) return;
    setIsAnalyzing(true);
    try {
      const context = [
        `Product: ${selectedProduct.name}`,
        selectedProduct.description ? `Description: ${selectedProduct.description}` : '',
        selectedProduct.category ? `Category: ${selectedProduct.category}` : '',
        selectedProduct.features?.length ? `Features: ${selectedProduct.features.join(', ')}` : '',
        selectedProduct.images?.length ? `Product image: ${selectedProduct.images[0]}` : '',
      ].filter(Boolean).join('\n');

      const res = await api.post<{ prompt: string }>('/ai/generate-image-prompt', {
        prompt: context,
      });
      setPrompt(res.data.prompt);
      toast.success('Smart prompt generated! Review and edit below.');
    } catch {
      toast.error('Failed to generate smart prompt');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentSize = sizePresets[size];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!selectedProductId) {
      toast.error('Select a product before generating. Your product gives the AI the context it needs.');
      return;
    }
    setIsGenerating(true);
    try {
      let genId = generationId;
      if (!genId) {
        const genRes = await api.post<{ id: string }>('/ai-generations', {
          productId: selectedProductId,
          type: 'image',
          prompt,
          model,
          provider: 'pollinations',
          width: currentSize.width,
          height: currentSize.height,
          seed,
        });
        genId = genRes.data.id;
        setGenerationId(genId);
      }

      const res = await api.post<GenerateImageResponse>('/ai/generate-image', {
        prompt,
        model,
        width: currentSize.width,
        height: currentSize.height,
        seed,
        productId: selectedProductId,
      });

      if (genId) {
        api.patch(`/ai-generations/${genId}`, {
          status: 'completed',
          outputUrl: res.data.imageUrl,
        }).catch(() => {});
      }

      setResult(res.data);
      setHistory(prev => [res.data, ...prev].slice(0, 20));
      toast.success('Image generated!');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = axiosErr?.response?.data?.message || axiosErr?.message || 'Failed to generate image';
      if (generationId) {
        api.patch(`/ai-generations/${generationId}`, { status: 'failed', error: msg }).catch(() => {});
      }
      toast.error(msg);
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

  const handleAttachToPost = async () => {
    if (!result) return;
    try {
      const hashtagsArr = selectedProduct
        ? [`#${selectedProduct.name?.replace(/\s+/g, '')}`, `#${selectedProduct.category || 'product'}`]
        : [];
      const res = await api.post('/posts', {
        caption: `${selectedProduct?.name || 'New product'} — Check out this amazing product!`,
        title: `${selectedProduct?.name || 'New product'} Image Post`,
        hashtags: hashtagsArr,
        platforms: ['Instagram'],
        imageUrl: result.imageUrl,
        productId: selectedProductId || undefined,
      });
      toast.success('Post created with this image!', {
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
        <div className="font-mono text-xs tracking-[3px] text-white/50">AI STUDIO</div>
        <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">Image Generator</div>
        <div className="text-white/50 text-sm mt-2">Generate product images for free using Pollinations.ai</div>
      </div>

      <div className="px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        {/* Controls */}
        <div className="glass p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
          <div className="space-y-5">
            {/* Product Selection */}
            <div>
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
                  <div className="text-white/50 text-sm mb-2">Add a product first to generate AI images.</div>
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
                  <><Sparkles className="w-4 h-4" /> Generate Smart Prompt from Product</>
                )}
              </button>
            )}

            <div>
              <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">PROMPT</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-3xl px-4 sm:px-6 py-4 text-sm h-28 resize-none"
                placeholder="Describe the image you want to generate..."
              />
            </div>

            <div>
              <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">MODEL</label>
              <div className="space-y-2">
                {imageModels.map(m => (
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
              <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">SIZE</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {sizePresets.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSize(i)}
                    className={`py-2 sm:py-3 rounded-2xl text-xs sm:text-sm font-medium border transition-colors ${
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
              <div className="flex gap-2">
                <input
                  type="number"
                  value={seed || ''}
                  onChange={e => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Random"
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm"
                />
                <button
                  onClick={() => setSeed(Math.floor(Math.random() * 1000000))}
                  className="p-3 rounded-2xl border border-white/10 hover:bg-white/5 transition-colors shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || !selectedProductId}
              className="neon-button w-full mt-2 disabled:opacity-40"
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
        <div className="glass p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden min-h-[400px]">
          {!result ? (
            <div className="h-full flex items-center justify-center text-center px-4 min-h-[400px]">
              <div>
                <div className="text-6xl mb-4">🎨</div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">Ready to create</div>
                <div className="text-white/50 mt-2 text-sm">
                  {selectedProductId
                    ? 'Review the prompt and click Generate'
                    : 'Select a product first to get started'}
                </div>
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

              <div className="flex gap-3 mt-6">
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
