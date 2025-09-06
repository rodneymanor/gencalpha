# Gen C Alpha - Project Memory Bank

## Last Updated: September 6, 2025

## Project Overview
**Name:** Gen C Alpha  
**Type:** Next.js 15 Script Writing Application  
**Framework:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4  
**Database:** Firebase Firestore  
**Auth:** Firebase Auth with custom AuthProvider  
**Deployment:** Vercel  

## Current App Status

### Core Features
1. **Script Generation System**
   - Streamlined script writer with multiple views (Input, Generating, Transcribing, Editing)
   - AI-powered script generation with persona selection
   - Quick generators and templates for common content types
   - Script analysis and complexity metrics
   - Word count tracking and save functionality

2. **Authentication System**
   - Firebase Auth integration
   - AuthProvider with context-based user management
   - Protected routes with AuthRedirectGuard
   - V1 login page (simplified for deployment stability)

3. **User Interface**
   - Clarity Design System with numbered color variants (50-950)
   - Soft UI principles with subtle shadows and transitions
   - Component hierarchy: Ghost → Soft → Solid buttons
   - 4px spacing grid system
   - Custom CSS variables in globals.css

### Recent Changes (September 6, 2025)
1. **Input Form Updates**
   - Disabled RSS feed/trending topics dropdown completely
   - Removed autofocus on page load for input field
   - Cleaner initial user experience without automatic dropdowns

### File Structure
```
src/
├── app/
│   ├── (main)/
│   │   └── write/         # Main script writing page
│   ├── (v1auth)/          # V1 authentication pages
│   ├── api/               # API routes (microservices pattern)
│   └── globals.css        # Design system tokens
├── components/
│   ├── script-generation/ # Script generation components
│   │   ├── components/
│   │   │   └── views/    # Different view states
│   │   ├── hooks/        # Custom React hooks
│   │   └── types/        # TypeScript definitions
│   ├── ChatInterface/    # Chat input components
│   ├── ui/              # Reusable UI components
│   └── providers/       # Context providers
└── lib/
    ├── firebase/        # Firebase configuration
    └── utils/          # Utility functions
```

### API Architecture
- **Pattern:** Microservices with single responsibility
- **Structure:** `/api/[domain]/[action]/route.ts`
- **Orchestrator:** Complex workflows via coordinator routes
- **Error Handling:** Graceful fallbacks for all services

### Design System
- **Colors:** Neutral, Primary, Brand, Success, Warning, Destructive
- **Scales:** 50-950 numbered variants with perceptual lightness
- **Typography:** System fonts (sans, serif, mono)
- **Borders:** Custom radius variables (--radius-card, --radius-button)
- **Shadows:** Soft drop shadow and input shadow variables
- **Animations:** 150-200ms transitions, cubic-bezier easing

### Development Environment
- **Node Version:** Compatible with Next.js 15
- **Package Manager:** npm
- **Development Server:** `npm run dev` (running on background)
- **Build Command:** `npm run build`
- **Lint/Type Check:** Available but commands need verification

### Known Issues & TODOs
1. ~~RSS feed dropdown appearing on page load~~ ✅ Fixed
2. ~~Autofocus causing unwanted behavior~~ ✅ Fixed
3. Feature flags system set up but not actively used
4. Some deployment issues resolved with V1 login page

### Configuration Files
- **CLAUDE.md:** Project instructions and design rules
- **COLOR-SYSTEM.md:** Color generation system documentation
- **HYBRID-TOKENS.md:** Design token strategy
- **.env.local:** Firebase and API keys (not tracked)

### Git Status
- **Current Branch:** main
- **Recent Commits:**
  - fix: remove DotPattern animation from V1 login
  - fix: create minimal working root page
  - add simple test page to debug deployment
  - fix: switch to V1 login page
  - fix: add AuthProvider to write page layout

### Deployment
- **Platform:** Vercel
- **URL:** [Production URL if available]
- **Environment Variables:** Set in Vercel dashboard
- **Build Settings:** Next.js defaults

### Testing Approach
- Component testing with appropriate framework
- `/theme-tester` route for color system testing
- Manual testing for user flows

### Performance Optimizations
- Lazy loading for heavy components
- Optimized bundle size with code splitting
- Cached trending topics with 15-minute TTL
- Efficient re-renders with proper React hooks

### Security Considerations
- Firebase security rules in place
- Environment variables for sensitive data
- No hardcoded secrets in codebase
- Secure authentication flow

## Next Steps & Priorities
1. Replace RSS feed feature with new functionality
2. Implement proper lint and type-check commands
3. Enhance script generation with more personas
4. Add user dashboard for saved scripts
5. Implement collaborative features

## Developer Notes
- Always follow Clarity Design System principles
- Use numbered color variants (e.g., neutral-200, primary-500)
- Maintain 4px grid spacing
- Prefer editing existing files over creating new ones
- Commit with conventional commit messages
- Test thoroughly before deployment

---
*This memory bank serves as a living document of the project state and should be updated regularly with significant changes.*