# One-Click Content Creation Flow Design

## Overview

Implement a seamless one-click content creation flow for the social media management platform. The goal is to reduce clicks: Product → one action → everything connected.

## Current State

### AI Image Page (`/ai/image`)
- Has "Attach to Post" button that creates a post and navigates to `/posts/[id]`
- No option to schedule after creation

### AI Video Page (`/ai/video`)
- Same pattern as image page
- Creates post and navigates to `/posts/[id]`

### Posts Page (`/posts`)
- Edit modal with fields: title, caption, hashtags, platforms, image/video URLs
- AI post generator modal accepts `productId`, `create`, `scheduleDate` from URL
- No schedule field in edit modal

### Products Page (`/products`)
- Action buttons: Post, Image, Video, Ideas
- No "Quick Content" chain button

### Calendar Page (`/calendar`)
- "Create Post for This Date" button navigates to `/posts?create=true&scheduleDate=...`
- Date format: `YYYY-MM-DDTHH:MM`

## Requirements

### 1. "Attach to Post" on AI Pages → Calendar Chain

**Current behavior:** Creates post and navigates to `/posts/[id]`

**New behavior:** After creating post, show toast with two action buttons:
- "View Post" → navigates to `/posts/[id]`
- "Schedule" → navigates to `/posts` with edit modal open on the new post

**Implementation:**
- Use sonner's `toast` with action buttons
- Store the created post ID
- "Schedule" action opens `/posts?edit=NEW_POST_ID`
- Posts page needs to handle `edit` param to open edit modal on specific post

### 2. Quick Schedule from Post Edit Modal

**Current behavior:** Edit modal has title, caption, hashtags, platforms, image/video URLs

**New behavior:** Add schedule field:
- `datetime-local` input for scheduling
- When saving, if schedule date is set, include `scheduledFor` in update payload
- Show scheduled date in posts table

**Implementation:**
- Add `editScheduledFor` state in posts page
- Add `datetime-local` input in edit modal
- Include `scheduledFor` in `handleEditSave` payload
- Display scheduled date in table (already shows `post.scheduledFor`)

### 3. Product → Generate → Post Chain Button

**Current behavior:** Action buttons (Post, Image, Video, Ideas)

**New behavior:** Add "Quick Content" button with dropdown:
- "Generate Image → Create Post" → navigates to `/ai/image?productId=XXX`
- "Generate Video → Create Post" → navigates to `/ai/video?productId=XXX`
- "AI Post Ideas" → calls recommendations endpoint and shows ideas

**Implementation:**
- Add dropdown/popover state in products page
- Add "Quick Content" button with three options
- "AI Post Ideas" uses existing `handleGenerateContentIdeas` function

### 4. Calendar → Quick Create Chain

**Current behavior:** "Create Post for This Date" navigates to `/posts?create=true&scheduleDate=...`

**New behavior:**
- Ensure schedule date is properly formatted for `datetime-local` input
- AI post generator modal opens automatically with date pre-filled
- After creating post, it appears on that calendar date immediately

**Implementation:**
- Verify date format is correct (`YYYY-MM-DDTHH:MM`)
- Posts page already handles `scheduleDate` param and opens modal
- Post creation already includes `scheduledFor` in payload
- Query invalidation ensures calendar updates

## Technical Details

### Files to Modify

1. **`frontend/app/(authenticated)/ai/image/page.tsx`**
   - Update `handleAttachToPost` to show toast with actions
   - Add router navigation logic for "Schedule" action

2. **`frontend/app/(authenticated)/ai/video/page.tsx`**
   - Same changes as image page

3. **`frontend/app/(authenticated)/posts/page.tsx`**
   - Add `editScheduledFor` state
   - Add schedule field in edit modal
   - Update `handleEditSave` to include `scheduledFor`
   - Handle `edit` URL param to open edit modal on specific post

4. **`frontend/app/(authenticated)/products/page.tsx`**
   - Add dropdown/popover state for "Quick Content"
   - Add "Quick Content" button with dropdown options
   - Reuse existing content ideas generation

5. **`frontend/app/(authenticated)/calendar/page.tsx`**
   - Verify date formatting for `datetime-local` input
   - Ensure proper navigation to posts with schedule date

### Design System

- Use existing glass, neon-button, sonner, lucide-react components
- Follow existing modal patterns (fixed overlay, glass background)
- Use existing dropdown/popover patterns if available
- Maintain consistent spacing and typography

### Data Flow

1. **AI Pages → Posts:** Create post with `imageUrl`/`videoUrl`, then navigate with `edit` param
2. **Posts Edit:** Include `scheduledFor` in update payload
3. **Products → AI Pages:** Pass `productId` in URL
4. **Calendar → Posts:** Pass `scheduleDate` in URL

### Error Handling

- Toast notifications for success/error states
- Loading states for async operations
- Graceful fallbacks if operations fail

## Testing

1. Test "Attach to Post" flow on AI image and video pages
2. Test schedule field in edit modal
3. Test "Quick Content" dropdown on products page
4. Test calendar → post creation flow
5. Verify posts appear on calendar after scheduling
6. Test edge cases (no product selected, empty fields, etc.)
