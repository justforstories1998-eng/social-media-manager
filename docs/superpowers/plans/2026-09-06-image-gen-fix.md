# Image Generation Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 3 bugs in the NVIDIA FLUX image generation flow: broken model selector, invisible errors, and silent Cloudinary fallback.

**Architecture:** Targeted fixes in 3 files — pass `model` parameter through the call chain, let backend errors propagate as HTTP 500 (via existing AllExceptionsFilter), and throw on Cloudinary upload failure. No new files, no new dependencies, no schema changes.

**Tech Stack:** NestJS 11, Next.js 16, NVIDIA FLUX API, Cloudinary, class-validator

## Global Constraints

- Backend runs on Render with `AllExceptionsFilter` — exceptions become JSON `{ statusCode, message }` responses
- Global `ValidationPipe`: `whitelist: true, transform: true, forbidNonWhitelisted: true`
- Frontend uses axios with interceptors; errors thrown for non-2xx responses
- `toast` from `sonner` for user notifications
- No database changes needed
- PowerShell 5.1: chain with `;` / `if ($?)`, never `&&`. Do not `cd`; use workdir params.

---

### Task 1: Fix model selector — pass model through the call chain

**Files:**
- Modify: `backend/src/ai/providers/nvidia.provider.ts` (lines 134-166)
- Modify: `backend/src/ai/ai.service.ts` (lines 468-483)

**Interfaces:**
- Consumes: `model` string from `GenerateImageDto` (e.g. `'black-forest-labs/flux.1-dev'`)
- Produces: NVIDIA API called with correct `steps` for the selected model

- [ ] **Step 1: Add `model` to provider method signatures**

In `backend/src/ai/providers/nvidia.provider.ts`, update both methods:

`generateTextToImage` — change params type from:
```ts
async generateTextToImage(params: {
  prompt: string;
  width?: number;
  height?: number;
  numberOfImages?: number;
  seed?: number;
}): Promise<GeneratedImageResult> {
  const model = this.resolveModel();
```
To:
```ts
async generateTextToImage(params: {
  prompt: string;
  width?: number;
  height?: number;
  numberOfImages?: number;
  seed?: number;
  model?: string;
}): Promise<GeneratedImageResult> {
  const model = this.resolveModel(params.model);
```

`generateWithProduct` — change params type from:
```ts
async generateWithProduct(params: {
  prompt: string;
  productImage: string;
  width?: number;
  height?: number;
  numberOfImages?: number;
  seed?: number;
}): Promise<GeneratedImageResult> {
  const model = this.resolveModel();
```
To:
```ts
async generateWithProduct(params: {
  prompt: string;
  productImage: string;
  width?: number;
  height?: number;
  numberOfImages?: number;
  seed?: number;
  model?: string;
}): Promise<GeneratedImageResult> {
  const model = this.resolveModel(params.model);
```

- [ ] **Step 2: Pass `model` from service to provider**

In `backend/src/ai/ai.service.ts`, `generateImage` method, update both provider calls:

Change (line ~468-475):
```ts
      if (productData?.imageUrl) {
        result = await provider.generateWithProduct({
          prompt: enrichedPrompt,
          productImage: productData.imageUrl,
          width,
          height,
          seed,
        });
      } else {
        result = await provider.generateTextToImage({
          prompt: enrichedPrompt,
          width,
          height,
          seed,
        });
      }
```
To:
```ts
      if (productData?.imageUrl) {
        result = await provider.generateWithProduct({
          prompt: enrichedPrompt,
          productImage: productData.imageUrl,
          width,
          height,
          seed,
          model,
        });
      } else {
        result = await provider.generateTextToImage({
          prompt: enrichedPrompt,
          width,
          height,
          seed,
          model,
        });
      }
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit` (workdir: `backend`)
Expected: no new errors

- [ ] **Step 4: Commit**

