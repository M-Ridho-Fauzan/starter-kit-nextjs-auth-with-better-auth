# catatan

## Catatan sesi percakapan

### sesi tgl 22 june 2026 (sesion public/shared)

- `opencode -s ses_1130e160affeT25byvoI78ISua`
- [link shared](https://opncd.ai/share/oI78ISua).

- `opencode -s ses_10bea5c92ffeY1UcpkCj5qgL1T`

## instruction fo clude workflow

```markdown
=== PEMBUKA PROJECT BARU ===

## Context

[2-3 kalimat deskripsi]

## Stack

[tech stack]

## Status saat ini

[sudah ada / belum ada]

## Yang saya butuhkan sekarang

[satu hal spesifik]

## Output yang saya minta

[instruksi / evaluasi / review / dll]

=== PERTENGAHAN PROJECT ===
[Fase X item Y — nama item]
[paste raw output OpenCode]
Bagaimana? / Ada masalah? / Selanjutnya apa?

=== SAAT ADA DESIGN DOC ===
[paste design doc]
Bagaimana? [approve ke builder / perlu revisi?]

=== SAAT MINTA INSTRUKSI ===
Berikan instruksi untuk [task spesifik] ke [build/plan/subagent].
```

---

### contoh isi

```markdown
## Context

Membangun Next.js Auth Starter Kit mirip Laravel Jetstream/Breeze,
berbasis Better Auth, config-driven via auth.config.ts tunggal.

## Stack

Next.js 15, Better Auth, TypeScript strict, shadcn/ui, Tailwind v4.
Multi-adapter: Prisma, Drizzle, Kysely.

## Status saat ini

Folder kosong. Sudah ada:

- opencode.jsonc (plan: gemini-2.5-pro, build: deepseek-v4-flash)
- .agents/ dengan agents/_.md dan commands/_.md masih kosong
- skills: create-auth-skill, docs-writing, find-skills

## Yang saya butuhkan

Isi lengkap untuk semua file .agents/ dan AGENTS.md dan PLAN.md,
siap di-copy paste tanpa perlu bolak-balik.

## Output yang saya minta

Isi file lengkap, siap paste, dengan penjelasan singkat per file.
```
