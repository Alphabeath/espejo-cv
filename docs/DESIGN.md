```markdown
# Design System Document: The Quiet Authority

## 1. Overview & Creative North Star
The objective of this design system is to transform the high-stress environment of a job interview simulation into a space of clarity, composure, and confidence. Our Creative North Star is **"The Quiet Authority."** 

Unlike generic "SaaS-blue" platforms, this system rejects the cluttered, grid-heavy layouts of traditional software. Instead, it adopts a **High-End Editorial** approach. We use intentional asymmetry, expansive whitespace (the "breath"), and a sophisticated typographic scale to guide the candidate's focus. We break the "template" look by treating the screen not as a set of boxes, but as a series of layered, tactile surfaces that feel as premium as a physical portfolio or a luxury stationery set.

## 2. Colors & Surface Philosophy
The palette is rooted in a spectrum of sophisticated neutrals, anchored by a singular, deep indigo (`primary: #515d82`) that signifies professional depth.

### The "No-Line" Rule
To achieve a truly high-end aesthetic, **1px solid borders are strictly prohibited for sectioning.** We do not "box in" content. Boundaries must be defined through:
*   **Background Shifts:** Using `surface-container-low` against a `surface` background.
*   **Tonal Transitions:** Defining functional areas through subtle changes in luminance rather than structural lines.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine paper. Use the `surface-container` tiers to create organic depth:
*   **Base:** `surface` (#f8f9fa) for the main canvas.
*   **Sections:** `surface-container-low` (#f1f4f6) for large content areas.
*   **Interactive Layers:** `surface-container-lowest` (#ffffff) for the highest-priority cards or focus areas.
*   **Emphasis:** `surface-container-high` (#e3e9ec) for secondary sidebars or utility panels.

### The "Glass & Gradient" Rule
Flat color can feel "default." To inject soul into the UI:
*   **Glassmorphism:** For floating overlays (modals, tooltips), use a semi-transparent `surface` color with a `backdrop-blur` effect. This allows the interview context to peek through, maintaining the user’s sense of place.
*   **Signature Gradients:** For primary CTAs or "Success" states, use a subtle linear gradient from `primary` (#515d82) to `primary_dim` (#455176). This adds a "lift" that flat hex codes cannot achieve.

## 3. Typography
The system utilizes a dual-font strategy to balance editorial character with functional precision.

*   **Display & Headlines (Manrope):** These are our "Statement" tokens. Use `display-lg` (3.5rem) and `headline-md` (1.75rem) with generous letter-spacing to create an authoritative, calm presence. Headlines should often be placed asymmetrically to break the rigid vertical axis.
*   **Body & Labels (Inter):** Inter handles the "work." It provides maximum readability during high-pressure simulations. Use `body-md` (0.875rem) for most content to keep the interface feeling light and airy.
*   **Hierarchy as Identity:** Use `on_surface_variant` (#586064) for secondary metadata. The contrast between the bold, dark Manrope headlines and the soft, grey Inter body text creates a "Sophisticated Journal" feel.

## 4. Elevation & Depth
In "The Quiet Authority," depth is felt, not seen. We move away from traditional drop shadows toward **Tonal Layering.**

### The Layering Principle
Achieve elevation by "stacking." A `surface-container-lowest` card placed on a `surface-container-low` background creates a natural, soft lift. This mimics natural light hitting layered materials.

### Ambient Shadows
If a floating effect is required (e.g., a "Recording" indicator), use an **Ambient Shadow**:
*   **Blur:** 24px - 40px.
*   **Opacity:** 4% - 6%.
*   **Color:** Use a tinted version of `on_surface` (#2b3437) rather than pure black to ensure the shadow feels like a part of the environment.

### The "Ghost Border" Fallback
If a border is absolutely necessary for accessibility (e.g., input fields), use a **Ghost Border**: `outline-variant` (#abb3b7) at **15% opacity**. Never use 100% opaque borders.

## 5. Components

### Buttons
*   **Primary:** Uses the Signature Gradient (`primary` to `primary_dim`). Roundedness: `md` (0.375rem).
*   **Secondary:** `surface-container-highest` background with `on_surface` text. No border.
*   **Tertiary:** Ghost border (15% opacity `outline-variant`) with `on_primary_container` text.

### Input Fields
*   **Style:** Background-only approach using `surface-container-high`. 
*   **States:** On focus, transition the background to `surface-container-highest` and add a subtle `primary` underline (2px). Forgo the 4-sided focus box.
*   **Error:** Use `error` (#9f403d) for the label text and a `error_container` tint for the field background.

### Cards & Lists
*   **The Divider Ban:** Never use horizontal lines to separate list items. Use the **Spacing Scale** (e.g., `spacing-5` or `spacing-6`) to create separation through "void." 
*   **Selection:** A selected card should transition from `surface-container-low` to `surface-container-lowest` and gain a `primary` "accent tab" (4px width) on the left edge.

### Simulation-Specific Components
*   **The Teleprompter/Script:** Uses `surface-container-lowest` with a heavy `backdrop-blur`. Typography: `title-lg` (Inter) for maximum legibility.
*   **Feedback Chips:** Use `secondary_container` (#d7e3ff) with `on_secondary_container` (#43526f) text. Keep corners `full` for a soft, approachable feel.
*   **Composure Meter:** A slim, vertical bar using `primary_fixed_dim` with a `primary` indicator.

## 6. Do’s and Don’ts

### Do:
*   **Embrace the Asymmetric:** Offset your headlines. Leave one side of the layout "heavy" and the other "light" to create a modern, editorial vibe.
*   **Use the Spacing Scale:** Stick strictly to the defined increments (e.g., `8` for section gaps, `3` for internal padding) to maintain a rhythmic "pulse."
*   **Prioritize the "Focus State":** In an interview, the user should only see what matters. Dim non-essential `surface-containers` when the user is answering a question.

### Don’t:
*   **Don't use 100% Black:** Always use `on_surface` (#2b3437) for text to keep the contrast "professional-soft" rather than "harsh-digital."
*   **Don't crowd the edges:** If a component feels tight, double the spacing. "The Quiet Authority" requires room to breathe.
*   **No "Heavy" Shadows:** If you can clearly see where a shadow ends, it's too dark. Blur it out until it’s a whisper.
*   **No Default Borders:** If you find yourself reaching for a `border: 1px solid`, ask if a background color shift or a `spacing-10` gap could solve the problem instead.```