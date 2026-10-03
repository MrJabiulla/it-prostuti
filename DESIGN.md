# Prosthuti — Design Rules

- **Design reference:** Follow the approved Home and Question Bank widgets throughout the app. Latest user instructions take priority.
- **Style:** Minimal, clean, content-first UI. Avoid unnecessary decoration, oversized headings, icons, badges, gradients and shadows.
- **Consistency:** Share colors, typography, spacing and controls across Student and Admin interfaces; adapt layouts to their tasks.
- **Colors:** Background `#f6f4ef`, surface `#ffffff`, text `#171f26`, muted `#78838d`, border `#e7e2d8`, primary green `#1f5f4a`. Reuse semantic and dark-theme tokens.
- **Typography:** Hind Siliguri with system fallbacks. Keep clear title, body and metadata hierarchy; support Bengali content, long text and font scaling.
- **Spacing:** Follow existing widget padding, gaps, radii, subtle borders and shadows. Preserve approved widget dimensions.
- **Cards/lists:** Group related rows with titles, subtitles and dividers. Keep subject cards minimal: title and counts.
- **Actions:** Use solid green for primary buttons and subtle or text styles for secondary actions. Avoid competing primary actions.
- **Tabs/search:** Follow Question Bank underline tabs and search/filter patterns; avoid decorative pill tabs.
- **Navigation:** Preserve Home section order and the subject → chapter → topic flow. Keep Study and Practice as distinct contextual actions.
- **Responsive:** Follow existing desktop sidebar, mobile bottom navigation and breakpoints. Wrap or stack content without obscuring actions.
- **Other screens:** Apply the same visual language to revision, routine, progress, settings and practice. Use simple tables, filters and forms for Admin; scope new features separately.
- **States:** Keep loading feedback local and empty/error/success feedback clear. Preserve existing copy, loaders, skeletons and behavior unless explicitly requested otherwise.
- **Accessibility:** Provide visible keyboard focus, labeled controls, readable contrast and comfortable touch targets. Do not communicate status through color alone.
- **Implementation:** Reuse existing widgets. Work on one widget at a time; avoid unnecessary abstractions, dependencies or a new design system.
- **Validation:** Compare mobile and desktop rendering and run relevant technical checks. Passing tests alone does not prove visual parity.
- **Stack direction:** Next.js + TypeScript with Vercel hosting. Student Web uses this stack while preserving the existing CSS.

**Source:** `src/student/app.ts` → `home()`, `bank()` and subject/chapter/topic widgets; `src/app/style.css` → their styles. The UI kit showcase is a secondary reference.
