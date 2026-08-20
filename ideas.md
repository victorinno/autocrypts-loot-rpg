# AutoCrypts — Design Direction

## Three Directions Considered

| Theme Name | Very Brief Intro | Probability |
|---|---|---:|
| Catacomb Field Manual | A tactile explorer’s field notebook becomes the control surface for a living crypt: parchment, mineral stains, hand-inked geometry, and practical dungeon annotations. It makes automation feel like deliberate expedition planning rather than passive idling. | 0.07 |
| Votive Brass Reliquary | A theatrical shrine interface of dark brass, stained glass, and small candlelit relics, built around ceremonial preparation before each room. It treats skills as sacred mechanisms and loot as offerings. | 0.04 |
| Basalt Signal Station | A severe subterranean command post of basalt slabs, signal flags, and restrained electric glyphs, with a utilitarian combat telemetry focus. It makes combo logic read like field engineering. | 0.09 |

## Chosen Direction — Modernist Dungeon Ledger

### Design Movement

The game uses the visual language of a **Swiss modernist tactical ledger**: exact alignment, quiet surfaces, disciplined type, black ink lines, and sparse semantic color. It replaces decoration with hierarchy, so the player can read an automated combat doctrine at a glance.

### Core Principles

1. **Purposeful reduction.** Every border, icon, meter, and label communicates a game decision; no decorative imagery is used.
2. **Asymmetric expedition desk.** Information gathers around an offset room tableau rather than a centered card grid, producing an active planning surface.
3. **Readable urgency.** Dark typography, clear meters, elemental color chips, and high-contrast numerical changes make automated action intelligible at a glance.
4. **Visible causality.** When an automation condition fires or a combo is completed, the relevant rule, skill rune, and damage flavor visibly connect.

### Color Philosophy

The base is graphite, bone white, and cool gray, creating a calm working surface for planning. Bright semantic pigments are reserved for game meaning: ember orange for fire, mineral teal for frost, electric blue for arcane, acid green for poison, and iron red for physical force. Gold belongs to loot and earned upgrades only, making it feel scarce.

### Layout Paradigm

The interface is a **three-part expedition desk**. A narrow left ledger holds the adventurer and current loadout. The center is a tall geometric room tableau where automated combat unfolds. A right margin stacks rule blocks, combo links, and combat events. On small screens, these stack around the room tableau in gameplay order rather than becoming an unrelated card gallery.

### Signature Elements

1. **Route thread:** a broken black line connecting the previous room, current room, and next unknown room.
2. **Elemental marks:** precise pigment discs with glyphs, repeated in skills, damage logs, and combo states.
3. **Ledger rails:** thin lines and numbered blocks that establish a strict, scan-friendly visual rhythm.

### Interaction Philosophy

The player does not micromanage every attack. They prepare a combat doctrine: select skills, tune ordered priority rules, and define combo links. Clicking a combat control should feel like placing a clear instruction in a tactical ledger; each change immediately affects a small predictive readout.

### Animation

Automated attacks resolve in short, legible pulses: combat silhouettes move by a few pixels, strikes trace a brief line, and elemental impacts leave a 220ms pigment burst. A combo travels along a thin colored thread from one ability rune to the next. New items enter with a compact 180ms vertical reveal. Room transitions use a 260ms geometric shift and fade. All nonessential motion must respect reduced-motion preferences.

### Typography System

**Space Grotesk** provides the expressive display voice for room names, class names, and big reward moments. **IBM Plex Mono** is the field-system typeface for timers, damage, skill rule expressions, and item stats. Body labels use **DM Sans**, with short sentence fragments rather than dense narrative blocks. Headlines should be clean and compact; numbers should always be monospaced.

### Brand Essence

**AutoCrypts is a build-first dungeon expedition for players who want combat to execute their tactical doctrine, not replace it.** Personality: **methodical, stark, precise**.

### Brand Voice

Headlines sound like notes from an experienced delver: direct, specific, and slightly mysterious. CTAs sound like tactical choices, not generic onboarding.

> “Mark the doctrine. The crypt will test it.”

> “If the target burns, chain Frost Lance.”

### Wordmark & Logo

The mark is a compact **open dungeon doorway nested inside a four-point compass**, constructed from a thick graphite line and a single vermilion point. Until visual assets are introduced, the symbol is assembled from CSS geometry and an icon rather than an image file.

### Signature Brand Color

**Crypt Vermilion — #D95B38.** A mineral orange-red used only for the active room marker, urgent hits, and the brand’s compass spark.

## Style Decisions

Crypt Vermilion is now restricted to the compass spark, current route node, active room urgency, and immediate combat-impact moments. The route thread is treated as a primary brand motif, linking explored rooms, the current room, unknown depth, and the active doctrine through broken ledger-line geometry. Space Grotesk owns class and room moments, IBM Plex Mono owns rules, numbers, and logs, while DM Sans is reserved for compact explanatory copy.

The doorway-compass mark must recur at command points, especially route and room-state moments. Rule builders must behave and look like printed tactical strips rather than browser forms: mono expressions, sharp rails, encoded condition/action fields, and rule-order markers. The room tableau must retain a visible doctrine-to-room signal and broken route geometry even when a room is idle.

The route thread is the dominant AutoCrypts signature: it must visibly connect a prior marker, the current breach node, unknown depth, and doctrine synchronization across every room state. Idle tableaux are active planning diagrams, with a room boundary, route geometry, state cards, and a next-breach directive rather than unused blank space. Display headlines use Space Grotesk at command moments; pigments remain semantic, with vermilion for breach/impact, teal only for sync or frost, and gold only for earned progression.
