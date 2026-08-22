# One-Click Content Creation Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a seamless one-click content creation flow that reduces clicks from Product → AI Generation → Post → Calendar.

**Architecture:** Update four existing pages (AI image, AI video, posts, products) to chain actions together. Add schedule field to post edit modal, toast actions to AI pages, and dropdown menu to products page.

**Tech Stack:** Next.js, React, TypeScript, sonner (toast), lucide-react (icons), existing glass/neon-button design system

## Global Constraints

- Use existing design system: glass, neon-button, sonner, lucide-react
- Follow existing modal patterns (fixed overlay, glass background)
- Maintain consistent spacing and typography
- No new dependencies required
- Keep existing functionality working

---

### Task 1: Add Schedule Field to Post Edit Modal

**Files:**
- Modify: `frontend/app/(authenticated)/posts/page.tsx:32-39` (state declarations)
- Modify: `frontend/app/(authenticated)/posts/page.tsx:133-141` (openEdit function)
- Modify: `frontend/app/(authenticated)/posts/page.tsx:143-167` (handleEditSave function)
- Modify: `frontend/app/(authenticated)/posts/page.tsx:410-471` (edit modal JSX)

**Interfaces:**
- Consumes: `Post` type from `@/lib/api`
- Produces: Updated `editScheduledFor` state, `scheduledFor` in update payload

- [ ] **Step 1: Add schedule state variable**

In `frontend/app/(authenticated)/posts/page.tsx`, add state variable after line 38:

```typescript
const [editScheduledFor, setEditScheduledFor] = useState('');
```

- [ ] **Step 2: Update openEdit function to populate schedule**

In `frontend/app/(authenticated)/posts/page.tsx`, add to `openEdit` function after line 140:

```typescript
setEditScheduledFor(post.scheduledFor ? new Date(post.scheduledFor).toISOString().slice(0, 16) : '');
```

- [ ] **Step 3: Update handleEditSave to include scheduledFor**

In `frontend/app/(authenticated)/posts/page.tsx`, update `handleEditSave` function to include scheduledFor in the payload (around line 150):

```typescript
await updatePost.mutateAsync({
  id: editPost.id,
  data: {
    title: editTitle || undefined,
    caption: editCaption,
    hashtags: hashtagsArr,
    platforms: editPlatforms,
    imageUrl: editImageUrl || undefined,
    videoUrl: editVideoUrl || undefined,
    scheduledFor: editScheduledFor || null,
  },
});
```

- [ ] **Step 4: Add schedule field to edit modal JSX**

In `frontend/app/(authenticated)/posts/page.tsx`, add after the video URL field (around line 470):

```typescript
<div>
  <label className="text-xs font-mono tracking-[1px] text-white/50 block mb-2">SCHEDULE (OPTIONAL)</label>
  <input
    type="datetime-local"
    value={editScheduledFor}
    onChange={e => setEditScheduledFor(e.target.value)}
    className="w-full bg-white/5 border border-white/10 rounded-3xl p-4 text-sm"
  />
</div>
```

- [ ] **Step 5: Test the schedule field**

1. Navigate to `/posts`
2. Click edit on any post
3. Verify schedule field appears
4. Set a schedule date and save
5. Verify post shows scheduled date in table

---

### Task 2: Handle Edit URL Param in Posts Page

**Files:**
- Modify: `frontend/app/(authenticated)/posts/page.tsx:41-53` (useEffect for URL params)
- Modify: `frontend/app/(authenticated)/posts/page.tsx:133-141` (openEdit function)

**Interfaces:**
- Consumes: `searchParams` from URL
- Produces: Auto-opens edit modal on specific post

- [ ] **Step 1: Add edit URL param handling**

In `frontend/app/(authenticated)/posts/page.tsx`, add to useEffect after line 53:

```typescript
const urlEdit = searchParams.get('edit');

useEffect(() => {
  if (urlScheduleDate) {
    setScheduleDate(urlScheduleDate);
  }
  if (urlCreate === 'true') {
    setShowModal(true);
    setStep('input');
  }
  if (urlEdit && posts) {
    const postToEdit = posts.find(p => p.id === urlEdit);
    if (postToEdit) {
      openEdit(postToEdit);
    }
  }
}, [urlCreate, urlScheduleDate, urlEdit, posts]);
```

- [ ] **Step 2: Update useEffect dependencies**

Update the useEffect dependency array to include `posts` and `urlEdit`:

```typescript
}, [urlCreate, urlScheduleDate, urlEdit, posts]);
```

- [ ] **Step 3: Test edit URL param**

1. Create a post
2. Navigate to `/posts?edit=POST_ID`
3. Verify edit modal opens automatically on that post

---

