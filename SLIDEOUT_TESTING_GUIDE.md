# Slideout Panel Testing Guide

## Automated Tests (No Authentication Required)

Run the Playwright tests that verify our CSS animations and styling:

```bash
npm run test:e2e tests/slideout-animation.spec.ts
```

This will test:
- ✅ Claude cubic-bezier timing function (0.32, 0.72, 0, 1)
- ✅ Correct animation durations (400ms open, 250ms close)
- ✅ 52px standardized header height
- ✅ Smooth transform transitions
- ✅ CSS class application

## Manual Testing for Authenticated Pages

Since the collections page requires Google Auth, here's a manual testing checklist:

### 1. Collections Page Slideout Testing

1. **Navigate to Collections Page**
   ```
   http://localhost:3000/collections
   ```

2. **Open a Video Slideout**
   - Click on any video thumbnail/card in the collections grid
   - The slideout should slide in smoothly from the right

3. **Verify Animation Behavior**
   - [ ] Slideout slides in with smooth, Claude-style easing (not jarring or instant)
   - [ ] Animation takes approximately 400ms to complete
   - [ ] No visual glitches or jumping during animation

4. **Check Header Consistency**
   - [ ] Header height is exactly 52px (use browser dev tools to measure)
   - [ ] Chevron close button (>>) appears on the left side of header
   - [ ] Header has consistent border-bottom styling
   - [ ] Header content (badges, buttons) are properly aligned

5. **Test Close Behavior**
   - [ ] Click chevron close button - slideout closes smoothly
   - [ ] Press Escape key - slideout closes smoothly  
   - [ ] Closing animation takes approximately 250ms
   - [ ] Panel slides out completely (translateX(100%))

### 2. Other Pages with Slideouts

Test the same behavior on these pages:

#### Personas Page (`/personas`)
- Click on any persona card to open slideout
- Verify header shows persona avatar + name with 52px height

#### Content Inbox (`/content-inbox` or similar)
- Open content viewer slideout
- Verify "Content Details" header with 52px height

#### Write Chat Page (`/write` or chat interface)
- Generate content that opens in slideout (scripts, editor content)
- Verify header behavior for both editor and script panels

### 3. Cross-Browser Testing

Test on all browsers:
- [ ] Chrome/Chromium - smooth animations
- [ ] Firefox - smooth animations  
- [ ] Safari/Webkit - smooth animations

### 4. Responsive Behavior

Test slideout at different screen sizes:
- [ ] Desktop (1200px+) - 600px width, side-by-side
- [ ] Tablet (768px-1200px) - overlay with backdrop
- [ ] Mobile (<768px) - full screen takeover

### 5. Animation Quality Checklist

For each slideout interaction, verify:
- [ ] No janky or stuttering animations
- [ ] Smooth easing curve (not linear or too bouncy)
- [ ] Consistent timing across all slideouts
- [ ] Proper z-index layering
- [ ] No layout shift when opening/closing

## CSS Developer Tools Verification

1. Open browser dev tools
2. Inspect slideout panel element
3. Check computed styles include:
   ```css
   transition-timing-function: cubic-bezier(0.32, 0.72, 0, 1)
   transition-duration: 0.4s (opening) / 0.25s (closing)
   transition-property: transform
   ```

## Debugging Animation Issues

If animations appear broken or not smooth:

1. **Check CSS Classes Applied**
   - Slideout should have `slideout-claude-transition` class
   - Should have `opening` class when opening
   - Should have `closing` class when closing

2. **Verify CSS Variables**
   - Inspect `:root` to ensure `--ease-claude` is defined
   - Check `--slideout-duration` and `--slideout-close-duration`

3. **Check Transform Values**
   - Opening: `transform: translateX(0)`
   - Closing: `transform: translateX(100%)`

## Performance Testing

Monitor performance during slideout animations:
- [ ] No dropped frames during animation
- [ ] Smooth 60fps animation
- [ ] No memory leaks from repeated open/close
- [ ] Good performance on slower devices

## Success Criteria

✅ All slideouts use consistent 52px headers
✅ All slideouts have chevron close button on left  
✅ All animations use Claude cubic-bezier easing
✅ Opening animations take 400ms, closing takes 250ms
✅ No visual glitches or layout shifts
✅ Responsive behavior works correctly
✅ Keyboard (Escape) and click interactions work
✅ Cross-browser compatibility confirmed

## Automated Test Results Location

After running tests, check results at:
- Terminal output for pass/fail summary
- `playwright-report/` directory for detailed HTML report
- Screenshots and videos in `test-results/` if any tests fail