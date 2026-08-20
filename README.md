# AutoCrypts

AutoCrypts is a **minimalist loot RPG dungeon crawler**. You do not click each attack. Instead, you define an ordered automation doctrine, unlock skill-tree nodes, configure a linked combo, and then advance through an expedition where every room resolves as **nothing, monster, treasure, or trap**.

## Play Loop

Choose a class in the **Class folio**, spend skill points to unlock its next ability, and tune the **Automation doctrine**. The first rule whose condition is true fires on each automatic combat tick. Set the opener and follow-up in **Combo sequence** to receive the linked damage bonus when those skills fire consecutively.

The Warden emphasizes slashing and resilient setups, the Arcanist emphasizes elemental sequencing, and the Ravager favors heavy physical impact. Each run records items, rarity, gold, experience, current room depth, and the complete combat record.

## Development

The app is a React and TypeScript static site with a small procedural Babylon.js room tableau. It intentionally uses **no image assets**: the presentation is built from CSS, typography, geometric markers, and semantic damage colors.

```bash
pnpm install
pnpm dev
```

Use `?demo` at the end of the URL to make the run advance automatically for visual demonstration.

## Deployment

Every push to `main` builds the static app and deploys it through GitHub Pages. The expected public URL is:

`https://victorinno.github.io/autocrypts-loot-rpg/`