### Task 3: Update AI Image Page "Attach to Post" with Toast Actions

**Files:**
- Modify: `frontend/app/(authenticated)/ai/image/page.tsx:167-186` (handleAttachToPost function)

**Interfaces:**
- Consumes: `result.imageUrl`, `selectedProductId`, `selectedProduct`
- Produces: Toast with "View Post" and "Schedule" actions

- [ ] **Step 1: Update handleAttachToPost function**

Replace the `handleAttachToPost` function in `frontend/app/(authenticated)/ai/image/page.tsx`:

```typescript
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
    const postId = res.data.id;
    toast.success('Post created!', {
      action: {
        label: 'View Post',
        onClick: () => router.push(`/posts/${postId}`),
      },
      action2: {
        label: 'Schedule',
        onClick: () => router.push(`/posts?edit=${postId}`),
      },
    });
  } catch {
    toast.error('Failed to create post');
  }
};
```

- [ ] **Step 2: Test toast actions**

1. Navigate to `/ai/image?productId=PRODUCT_ID`
2. Generate an image
3. Click "Attach to Post"
4. Verify toast appears with "View Post" and "Schedule" buttons
5. Click "View Post" - verify navigation to `/posts/POST_ID`
6. Repeat and click "Schedule" - verify navigation to `/posts?edit=POST_ID`

---

### Task 4: Update AI Video Page "Attach to Post" with Toast Actions

**Files:**
- Modify: `frontend/app/(authenticated)/ai/video/page.tsx:154-173` (handleAttachToPost function)

**Interfaces:**
- Consumes: `result.videoUrl`, `selectedProductId`, `selectedProduct`
- Produces: Toast with "View Post" and "Schedule" actions

- [ ] **Step 1: Update handleAttachToPost function**

Replace the `handleAttachToPost` function in `frontend/app/(authenticated)/ai/video/page.tsx`:

```typescript
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
    const postId = res.data.id;
    toast.success('Post created!', {
      action: {
        label: 'View Post',
        onClick: () => router.push(`/posts/${postId}`),
      },
      action2: {
        label: 'Schedule',
        onClick: () => router.push(`/posts?edit=${postId}`),
      },
    });
  } catch {
    toast.error('Failed to create post');
  }
};
```

- [ ] **Step 2: Test toast actions**

1. Navigate to `/ai/video?productId=PRODUCT_ID`
2. Generate a video
3. Click "Attach to Post"
4. Verify toast appears with "View Post" and "Schedule" buttons
5. Click "View Post" - verify navigation to `/posts/POST_ID`
6. Repeat and click "Schedule" - verify navigation to `/posts?edit=POST_ID`

---

### Task 5: Add "Quick Content" Dropdown to Products Page

**Files:**
- Modify: `frontend/app/(authenticated)/products/page.tsx:32-55` (state declarations)
- Modify: `frontend/app/(authenticated)/products/page.tsx:243-267` (product card buttons)

**Interfaces:**
- Consumes: `product.id`, existing `handleGenerateContentIdeas` function
- Produces: Dropdown with three options

- [ ] **Step 1: Add dropdown state**

In `frontend/app/(authenticated)/products/page.tsx`, add state variable after line 54:

```typescript
const [showQuickContent, setShowQuickContent] = useState<string | null>(null);
```

- [ ] **Step 2: Add Quick Content button and dropdown**

Replace the product card buttons section (lines 243-267) with:

```typescript
<div className="flex gap-2 mt-4">
  <button onClick={() => handleGenerateAdConcepts(product)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#7c3aed]/15 text-[#7c3aed] text-xs font-medium hover:bg-[#7c3aed]/25 transition-colors">
    <Sparkles className="w-3.5 h-3.5" /> AI Ad
  </button>
  <button onClick={() => handleAnalyzeProduct(product)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#ec4899]/15 text-[#ec4899] text-xs font-medium hover:bg-[#ec4899]/25 transition-colors">
    <Brain className="w-3.5 h-3.5" /> Analyze
  </button>
  <div className="relative">
    <button
      onClick={() => setShowQuickContent(showQuickContent === product.id ? null : product.id)}
      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed]/15 to-[#ec4899]/15 text-white/80 text-xs font-medium hover:from-[#7c3aed]/25 hover:to-[#ec4899]/25 transition-colors"
    >
      <Sparkles className="w-3.5 h-3.5" /> Quick Content
    </button>
    {showQuickContent === product.id && (
      <div className="absolute top-full left-0 mt-2 w-56 glass rounded-2xl border border-white/10 shadow-xl z-10 overflow-hidden">
        <button
          onClick={() => { setShowQuickContent(null); router.push(`/ai/image?productId=${product.id}`); }}
          className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-center gap-3"
        >
          <Image className="w-4 h-4 text-[#7c3aed]" />
          <div>
            <div className="font-medium">Generate Image → Create Post</div>
            <div className="text-[10px] text-white/40">Create a product image</div>
          </div>
        </button>
        <button
          onClick={() => { setShowQuickContent(null); router.push(`/ai/video?productId=${product.id}`); }}
          className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-center gap-3"
        >
          <Film className="w-4 h-4 text-[#ec4899]" />
          <div>
            <div className="font-medium">Generate Video → Create Post</div>
            <div className="text-[10px] text-white/40">Create a product video</div>
          </div>
        </button>
        <button
          onClick={() => { setShowQuickContent(null); handleGenerateContentIdeas(product); }}
          className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-center gap-3"
        >
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <div>
            <div className="font-medium">AI Post Ideas</div>
            <div className="text-[10px] text-white/40">Get content suggestions</div>
          </div>
        </button>
      </div>
    )}
  </div>
  <button onClick={() => handleDelete(product.id)} className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
    <Trash2 className="w-4 h-4" />
  </button>
</div>
```

