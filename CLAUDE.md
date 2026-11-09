@AGENTS.md

# CookthatOne (interface) : instructions du projet

Interface web de CookthatOne (Next.js 16, React 19, Tailwind 4, TypeScript, npm). **Le protocole complet** (équipe d'agents, déroulement d'un ticket, règles, garde-fous) est défini dans `C:\Users\jeffl\Dev\Jeff-Dev\cookthatone-backend\CLAUDE.md` : il fait foi pour les deux dépôts. Ce fichier n'en reprend que l'essentiel pour une session ouverte ici.

## Ce qui fait foi

Le ticket GitHub du travail en cours, puis `docs/IMPLEMENTATION.md` du dépôt backend (jalons et définition de « terminé »). Le contrat d'API est le skill `cookthatone-api` du dépôt backend. **Ce Next.js n'est pas celui que tu connais** : lire le guide concerné dans `node_modules/next/dist/docs/` avant d'écrire du code.

## Agents (`.claude/agents/`)

`frontend` (ce dépôt), `performance-securite` et `relecteur` (lecture seule). Le backend et la base de données sont dans l'autre dépôt (agents `backend` et `base-de-donnees`). L'orchestrateur est la conversation principale.

## Déroulement d'un ticket d'interface

1. Lire le ticket, **l'assigner à Jeff** si ce n'est pas fait, créer la branche depuis `main` dans ce dossier.
2. Si une route manque : décrire le contrat attendu pour l'agent `backend` (autre dépôt) avant de coder.
3. `frontend` : lint, `typecheck`, `format:check`, `build` verts ; page contrôlée à 375 px et au clavier ; `impeccable detect` sur les fichiers modifiés.
4. `/impeccable audit` en lecture seule (aucun P0 ni P1 ouvert), puis `design:accessibility-review` en fin de jalon. `ui-ux-pro-max` propose, ne décide pas.
5. `performance-securite` puis `relecteur` : **pas de PR tant qu'il y a un bloquant.** Jeff ordonne le commit, la PR et le merge.

## Règles

- **Jamais de commit, de push, de merge, de PR ni de ticket sans l'ordre explicite de Jeff.**
- Commits en français (Conventional Commits), **aucune mention de Claude ni d'une IA**. Une branche par ticket, jamais de worktree ni de copie.
- Rien d'inventé : une information inconnue devient une question à Jeff. Ne jamais lire les valeurs d'un `.env*` (seulement `.env.local.example`).
- Dépôt **public** : aucun ticket ni PR ne décrit une faille de façon exploitable.
- Thèmes, responsive et accessibilité : voir l'agent `frontend` (375, 768, 1024, 1440 px ; cibles de 44 px ; texte de 12 px minimum ; un titre de page par écran).
- Les hooks d'Impeccable restent désactivés ; ne pas lancer `impeccable update` sans demande de Jeff.
