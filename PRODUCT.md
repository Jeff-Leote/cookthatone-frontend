# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personnes ou foyers qui cuisinent régulièrement et veulent organiser leur semaine alimentaire sans jongler entre plusieurs outils. Usage primaire : une personne gère les repas pour un foyer de 1 à 4 personnes — elle planifie la semaine, surveille ce qui reste en stock et prépare ses courses. Vocation déclarée : devenir un produit SaaS public ; les utilisateurs cibles dépassent Jeff lui-même.

## Product Purpose

CookthatOne couvre le cycle complet de l'alimentation domestique : créer et retrouver ses recettes, les planifier sur un calendrier hebdomadaire, suivre son stock d'ingrédients et générer automatiquement la liste de courses à partir de ce qui manque réellement. Le succès, c'est une semaine planifiée en quelques minutes, des courses sans oubli, et un stock qui reflète la réalité.

## Positioning

L'ensemble du cycle — recettes → calendrier → stock → courses — dans une seule interface fluide, sans avoir à exporter, copier-coller ou synchroniser des données entre applications séparées. Un concurrent qui propose uniquement un planificateur ou uniquement une liste de courses ne peut pas tenir cette promesse.

## Operating Context

Usage mobile-first (planification le week-end, consultation en cuisine ou au supermarché), avec accès desktop pour les saisies longues (recettes, ingrédients). Le serveur backend est hébergé sur Render (offre gratuite, réveil à froid de 30-60 s au premier appel). Base de données Supabase en production. Déploiement frontend prévu sur Vercel.

## Capabilities and Constraints

- Authentification JWT (access token 15 min, refresh token 7 jours, cookie httpOnly).
- Gestion de recettes avec ingrédients, étapes et portions.
- Calendrier hebdomadaire avec créneaux repas (matin, midi, soir, snack).
- Stock : quantités, unités, dates de péremption.
- Listes de courses générées depuis le calendrier de la semaine ; validation qui met à jour le stock.
- Import de recette par URL : prévu (J3), pas encore livré.
- Multi-utilisateur : non prévu à ce stade ; un compte = un foyer.
- Offre gratuite Render : aucune sonde permanente ; les quotas sont documentés.

## Brand Commitments

Nom : **CookthatOne**. Voix efficace et sobre : l'interface s'efface derrière l'usage, messages directs, aucun discours marketing. Pas de ton condescendant ni de gamification. Icônes SVG (Lucide React), pas d'emoji dans l'interface.

## Evidence on Hand

Dépôt frontend : `C:\Users\jeffl\Dev\Jeff-Dev\cookthatone-frontend`. Dépôt backend : `C:\Users\jeffl\Dev\Jeff-Dev\cookthatone-backend`. Projet personnel de Jeff Leote, support de sa certification CDA (RNCP 37873). Aucun témoignage, benchmark, ni donnée marketing réelle à ce stade.

## Product Principles

1. **Flux continu** — chaque écran sert le suivant ; recette, calendrier, stock et courses forment un pipeline, pas des modules indépendants.
2. **Réalité du stock** — les suggestions et les listes s'appuient sur ce qui est réellement disponible, pas sur une théorie.
3. **Zéro friction mobile** — toute action courante (valider un repas, cocher un article) doit fonctionner d'une main, en 2 interactions maximum.
4. **Sobre et direct** — aucun élément d'interface ne distrait de la tâche ; les retours d'état sont clairs, pas bavardes.
5. **Évolutif prudemment** — les fonctionnalités avancées (IA, import, multi-compte) sont ajoutées seulement une fois les fondations stables.

## Accessibility & Inclusion

Standard visé : RGAA (niveau AA). Jalons J4 appliqués : texte ≥ 12 px, cibles tactiles ≥ 44 px, icônes SVG accessibles, navigation clavier complète (tablist ARIA, dialog natif), `prefers-reduced-motion` respecté, titres de page uniques par écran. Le thème, sombre ou clair, suit le réglage du système (`prefers-color-scheme`), sans bouton ni stockage ; les contrastes sont mesurés pour les deux thèmes (relevé en tête de `globals.css`).
