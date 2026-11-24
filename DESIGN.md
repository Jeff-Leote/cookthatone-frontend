---
name: CookthatOne
description: Planification de repas, stock et courses dans une interface sobre et directe
colors:
  background: "#0a0a0a"
  surface: "#141414"
  surface-raised: "#1a1a1a"
  foreground: "#ffffff"
  foreground-secondary: "#a3a3a3"
  border: "#2a2a2a"
  border-strong: "#404040"
  accent: "#c8ff3e"
  accent-foreground: "#0a0a0a"
  danger: "#f87171"
  success: "#4ade80"
typography:
  display:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "normal"
  headline:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.3
  title:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.05em"
rounded:
  xs: "2px"
  sm: "6px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  button-primary-hover:
    backgroundColor: "#b8ef28"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.danger}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground-secondary}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  input-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
---

# Design System: CookthatOne

## Overview

**Creative North Star: "Le Carnet de Cuisinier"**

CookthatOne est un outil de cuisine, pas une vitrine. Son identité visuelle part d'un carnet de notes professionnel : des pages où seul l'essentiel tranche (sombres ou claires selon le système), un accent réservé aux actions qui méritent l'attention (lime sur fond sombre, vert foncé sur fond clair), une typographie structurée qui organise l'information sans l'habiller. L'interface s'efface derrière les données de l'utilisateur — ses recettes, son stock, sa semaine.

Le système a deux thèmes qui suivent le réglage du système (`prefers-color-scheme`), sans bouton ni stockage : tout se joue en CSS, donc sans clignotement au chargement. Le sombre est la valeur par défaut : un fond #0a0a0a et des surfaces #141414 / #1a1a1a créent une hiérarchie lisible sans avoir recours aux ombres. Le clair redéfinit les mêmes jetons (fond #fafafa, surfaces #ffffff / #f4f4f5). L'accent (lime #c8ff3e en sombre, vert foncé #3f6212 en clair) fonctionne comme un marqueur sur le carnet : il n'apparaît que sur les éléments actifs et les appels à l'action, et sa rareté en fait le signal.

Les composants sont épurés mais humains : coins arrondis modérés (8-12 px), corps en Inter pour la lisibilité dense, titres en Outfit pour signaler la structure. Aucune ombre portée, pas de dégradé, pas d'animation décorative — uniquement des retours d'état brefs sur les éléments interactifs.

**Key Characteristics:**

- Deux thèmes qui suivent le système : fond quasi-noir ou quasi-blanc, surfaces légèrement surélevées par la luminosité
- Accent unique (lime en sombre, vert foncé en clair), réservé aux actions et aux indicateurs de focus
- Zéro ombre portée : la profondeur est tonale, pas physique
- Mobile-first, dense mais lisible, cibles 44 px minimum
- Icônes SVG (Lucide React) uniquement, aucun emoji dans l'interface

## Colors

Palette monochrome à accent unique : le lime #c8ff3e (thème sombre) ou son équivalent vert foncé #3f6212 (thème clair) est le seul chroma de tout le système. Les valeurs ci-dessous sont celles du thème sombre ; le thème clair est décrit plus bas.

### Primary

