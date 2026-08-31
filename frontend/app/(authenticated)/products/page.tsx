'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Sparkles, Download, X, Loader2, Brain, Image, Lightbulb, ChevronDown, AlertCircle, RefreshCw, Package, Check, AlertTriangle } from 'lucide-react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import api, { getUploadUrl, type AdConcept, type AdImageResponse, type ComboAnalysis } from '@/lib/api';
import { toast } from 'sonner';
import CustomDropdown from '@/components/CustomDropdown';
import { TourButton } from '../../../components/tour/TourButton';

const currencyOptions = [
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
  { value: 'INR', label: '₹ INR' },
  { value: 'JPY', label: '¥ JPY' },
  { value: 'AUD', label: 'A$ AUD' },
  { value: 'CAD', label: 'C$ CAD' },
];

const currencySymbols: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', AUD: 'A$', CAD: 'C$',
};

interface ProductSuggestion {
  caption: string;
  hashtags: string;
  imagePrompt: string;
  platform: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const { data: products, isLoading, error: productsError, refetch: refetchProducts } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [showAdd, setShowAdd] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);
  const [showIdeasModal, setShowIdeasModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adConcepts, setAdConcepts] = useState<AdConcept[]>([]);
  const [generatedImage, setGeneratedImage] = useState<AdImageResponse | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<number | null>(null);
  const [isGeneratingConcepts, setIsGeneratingConcepts] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [contentIdeas, setContentIdeas] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [quickContentOpen, setQuickContentOpen] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: '', category: '', price: '', currency: 'USD', description: '', emoji: '' });
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', category: '', price: '', currency: 'USD', description: '', emoji: '' });
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [editUploading, setEditUploading] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);

  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [showComboBuilder, setShowComboBuilder] = useState(false);
  const [comboStep, setComboStep] = useState<'config' | 'analysis' | 'prompt' | 'generating' | 'result'>('config');
  const [comboName, setComboName] = useState('');
  const [comboDiscount, setComboDiscount] = useState('');
  const [comboAudience, setComboAudience] = useState('');
  const [comboPlatform, setComboPlatform] = useState('Instagram');
  const [comboVisualStyle, setComboVisualStyle] = useState('');
  const [comboObjective, setComboObjective] = useState('');
  const [comboAnalysis, setComboAnalysis] = useState<ComboAnalysis | null>(null);
  const [comboPrompt, setComboPrompt] = useState('');
  const [comboResult, setComboResult] = useState<{ imageUrl: string } | null>(null);
  const [comboOfferId, setComboOfferId] = useState<string | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [comboGeneratingImage, setComboGeneratingImage] = useState(false);
  const [comboError, setComboError] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState(0);

  const promptSuggestions = [
    'Premium studio shot',
    'Natural lifestyle scene',
    'Gift bundle presentation',
    'E-commerce promotional banner',
    'Summer campaign',
    'Christmas bundle',
    'Luxury product advertisement',
    'Limited-time offer',
  ];

  const generationSteps = [
    { key: 'analyze', label: 'Analysing products' },
    { key: 'concept', label: 'Building visual concept' },
    { key: 'prepare', label: 'Preparing product references' },
    { key: 'generate', label: 'Generating image' },
    { key: 'finalize', label: 'Finalising image' },
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadedImageUrl(res.data.url);
      toast.success('Image uploaded!');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAdd = async () => {
    try {
      await createProduct.mutateAsync({
        name: form.name,
        category: form.category,
        price: parseFloat(form.price) || 0,
        currency: form.currency,
        description: form.description || undefined,
        emoji: form.emoji || undefined,
        images: uploadedImageUrl ? [uploadedImageUrl] : undefined,
      });
      toast.success('Product added!');
      setShowAdd(false);
      setForm({ name: '', category: '', price: '', currency: 'USD', description: '', emoji: '' });
      setUploadedImageUrl(null);
    } catch {
      toast.error('Failed to add product');
    }
  };

  const handleEdit = async () => {
    if (!editingProduct) return;
    try {
      await updateProduct.mutateAsync({
        id: editingProduct.id,
        data: {
          name: editForm.name,
          category: editForm.category,
          price: parseFloat(editForm.price) || 0,
          currency: editForm.currency,
          description: editForm.description || undefined,
          emoji: editForm.emoji || undefined,
          images: editImageUrl ? [editImageUrl] : undefined,
        },
      });
      toast.success('Product updated!');
      setShowEdit(false);
      setEditingProduct(null);
    } catch {
      toast.error('Failed to update product');
    }
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditImageUrl(res.data.url);
      toast.success('Image uploaded!');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setEditUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleGenerateAdConcepts = async (product: any) => {
    setSelectedProduct(product);
    setShowAdModal(true);
    setIsGeneratingConcepts(true);
    setAdConcepts([]);
    setGeneratedImage(null);
    setSelectedConcept(null);
    try {
      const res = await api.post<AdConcept[]>('/ai/generate-ad-concepts', {
        productName: product.name,
        category: product.category,
        description: product.description || '',
        imageUrl: product.images?.[0] || product.imageUrl,
      });
      setAdConcepts(res.data);
    } catch {
      toast.error('Failed to generate ad concepts');
    } finally {
      setIsGeneratingConcepts(false);
    }
  };

  const handleGenerateImage = async (concept: AdConcept, index: number) => {
    setSelectedConcept(index);
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    try {
      const res = await api.post<AdImageResponse>('/ai/generate-ad-image', {
        prompt: concept.prompt,
        width: 1024,
        height: 1024,
      });
      setGeneratedImage(res.data);
      toast.success('Image generated!');
    } catch {
      toast.error('Failed to generate image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleAnalyzeProduct = async (product: any) => {
    setSelectedProduct(product);
    setShowAnalyzeModal(true);
    setIsAnalyzing(true);
    setSuggestions([]);
    try {
      const res = await api.post('/ai/generate-post', {
        prompt: `Analyze this product and create a social media post. Product: ${product.name}, Category: ${product.category}, Description: ${product.description || 'No description'}`,
        platform: 'Instagram',
        type: 'Product Promotion',
      });
      const data = res.data;
      if (data.caption) {
        setSuggestions([{
          caption: data.caption,
          hashtags: data.hashtags || '',
          imagePrompt: data.imagePrompt || '',
          platform: 'Instagram',
        }]);
      }
    } catch {
      toast.error('Failed to analyze product');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadImage = (imageUrl: string, name: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${name.replace(/\s+/g, '_')}_ad.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllProducts = () => {
    if (products) {
      setSelectedProductIds(new Set(products.map(p => p.id)));
    }
  };

  const clearSelection = () => setSelectedProductIds(new Set());

  const handleAnalyzeCombo = async () => {
    if (selectedProductIds.size < 2) {
      toast.error('Please select at least two products');
      return;
    }
    setComboStep('generating');
    setGenerationStep(0);
    setComboError(null);
    try {
      setGenerationStep(0);
      await new Promise(r => setTimeout(r, 800));
      setGenerationStep(1);
      
      const res = await api.post<ComboAnalysis>('/combo-offers/analyze', { productIds: [...selectedProductIds] });
      setComboAnalysis(res.data);
      setComboStep('analysis');
    } catch (err: any) {
      setComboError(err.response?.data?.message || 'Failed to analyze combo offer');
      setComboStep('config');
      toast.error('Failed to analyze combo offer');
    }
  };

  const handleGeneratePrompt = async () => {
    if (!comboAnalysis) return;
    setComboStep('generating');
    setGenerationStep(2);
    setComboError(null);
    try {
      setGenerationStep(2);
      await new Promise(r => setTimeout(r, 600));
      setGenerationStep(3);

      const combo = await api.post('/combo-offers', {
        name: comboName || comboAnalysis.concept || 'Combo Offer',
        discount: comboDiscount || comboAnalysis.suggestedDiscount,
        targetAudience: comboAudience || comboAnalysis.targetAudience,
        platform: comboPlatform,
        visualStyle: comboVisualStyle || comboAnalysis.visualStyle,
        objective: comboObjective,
        productIds: [...selectedProductIds],
      });
      setComboOfferId(combo.data.id);
      
      const promptRes = await api.post<{ prompt: string }>(`/combo-offers/${combo.data.id}/generate-prompt`);
      setComboPrompt(promptRes.data.prompt);
      setGenerationStep(4);
      await new Promise(r => setTimeout(r, 400));
      setComboStep('prompt');
    } catch (err: any) {
      setComboError(err.response?.data?.message || 'Failed to generate prompt');
      setComboStep('analysis');
      toast.error('Failed to generate prompt');
    }
  };

  const handleGenerateComboImage = async () => {
    if (!comboOfferId || !comboPrompt) return;
    setComboGeneratingImage(true);
    setComboError(null);
    setGenerationStep(0);
    setComboStep('generating');
    try {
      setGenerationStep(0);
      await new Promise(r => setTimeout(r, 500));
      setGenerationStep(1);
      await new Promise(r => setTimeout(r, 500));
      setGenerationStep(2);
      await new Promise(r => setTimeout(r, 500));
      setGenerationStep(3);

      const imgRes = await api.post<{ imageUrl: string }>(`/combo-offers/${comboOfferId}/generate-image`, { prompt: comboPrompt });
      setGenerationStep(4);
      await new Promise(r => setTimeout(r, 400));
      setComboResult(imgRes.data);
      setComboStep('result');
      toast.success('Combo offer image generated!');
    } catch (err: any) {
      setComboError(err.response?.data?.message || 'Failed to generate image');
      setComboStep('prompt');
      toast.error('Failed to generate image');
    } finally {
      setComboGeneratingImage(false);
    }
  };

  const handleUseInPost = async () => {
    if (!comboResult || !comboName) return;
    try {
      const postRes = await api.post('/posts', {
        caption: `Special combo offer: ${comboName}`,
        title: comboName,
        hashtags: ['#combo', '#offer', '#bundle'],
        platforms: [comboPlatform],
        imageUrl: comboResult.imageUrl,
      });
      toast.success('Post created!');
      setShowComboBuilder(false);
      resetComboBuilder();
      router.push(`/posts/${postRes.data.id}`);
    } catch (err: any) {
      toast.error('Failed to create post');
    }
  };

  const resetComboBuilder = () => {
    setShowComboBuilder(false);
    setComboStep('config');
    setComboName('');
    setComboDiscount('');
    setComboAudience('');
    setComboPlatform('Instagram');
    setComboVisualStyle('');
    setComboObjective('');
    setComboAnalysis(null);
    setComboPrompt('');
    setComboResult(null);
    setComboOfferId(null);
    setComboError(null);
    setSelectedProductIds(new Set());
  };

  const handleGenerateContentIdeas = async (product: any) => {
    setSelectedProduct(product);
    setShowIdeasModal(true);
    setIsGeneratingIdeas(true);
    setContentIdeas('');
    try {
      const res = await api.post('/ai/generate-post', {
        prompt: `Generate 3 content ideas for ${product.name}: ${product.description || product.category}. For each idea, provide: 1) A content concept, 2) The best platform for it, 3) A brief caption preview. Format as a numbered list.`,
        platform: 'Instagram',
        type: 'Content Ideas',
      });
      setContentIdeas(res.data.caption || 'No ideas generated');
    } catch {
      toast.error('Failed to generate content ideas');
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  return (
    <div className="floating-shell mx-auto ring-1 ring-white/10">
      <div className="px-4 sm:px-8 h-20 flex items-center justify-between border-b border-white/10">
        <div className="font-mono text-xs tracking-[3px] text-white/50">PRODUCT LIBRARY</div>
        <div className="flex items-center gap-3">
          <button data-tour="add-product" onClick={() => setShowAdd(true)} className="neon-button flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </button>
          <TourButton moduleId="products" />
        </div>
      </div>

      <div className="px-4 sm:px-8 pt-9 pb-6">
        <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">Products</div>
      </div>

      <div className="px-4 sm:px-8 pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass p-7 rounded-[2.5rem] border border-white/10 animate-pulse">
              <div className="w-full h-40 bg-white/10 rounded-2xl mb-6" />
              <div className="h-5 bg-white/10 rounded w-2/3 mb-2" />
              <div className="h-4 bg-white/5 rounded w-1/3" />
            </div>
          ))
        ) : productsError ? (
          <div className="col-span-full text-center py-12">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <div className="text-white/70 mb-2">Failed to load products</div>
            <div className="text-white/40 text-sm mb-4">{productsError.message || 'Check your connection and try again.'}</div>
            <button onClick={() => refetchProducts()} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm text-white/70">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        ) : products && products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} data-tour="product-card" className="glass p-6 sm:p-7 rounded-[2.5rem] border border-white/10 hover:border-[#7c3aed]/40 transition-colors relative group">
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleProductSelection(product.id);
                  }}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    selectedProductIds.has(product.id)
                      ? 'bg-[#7c3aed] border-[#7c3aed]'
                      : 'border-white/30 bg-black/20 hover:border-white/50'
                  }`}
                >
                  {selectedProductIds.has(product.id) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </button>
              </div>
              <div className="w-full h-40 rounded-2xl mb-6 overflow-hidden bg-white/5 flex items-center justify-center">
                {product.images?.[0] || product.imageUrl ? (
                  <img
                    src={getUploadUrl(product.images?.[0] || product.imageUrl || '')}
                    alt={product.name}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(getUploadUrl(product.images?.[0] || product.imageUrl || ''));
                    }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                  />
                ) : null}
                <div className={`text-5xl sm:text-6xl opacity-80 ${(product.images?.[0] || product.imageUrl) ? 'hidden' : ''}`}>{product.emoji || '📦'}</div>
              </div>
              <div className="font-semibold text-xl tracking-tight">{product.name}</div>
              <div className="text-white/50 text-sm mt-1">{product.category}</div>
              <div className="flex justify-between items-end mt-6">
                <div className="font-mono text-xl font-semibold">
                  {currencySymbols[product.currency] || '$'}{Number(product.price || 0).toFixed(2)}
                  <span className="text-xs text-white/40 ml-1">{product.currency}</span>
                </div>
              </div>
              <div data-tour="product-actions" className="flex gap-2 mt-4">
                <button onClick={() => handleGenerateAdConcepts(product)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#7c3aed]/15 text-[#7c3aed] text-xs font-medium hover:bg-[#7c3aed]/25 transition-colors">
                  <Sparkles className="w-3.5 h-3.5" /> AI Ad
                </button>
                <button onClick={() => handleAnalyzeProduct(product)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#ec4899]/15 text-[#ec4899] text-xs font-medium hover:bg-[#ec4899]/25 transition-colors">
                  <Brain className="w-3.5 h-3.5" /> Analyze
                </button>
                <button
                  onClick={() => {
                    setEditingProduct(product);
                    setEditForm({
                      name: product.name,
                      category: product.category || '',
                      price: String(product.price || ''),
                      currency: product.currency || 'USD',
                      description: product.description || '',
                      emoji: product.emoji || '',
                    });
                    setEditImageUrl(product.images?.[0] || null);
                    setShowEdit(true);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs transition-colors"
                >
                  Edit
                </button>
                <button onClick={() => setDeletingProduct(product)} className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => router.push(`/posts?productId=${product.id}`)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-white/10 text-white/60 text-[11px] font-medium hover:bg-white/5 hover:text-white transition-colors">
                  <Plus className="w-3 h-3" /> Post
                </button>
                <div className="relative flex-1">
                  <button
                    onClick={() => setQuickContentOpen(quickContentOpen === product.id ? null : product.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#7c3aed]/15 text-[#7c3aed] text-[11px] font-medium hover:bg-[#7c3aed]/25 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" /> Quick Content <ChevronDown className="w-3 h-3" />
                  </button>
                  {quickContentOpen === product.id && (
                    <div className="absolute bottom-full mb-2 left-0 right-0 bg-[#0c0c0c] rounded-2xl border border-white/10 p-2 z-20 shadow-xl">
                      <button
                        onClick={() => { setQuickContentOpen(null); router.push(`/ai/studio?tab=image&productId=${product.id}&prompt=${encodeURIComponent(product.name + ' ' + (product.description || product.category || ''))}`); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors text-left"
                      >
                        <Image className="w-3.5 h-3.5" /> Generate Image → Post
                      </button>

                      <button
                        onClick={() => { setQuickContentOpen(null); handleGenerateContentIdeas(product); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors text-left"
                      >
                        <Lightbulb className="w-3.5 h-3.5" /> AI Post Ideas
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-white/50">
            <div className="text-4xl mb-3">📦</div>
            No products yet. Add your first one!
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setShowAdd(false)}>
          <div className="bg-[#0c0c0c] p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight">Add Product</div>
              <button onClick={() => setShowAdd(false)} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">PRODUCT IMAGE</label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {uploadedImageUrl ? (
                  <div className="relative">
                    <img src={getUploadUrl(uploadedImageUrl)} alt="Preview" className="w-full h-40 object-cover rounded-2xl" />
                    <button onClick={() => setUploadedImageUrl(null)} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#7c3aed]/40 transition-colors">
                    {uploadingImage ? <Loader2 className="w-6 h-6 animate-spin text-[#7c3aed]" /> : <><Sparkles className="w-6 h-6 text-white/40" /><span className="text-sm text-white/50">Click to upload image</span></>}
                  </button>
                )}
              </div>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Product name" className="w-full" />
              <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Category" className="w-full" />
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <input value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="Price" type="number" className="w-full" />
                </div>
                <div>
                  <CustomDropdown options={currencyOptions} value={form.currency} onChange={v => setForm({...form, currency: v})} />
                </div>
              </div>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description (optional)" className="w-full h-20" />
              <input value={form.emoji} onChange={e => setForm({...form, emoji: e.target.value})} placeholder="Emoji fallback (e.g. 🧴)" className="w-full" />
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleAdd} disabled={createProduct.isPending || !form.name} className="neon-button flex-1">
                {createProduct.isPending ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setShowAdModal(false)}>
          <div className="bg-[#0c0c0c] p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="font-mono text-xs tracking-[3px] text-white/50">AI AD GENERATOR</div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">{selectedProduct?.name}</div>
              </div>
              <button onClick={() => setShowAdModal(false)} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>
            {isGeneratingConcepts ? (
              <div className="flex flex-col items-center py-12">
                <Loader2 className="w-8 h-8 text-[#7c3aed] animate-spin mb-4" />
                <div className="text-white/50">Analyzing product and generating ad concepts...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adConcepts.map((concept, index) => (
                  <div key={index} className={`p-5 rounded-2xl border transition-all cursor-pointer ${selectedConcept === index ? 'border-[#7c3aed] bg-[#7c3aed]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`} onClick={() => handleGenerateImage(concept, index)}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{concept.name}</div>
                      {selectedConcept === index && isGeneratingImage && <Loader2 className="w-4 h-4 text-[#7c3aed] animate-spin" />}
                    </div>
                    <div className="text-white/50 text-sm">{concept.description}</div>
                  </div>
                ))}
              </div>
            )}
            {generatedImage && (
              <div className="mt-6 p-5 rounded-2xl border border-[#7c3aed]/40 bg-[#7c3aed]/5">
                <div className="font-mono text-xs text-white/50 mb-3">GENERATED IMAGE</div>
                <img src={generatedImage.imageUrl} alt="Generated ad" className="w-full max-h-96 object-contain rounded-xl mb-4" loading="lazy" />
                <div className="flex gap-3">
                  <button onClick={() => handleDownloadImage(generatedImage.imageUrl, selectedProduct?.name || 'ad')} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/20 hover:bg-white/5 text-sm transition-colors">
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button onClick={() => handleGenerateImage(adConcepts[selectedConcept!], selectedConcept!)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#7c3aed]/15 text-[#7c3aed] text-sm font-medium hover:bg-[#7c3aed]/25 transition-colors">
                    <Sparkles className="w-4 h-4" /> Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showAnalyzeModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setShowAnalyzeModal(false)}>
          <div className="bg-[#0c0c0c] p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="font-mono text-xs tracking-[3px] text-white/50">AI PRODUCT ANALYSIS</div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">{selectedProduct?.name}</div>
              </div>
              <button onClick={() => setShowAnalyzeModal(false)} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>
            {isAnalyzing ? (
              <div className="flex flex-col items-center py-12">
                <Loader2 className="w-8 h-8 text-[#ec4899] animate-spin mb-4" />
                <div className="text-white/50">Analyzing product and generating social media suggestions...</div>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-4">
                {suggestions.map((s, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-white/10 bg-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full bg-[#7c3aed]/20 text-[#7c3aed] text-xs font-medium">{s.platform}</span>
                    </div>
                    <div className="text-sm leading-relaxed mb-3 whitespace-pre-wrap">{s.caption}</div>
                    {s.hashtags && <div className="text-xs text-[#ec4899] mb-3">{s.hashtags}</div>}
                    {s.imagePrompt && (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="font-mono text-[10px] text-white/40 mb-1">IMAGE PROMPT</div>
                        <div className="text-xs text-white/60">{s.imagePrompt}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/50">No suggestions generated</div>
            )}
          </div>
        </div>
      )}

      {/* Content Ideas Modal */}
      {showIdeasModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setShowIdeasModal(false)}>
          <div className="glass p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="font-mono text-xs tracking-[3px] text-white/50">CONTENT IDEAS</div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">{selectedProduct?.name}</div>
              </div>
              <button onClick={() => setShowIdeasModal(false)} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>
            {isGeneratingIdeas ? (
              <div className="flex flex-col items-center py-12">
                <Loader2 className="w-8 h-8 text-[#7c3aed] animate-spin mb-4" />
                <div className="text-white/50">Generating content ideas for {selectedProduct?.name}...</div>
              </div>
            ) : contentIdeas ? (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="font-mono text-[10px] text-white/40 mb-3">AI-GENERATED IDEAS</div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap text-white/80">{contentIdeas}</div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowIdeasModal(false); router.push(`/posts?productId=${selectedProduct?.id}`); }}
                    className="flex-1 py-3 rounded-xl bg-[#7c3aed]/15 text-[#7c3aed] text-sm font-medium hover:bg-[#7c3aed]/25 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Create Post
                  </button>
                  <button
                    onClick={() => { setShowIdeasModal(false); router.push(`/ai/studio?tab=image&productId=${selectedProduct?.id}&prompt=${encodeURIComponent(contentIdeas?.slice(0, 200) || selectedProduct?.name || '')}`); }}
                    className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Image className="w-4 h-4" /> Generate Image
                  </button>
                </div>
                <button
                  onClick={() => handleGenerateContentIdeas(selectedProduct)}
                  className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Regenerate Ideas
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-white/50">No ideas generated</div>
            )}
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEdit && editingProduct && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setShowEdit(false)}>
          <div className="bg-[#0c0c0c] p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="font-mono text-xs tracking-[3px] text-white/50">EDIT PRODUCT</div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1">{editingProduct.name}</div>
              </div>
              <button onClick={() => setShowEdit(false)} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">PRODUCT IMAGE</label>
                <input ref={editFileInputRef} type="file" accept="image/*" onChange={handleEditImageUpload} className="hidden" />
                {editImageUrl ? (
                  <div className="relative">
                    <img src={getUploadUrl(editImageUrl)} alt="Preview" className="w-full h-40 object-cover rounded-2xl" />
                    <button onClick={() => setEditImageUrl(null)} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <button onClick={() => editFileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#7c3aed]/40 transition-colors">
                    {editUploading ? <Loader2 className="w-6 h-6 animate-spin text-[#7c3aed]" /> : <><Sparkles className="w-6 h-6 text-white/40" /><span className="text-sm text-white/50">Click to upload image</span></>}
                  </button>
                )}
              </div>
              <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Product name" className="w-full" />
              <input value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} placeholder="Category" className="w-full" />
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <input value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} placeholder="Price" type="number" className="w-full" />
                </div>
                <div>
                  <CustomDropdown options={currencyOptions} value={editForm.currency} onChange={v => setEditForm({...editForm, currency: v})} />
                </div>
              </div>
              <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} placeholder="Description (optional)" className="w-full h-20" />
              <input value={editForm.emoji} onChange={e => setEditForm({...editForm, emoji: e.target.value})} placeholder="Emoji fallback (e.g. 🧴)" className="w-full" />
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowEdit(false)} className="flex-1 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleEdit} disabled={updateProduct.isPending || !editForm.name} className="neon-button flex-1">
                {updateProduct.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setDeletingProduct(null)}>
          <div className="bg-[#0c0c0c] p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] max-w-sm w-full border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <div className="text-xl font-semibold mb-2">Delete Product</div>
              <div className="text-white/50 text-sm mb-1">Are you sure you want to delete</div>
              <div className="font-medium mb-4">&quot;{deletingProduct.name}&quot;?</div>
              <div className="text-white/40 text-xs mb-6">This action cannot be undone. All associated content will be affected.</div>
              <div className="flex gap-3">
                <button onClick={() => setDeletingProduct(null)} className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm">
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleDelete(deletingProduct.id);
                    setDeletingProduct(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedProductIds.size > 0 && (
        <div data-tour="combo-offer" className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:p-6">
          <div className="bg-[#0c0c0c] max-w-4xl mx-auto rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 border border-white/10">
            <div className="flex-1">
              <div className="font-mono text-xs tracking-[2px] text-white/50">SELECTION</div>
              <div className="text-lg font-semibold">{selectedProductIds.size} product{selectedProductIds.size !== 1 ? 's' : ''} selected</div>
            </div>
            <div className="flex gap-3">
              <button onClick={selectAllProducts} className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-sm">
                Select All
              </button>
              <button onClick={clearSelection} className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-sm">
                Clear
              </button>
              <button
                onClick={() => {
                  if (selectedProductIds.size < 2) {
                    toast.error('Combo offers require at least two products. Select another product to continue.');
                    return;
                  }
                  setShowComboBuilder(true);
                  setComboStep('config');
                }}
                className="neon-button"
                disabled={selectedProductIds.size < 2}
              >
                Create Combo Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {showComboBuilder && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-[#0c0c0c] p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="font-mono text-xs tracking-[3px] text-white/50">COMBO OFFER BUILDER</div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  {comboStep === 'config' && 'Configure Combo'}
                  {comboStep === 'analysis' && 'AI Analysis'}
                  {comboStep === 'prompt' && 'Image Prompt'}
                  {comboStep === 'generating' && 'Generating...'}
                  {comboStep === 'result' && 'Combo Offer Ready'}
                </div>
              </div>
              <button onClick={resetComboBuilder} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>

            {comboStep === 'config' && (
              <div className="space-y-6">
                <div>
                  <div className="font-mono text-xs tracking-[2px] text-white/50 mb-3">SELECTED PRODUCTS</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {products?.filter(p => selectedProductIds.has(p.id)).map(p => (
                      <div key={p.id} className="glass rounded-2xl p-3 border border-white/10">
                        <div className="w-full h-20 rounded-xl mb-2 overflow-hidden bg-white/5 flex items-center justify-center">
                          {p.images?.[0] || p.imageUrl ? (
                            <img src={getUploadUrl(p.images?.[0] || p.imageUrl || '')} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-2xl opacity-80">{p.emoji || '📦'}</div>
                          )}
                        </div>
                        <div className="text-xs font-medium truncate">{p.name}</div>
                        <div className="text-xs text-white/40">${p.price.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">COMBO NAME</label>
                    <input value={comboName} onChange={e => setComboName(e.target.value)} placeholder="e.g. Summer Essentials Bundle" className="w-full rounded-3xl px-4 py-3 bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">DISCOUNT</label>
                    <input value={comboDiscount} onChange={e => setComboDiscount(e.target.value)} placeholder="e.g. 15% or $10 off" className="w-full rounded-3xl px-4 py-3 bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">TARGET AUDIENCE</label>
                    <input value={comboAudience} onChange={e => setComboAudience(e.target.value)} placeholder="e.g. Health-conscious millennials" className="w-full rounded-3xl px-4 py-3 bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">PLATFORM</label>
                    <CustomDropdown
                      options={[
                        { value: 'Instagram', label: 'Instagram' },
                        { value: 'Facebook', label: 'Facebook' },
                        { value: 'Twitter', label: 'Twitter' },
                        { value: 'TikTok', label: 'TikTok' },
                        { value: 'LinkedIn', label: 'LinkedIn' },
                      ]}
                      value={comboPlatform}
                      onChange={setComboPlatform}
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">VISUAL STYLE</label>
                    <input value={comboVisualStyle} onChange={e => setComboVisualStyle(e.target.value)} placeholder="e.g. Minimalist, Bold, Elegant" className="w-full rounded-3xl px-4 py-3 bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">OBJECTIVE</label>
                    <input value={comboObjective} onChange={e => setComboObjective(e.target.value)} placeholder="e.g. Drive holiday sales" className="w-full rounded-3xl px-4 py-3 bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors" />
                  </div>
                </div>

                {comboError && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {comboError}
                  </div>
                )}

                <button onClick={handleAnalyzeCombo} className="neon-button w-full py-4 text-lg">
                  <Sparkles className="w-5 h-5 inline mr-2" /> Analyze Combo
                </button>
              </div>
            )}

            {comboStep === 'analysis' && comboAnalysis && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="font-mono text-[10px] text-white/40 mb-2">CONCEPT</div>
                    <div className="text-lg font-semibold">{comboAnalysis.concept}</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="font-mono text-[10px] text-white/40 mb-2">SELLING ANGLE</div>
                    <div className="text-sm text-white/70">{comboAnalysis.sellingAngle}</div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="font-mono text-[10px] text-white/40 mb-2">DESCRIPTION</div>
                  <div className="text-sm text-white/70 leading-relaxed">{comboAnalysis.description}</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-[#7c3aed]/10 border border-[#7c3aed]/30">
                    <div className="font-mono text-[10px] text-white/40 mb-1">AUDIENCE</div>
                    <div className="text-sm font-medium">{comboAnalysis.targetAudience}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#ec4899]/10 border border-[#ec4899]/30">
                    <div className="font-mono text-[10px] text-white/40 mb-1">DISCOUNT</div>
                    <div className="text-sm font-medium">{comboAnalysis.suggestedDiscount}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="font-mono text-[10px] text-white/40 mb-1">STYLE</div>
                    <div className="text-sm font-medium">{comboAnalysis.visualStyle}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="font-mono text-[10px] text-white/40 mb-1">SUGGESTED</div>
                    <div className="text-sm font-medium">{comboAnalysis.ideas?.length || 0} ideas</div>
                  </div>
                </div>

                {comboAnalysis.ideas && comboAnalysis.ideas.length > 0 && (
                  <div>
                    <div className="font-mono text-xs tracking-[2px] text-white/50 mb-3">COMBO IDEAS</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {comboAnalysis.ideas.map((idea, i) => (
                        <div key={i} className="p-4 rounded-2xl border border-white/10 bg-white/5">
                          <div className="font-semibold text-sm mb-1">{idea.name}</div>
                          <div className="text-xs text-white/50">{idea.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {comboError && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {comboError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setComboStep('config')} className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
                    Back to Config
                  </button>
                  <button onClick={handleGeneratePrompt} className="neon-button flex-1 py-3">
                    <Sparkles className="w-4 h-4 inline mr-2" /> Generate Prompt
                  </button>
                </div>
              </div>
            )}

            {comboStep === 'prompt' && (
              <div className="space-y-6">
                <div>
                  <div className="font-mono text-xs tracking-[2px] text-white/50 mb-3">IMAGE PROMPT</div>
                  <textarea
                    value={comboPrompt}
                    onChange={e => setComboPrompt(e.target.value)}
                    className="w-full h-40 rounded-2xl px-4 py-3 bg-white/5 border border-white/10 focus:border-[#7c3aed] focus:outline-none transition-colors resize-none"
                    placeholder="Enter or edit the image prompt..."
                  />
                </div>

                <div>
                  <div className="font-mono text-xs tracking-[2px] text-white/50 mb-3">STYLE SUGGESTIONS</div>
                  <div className="flex flex-wrap gap-2">
                    {promptSuggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => setComboPrompt(prev => prev + ` Style: ${suggestion}.`)}
                        className="px-3 py-1.5 rounded-full border border-white/10 text-xs text-white/60 hover:bg-[#7c3aed]/20 hover:border-[#7c3aed]/40 hover:text-[#7c3aed] transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {comboError && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {comboError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setComboStep('analysis')} className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
                    Back to Analysis
                  </button>
                  <button onClick={handleGenerateComboImage} disabled={!comboPrompt || comboGeneratingImage} className="neon-button flex-1 py-3">
                    {comboGeneratingImage ? (
                      <><Loader2 className="w-4 h-4 inline mr-2 animate-spin" /> Generating...</>
                    ) : (
                      <><Image className="w-4 h-4 inline mr-2" /> Generate Image</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {comboStep === 'generating' && (
              <div className="py-12">
                <div className="flex flex-col items-center">
                  <Loader2 className="w-12 h-12 text-[#7c3aed] animate-spin mb-6" />
                  <div className="text-lg font-semibold mb-8">Creating your combo offer image...</div>
                  <div className="w-full max-w-md space-y-3">
                    {generationSteps.map((step, i) => (
                      <div key={step.key} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        i < generationStep ? 'bg-[#7c3aed]/10 border border-[#7c3aed]/30' :
                        i === generationStep ? 'bg-white/5 border border-white/20' :
                        'opacity-40'
                      }`}>
                        {i < generationStep ? (
                          <Check className="w-5 h-5 text-[#7c3aed]" />
                        ) : i === generationStep ? (
                          <Loader2 className="w-5 h-5 text-[#7c3aed] animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-white/20" />
                        )}
                        <span className={`text-sm ${i <= generationStep ? 'text-white' : 'text-white/40'}`}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {comboStep === 'result' && comboResult && (
              <div className="space-y-6">
                <div className="rounded-2xl overflow-hidden border border-[#7c3aed]/30 bg-[#7c3aed]/5">
                  <img src={comboResult.imageUrl} alt="Combo offer" className="w-full max-h-[500px] object-contain" />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setComboStep('prompt')} className="flex-1 min-w-[150px] py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4" /> Edit Prompt
                  </button>
                  <button onClick={handleGenerateComboImage} className="flex-1 min-w-[150px] py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-sm">
                    <RefreshCw className="w-4 h-4" /> Regenerate
                  </button>
                  <button onClick={() => handleDownloadImage(comboResult.imageUrl, comboName || 'combo-offer')} className="flex-1 min-w-[150px] py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-sm">
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button onClick={handleUseInPost} className="neon-button flex-1 min-w-[150px] py-3 flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Use in Post
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4" onClick={() => setPreviewImage(null)}>
          <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10">
            <X className="w-6 h-6" />
          </button>
          <img 
            src={previewImage} 
            alt="Product preview" 
            className="max-w-full max-h-[90vh] object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
