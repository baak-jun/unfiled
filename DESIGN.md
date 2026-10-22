# 미결 / UNFILED — 진술실 04

## Reference and interpretation

Source: [Noir Detetive DESIGN.md](https://designmd.app/library/noir-detetive/), read in full on 2026-10-22, including colors, typography, layout, components, motion, and Do's and Don'ts. The source contains no separate Known Gaps section. This file is an original project adaptation, not a reproduction of the reference document or its sample landing-page prompt.

Source-derived direction: off-black, fog white, streetlamp yellow; hard light and blind shadows; restrained palette; asymmetric layout; horizontal divisions. The source is a cinematic landing-page reference, not an investigation-game interaction specification.

## Project decisions

- A case-file interface, not counseling, wellness, or a marketing page.
- Charcoal shell `#0f0f0f`, readable transcript `#d4d4d4`, yellow focus `#e8c547`.
- Paper deduction sheet `#d6d3c4` with dark ink `#25291f` is our game-specific adaptation. It separates hypotheses from recorded testimony.
- Body uses Korean system sans, display uses Batang serif, metadata uses Consolas. The reference's Special Elite has no suitable Korean coverage and is not imported.
- 8px spacing rhythm; asymmetric case / testimony / deduction columns. Panels share borders rather than floating as rounded cards.
- No bubble chat, decorative emoji, healing language, gradients behind text, glowing UI, or landing-page feature cards.
- Atmospheric illustration stays in the scene image. No fog, rain, or typewriter animations over readable text. Motion is brief and respects reduced motion.
- Breakpoints: 1050px places deduction below; 650px stacks the complete investigation flow. Controls remain readable and keyboard accessible.
- Unsolved: slot number and submission action. Solved: check mark and confirmed fact. Mistakes produce a transcript notice without losing progress.

## Narrative contract

Players uncover hidden actions, evidence locations, and concealment motives. NPCs are witnesses with fixed facts and evasive testimony. The final report reconstructs the evidence chain. There is no psychological diagnosis, counseling mode, empathy score, or self-reflection prompt.

## Assets and limitations

The interrogation-room SVG is original project artwork. No downloaded photos, brand marks, or source-site assets are redistributed. The three cases currently share this room illustration. The current case pool is authored and randomly selected, not AI-generated. Provider dialogue requires a local user-provided API key. Raon live dialogue was verified; other providers are mock-tested only.
