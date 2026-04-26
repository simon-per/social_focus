# Minimalist Shield

## Project Summary
Minimalist Shield is a Chrome-first browser extension that turns social media from a passive consumption trap into an intentional utility.

The product does this by removing discovery-heavy surfaces such as feeds, stories, reels, shorts, autoplay video, and recommendations, while preserving direct actions such as search, navigation, messages, and intentional page visits.

Primary target:
- Chrome extension with Manifest V3

Secondary target:
- Safari on macOS via Safari Web Extension packaging after Chrome behavior is stable

## Core Product Goal
Allow users to open social media for a specific purpose without getting pulled into algorithmic consumption loops.

The extension should be strict, simple, and fast to use. It should not overwhelm users with dozens of granular settings. The core model is three high-impact modes.

## Protection Modes

### 1. Shorts Only Block
Purpose:
- Remove short-form video entry points while leaving the rest of the platform mostly intact

Behavior:
- Hide YouTube Shorts shelves, tabs, links, and sidebar entries
- Hide Instagram Reels entry points and related short-form surfaces
- Hide Facebook Reels entry points and related short-form surfaces
- Hide X video-heavy rails and similar addictive short-form discovery surfaces where practical

### 2. Feed Block
Purpose:
- Remove the main algorithmic feed while preserving useful navigation and communication features

Behavior:
- Hide or replace the main home feed
- Hide stories and suggested content where relevant
- Prevent clicks into blocked content
- Preserve search, navigation, and direct communication surfaces where practical

### 3. Search Only
Purpose:
- Reduce a platform to deliberate, search-first usage

Behavior:
- Preserve the platform's native search UI
- Hide the home feed, recommendations, stories, reels, shorts, trends, and other discovery surfaces
- Prevent interaction with blocked regions

Important:
- Version 1 should preserve the site's native search experience rather than rebuilding each site into a custom search-only shell
- This is less brittle and has higher ROI than replacing the entire page layout

## Version Scope

### Version 1
- YouTube
- Instagram
- Facebook
- X / Twitter

### Version 2
- TikTok Web
- Reddit
- LinkedIn
- Pinterest
- Threads

## Platform Expectations

### YouTube
- Remove Shorts shelf, Shorts tab, Shorts sidebar entry, and Shorts links
- Hide homepage recommendations in Feed Block and Search Only
- Preserve search
- Allow intentional viewing when the user opens a direct video URL or enters via search results

### Instagram
- Hide home feed posts
- Hide stories row
- Hide reels entry points and reels surfaces
- Preserve search
- In stricter modes, preserve only intentional destinations where feasible

### Facebook
- Hide home feed and suggested content
- Hide stories
- Hide reels and short-form entry points
- Preserve search

### X / Twitter
- Hide the `For You` timeline and similar algorithmic feed surfaces
- Hide autoplay-heavy video rails where practical
- Hide trends and discovery-heavy modules in stricter modes where practical
- Preserve search
- Preserve intentional utilities like messages, notifications, bookmarks, lists, and direct profile navigation where feasible

## UX Principles
- The extension should feel strict and predictable
- If content is blocked, it should feel unavailable rather than half-hidden
- Search and direct utility should remain easy to use
- The product should minimize temptation, not merely reduce it slightly
- The popup should make mode selection obvious in one click

## Technical Direction

### Architecture
- Manifest V3
- Chrome-first implementation
- Content-script-first design
- Service worker only for settings, messaging, and background coordination
- Safari adaptation later through Apple's Safari Web Extension packaging flow

### Core Mechanism
- Static content scripts for known domains
- `MutationObserver` for infinite scroll, SPA navigation, and delayed injections
- CSS-first blocking at early load
- JavaScript cleanup after initial paint

### Anti-Flicker Strategy
- Inject blocking CSS as early as possible, ideally at `document_start`
- Prefer immediate hiding first, then precise cleanup
- Use JS to remove, replace, or hard-block elements after the initial hide pass

### Persistence
- Use `chrome.storage.local` for mode persistence
- Version 1 assumes settings persist within the local browser profile
- Cross-device sync is not required for Version 1

## Selector Strategy

### Main Risk
The main long-term maintenance burden is selector decay.

Reasons:
- Social platforms frequently change DOM structure
- Some platforms use unstable or generated class names
- Some surfaces render late or rerender often

### Required Approach
Use a centralized selector registry with:
- packaged default selectors inside the extension
- per-site rule groups
- per-mode selector groups
- fallback text or attribute matching where selectors are unstable

### Remote Override Policy
Remote selector updates are allowed only as data, not as logic.

Allowed:
- JSON selector lists
- booleans and flags
- text labels to match
- simple configuration values

Not allowed:
- remote JavaScript
- `eval`
- arbitrary command execution
- a remote mini-language that changes extension behavior beyond packaged logic

Rule:
- All executable logic must remain inside the shipped extension package
- Remote data may refine packaged logic, but must not replace it

## Risks And Constraints
- DOM fragility will require ongoing maintenance
- Search Only behavior will vary by platform
- Overblocking must not break intentional navigation
- Safari support adds packaging and compatibility work, but should not shape Version 1 architecture

## Acceptance Criteria
- YouTube Shorts are removed when Shorts Only Block is enabled
- Instagram reels entry points are removed as much as technically possible when Shorts Only Block is enabled
- Facebook reels entry points are removed as much as technically possible when Shorts Only Block is enabled
- X algorithmic timeline surfaces are hidden in Feed Block while search remains usable
- Feed Block hides the main feed on each Version 1 platform and prevents interaction with blocked content
- Search Only preserves native search while hiding discovery-heavy surfaces
- Settings persist across refreshes and browser restarts

## Recommended Build Order
1. Build the Chrome extension shell with manifest, popup, storage, and shared settings model
2. Implement shared blocking primitives: hide, remove, overlay, click-block, observer lifecycle
3. Implement YouTube Shorts Only
4. Implement YouTube Feed Block and Search Only
5. Implement Instagram blocking modes
6. Implement Facebook blocking modes
7. Implement X / Twitter blocking modes
8. Harden dynamic page handling and anti-flicker behavior
9. Add selector registry structure and optional remote data-only overrides
10. Package for Safari after Chrome is stable

## Implementation Notes For Agents
- Favor simple, explicit logic over clever abstractions early
- Build per-site adapters around shared primitives
- Keep selectors centralized, versioned, and easy to audit
- Prefer native platform search UIs over custom reconstructed layouts in Version 1
- Do not introduce remote logic execution under any circumstances
