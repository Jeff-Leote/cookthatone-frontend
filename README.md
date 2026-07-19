# cookthatone-frontend

Frontend Next.js pour CookthatOne — projet personnel CDA RNCP37873. Consomme l'API REST du
[backend](https://github.com/Jeff-Leote/cookthatone-backend) (voir la skill `cookthatone-api`
côté backend pour le contrat des routes).

Stack : Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Vercel.

## Installation

```bash
npm install
cp .env.local.example .env.local
```

Le backend (`cookthatone-backend`) doit tourner en local sur `localhost:3000` (voir son README).

## Lancer le projet

```bash
npm run dev   # hot-reload, localhost:3001
```

## Qualité

```bash
npm run lint       # ESLint (Next.js + règles React 19 strictes)
npm run typecheck  # tsc --noEmit
npm run build      # build de production
```

## Accessibilité (RGAA)

- Thème sombre unique aligné sur les maquettes (§4.1 du dossier CDA) ; contrastes vérifiés WCAG 2.1
  (accent sur fond : 16,81:1, texte secondaire : 7,80:1 — voir `src/app/globals.css`).
- Indicateur de focus clavier visible partout (`:focus-visible`, jamais `:focus` seul).
- Lien d'évitement vers le contenu principal sur chaque page.
- Formulaires : `<label>` explicitement associé à chaque champ, erreurs reliées par
  `aria-describedby` et annoncées via `role="alert"`.
- Navigation : élément courant marqué par `aria-current="page"`, jamais par la couleur seule.
- `prefers-reduced-motion` respecté pour toutes les transitions.

## Déploiement

Déploiement continu sur Vercel, connecté au dépôt GitHub (push sur `main` → prod, PR → preview).
