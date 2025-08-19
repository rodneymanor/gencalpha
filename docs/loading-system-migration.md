# Claude-Style Loading System Migration Guide

## Overview

This migration replaces all spinner-based loaders with Claude-style skeleton screens and progressive loading strategies. The goal is to **never show a spinner** and always show **the shape of what's coming**.

## Migration Summary

### ✅ Completed Changes

1. **Main Page Loader**: `app/loading.tsx` → `SkeletonPageLayout`
2. **Chat AckLoader**: `ack-loader.tsx` → `ThinkingIndicator`
3. **Loading Indicator**: `loading-indicator.tsx` → `ThinkingIndicator`
4. **Video Processing**: `video-grid-processing-placeholder.tsx` → `ThinkingIndicator`
5. **Core Loading Components**: Updated to redirect to skeleton screens
6. **CSS Animations**: Added shimmer animations for skeleton screens

### 🔄 New Components Available

- `SkeletonPageLayout` - Full page skeleton
- `SkeletonChatPage` - Chat interface skeleton
- `SkeletonVideoGrid` - Video grid skeleton
- `ThinkingIndicator` - AI processing dots
- `ProgressivePageLoader` - Three-stage progressive loading
- `DataProgressiveLoader` - Data fetching with skeletons

## Usage Guide

### 1. Replace Page Loaders

**Before:**
```tsx
import { PageLoader } from "@/components/ui/loading";

function Page() {
  if (isLoading) return <PageLoader message="Loading..." />;
  return <Content />;
}
```

**After:**
```tsx
import { SkeletonPageLayout } from "@/components/ui/loading";

function Page() {
  if (isLoading) return <SkeletonPageLayout />;
  return <Content />;
}
```

### 2. Replace Inline Loaders

**Before:**
```tsx
import { ClarityLoader, InlineLoader } from "@/components/ui/loading";

// AI thinking
<ClarityLoader size="sm" message="Thinking..." />

// Button loading
<InlineLoader action="submit" />
```

**After:**
```tsx
import { ThinkingIndicator } from "@/components/ui/loading";

// AI thinking
<ThinkingIndicator message="Thinking" />

// Button loading (keep minimal)
<ThinkingIndicator />
```

### 3. Progressive Loading Strategy

**Full Page Progressive Loading:**
```tsx
import { ProgressivePageLoader } from "@/components/ui/loading";

function App() {
  return (
    <ProgressivePageLoader type="page" duration={300}>
      <YourContent />
    </ProgressivePageLoader>
  );
}
```

**Data Fetching with Skeletons:**
```tsx
import { DataProgressiveLoader, SkeletonVideoGrid } from "@/components/ui/loading";

function VideoList() {
  const { data, isLoading, error } = useVideos();
  
  return (
    <DataProgressiveLoader
      data={data}
      isLoading={isLoading}
      error={error}
      skeleton={<SkeletonVideoGrid count={6} />}
    >
      {(videos) => <VideoGrid videos={videos} />}
    </DataProgressiveLoader>
  );
}
```

### 4. Content-Specific Skeletons

**Video Grids:**
```tsx
import { SkeletonVideoGrid } from "@/components/ui/loading";

// While loading videos
<SkeletonVideoGrid count={6} />
```

**Chat Messages:**
```tsx
import { SkeletonChatList } from "@/components/ui/loading";

// While loading messages
<SkeletonChatList count={4} />
```

**Cards/Content:**
```tsx
import { SkeletonCard } from "@/components/ui/loading";

// While loading card content
<SkeletonCard />
```

## Progressive Loading Stages

### Stage 1: Skeleton (0-100ms)
- Show skeleton layout immediately
- Maintain spatial layout
- Provide immediate visual feedback

### Stage 2: Partial (100-300ms)
- Show shell with navigation/header
- Display thinking indicators for loading sections
- Keep user oriented

### Stage 3: Complete (300ms+)
- Fade in actual content
- Smooth transition from skeleton
- Remove all loading states

## Best Practices

### ✅ Do This

1. **Use skeletons for layouts**
   ```tsx
   <SkeletonPageLayout /> // Not <PageLoader />
   ```

2. **Use thinking dots for AI**
   ```tsx
   <ThinkingIndicator message="Analyzing" />
   ```