- **Lime Actif** (#c8ff3e) : accent exclusif du thème sombre. Bouton principal, anneau de focus (16,81:1 de contraste sur fond), indicateurs d'état actif. Ne pas diluer avec `opacity` sauf pour les états désactivés et les teintes de fond (`bg-accent/10`, `/15`).

### Neutral

- **Encre Profonde** (#0a0a0a) : couleur de fond `body` et arrière-plan page. Quasi-noir pur.
- **Ardoise Nuit** (#141414) : surface des cartes, panneaux et dialogs.
- **Ardoise Relevée** (#1a1a1a) : surface surélevée — champs en mode non-focus, éléments passifs dans une card.
- **Blanc Page** (#ffffff) : texte principal, valeurs, contenus de premier plan.
- **Gris Carnet** (#a3a3a3) : texte secondaire, placeholders, métadonnées. Contraste 7,85:1 sur fond.
- **Trait de Page** (#2a2a2a) : bordures par défaut — séparateurs, contours de champs inactifs.
- **Trait Fort** (#404040) : bordure hover sur les champs et les éléments interactifs.

### Semantic

- **Alerte** (#f87171) : erreurs de validation, messages destructifs, bouton danger. Jamais pour de la décoration.
- **Succès** (#4ade80) : confirmation d'action réussie (`role="status"`), validation de repas.

### Thème clair

Il s'active quand le système demande un thème clair (`@media (prefers-color-scheme: light)` dans `globals.css`) et redéfinit les mêmes jetons : aucun composant ne change. Contrastes mesurés (WCAG 2.1) sur le fond, sauf mention.

| Jeton                  | Valeur  | Rôle et contraste                                                       |
| ---------------------- | ------- | ----------------------------------------------------------------------- |
| `background`           | #fafafa | Fond de page                                                            |
| `surface`              | #ffffff | Cartes, panneaux, dialogs, champs                                       |
| `surface-raised`       | #f4f4f5 | Surface surélevée, bouton secondaire                                    |
| `foreground`           | #0a0a0a | Texte principal, 18,97:1                                                |
| `foreground-secondary` | #52525b | Texte secondaire, 7,41:1                                                |
| `border`               | #d4d4d8 | Bordures et séparateurs, 1,42:1                                         |
| `border-strong`        | #8c8c95 | Survol des champs et éléments interactifs, 3,19:1                       |
| `accent`               | #3f6212 | Vert foncé : texte 6,78:1, bouton avec texte `accent-foreground` 7,08:1 |
| `accent-foreground`    | #ffffff | Texte sur fond `accent`                                                 |
| `danger`               | #b91c1c | Texte 6,20:1 (4,99:1 minimum sur `bg-danger/10`)                        |
| `success`              | #166534 | Texte 6,83:1                                                            |
| `focus-ring`           | #3f6212 | Anneau de focus, 6,78:1                                                 |

Le voile des dialogs (`backdrop:bg-black/60`) reste sombre dans les deux thèmes.

### Named Rules

**La Règle du Marqueur.** Le lime n'apparaît que là où l'utilisateur peut agir ou doit regarder. Sur une page donnée, il occupe ≤10 % de la surface visible. Sa rareté est son signal.

**La Règle Sémantique.** Danger (#f87171 en sombre, #b91c1c en clair) et succès (#4ade80 en sombre, #166534 en clair) ne sont jamais utilisés comme couleurs décoratives — uniquement pour des états confirmés par la logique applicative.

**La Règle du Lime Clair.** Le lime #c8ff3e n'existe que sur fond sombre. Sur fond clair, le thème utilise le vert plus foncé #3f6212 : un seul jeton `--accent`, dont la valeur change avec le thème, jamais de lime sur du blanc.

## Typography

**Display / Titres :** Outfit (sans-serif, variable weight)
**Corps / Interface :** Inter (sans-serif, variable weight)

**Caractère :** Outfit apporte une structure géométrique légèrement expressive pour signaler la hiérarchie ; Inter garantit une lisibilité maximale dans les listes denses et les formulaires. L'accord joue la complémentarité structurée plutôt que le contraste de style.

### Hierarchy

- **Display** (Outfit, 500, 1.5rem/24px, lh 1.2) : titre de page principal (`<h1>`). Un seul par écran.
- **Headline** (Outfit, 500, 1.25rem/20px, lh 1.3) : titre de section, en-tête de dialog ou de card.
- **Title** (Outfit, 500, 1rem/16px, lh 1.4) : sous-titre, en-tête de groupe, label de navigation.
- **Body** (Inter, 400, 0.875rem/14px, lh 1.5) : contenu principal, descriptions, valeurs de liste. Minimum autorisé : 12px.
- **Label** (Inter, 500, 0.75rem/12px, lh 1.4, lettre-spacing 0.05em, uppercase) : étiquettes de champs, colonnes de tableau, chips de navigation.

### Named Rules

**La Règle du Minimum.** Aucun texte en dessous de 12px (0.75rem) dans l'interface, y compris les labels et les métadonnées. Contraste WCAG AA minimum sur toutes les surfaces.

## Layout

L'interface est structurée en deux zones : sidebar fixe (desktop ≥ sm) + zone principale scrollable, ou bottom nav fixe (mobile). La zone principale utilise un conteneur de largeur max `max-w-5xl` centré avec padding horizontal `px-4` (mobile) / `px-6` (desktop).

Espacement vertical entre sections : `gap-6` (24px). Grille de composants internes : `gap-3` (12px) ou `gap-4` (16px). Le rythme de base est 4px (multiples de 4 partout).

Breakpoint de bascule sidebar/bottom nav : `sm` (640px). En dessous, la sidebar disparaît et la bottom nav prend le bas de l'écran.

Densité : modérée. Les listes tabulaires (stock, ingrédients) utilisent `py-2.5` par ligne. Les formulaires utilisent `gap-4` entre champs. Aucune page n'est vide sans état d'invitation explicite.

## Elevation & Depth

Le système est **plat par principe**. Aucune ombre portée (`box-shadow`) n'est utilisée pour simuler un relief physique. La profondeur est entièrement tonale : en sombre, fond `#0a0a0a`, surface `#141414`, surface surélevée `#1a1a1a` ; en clair, fond `#fafafa`, surface `#ffffff`, surface surélevée `#f4f4f5`. La hiérarchie se lit par la seule luminosité.

Les bordures (`#2a2a2a` → `#404040` au hover/focus) remplacent les ombres pour délimiter les zones interactives. L'anneau de focus (`2px solid` `--focus-ring` : #c8ff3e en sombre, #3f6212 en clair) est la seule élévation visuelle explicite.

### Named Rules

**La Règle du Plat.** Toute tentation d'ajouter une `box-shadow` pour "donner du relief" est un signal que la hiérarchie tonale est cassée — corriger les couleurs de surface plutôt qu'ajouter une ombre.

## Shapes

Langage de forme : coins arrondis modérés et cohérents. Les composants interactifs (boutons, champs, cards, dialogs) utilisent `rounded-lg` (8px) ou `rounded-xl` (12px). Les éléments plus petits (badges, chips, focus ring) utilisent `rounded` (6px) ou `rounded-sm` (2px pour l'anneau de focus uniquement).

Pas de forme asymétrique, pas de clip-path, pas de bord droit (`rounded-none`) sauf dans les tableaux (bordures horizontales uniquement). La cohérence des rayons signale l'appartenance à l'interface.

**La Règle du Rayon Cohérent.** Un bouton et le champ adjacent dans le même formulaire utilisent le même `rounded-lg`. Mélanger `rounded-md` et `rounded-lg` dans la même zone crée une incohérence perceptible sans bénéfice.

## Components

### Buttons

Forme sobre, signal clair par la couleur. Tous les variants partagent la même forme de base : `rounded-lg` (8px), `px-4 py-3` (cible 44px minimum), texte `text-sm font-medium`, `inline-flex items-center gap-2`.

- **Primary :** fond accent (lime `#c8ff3e` en sombre, vert `#3f6212` en clair), texte `accent-foreground` (`#0a0a0a` en sombre, `#ffffff` en clair). Hover : `brightness-95` (légèrement assombri). C'est le seul bouton à fond accent — un par zone d'action maximum.
- **Secondary :** fond `surface-raised` (`#1a1a1a`), texte blanc, bordure `border` (`#2a2a2a`) → `border-strong` (`#404040`) au hover.
- **Danger :** fond transparent, texte rouge (`#f87171`), bordure `danger/40`. Hover : fond `danger/10`. Réservé aux actions destructives dans les dialogs.
- **Ghost :** fond transparent, texte gris secondaire (`#a3a3a3`) → blanc au hover. Pour les actions de second plan (Annuler, navigation retour).
- **Disabled :** `opacity-50`, curseur `not-allowed` sur tous les variants.

### Inputs / Fields

- **Style :** bordure `#2a2a2a`, fond `surface` (`#141414`), texte blanc, `rounded-lg` (8px), `px-3.5 py-2.5` (44px de hauteur).
- **Focus :** bordure passe à `accent` (`#c8ff3e` en sombre, `#3f6212` en clair) — pas d'anneau séparé sur les champs, la bordure suffit.
- **Error :** bordure `danger` (`#f87171`), message d'erreur en rouge (`text-xs text-danger`) avec `role="alert"`.
- **Label :** `text-xs font-medium uppercase tracking-wide text-foreground-secondary`, toujours au-dessus.
- **Hint :** `text-xs text-foreground-secondary`, sous le champ, disparaît en cas d'erreur.

### Cards / Containers

- **Coin :** `rounded-xl` (12px) pour les cards principales, `rounded-lg` (8px) pour les conteneurs secondaires.
- **Fond :** `surface` (`#141414`), jamais `background` (réservé au fond de page).
- **Bordure :** `border border-border` (`#2a2a2a`) — toujours présente pour séparer la card du fond.
- **Padding interne :** `p-4` (16px) ou `p-5` (20px) pour les dialogs.
- **État vide :** bordure en pointillé (`border-dashed`), icône SVG 40px centrée, texte secondaire + lien d'invitation. Jamais de page blanche sans invite.

### Navigation

- **Sidebar (desktop ≥ sm) :** fond `surface` (`#141414`), items `py-3 px-3 rounded-lg`, icône 18px + label `text-sm`. Actif : `bg-accent/10 text-accent`. Hover : `bg-surface-raised`.
- **Bottom nav (mobile) :** fond `surface`, bordure top `border-t border-border`, 5 items avec icône 20px + label `text-xs`. Actif : icône et texte `text-accent`. Hauteur : 56px minimum avec padding sécurisé.
- **Logo :** icône ChefHat (Lucide) + texte "CookthatOne" en Outfit 500.

### Dialogs

Composant `<dialog>` natif (`showModal()`). Fond `surface` (`#141414`), bordure `border-border`, `rounded-xl`, max-width `max-w-sm`. En-tête avec titre en Outfit + bouton fermer (X ghost). Backdrop : `bg-black/60` (dans les deux thèmes). Anneau de focus sur le premier bouton à l'ouverture.

## Do's and Don'ts

### Do:

- **Do** utiliser l'accent (`#c8ff3e` en sombre, `#3f6212` en clair) uniquement pour les actions primaires, l'état actif et le focus — jamais pour la décoration ni les icônes passives.
- **Do** maintenir au moins 44px de hauteur sur toutes les cibles tactiles (`py-3` = 44px avec `text-sm`).
- **Do** utiliser `role="status"` pour les confirmations de succès et `role="alert"` pour les erreurs — les deux sont distincts.
- **Do** afficher un état vide illustré (icône + texte + CTA) sur toute liste ou page pouvant être vide.
- **Do** utiliser `<dialog>` natif avec `showModal()` pour toute modale ou confirmation de suppression.

### Don't:

- **Don't** ajouter une `box-shadow` pour créer du relief — corriger la hiérarchie tonale (fond/surface/surface-raised).
- **Don't** descendre en dessous de 12px pour le texte, même pour les métadonnées ou les labels de tableau.
- **Don't** utiliser des emoji dans l'interface — uniquement des icônes SVG Lucide React avec `aria-hidden="true"`.
- **Don't** mettre du texte lime (#c8ff3e) sur fond blanc ou surface claire — contraste insuffisant ; le thème clair utilise le vert plus foncé #3f6212 via le même jeton `--accent`.
- **Don't** figer une couleur en dur dans un composant, ni ajouter un bouton ou un script de thème : seuls les jetons de `globals.css` portent les couleurs, et le thème suit le système.
- **Don't** utiliser `window.confirm()` — toujours `ConfirmDialog` avec description de ce qui sera perdu.