```bash
git add backend/src/ai/providers/nvidia.provider.ts backend/src/ai/ai.service.ts
git commit -m "fix(ai): pass model parameter through to NVIDIA provider"
```

---

### Task 2: Fix error handling — return proper errors, show in UI

**Files:**
- Modify: `backend/src/ai/ai.controller.ts` (lines 72-130)
- Modify: `frontend/app/(authenticated)/ai/studio/page.tsx` (lines 400-422)

**Interfaces:**
- Consumes: exceptions from `aiService.generateImage()` (NVIDIA failures, Cloudinary failures)
- Produces: HTTP 500 JSON error response; frontend shows error toast

- [ ] **Step 1: Fix backend controller — let errors propagate**

In `backend/src/ai/ai.controller.ts`, replace the entire `generateImage` method body.

Change from:
```ts
  @Post('generate-image')
  async generateImage(
    @Request() req: any,
    @Body() body: GenerateImageDto,
  ) {
    try {
      this.logger.log(`generate-image called: prompt="${(body.prompt || '').substring(0, 50)}", model=${body.model}, productId=${body.productId}`);

      let productData: any = undefined;
      if (body.productId) {
        try {
          const product = await this.prisma.product.findFirst({
            where: { id: body.productId, userId: req.user.id },
          });
          if (product) {
            productData = {
              name: product.name,
              description: product.description || undefined,
              category: product.category || undefined,
              imageUrl: product.images?.[0] || undefined,
              features: product.features || [],
            };
          }
        } catch (e: any) {
          this.logger.warn(`Product lookup failed: ${e.message}`);
        }
      }

      this.logger.log('Calling aiService.generateImage...');
      const result = await this.aiService.generateImage(body.prompt, body.model, body.width, body.height, body.seed, productData);
      this.logger.log('aiService.generateImage returned successfully');

      let generation: any = null;
      try {
        generation = await this.aiGenerationService.create(req.user.id, {
          productId: body.productId,
          type: 'image',
          prompt: body.prompt,
          model: body.model,
          provider: 'nvidia',
          width: body.width,
          height: body.height,
          seed: body.seed,
        });
        await this.aiGenerationService.update(generation.id, req.user.id, {
          status: 'completed',
          outputUrl: result.imageUrl,
          outputData: result,
        }).catch((e: any) => this.logger.warn(`Generation update failed: ${e?.message}`));
      } catch (e: any) {
        this.logger.warn(`Generation record failed: ${e.message}`);
      }

      return { generation, result };
    } catch (error: any) {
      this.logger.error(`generate-image error: ${error.message}`, error.stack);
      return { generation: null, result: null, error: error.message || 'Image generation failed' };
    }
  }
```
To:
```ts
  @Post('generate-image')
  async generateImage(
    @Request() req: any,
    @Body() body: GenerateImageDto,
  ) {
    this.logger.log(`generate-image called: prompt="${(body.prompt || '').substring(0, 50)}", model=${body.model}, productId=${body.productId}`);

    let productData: any = undefined;
    if (body.productId) {
      try {
        const product = await this.prisma.product.findFirst({
          where: { id: body.productId, userId: req.user.id },
        });
        if (product) {
          productData = {
            name: product.name,
            description: product.description || undefined,
            category: product.category || undefined,
            imageUrl: product.images?.[0] || undefined,
            features: product.features || [],
          };
        }
      } catch (e: any) {
        this.logger.warn(`Product lookup failed: ${e.message}`);
      }
    }

    this.logger.log('Calling aiService.generateImage...');
    const result = await this.aiService.generateImage(body.prompt, body.model, body.width, body.height, body.seed, productData);
    this.logger.log('aiService.generateImage returned successfully');

    let generation: any = null;
    try {
      generation = await this.aiGenerationService.create(req.user.id, {
        productId: body.productId,
        type: 'image',
        prompt: body.prompt,
        model: body.model,
        provider: 'nvidia',
        width: body.width,
        height: body.height,
        seed: body.seed,
      });
      await this.aiGenerationService.update(generation.id, req.user.id, {
        status: 'completed',
        outputUrl: result.imageUrl,
        outputData: result,
      }).catch((e: any) => this.logger.warn(`Generation update failed: ${e?.message}`));
    } catch (e: any) {
      this.logger.warn(`Generation record failed: ${e.message}`);
    }

    return { generation, result };
  }
```

