'use client';

import React, { useState, useEffect } from 'react';
import api, { type GeneratePostResponse } from '@/lib/api';
import { toast } from 'sonner';
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

export default function AIGeneratePage() {
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
        prompt,
        platform,
        type,
        model: selectedModel,
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
    <div className="floating-shell mx-auto ring-1 ring-white/10">
      <div className="px-4 sm:px-8 pt-9 pb-6">
        <div className="font-mono text-xs tracking-[3px] text-white/50">AI STUDIO</div>
        <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">AI Content Generator</div>
      </div>

      <div className="px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        <div className="glass p-6 sm:p-9 rounded-[2.5rem]">
          <div className="space-y-6">
            <div>
              <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">PROMPT</label>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-sm h-28" />
            </div>

            <div>
              <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">AI MODEL</label>
              <CustomDropdown
                options={modelOptions}
                value={selectedModel}
                onChange={setSelectedModel}
                placeholder="Select a model..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">PLATFORM</label>
                <CustomDropdown
                  options={platformOptions}
                  value={platform}
                  onChange={setPlatform}
                />
              </div>
              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">TYPE</label>
                <CustomDropdown
                  options={typeOptions}
                  value={type}
                  onChange={setType}
                />
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

              <div className="flex gap-3 mt-8">
                <button className="flex-1 py-3.5 border border-white/10 rounded-full text-sm hover:bg-white/5 transition-colors">Generate Image</button>
                <button className="neon-button flex-1 text-sm">Send to Telegram</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
