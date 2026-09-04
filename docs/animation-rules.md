# Memovix Animation Rules

## Philosophy

Animations exist to improve user experience.

They should communicate:

- Feedback
- State changes
- Navigation
- Focus
- Hierarchy

Never animate simply because it looks cool.

Premium SaaS products feel smooth, not flashy.

---

# Animation Library

Primary Animation Library

- Motion

Component Enhancements

- React Bits

Micro Interactions

- Motion Primitives

Never mix multiple animation libraries for the same component.

---

# Animation Principles

Animations should be:

Fast

Smooth

Subtle

Purposeful

Consistent

Predictable

Avoid distracting users.

---

# Duration

Micro Interaction

100–150ms

Hover

150–200ms

Cards

200–250ms

Dialogs

250–300ms

Page Transition

300–400ms

Never use animations longer than necessary.

---

# Easing

Prefer natural easing.

Avoid bouncy animations for business interfaces.

---

# Allowed Animations

Page transitions

Fade

Slide

Scale

Hover elevation

Button feedback

Accordion

Dialogs

Dropdowns

Tooltips

Skeleton transitions

Toast notifications

AI streaming indicators

Loading placeholders

Command palette

Sidebar expansion

Search interactions

---

# Forbidden Animations

Continuous bouncing

Infinite floating

Rotating icons without meaning

Large parallax effects

Excessive blur transitions

Heavy particle effects

Random motion

Long entrance animations

Animation should never slow down productivity.

---

# Hover Effects

Cards

Small elevation

Soft shadow

Subtle border highlight

Buttons

Small scale

Background transition

Cursor feedback

Icons

Slight opacity

Color transition

Avoid dramatic movement.

---

# Page Transitions

Keep transitions short.

Maintain user orientation.

Never animate every component independently.

Prefer shared layout transitions.

---

# Dialogs

Fade

Scale

Backdrop fade

Focus first interactive element.

---

# Sidebar

Smooth collapse

Smooth expand

No sliding from off-screen on desktop.

Use responsive drawer only for mobile.

---

# Loading States

Prefer skeleton loaders.

Avoid fullscreen spinners.

Loading should preserve layout.

---

# Empty States

Use subtle illustration or icon.

Optional fade animation.

No excessive motion.

---

# AI Components

AI features may have slightly richer interactions.

Examples

Streaming response

Thinking indicator

Typing effect

Semantic search highlights

Citation reveal

Keep AI animations elegant.

Never imitate chat applications unnecessarily.

---

# React Bits Usage

React Bits should be used sparingly.

Recommended Areas

Landing Page Hero

Marketing Sections

Premium Empty States

AI Feature Highlights

Authentication Background

Never use React Bits throughout the dashboard.

The application interface should remain clean.

---

# Motion Primitives Usage

Recommended

Command Palette

Spotlight Search

Floating Toolbar

Context Menu

Dock

Popover

Drawer

Search Overlay

Avoid using Motion Primitives for basic forms or tables.

---

# Accessibility

Respect reduced motion preferences.

Animations must never prevent interaction.

Provide immediate feedback for user actions.

Maintain keyboard accessibility.

---

# Performance

Avoid unnecessary re-renders.

Animate transforms instead of layout properties.

Lazy load animation-heavy components.

Avoid expensive animations on large lists.

---

# Animation Checklist

Before shipping a feature:

✔ Animation improves UX

✔ Animation is smooth

✔ Duration is appropriate

✔ No unnecessary motion

✔ Works on mobile

✔ Accessible

✔ Respects reduced motion

✔ Consistent with existing animations

✔ Performance tested