Key change: removed the outer `try/catch` that swallowed errors and returned 200 with null. Now errors propagate to `AllExceptionsFilter` which returns HTTP 500 with JSON `{ statusCode: 500, message: '...' }`.

- [ ] **Step 2: Fix frontend — check result before showing success**

In `frontend/app/(authenticated)/ai/studio/page.tsx`, replace the `handleGenerate` function.

Change from:
```ts
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
```
To:
```ts
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!selectedProductId) {
      toast.error('Select a product before generating.');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await api.post<{ generation: { id: string }; result: GenerateImageResponse | null }>('/ai/generate-image', {
        prompt, model, width: currentSize.width, height: currentSize.height, seed, productId: selectedProductId,
      });
      if (!res.data.result) {
        toast.error((res.data as any).error || 'Image generation failed');
        return;
      }
      const genId = res.data.generation?.id;
      if (genId) setGenerationId(genId);
      setResult(res.data.result);
      setHistory(prev => [res.data.result!, ...prev].slice(0, 20));
      toast.success('Image generated!');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(axiosErr?.response?.data?.message || axiosErr?.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };
```

Key changes:
- Type annotation now allows `result: GenerateImageResponse | null`
- Added null check: if `res.data.result` is null, show error toast and return early
- `toast.success` only fires when result is non-null
- Added `!` assertion on `res.data.result` in `setHistory` (guaranteed non-null after the check)

- [ ] **Step 3: Verify builds**

Run: `npx tsc --noEmit` (workdir: `backend`)
Run: `npx tsc --noEmit` (workdir: `frontend`)
Expected: no new errors in either

- [ ] **Step 4: Commit**

```bash
git add backend/src/ai/ai.controller.ts "frontend/app/(authenticated)/ai/studio/page.tsx"
git commit -m "fix(ai): propagate errors properly and show them in UI"
```

---

### Task 3: Fix Cloudinary fallback — throw on upload failure

**Files:**
- Modify: `backend/src/ai/ai.service.ts` (lines 515-517)

**Interfaces:**
- Consumes: Cloudinary upload error
- Produces: Exception thrown instead of silent fallback

- [ ] **Step 1: Throw on Cloudinary failure**

In `backend/src/ai/ai.service.ts`, find the Cloudinary upload catch block (around line 515):

Change from:
```ts
        } catch (uploadErr: any) {
          this.logger.warn(`Cloudinary upload failed, using base64: ${uploadErr.message}`);
        }
```
To:
```ts
        } catch (uploadErr: any) {
          this.logger.error(`Cloudinary upload failed: ${uploadErr.message}`);
          throw new Error(`Image generated but upload failed: ${uploadErr.message}. Check Cloudinary configuration.`);
        }
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit` (workdir: `backend`)
Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add backend/src/ai/ai.service.ts
git commit -m "fix(ai): throw on Cloudinary upload failure instead of silent fallback"
```

---

### Task 4: Full verification

- [ ] **Step 1: Run all backend checks**

Run: `npx tsc --noEmit` (workdir: `backend`)
Expected: clean

- [ ] **Step 2: Run all frontend checks**

Run: `npx tsc --noEmit` (workdir: `frontend`)
Expected: clean

- [ ] **Step 3: Verify git status is clean**

Run: `git status --short`
Expected: empty (all changes committed)

- [ ] **Step 4: Push to origin**

Run: `git push origin main`
Expected: push succeeds, Render auto-deploys
