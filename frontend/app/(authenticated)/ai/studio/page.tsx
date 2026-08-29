'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Download, RefreshCw, Loader2, Copy, Maximize2, Sparkles,
  Image as ImageIcon, Link as LinkIcon, Package, AlertCircle,
  Type, Film
} from 'lucide-react';
import api, { type GeneratePostResponse, type GenerateImageResponse, type GenerateVideoResponse, type Product } from '@/lib/api';
import { toast } from 'sonner';
import { TourButton } from '../../../../components/tour/TourButton';
import CustomDropdown from '@/components/CustomDropdown';

interface AIModel {
  id: string;
  name: string;
  context?: string;
  description?: string;
  size?: string;
}

const platformOptions = [
  { value: 'Instagram', label: 'Instagram' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'X', label: 'X (Twitter)' },
  { value: 'TikTok', label: 'TikTok' },
];

const typeOptions = [
  { value: 'Product Promotion', label: 'Product Promotion' },
  { value: 'Educational', label: 'Educational' },
  { value: 'Festival', label: 'Festival' },
];

const imageModels = [
  { id: 'black-forest-labs/FLUX.1-schnell-Free', name: 'FLUX.1 Schnell', description: 'Fast, high-quality image generation (free)' },
  { id: 'black-forest-labs/FLUX.1-dev', name: 'FLUX.1 Dev', description: 'High-quality FLUX development model' },
  { id: 'stabilityai/stable-diffusion-xl-base-1.0', name: 'Stable Diffusion XL', description: 'Photorealistic, strong composition' },
];

const sizePresets = [
  { label: 'Square', width: 1024, height: 1024 },
  { label: 'Landscape', width: 1280, height: 720 },
  { label: 'Portrait', width: 720, height: 1280 },
  { label: 'Wide', width: 1536, height: 640 },
  { label: 'Social', width: 1080, height: 1350 },
];

const videoModels = [
  { id: 'Wan-AI/Wan2.2-T2V-A14B', name: 'Wan 2.2 Text-to-Video', description: 'Best free text-to-video generation' },
  { id: 'Wan-AI/Wan2.2-TI2V-5B', name: 'Wan 2.2 Text+Image-to-Video', description: 'Text + image to video' },
  { id: 'Wan-AI/Wan2.2-I2V-A14B', name: 'Wan 2.2 Image-to-Video', description: 'Image to video generation' },
];

const durationOptions = [
  { value: 3, label: '3s', description: 'Short clip' },
  { value: 5, label: '5s', description: 'Standard' },
  { value: 8, label: '8s', description: 'Extended' },
];

type TabId = 'content' | 'image' | 'video';

export default function AIStudioPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<TabId>(
    ['content', 'image', 'video'].includes(tabParam || '') ? (tabParam as TabId) : 'content'
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

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
    if (tabParam && ['content', 'image', 'video'].includes(tabParam)) {
      setActiveTab(tabParam as TabId);
    }
  }, [tabParam]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    router.replace(`/ai/studio?tab=${tab}`, { scroll: false });
  };

  const tabs = [
    { id: 'content' as TabId, label: 'Content', icon: <Type className="w-4 h-4" /> },
    { id: 'image' as TabId, label: 'Image', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'video' as TabId, label: 'Video', icon: <Film className="w-4 h-4" /> },
  ];

  return (
    <div className="floating-shell mx-auto ring-1 ring-white/10">
      <div className="px-4 sm:px-8 pt-9 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-xs tracking-[3px] text-white/50">AI STUDIO</div>
            <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">AI Studio</div>
            <div className="text-white/50 text-sm mt-2">Generate content, images, and videos with AI</div>
          </div>
          <TourButton moduleId="aiStudio" />
        </div>
      </div>

      <div className="px-4 sm:px-8 pb-4">
        <div className="flex gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/25'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'content' && (
        <ContentTab />
      )}
      {activeTab === 'image' && (
        <ImageTab
          products={products}
          isLoadingProducts={isLoadingProducts}
          productsError={productsError}
          setProducts={setProducts}
          setProductsError={setProductsError}
          setIsLoadingProducts={setIsLoadingProducts}
        />
      )}
      {activeTab === 'video' && (
        <VideoTab
          products={products}
          isLoadingProducts={isLoadingProducts}
          productsError={productsError}
          setProducts={setProducts}
          setProductsError={setProductsError}
          setIsLoadingProducts={setIsLoadingProducts}
        />
      )}
    </div>
  );
}