3. **Match skeleton to content shape**
   ```tsx
   // Video grid loading
   <SkeletonVideoGrid count={6} />
   
   // Chat loading  
   <SkeletonChatList count={3} />
   ```

4. **Progressive disclosure**
   ```tsx
   <ProgressiveContentLoader
     isLoading={isLoading}
     type="video-grid"
     skeletonCount={6}
   >
     <VideoGrid videos={videos} />
   </ProgressiveContentLoader>
   ```

### ❌ Don't Do This

1. **Don't use spinners**
   ```tsx
   <Loader2 className="animate-spin" /> // ❌
   <ClarityLoader size="lg" />          // ❌
   ```

2. **Don't show generic "Loading..."**
   ```tsx
   <div>Loading...</div>                // ❌
   ```

3. **Don't block entire UI**
   ```tsx
   // ❌ Full screen spinner
   <div className="fixed inset-0 flex items-center justify-center">
     <Spinner />
   </div>
   ```

4. **Don't use progress bars for indeterminate loads**
   ```tsx
   <Progress value={undefined} />       // ❌
   ```

## Component Migration Map

| Old Component | New Component | Use Case |
|--------------|---------------|----------|
| `PageLoader` | `SkeletonPageLayout` | Full page loading |
| `SectionLoader` | `SkeletonMainContent` | Content sections |
| `InlineLoader` | `ThinkingIndicator` | AI processing |
| `ClarityLoader` | `ThinkingIndicator` | General loading |
| `LoadingIndicator` | `ThinkingIndicator` | Chat/AI states |

## Advanced Usage

### Route Transitions
```tsx
import { RouteTransitionLoader } from "@/components/ui/loading";

function Layout({ children, isTransitioning }) {
  return (
    <RouteTransitionLoader 
      isTransitioning={isTransitioning}
      persistentElements={<Header />}
    >
      {children}
    </RouteTransitionLoader>
  );
}
```

### Custom Skeletons
```tsx
import { SkeletonElement } from "@/components/ui/loading";

function CustomSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonElement className="h-8 w-48" />
      <SkeletonElement className="h-64 w-full" />
      <div className="flex gap-4">
        <SkeletonElement className="h-10 w-24" />
        <SkeletonElement className="h-10 w-24" />
      </div>
    </div>
  );
}
```

### Progressive Loading Hook
```tsx
import { useProgressiveLoading } from "@/components/ui/loading";

function MyComponent() {
  const { stage, isLoading, startLoading, finishLoading } = useProgressiveLoading();
  
  useEffect(() => {
    startLoading();
    fetchData().then(() => finishLoading());
  }, []);
  
  if (stage === "skeleton") return <MySkeleton />;
  if (stage === "partial") return <MyPartialContent />;
  return <MyFullContent />;
}
```

## Performance Benefits

1. **Perceived Speed**: Skeletons feel 30% faster than spinners
2. **No Layout Shift**: Content appears in expected locations
3. **Maintained Context**: Users never lose spatial orientation
4. **Progressive Enhancement**: Page becomes interactive in stages
5. **Reduced Cognitive Load**: Shape hints at coming content

## Accessibility

- Skeletons include `aria-busy` and `role="status"`
- Reduced motion support via CSS `prefers-reduced-motion`
- Screen reader announcements for state changes
- Keyboard navigation maintained throughout loading

## CSS Classes Added

```css
/* Base skeleton with shimmer */
.skeleton {
  background: linear-gradient(90deg, var(--muted) 25%, var(--muted-foreground/10) 50%, var(--muted) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius);
}

/* Variants */
.skeleton-text { height: 1rem; }
.skeleton-title { height: 1.5rem; }
.skeleton-button { height: 2.25rem; }
.skeleton-avatar { border-radius: 50%; }
```

## Next Steps

1. **Test all loading states** across the application
2. **Update any remaining ClarityLoader usage** to ThinkingIndicator
3. **Add progressive loading** to major data-heavy pages
4. **Monitor performance metrics** for perceived speed improvements
5. **Consider preloading strategies** for predictable user flows

This migration transforms the loading experience from disruptive spinners to helpful, context-preserving skeletons that guide users through the loading process while maintaining spatial awareness and perceived performance.