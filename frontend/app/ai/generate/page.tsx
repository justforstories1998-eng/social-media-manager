'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';

interface GenerateResult {
  caption: string;
  hashtags: string;
  imagePrompt: string;
  model: string;
  confidence: string;
}

export default function AIGenerate() {
  const [prompt, setPrompt] = useState("Earth Day campaign for sustainable water bottles");
  const [platform, setPlatform] = useState("Instagram");
  const [type, setType] = useState("Product Promotion");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const generateContent = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      setResult({
        caption: "🌍 This Earth Day, choose reusable. Our new eco stainless bottle keeps your drinks cold for 24h and your conscience clean. Small choices. Big impact. ♻️",
        hashtags: "#EarthDay #SustainableLiving #EcoBottle #ZeroWaste",
        imagePrompt: "Premium product photography of a sleek stainless steel water bottle on moss, soft natural lighting, cinematic",
        model: "Qwen2.5-7B",
        confidence: "96%"
      });
      setIsGenerating(false);
    }, 1400);
  };

  const generateImage = () => {
    setImageLoading(true);
    const id = Math.floor(Math.random() * 1000) + 1;
    setImagePreview(`https://picsum.photos/id/${id}/900/900`);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans">
      <MobileNav />
      <div className="floating-shell mx-auto my-6 ring-1 ring-white/10">
        <div className="px-4 sm:px-8 h-20 flex items-center justify-between border-b border-white/10">
          <Link href="/dashboard" className="font-semibold text-2xl tracking-tight">WonderMedia</Link>
          <div className="font-mono text-xs tracking-[3px] text-white/50">AI STUDIO</div>
        </div>

        <div className="px-4 sm:px-8 pt-9 pb-6">
          <div className="text-4xl sm:text-5xl font-semibold tracking-[-2px]">AI Content Generator</div>
        </div>

        <div className="px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
          {/* Input */}
          <div className="glass p-6 sm:p-9 rounded-[2.5rem]">
            <div className="space-y-6">
              <div>
                <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">PROMPT</label>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-sm h-28" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">PLATFORM</label>
                  <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-sm">
                    <option>Instagram</option><option>LinkedIn</option><option>Facebook</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-xs tracking-[2px] text-white/50 block mb-2">TYPE</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-sm">
                    <option>Product Promotion</option><option>Educational</option><option>Festival</option>
                  </select>
                </div>
              </div>

              <button onClick={generateContent} disabled={isGenerating} className="neon-button w-full mt-2">
                {isGenerating ? "Generating..." : "Generate Content"}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="glass p-6 sm:p-9 rounded-[2.5rem]">
            {!result ? (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <div className="text-3xl font-semibold tracking-tight">Ready to create</div>
                  <div className="text-white/50 mt-2">Using Qwen2.5-7B • Local AI</div>
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
                    <div>{result.caption}</div>
                  </div>
                  <div>
                    <div className="font-mono text-xs text-white/50 mb-1">HASHTAGS</div>
                    <div className="text-[#ec4899]">{result.hashtags}</div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button onClick={generateImage} className="flex-1 py-3.5 border border-white/10 rounded-full text-sm hover:bg-white/5 transition-colors">Generate Image</button>
                  <button className="neon-button flex-1 text-sm">Send to Telegram</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="px-4 sm:px-8 pb-10">
            <div className="glass p-6 sm:p-8 rounded-[2.5rem]">
              <div className="font-mono text-xs tracking-[2px] text-white/50 mb-4">IMAGE PREVIEW</div>
              {imageLoading && (
                <div className="w-full max-w-[420px] aspect-square rounded-3xl bg-white/5 animate-pulse flex items-center justify-center">
                  <span className="text-white/30 text-sm">Loading...</span>
                </div>
              )}
              <img 
                src={imagePreview} 
                alt="AI generated content preview" 
                className={`rounded-3xl w-full max-w-[420px] aspect-square object-cover border border-white/10 ${imageLoading ? 'hidden' : ''}`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImagePreview(null);
                  alert('Failed to load image. Please try again.');
                }}
              />
              <div className="flex gap-3 mt-4">
                <button className="px-6 py-3 border border-white/10 rounded-full flex-1 hover:bg-white/5 transition-colors">Use Image</button>
                <button onClick={() => { setImagePreview(null); setImageLoading(false); }} className="px-6 py-3 border border-white/10 rounded-full flex-1 hover:bg-white/5 transition-colors">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