interface MediaTabProps {
  products: Product[];
  isLoadingProducts: boolean;
  productsError: string | null;
  setProducts: (p: Product[]) => void;
  setProductsError: (e: string | null) => void;
  setIsLoadingProducts: (v: boolean) => void;
}

function ProductSelector({
  selectedProductId,
  setSelectedProductId,
  products,
  isLoadingProducts,
  productsError,
  setProducts,
  setProductsError,
  setIsLoadingProducts,
}: {
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
} & MediaTabProps) {
  const router = useRouter();

  const retryLoad = () => {
    setIsLoadingProducts(true);
    setProductsError(null);
    api.get<Product[]>('/products')
      .then(res => setProducts(res.data))
      .catch(() => setProductsError('Failed to load products'))
      .finally(() => setIsLoadingProducts(false));
  };

  return (
    <div data-tour="product-selector">
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
          <button onClick={retryLoad} className="text-xs px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors">
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
          <div className="text-white/50 text-sm mb-2">Add a product first to generate AI content.</div>
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
  );
}

function ContentTab() {
  const [prompt, setPrompt] = useState("Earth Day campaign for sustainable water bottles");
  const [platform, setPlatform] = useState("Instagram");
  const [type, setType] = useState("Product Promotion");
  const [selectedModel, setSelectedModel] = useState("");
  const [models, setModels] = useState<AIModel[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratePostResponse | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await api.get<AIModel[]>('/ai/models');
        setModels(res.data);
        if (res.data.length > 0 && !selectedModel) {
          setSelectedModel(res.data[0].id);
        }
      } catch {
        setModels([{ id: 'local', name: 'Local AI', description: 'Ollama local model' }]);
        setSelectedModel('local');
      }
    };
    fetchModels();
  }, []);

  const generateContent = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post<GeneratePostResponse>('/ai/generate-post', {
        prompt, platform, type, model: selectedModel,
      });
      setResult(res.data);
      toast.success('Content generated!');
    } catch {
      toast.error('Failed to generate content');
      setResult({
        caption: "🌍 This Earth Day, choose reusable. Our new eco stainless bottle keeps your drinks cold for 24h and your conscience clean. Small choices. Big impact. ♻️",
        hashtags: "#EarthDay #SustainableLiving #EcoBottle #ZeroWaste",
        imagePrompt: "Premium product photography of a sleek stainless steel water bottle on moss, soft natural lighting, cinematic",
        model: selectedModel || "Qwen2.5-7B",
        confidence: "96%"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const currentModel = models.find(m => m.id === selectedModel);
  const modelOptions = models.map(m => ({
    value: m.id,
    label: m.name,
    description: m.context ? `${m.context}${m.description ? ' — ' + m.description : ''}` : m.description || m.size,
  }));

  return (
    <div className="px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
      <div className="glass p-6 sm:p-9 rounded-[2.5rem]">
        <div className="space-y-6">
          <div data-tour="content-prompt">
            <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">PROMPT</label>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-sm h-28" />
          </div>
          <div>
            <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">AI MODEL</label>
            <CustomDropdown options={modelOptions} value={selectedModel} onChange={setSelectedModel} placeholder="Select a model..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">PLATFORM</label>
              <CustomDropdown options={platformOptions} value={platform} onChange={setPlatform} />
            </div>
            <div>
              <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">TYPE</label>
              <CustomDropdown options={typeOptions} value={type} onChange={setType} />
            </div>
          </div>
          <button onClick={generateContent} disabled={isGenerating} className="neon-button w-full mt-2">
            {isGenerating ? "Generating..." : "Generate Content"}
          </button>
        </div>
      </div>

      <div className="glass p-6 sm:p-9 rounded-[2.5rem] overflow-hidden">
        {!result ? (
          <div className="h-full flex items-center justify-center text-center px-4">
            <div className="max-w-full">
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight break-words">Ready to create</div>
              <div className="text-white/50 mt-2 text-sm sm:text-base break-words">
                Using {currentModel?.name || 'AI'} {currentModel?.context ? `• ${currentModel.context}` : ''}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="font-mono text-xs text-white/50">GENERATED WITH</div>
                <div className="font-semibold">{result.model}</div>
              </div>
              <div className="status-badge status-approved">{result.confidence}</div>
            </div>
            <div className="space-y-5 text-sm">
              <div>
                <div className="font-mono text-xs text-white/50 mb-1">CAPTION</div>
                <div className="break-words">{result.caption}</div>
              </div>
              <div>
                <div className="font-mono text-xs text-white/50 mb-1">HASHTAGS</div>
                <div className="text-[#ec4899] break-words">{result.hashtags}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ImageTab(props: MediaTabProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedProductId = searchParams.get('productId');
  const urlPrompt = searchParams.get('prompt') || '';

  const [selectedProductId, setSelectedProductId] = useState<string>(preselectedProductId || '');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [prompt, setPrompt] = useState(urlPrompt);
  const [model, setModel] = useState('black-forest-labs/FLUX.1-schnell-Free');
  const [size, setSize] = useState(0);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<GenerateImageResponse | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [history, setHistory] = useState<GenerateImageResponse[]>([]);

  useEffect(() => {
    if (preselectedProductId) setSelectedProductId(preselectedProductId);
  }, [preselectedProductId]);

  useEffect(() => {
    if (selectedProductId) {
      const p = props.products.find(pr => pr.id === selectedProductId);
      if (p) {
        setSelectedProduct(p);
        if (!prompt) buildProductPrompt(p);
      }
    }
  }, [selectedProductId, props.products]);

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
      const res = await api.post<{ prompt: string }>('/ai/generate-image-prompt', { prompt: context });
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
      toast.error('Select a product before generating.');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await api.post<{ generation: { id: string }; result: GenerateImageResponse }>('/ai/generate-image', {
        prompt, model, width: currentSize.width, height: currentSize.height, seed, productId: selectedProductId,
      });
      const genId = res.data.generation?.id;
      if (genId) setGenerationId(genId);
      setResult(res.data.result);
      setHistory(prev => [res.data.result, ...prev].slice(0, 20));
      toast.success('Image generated!');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(axiosErr?.response?.data?.message || axiosErr?.message || 'Failed to generate image');
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
        hashtags: hashtagsArr, platforms: ['Instagram'], imageUrl: result.imageUrl, productId: selectedProductId || undefined,
      });
      toast.success('Post created with this image!', {
        action: { label: 'View Post', onClick: () => router.push(`/posts/${res.data.id}`) },
      });
    } catch {
      toast.error('Failed to create post');
    }
  };

  return (
    <div className="px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
      <div className="glass p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
        <div className="space-y-5">
          <ProductSelector
            selectedProductId={selectedProductId}
            setSelectedProductId={setSelectedProductId}
            {...props}
          />

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

          <div data-tour="prompt-input">
            <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">PROMPT</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-3xl px-4 sm:px-6 py-4 text-sm h-28 resize-none"
              placeholder="Describe the image you want to generate..."
            />
          </div>

          <div data-tour="style-options">
            <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">MODEL</label>
            <div className="space-y-2">
              {imageModels.map(m => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all text-sm ${
                    model === m.id ? 'border-[#7c3aed] bg-[#7c3aed]/10' : 'border-white/10 bg-white/5 hover:border-white/20'
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
                    size === i ? 'border-[#7c3aed] bg-[#7c3aed]/10 text-[#7c3aed]' : 'border-white/10 hover:bg-white/5'
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
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Generating...</span>
            ) : 'Generate Image'}
          </button>
        </div>
      </div>

      <div className="glass p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden min-h-[400px]">
        {!result ? (
          <div className="h-full flex items-center justify-center text-center px-4 min-h-[400px]">
            <div>
              <div className="text-6xl mb-4">🎨</div>
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight">Ready to create</div>
              <div className="text-white/50 mt-2 text-sm">
                {selectedProductId ? 'Review the prompt and click Generate' : 'Select a product first to get started'}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="font-mono text-xs text-white/50">RESULT</div>
              <div className="flex gap-2">
                <button onClick={() => handleDownload(result.imageUrl, result.prompt)} className="p-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors" title="Download">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={() => { navigator.clipboard.writeText(result.imageUrl); toast.success('URL copied!'); }} className="p-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors" title="Copy URL">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
              <img src={result.imageUrl} alt={result.prompt} className="w-full object-contain max-h-[500px]" loading="lazy" />
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-white/50">Model</span><span className="font-mono">{result.model}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Size</span><span className="font-mono">{result.width}x{result.height}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Seed</span><span className="font-mono">{result.seed}</span></div>
              {selectedProduct && (
                <div className="flex justify-between"><span className="text-white/50">Product</span><span className="font-mono">{selectedProduct.emoji} {selectedProduct.name}</span></div>
              )}
            </div>
            {selectedProduct && (
              <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="font-mono text-[10px] text-white/40 mb-2">SOURCE</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-white/50">Product</span><span>{selectedProduct.emoji} {selectedProduct.name}</span></div>
                  {generationId && <div className="flex justify-between"><span className="text-white/50">Generation ID</span><span className="font-mono text-xs">{generationId}</span></div>}
                  <div className="flex justify-between"><span className="text-white/50">Provider</span><span className="font-mono">{result.provider}</span></div>
                  <div className="flex justify-between"><span className="text-white/50">Prompt</span><span className="text-right max-w-[60%] text-xs truncate">{result.prompt}</span></div>
                </div>
              </div>
            )}
            <div data-tour="result-actions" className="flex gap-3 mt-6">
              <button onClick={handleAttachToPost} className="flex-1 py-3 rounded-2xl border border-white/10 hover:bg-white/5 transition-colors text-sm flex items-center justify-center gap-2">
                <LinkIcon className="w-4 h-4" /> Attach to Post
              </button>
              <button onClick={handleGenerate} disabled={isGenerating} className="neon-button flex-1">
                {isGenerating ? 'Regenerating...' : 'Regenerate'}
              </button>
            </div>
          </div>
        )}
      </div>

      {history.length > 1 && (
        <div className="col-span-full">
          <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">RECENT GENERATIONS</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {history.slice(1).map((img, i) => (
              <button key={i} onClick={() => setResult(img)} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 hover:border-[#7c3aed]/40 transition-colors">
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

function VideoTab(props: MediaTabProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedProductId = searchParams.get('productId');
  const urlPrompt = searchParams.get('prompt') || '';

  const [selectedProductId, setSelectedProductId] = useState<string>(preselectedProductId || '');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [prompt, setPrompt] = useState(urlPrompt);
  const [model, setModel] = useState('Wan-AI/Wan2.2-T2V-A14B');
  const [duration, setDuration] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<GenerateVideoResponse | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [history, setHistory] = useState<GenerateVideoResponse[]>([]);

  useEffect(() => {
    if (preselectedProductId) setSelectedProductId(preselectedProductId);
  }, [preselectedProductId]);

  useEffect(() => {
    if (selectedProductId && props.products.length) {
      const p = props.products.find(pr => pr.id === selectedProductId);
      if (p) {
        setSelectedProduct(p);
        if (!prompt) buildProductPrompt(p);
      }
    }
  }, [selectedProductId, props.products]);

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
        prompt: `Generate a video prompt for this product:\n${context}`, type: 'video',
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
      toast.error('Select a product before generating.');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await api.post<{ generation: { id: string }; result: GenerateVideoResponse }>('/ai/generate-video', {
        prompt, model, duration, productId: selectedProductId,
      });
      const genId = res.data.generation?.id;
      if (genId) setGenerationId(genId);
      setResult(res.data.result);
      setHistory(prev => [res.data.result, ...prev].slice(0, 10));
      toast.success('Video generated!');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(axiosErr?.response?.data?.message || axiosErr?.message || 'Failed to generate video');
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
        hashtags: hashtagsArr, platforms: ['Instagram'], videoUrl: result.videoUrl, productId: selectedProductId || undefined,
      });
      toast.success('Post created with this video!', {
        action: { label: 'View Post', onClick: () => router.push(`/posts/${res.data.id}`) },
      });
    } catch {
      toast.error('Failed to create post');
    }
  };

  return (
    <div className="px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
      <div className="glass p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
        <div className="space-y-5">
          <ProductSelector
            selectedProductId={selectedProductId}
            setSelectedProductId={setSelectedProductId}
            {...props}
          />

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
                    model === m.id ? 'border-[#7c3aed] bg-[#7c3aed]/10' : 'border-white/10 bg-white/5 hover:border-white/20'
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
                    duration === d.value ? 'border-[#7c3aed] bg-[#7c3aed]/10 text-[#7c3aed]' : 'border-white/10 hover:bg-white/5'
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
                <div className="font-medium text-white/70 mb-1">AI Video Generation</div>
                Videos are generated using HuggingFace Inference API with Wan 2.2 models. Generation may take 30-120 seconds.
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || !selectedProductId}
            className="neon-button w-full mt-2 disabled:opacity-40"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Generating video...</span>
            ) : (
              <span className="flex items-center gap-2"><Film className="w-4 h-4" /> Generate Video</span>
            )}
          </button>
        </div>
      </div>

      <div className="glass p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden min-h-[400px]">
        {!result ? (
          <div className="h-full flex items-center justify-center text-center px-4 min-h-[400px]">
            <div>
              <div className="text-6xl mb-4">🎬</div>
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight">Ready to create</div>
              <div className="text-white/50 mt-2 text-sm">
                {selectedProductId ? 'Review the prompt and click Generate Video' : 'Select a product first to get started'}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="font-mono text-xs text-white/50">RESULT</div>
              <button onClick={() => handleDownload(result.videoUrl, result.prompt)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
              <video src={result.videoUrl} controls className="w-full max-h-[400px]" preload="metadata" />
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-white/50">Model</span><span className="font-mono">{result.model}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Duration</span><span className="font-mono">{result.duration}s</span></div>
              <div className="flex justify-between"><span className="text-white/50">Provider</span><span className="font-mono">{result.provider}</span></div>
              {selectedProduct && (
                <div className="flex justify-between"><span className="text-white/50">Product</span><span className="font-mono">{selectedProduct.emoji} {selectedProduct.name}</span></div>
              )}
            </div>
            {selectedProduct && (
              <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="font-mono text-[10px] text-white/40 mb-2">SOURCE</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-white/50">Product</span><span>{selectedProduct.emoji} {selectedProduct.name}</span></div>
                  {generationId && <div className="flex justify-between"><span className="text-white/50">Generation ID</span><span className="font-mono text-xs">{generationId}</span></div>}
                  <div className="flex justify-between"><span className="text-white/50">Provider</span><span className="font-mono">{result.provider}</span></div>
                  <div className="flex justify-between"><span className="text-white/50">Prompt</span><span className="text-right max-w-[60%] text-xs truncate">{result.prompt}</span></div>
                </div>
              </div>
            )}
            <div data-tour="video-result" className="flex gap-3 mt-6">
              <button onClick={handleAttachToPost} className="flex-1 py-3 rounded-2xl border border-white/10 hover:bg-white/5 transition-colors text-sm flex items-center justify-center gap-2">
                <LinkIcon className="w-4 h-4" /> Attach to Post
              </button>
              <button onClick={handleGenerate} disabled={isGenerating} className="neon-button flex-1">
                {isGenerating ? 'Regenerating...' : 'Regenerate'}
              </button>
            </div>
          </div>
        )}
      </div>

      {history.length > 1 && (
        <div className="col-span-full">
          <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">RECENT GENERATIONS</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {history.slice(1).map((vid, i) => (
              <button key={i} onClick={() => setResult(vid)} className="group relative aspect-video rounded-2xl overflow-hidden border border-white/10 hover:border-[#7c3aed]/40 transition-colors">
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
