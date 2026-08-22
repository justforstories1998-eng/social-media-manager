# Post ↔ Calendar Synchronization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance calendar post indicators with platform/status badges and click-to-navigate functionality.

**Architecture:** All post mutations already invalidate the `['posts']` query, so calendar sync is automatic. The only work needed is calendar UI enhancement for post indicators.

**Tech Stack:** Next.js, React Query, Tailwind CSS, Lucide icons

## Global Constraints

- Don't break existing functionality
- Follow existing code style (glass morphism, neon-button, status-badge patterns)
- Use existing `usePosts()` hook and Post type from `@/lib/api`

---

## Analysis (No Changes Needed)

### Post ↔ Calendar Sync — Already Working

All mutations in `frontend/hooks/usePosts.ts` call `queryClient.invalidateQueries({ queryKey: ['posts'] })`:
- `useCreatePost` — line 22 ✓
- `useUpdatePost` — line 35 ✓
- `useDeletePost` — line 47 ✓
- `useDuplicatePost` — line 60 ✓

Calendar uses `usePosts()` (line 13 of calendar/page.tsx), so it auto-refreshes on any mutation.

### Backend Duplicate — Already Correct

`backend/src/posts/posts.service.ts:105-106`:
```typescript
scheduledFor: null,
status: 'DRAFT',
```

Duplicated posts are DRAFT with no scheduledFor — they won't appear on calendar.

### Post Detail Page Sync — Already Working

`frontend/app/(authenticated)/posts/[id]/page.tsx` uses `useUpdatePost()`, `useDeletePost()`, `useDuplicatePost()` — all invalidate the posts query, so calendar updates automatically.

---

## Task 1: Enhance Calendar Post Indicators

**Files:**
- Modify: `frontend/app/(authenticated)/calendar/page.tsx`

**What changes:**
1. Replace the simple `📝 Title` post indicators with styled chips showing:
   - Platform badge (colored: Instagram=pink, LinkedIn=blue, Facebook=blue, X=black, TikTok=cyan)
   - Status badge (DRAFT=gray, SCHEDULED=yellow, PUBLISHED=green)
   - Truncated post title
2. Make each post indicator clickable → navigates to `/posts/[id]`
3. Add hover tooltip with full post details

**Current code (lines 151-161):**
```tsx
{hasPosts && (
  <div className="hidden sm:block">
    {dayPosts.slice(0, 2).map((p, pi) => (
      <div key={pi} className="text-[10px] p-1 mt-1 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20 truncate">
        📝 {p.title || p.caption?.slice(0, 30) || 'Post'}
      </div>
    ))}
    {dayPosts.length > 2 && (
      <div className="text-[10px] text-[#7c3aed] mt-0.5">+{dayPosts.length - 2} more</div>
    )}
  </div>
)}
```

**Replace with:**
```tsx
{hasPosts && (
  <div className="hidden sm:block space-y-1">
    {dayPosts.slice(0, 2).map((p, pi) => (
      <button
        key={pi}
        onClick={(e) => { e.stopPropagation(); router.push(`/posts/${p.id}`); }}
        className="w-full text-left text-[10px] p-1.5 mt-1 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20 hover:bg-[#7c3aed]/20 hover:border-[#7c3aed]/40 transition-all cursor-pointer group"
        title={`${p.title || 'Untitled Post'} — ${p.platforms?.[0] || '—'} — ${p.status}`}
      >
        <div className="flex items-center gap-1 mb-0.5">
          <span className={`px-1 py-0.5 rounded text-[8px] font-mono ${
            p.platforms?.[0] === 'Instagram' ? 'bg-pink-500/20 text-pink-400' :
            p.platforms?.[0] === 'LinkedIn' ? 'bg-blue-500/20 text-blue-400' :
            p.platforms?.[0] === 'Facebook' ? 'bg-blue-600/20 text-blue-300' :
            p.platforms?.[0] === 'X' ? 'bg-white/20 text-white/70' :
            p.platforms?.[0] === 'TikTok' ? 'bg-cyan-500/20 text-cyan-400' :
            'bg-white/10 text-white/50'
          }`}>{p.platforms?.[0] || '—'}</span>
          <span className={`px-1 py-0.5 rounded text-[8px] font-mono ${
            p.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-400' :
            p.status === 'SCHEDULED' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-white/10 text-white/50'
          }`}>{p.status}</span>
        </div>
        <div className="truncate text-white/70 group-hover:text-white transition-colors">{p.title || p.caption?.slice(0, 25) || 'Post'}</div>
      </button>
    ))}
    {dayPosts.length > 2 && (
      <div className="text-[10px] text-[#7c3aed] mt-0.5">+{dayPosts.length - 2} more</div>
    )}
  </div>
)}
```

**Mobile indicators (lines 164-170):** Keep as-is (dots are fine for mobile).

- [ ] **Step 1: Update calendar post indicators**

Edit `frontend/app/(authenticated)/calendar/page.tsx` lines 151-161 to replace simple text with styled, clickable post chips.

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Verify calendar still renders**

Check that calendar loads, posts appear on correct dates, clicking a post navigates to detail page.

---

## Verification Checklist

After implementation, verify:
1. Calendar shows posts on correct dates with platform/status badges
2. Clicking a post indicator navigates to `/posts/[id]`
3. Creating a post with scheduledFor makes it appear on calendar
4. Editing a post's scheduledFor moves it on calendar
5. Deleting a post removes it from calendar
6. Duplicating a post does NOT add it to calendar (DRAFT, no scheduledFor)
