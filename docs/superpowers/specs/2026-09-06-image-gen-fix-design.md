# Image Generation Fix — Design Spec

**Date:** 2026-09-06
**Status:** Approved
**Scope:** 3 bugs in the NVIDIA FLUX image generation flow

---

## Problem Statement

The AI Image Studio (`POST /ai/generate-image`) has three bugs that prevent proper image generation:

1. The model selector in the UI is non-functional — all 3 FLUX model choices produce the same result
2. When NVIDIA generation fails, the user sees "Image generated!" with a blank area (no error shown)
3. If Cloudinary upload fails, a 5MB base64 data URI is silently returned instead of an error

---

## Issue 1: Model Selector Non-Functional

### Root Cause

The `model` parameter from the frontend DTO is never passed through to the NVIDIA provider.

**Call chain:**
1. Frontend sends `{ model: 'black-forest-labs/flux.1-dev', ... }`
2. Controller receives it in `GenerateImageDto` and passes to `aiService.generateImage(prompt, body.model, ...)`
3. Service receives it as the `model` parameter (line 447) but calls `provider.generateTextToImage({ prompt, width, height, seed })` — **model is NOT included**
4. Provider's `generateTextToImage()` (line 134) calls `this.resolveModel()` with **no argument**
5. `resolveModel(undefined)` returns `this.defaultModel` (from env var `NVIDIA_MODEL`)

Result: User selects FLUX.1 Dev (20 steps, highest quality) but always gets FLUX.2 Klein 4B (4 steps, default).

### Fix

**`backend/src/ai/providers/nvidia.provider.ts`:**
- Add optional `model` to `generateTextToImage` params interface
- Pass `params.model` to `this.resolveModel(params.model)` instead of `this.resolveModel()`
- Same fix for `generateWithProduct` — add `model` to params, pass to `resolveModel`

**`backend/src/ai/ai.service.ts`:**
- In `generateImage()` method, include `model` in the params passed to `provider.generateTextToImage()` and `provider.generateWithProduct()`
- Change from `provider.generateTextToImage({ prompt, width, height, seed })` to `provider.generateTextToImage({ prompt, width, height, seed, model })`
- Same for `generateWithProduct` call

### Files Changed
- `backend/src/ai/providers/nvidia.provider.ts` (lines 134-148, 150-166)
- `backend/src/ai/ai.service.ts` (lines 468-483)

---

## Issue 2: Error Responses Invisible to User

### Root Cause

When NVIDIA generation fails, the controller catches the error and returns HTTP 200 with `{ generation: null, result: null, error: '...' }`.

The frontend's error handling:
- `catch` block (line 416-418) only fires on HTTP errors (4xx/5xx)
- Since the response is HTTP 200, `catch` never fires
- `setResult(res.data.result)` sets `result` to `null`
- UI renders the empty "Ready to create" state
- `toast.success('Image generated!')` fires **unconditionally** (line 415) — it's outside any null check

### Fix

**`backend/src/ai/ai.controller.ts`:**
- Remove the try/catch that returns 200 with null result
- Let errors propagate naturally — the global `AllExceptionsFilter` (already in place) catches all exceptions and returns proper JSON with the correct status code
- This means NVIDIA failures return HTTP 500 with `{ statusCode: 500, message: '...' }`

**`frontend/app/(authenticated)/ai/studio/page.tsx`:**
- After `await api.post(...)`, check `res.data.result` before setting state
- If `result` is null, show `toast.error(res.data.error || 'Image generation failed')` and return
- Only show `toast.success('Image generated!')` when result is non-null
- Keep the `catch` block for HTTP errors as-is

### Files Changed
- `backend/src/ai/ai.controller.ts` (lines 72-130)
- `frontend/app/(authenticated)/ai/studio/page.tsx` (lines 400-422)

---

## Issue 3: Cloudinary Fallback Returns Base64

### Root Cause

In `ai.service.ts` line 515-517, when Cloudinary upload fails:
```ts
} catch (uploadErr: any) {
  this.logger.warn(`Cloudinary upload failed, using base64: ${uploadErr.message}`);
}
```
The code silently falls back to returning the raw base64 string as `imageUrl`. This 5MB+ data URI:
- Loads slowly in the browser
- Makes "Copy URL" useless (copies a massive data string)
- May fail to render in some contexts

### Fix

**`backend/src/ai/ai.service.ts`:**
- If Cloudinary upload fails, **throw the error** instead of swallowing it
- This causes the controller to return a proper error response (via AllExceptionsFilter)
- User sees "Image generation failed" instead of a broken/slow image

This is the correct behavior: if Cloudinary is misconfigured or down, the user should know rather than getting a degraded experience.

### Files Changed
- `backend/src/ai/ai.service.ts` (lines 515-517)

---

## Verification

1. **Model selector:** Generate an image with FLUX.1 Dev (20 steps) — should take longer and produce higher quality than FLUX.2 Klein (4 steps). Check backend logs for `steps: 20` vs `steps: 4`.
2. **Error handling:** Temporarily set `NVIDIA_API_KEY` to an invalid value — generate — should see error toast, not "Image generated!"
3. **Cloudinary:** If Cloudinary credentials are invalid, generation should fail with a clear error, not return a data URI.
4. **Happy path:** Valid API key + valid Cloudinary — image generates, appears in UI, URL is a Cloudinary URL.

---

## Scope Boundary

- Does NOT change: NVIDIA API payload format, DTO validation, AIGeneration record creation, frontend UI layout
- Does NOT add: new models, image-to-image composition, product image overlay
- Pure bug fixes — 3 targeted changes to make existing functionality work correctly
