# UI Components Documentation

## Overview

This document describes the new reusable UI components created to standardize the look and feel across all public pages.

## Components

### 1. Navigation Component

**Location:** `src/components/Navigation.tsx`

**Purpose:** Provides consistent navigation across all public pages.

**Features:**
- Sticky top navigation with backdrop blur effect
- Logo and brand identity
- Desktop and mobile responsive menu
- Links to all main public pages (Home, Klasemen, Pertandingan, Jadwal, Tim)
- Admin panel access link
- Mobile hamburger menu with smooth transitions

**Usage:**
```tsx
import Navigation from '@/components/Navigation';

export default function MyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navigation />
      {/* Your page content */}
    </div>
  );
}
```

**Design:**
- Background: `slate-950/95` with backdrop blur
- Border: `slate-800`
- Links: `slate-300` hover to `white`
- Active state: `slate-800` background
- Logo: Gradient from `indigo-600` to `purple-600`

---

### 2. Footer Component

**Location:** `src/components/Footer.tsx`

**Purpose:** Provides consistent footer across all public pages with system information.

**Features:**
- Brand section with logo and description
- Quick navigation links
- System features overview
- Copyright and admin link
- Responsive 3-column grid layout (stacks on mobile)

**Usage:**
```tsx
import Footer from '@/components/Footer';

export default function MyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      {/* Your page content */}
      <Footer />
    </div>
  );
}
```

**Design:**
- Background: `slate-950`
- Border: `slate-800`
- Text: Primary `white`, secondary `slate-400`
- Features list with green checkmarks

---

### 3. PageContainer Component

**Location:** `src/components/PageContainer.tsx`

**Purpose:** Wrapper component that combines Navigation and Footer for consistent page layout.

**Features:**
- Handles min-height and flex layout
- Includes Navigation at top
- Includes Footer at bottom
- Content area grows to fill space

**Usage:**
```tsx
import PageContainer from '@/components/PageContainer';

export default function MyPage() {
  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Your page content */}
      </div>
    </PageContainer>
  );
}
```

---

### 4. PageHeader Component

**Location:** `src/components/PageHeader.tsx`

**Purpose:** Standardized page header with title, subtitle, description, and optional icon/actions.

**Props:**
- `title` (string, required): Main page title
- `subtitle` (string, optional): Small text under title
- `description` (string, optional): Longer description paragraph
- `icon` (ReactNode, optional): Icon to display (typically emoji or SVG)
- `actions` (ReactNode, optional): Action buttons/links to display on the right

**Usage:**
```tsx
import PageHeader from '@/components/PageHeader';

export default function MyPage() {
  return (
    <div>
      <PageHeader
        title="Klasemen Liga"
        subtitle="Season 2024/2025"
        description="Pantau klasemen terkini dan statistik lengkap semua tim"
        icon={<span className="text-2xl">🏆</span>}
        actions={
          <button className="px-4 py-2 bg-indigo-600 rounded-lg">
            Export
          </button>
        }
      />
      {/* Page content */}
    </div>
  );
}
```

**Design:**
- Background: Gradient from `slate-900` via `slate-800` to `slate-900`
- Border: `slate-700` bottom border
- Icon container: Gradient from `indigo-600` to `purple-600`
- Title: 3xl/4xl bold white text
- Subtitle: `slate-400` small text
- Description: `slate-300` regular text

---

### 5. WelcomeSection Component

**Location:** `src/components/WelcomeSection.tsx`

**Purpose:** Informative welcome section for the home page explaining the system's purpose.

**Features:**
- Welcoming header with greeting emoji
- System description
- 4 feature cards highlighting key capabilities:
  - Klasemen Real-time
  - Hasil Pertandingan
  - Jadwal Lengkap
  - Sistem Turnamen
- Usage tip at the bottom
- Fully responsive grid layout

**Usage:**
```tsx
import WelcomeSection from '@/components/WelcomeSection';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <WelcomeSection />
      {/* Other home page content */}
    </div>
  );
}
```

**Design:**
- Background: Gradient with `indigo-900/30`, `purple-900/30`, `pink-900/30`
- Border: `indigo-500/20`
- Feature cards: `slate-800/50` background
- Grid: 1 column on mobile, 2 columns on desktop
- Emoji icons for visual appeal

---

## Color Scheme Standardization

All components use a consistent color palette based on the **Slate** color family:

### Primary Colors
- **Background:** `slate-900` (main), `slate-950` (darker)
- **Cards/Containers:** `slate-800`
- **Borders:** `slate-700`, `slate-800`
- **Text Primary:** `white`
- **Text Secondary:** `slate-300`, `slate-400`

### Accent Colors
- **Primary Gradient:** `indigo-600` to `purple-600`
- **Success:** `green-500/400`
- **Warning:** `yellow-500/400`
- **Info:** `blue-500`

### Interactive States
- **Hover:** `slate-800`, `slate-700`
- **Active:** `slate-800` with specific accent colors
- **Focus:** Ring with `indigo-500` or accent color

---

## Design Principles

1. **Consistency:** All components follow the same color scheme and spacing
2. **Responsiveness:** Mobile-first approach with sm/md/lg breakpoints
3. **Accessibility:** Clear contrast ratios, readable text sizes
4. **Modern:** Backdrop blur, gradients, smooth transitions
5. **Dark Theme:** Optimized for dark mode viewing

---

## Migration Guide

### To add Navigation and Footer to an existing page:

**Before:**
```tsx
export default function MyPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* content */}
    </div>
  );
}
```

**After (Simple):**
```tsx
import PageContainer from '@/components/PageContainer';

export default function MyPage() {
  return (
    <PageContainer>
      {/* content */}
    </PageContainer>
  );
}
```

**After (Custom):**
```tsx
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function MyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navigation />
      <main className="flex-1">
        {/* content */}
      </main>
      <Footer />
    </div>
  );
}
```

---

## Testing

All components have been tested to ensure:
- ✅ Build passes without errors
- ✅ TypeScript compilation successful
- ✅ Responsive on mobile, tablet, and desktop
- ✅ Consistent with existing design language
- ✅ Accessible navigation and interactive elements

---

## Support

For questions or issues with these components, please refer to the project's Copilot Instructions at `.github/copilot-instructions.md` or contact the development team.