- [ ] **Step 3: Add click outside handler**

Add useEffect to close dropdown when clicking outside (after line 54):

```typescript
useEffect(() => {
  const handleClickOutside = () => setShowQuickContent(null);
  if (showQuickContent) {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }
}, [showQuickContent]);
```

- [ ] **Step 4: Test Quick Content dropdown**

1. Navigate to `/products`
2. Click "Quick Content" button on any product
3. Verify dropdown appears with three options
4. Click "Generate Image → Create Post" - verify navigation to `/ai/image?productId=PRODUCT_ID`
5. Repeat for "Generate Video → Create Post"
6. Repeat for "AI Post Ideas" - verify modal opens

---

### Task 6: Verify Calendar Date Formatting

**Files:**
- Modify: `frontend/app/(authenticated)/calendar/page.tsx:294-303` (Create Post button)
- Modify: `frontend/app/(authenticated)/calendar/page.tsx:323-332` (Date Modal button)

**Interfaces:**
- Consumes: `selectedDate`, `year`
- Produces: Properly formatted `datetime-local` string

- [ ] **Step 1: Verify date format in Post List Modal**

Check line 297 in `frontend/app/(authenticated)/calendar/page.tsx`:

```typescript
const dateStr = `${year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}T10:00`;
```

This format is correct for `datetime-local` input. No changes needed.

- [ ] **Step 2: Verify date format in Date Modal**

Check line 326 in `frontend/app/(authenticated)/calendar/page.tsx`:

```typescript
const dateStr = `${year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}T10:00`;
```

This format is correct for `datetime-local` input. No changes needed.

- [ ] **Step 3: Test calendar flow**

1. Navigate to `/calendar`
2. Click on a date with no posts
3. Click "Create Post for This Date"
4. Verify navigation to `/posts?create=true&scheduleDate=YYYY-MM-DDTHH:MM`
5. Verify AI post generator modal opens with schedule date pre-filled
6. Create a post and verify it appears on calendar

---

### Task 7: Test End-to-End Flow

**Files:**
- Test: All modified files

**Interfaces:**
- Consumes: All implemented features
- Produces: Verified end-to-end flow

- [ ] **Step 1: Test Product → AI Image → Post → Schedule flow**

1. Navigate to `/products`
2. Click "Quick Content" on a product
3. Select "Generate Image → Create Post"
4. Generate an image on AI image page
5. Click "Attach to Post"
6. Click "Schedule" in toast
7. Verify edit modal opens with schedule field
8. Set schedule date and save
9. Verify post appears on calendar

- [ ] **Step 2: Test Product → AI Video → Post → Schedule flow**

1. Navigate to `/products`
2. Click "Quick Content" on a product
3. Select "Generate Video → Create Post"
4. Generate a video on AI video page
5. Click "Attach to Post"
6. Click "Schedule" in toast
7. Verify edit modal opens with schedule field
8. Set schedule date and save
9. Verify post appears on calendar

- [ ] **Step 3: Test Calendar → Post flow**

1. Navigate to `/calendar`
2. Click on a date
3. Click "Create Post for This Date"
4. Verify AI post generator opens with date pre-filled
5. Create a post
6. Verify post appears on calendar

- [ ] **Step 4: Commit changes**

```bash
git add frontend/app/(authenticated)/ai/image/page.tsx frontend/app/(authenticated)/ai/video/page.tsx frontend/app/(authenticated)/posts/page.tsx frontend/app/(authenticated)/products/page.tsx frontend/app/(authenticated)/calendar/page.tsx
git commit -m "feat: implement one-click content creation flow"
```
