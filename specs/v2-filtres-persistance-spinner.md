# Que qu'on mange ? — V2 : Filtres, persistance et spinner ameliore

## Overview

Evolution de l'app existante (prototype single-page de restaurant randomizer) vers une version plus riche, toujours 100% client-side, usage personnel.

**Objectifs :**
- Restructurer le monolithe `page.tsx` (389 lignes) en composants et hooks dedies
- Ajouter la persistance localStorage avec migration de schema
- Enrichir le modele de donnees (budget, coordonnees GPS)
- Ajouter des filtres combinatoires (cuisine, budget, distance, frequence)
- Corriger le spinner (bug de deceleration) et l'ameliorer (pre-filtres, "C'est parti !")
- Corriger les problemes existants (metadata, theme tokens, accessibilite ciblee)

**Contraintes :**
- Pas de backend, pas de base de donnees, pas de compte utilisateur
- Stack inchangee : Next.js 16.2, React 19, Tailwind CSS v4, shadcn/ui
- UI en francais
- Style visuel existant conserve (glassmorphism, blobs, dark theme)

## Architecture

L'app reste une single-page `'use client'` avec navigation par onglets en state React. Pas de routing Next.js.

### Structure des fichiers

```
app/
  page.tsx              -- shell (~40-50 lignes), gere le tab actif, branche les 3 vues
  layout.tsx            -- corrige: lang="fr", metadata francaise
  globals.css           -- theme Tailwind v4 (ajuster --background dark pour matcher #0e0e1a)

components/
  spinner-view.tsx      -- vue tirage : filtres pre-tirage, animation, carte resultat
  restaurant-list.tsx   -- vue liste : grille de restaurants avec filtres
  restaurant-form.tsx   -- formulaire ajout/edition (champs enrichis)
  filter-bar.tsx        -- barre de filtres partagee entre spinner et liste
  stars.tsx             -- composant Stars (extrait, rendu accessible)
  budget-badge.tsx      -- affichage budget (€, €€, €€€)
  distance-badge.tsx    -- affichage distance ("1.2 km")
  ui/                   -- shadcn components (existants + alert-dialog a installer)

hooks/
  use-restaurants.ts    -- CRUD + persistance localStorage + migration de schema
  use-geolocation.ts    -- wrapper Geolocation API navigateur
  use-filters.ts        -- etat des filtres actifs + logique de filtrage

lib/
  utils.ts              -- cn() (existant, inchange)
  weighted-random.ts    -- fonction weightedRandom extraite
  distance.ts           -- calcul distance Haversine
  storage.ts            -- lecture/ecriture localStorage avec versioning
```

### Flux de donnees

```
data/restaurants.json (seed initial, premier chargement uniquement)
        |
        v
  use-restaurants (hook central)
    - charge depuis localStorage au mount
    - si localStorage vide: seed depuis JSON, migre, ecrit dans localStorage
    - expose: restaurants[], add(), update(), remove(), incrementRecurrence()
    - chaque mutation => setState + ecriture synchrone localStorage
        |
        v
  use-filters (hook de filtrage)
    - recoit restaurants[] en entree
    - gere l'etat des filtres (categories, budget, maxDistance, maxRecurrence)
    - expose: filters, setFilters, filteredRestaurants[]
    - utilise use-geolocation pour le calcul de distance
        |
        v
  Composants UI (spinner-view, restaurant-list)
    - consomment filteredRestaurants[]
    - appellent add/update/remove/incrementRecurrence via props
```

## Components

### page.tsx (shell)

Responsabilite : gerer le state `tab: 'spin' | 'list' | 'edit'`, instancier les hooks `useRestaurants`, `useFilters`, `useGeolocation`, et passer les props aux vues.

Environ 40-50 lignes. Aucune logique metier, aucun style complexe.

### spinner-view.tsx

**Entrees :** `filteredRestaurants[]`, `filters`, `setFilters`, `incrementRecurrence()`, `geolocation`
**Responsabilite :** vue complete du tirage.

Contenu :
- `filter-bar` en haut pour les pre-filtres
- Compteur "X restaurants eligibles"
- Carte de resultat (emoji, nom, categorie, description, appreciation, budget, distance)
- Bouton "Lancer" (desactive si 0 restaurant eligible)
- Apres tirage : boutons "Relancer" et "C'est parti !"
- "C'est parti !" appelle `incrementRecurrence(id)` puis reinitialise l'etat du spinner

**Algorithme de tirage (`lib/weighted-random.ts`) :**
- Formule de poids : `appreciation * (6 - recurrence)`.
- Garde : si `recurrence >= 5`, le poids minimum est `1` (jamais 0, le restaurant reste eligible sauf si exclu par un filtre).
- Animation : ~15 ticks via `setTimeout` recursif (pas `setInterval`). Delai initial 60ms, augmente de ~15ms par tick, dernier tick a ~270ms. Chaque tick affiche un restaurant aleatoire du pool filtre. L'emoji tourne via CSS rotation pendant l'animation.
- Au resultat final : l'emoji s'agrandit, fond gradient colore, nom en fade-in.

### restaurant-list.tsx

**Entrees :** `filteredRestaurants[]`, `filters`, `setFilters`, `onEdit(restaurant)`, `onDelete(id)`, `onAdd()`, `geolocation`
**Responsabilite :** affichage de la liste filtree avec actions CRUD.

Contenu :
- `filter-bar` en haut
- Grille responsive 1-2 colonnes de cartes restaurant
- Chaque carte : emoji, nom, categorie, description, stars, budget badge, distance badge (si geoloc)
- Boutons "Modifier" / "Supprimer" au hover
- "Supprimer" ouvre un `AlertDialog` shadcn de confirmation
- Bouton dashed "+ Ajouter un restaurant" en bas
- Etat vide : message + CTA "Ajouter mon premier restaurant" si 0 restaurants total

### restaurant-form.tsx

**Entrees :** `restaurant?: Restaurant` (null pour ajout), `onSave(data)`, `onCancel()`
**Responsabilite :** formulaire d'ajout ou d'edition.

Champs :
- Emoji (text input, max 4 chars)
- Nom (text input, requis)
- Categorie (text input)
- Description (text input)
- Appreciation (Stars cliquables, 1-5)
- Recurrence (Stars cliquables, 1-5)
- Budget (3 boutons radio : €, €€, €€€)
- Coordonnees : champ adresse (geocodage Nominatim, debounce 500ms, max 5 suggestions) + bouton "Utiliser ma position" (appelle `use-geolocation`)

Validation : seul `name` est requis. Les autres champs ont des valeurs par defaut (`budget: 2`, `coords: null`, `appreciation: 3`, `recurrence: 1`).

### filter-bar.tsx

**Entrees :** `filters`, `setFilters`, `categories: string[]`, `geolocationAvailable: boolean`
**Responsabilite :** barre horizontale scrollable de filtres.

Elements :
- **Cuisine** : dropdown multi-select avec les categories derivees des restaurants existants
- **Budget** : 3 boutons toggle (€, €€, €€€), multi-selection possible
- **Distance** : select avec options (1 km, 2 km, 5 km, 10 km). Grise si geolocation indisponible ou refusee.
- **Frequence max** : select (1 a 5)
- **Reinitialiser** : bouton qui remet tous les filtres a leur etat par defaut (tout afficher)

### stars.tsx

Composant Stars extrait de `page.tsx` et rendu accessible :
- Chaque etoile est un `<button>` avec `aria-label="Note X sur 5"`
- Mode lecture seule (pas de `onChange`) : les etoiles sont des `<span>` avec `aria-label`
- Style inchange (etoiles dorees, opacite pour les inactives)

### budget-badge.tsx

Affiche le budget sous forme de pilule : "€", "€€", ou "€€€" avec un code couleur (vert, orange, rouge).

### distance-badge.tsx

Affiche la distance en km si les coords du restaurant et la position utilisateur sont disponibles. Sinon, n'affiche rien. Format : "1.2 km", "350 m" (en dessous de 1 km).

## Data Model

### Restaurant (v2)

```typescript
interface Restaurant {
  id: string;            // timestamp-based string pour les nouveaux, "1"-"10" pour le seed
  name: string;          // requis, non-vide
  category: string;      // type de cuisine, texte libre
  description: string;   // description courte
  emoji: string;         // emoji visuel, max 4 chars
  appreciation: number;  // 1-5, note personnelle
  recurrence: number;    // 1-5, frequence de visite
  budget: 1 | 2 | 3;    // 1=pas cher, 2=moyen, 3=cher
  coords: {              // coordonnees GPS, null si non renseigne
    lat: number;
    lng: number;
  } | null;
}
```

### Filters

```typescript
interface Filters {
  categories: string[];       // vide = toutes
  budget: (1 | 2 | 3)[];     // vide = tous
  maxDistance: number | null;  // en km, null = pas de filtre
  maxRecurrence: number | null; // 1-5, null = pas de filtre
}
```

### Storage schema

```typescript
interface StorageSchema {
  version: number;        // version courante: 2
  restaurants: Restaurant[];
}
```

Cle localStorage : `"quequonmange_data"`

## Error Handling

### Geolocation

| Situation | Comportement |
|-----------|-------------|
| Navigateur ne supporte pas la geolocation | `use-geolocation` retourne `error: "La geolocalisation n'est pas disponible sur ce navigateur"`. Filtre distance grise dans l'UI. |
| Utilisateur refuse la permission | `error: "Vous avez refuse l'acces a votre position"`. Filtre distance grise. |
| Timeout ou erreur reseau | `error: "Impossible de recuperer votre position"`. Filtre distance grise. |
| Position obtenue | `position: {lat, lng}`, `error: null`. Filtre distance actif. |

Dans tous les cas d'erreur, l'app reste entierement fonctionnelle sans geolocalisation. Le filtre distance est simplement indisponible.

### Geocodage Nominatim

| Situation | Comportement |
|-----------|-------------|
| Erreur reseau | Affiche "Impossible de rechercher l'adresse" sous le champ. Le champ reste utilisable, l'utilisateur peut reessayer. |
| Aucun resultat | Affiche "Aucune adresse trouvee". L'utilisateur peut reformuler. |
| Rate limit (429) | Affiche "Trop de requetes, reessayez dans quelques secondes". Le debounce de 500ms devrait prevenir ce cas. |

Les coordonnees restent optionnelles. L'echec du geocodage n'empeche jamais la sauvegarde du restaurant.

### localStorage

| Situation | Comportement |
|-----------|-------------|
| localStorage indisponible (navigation privee sur certains navigateurs) | L'app fonctionne normalement en memoire, comme la v1. Les donnees sont perdues au refresh. Pas de message d'erreur intrusif. |
| Donnees corrompues (JSON invalide) | Reset complet : supprime la cle, re-seed depuis le JSON initial. Log console.warn. |
| Schema ancien (version < courante) | Migration appliquee automatiquement au chargement. |
| localStorage plein (QuotaExceededError) | Catch l'erreur, log console.warn. L'app continue en memoire, les prochaines ecritures sont silencieusement ignorees. |

### Spinner

| Situation | Comportement |
|-----------|-------------|
| 0 restaurant eligible apres filtrage | Bouton "Lancer" desactive. Message "Aucun restaurant ne correspond aux filtres" avec bouton "Reinitialiser les filtres". |
| 1 restaurant eligible | Le tirage se lance normalement (l'animation joue), le resultat est predetermine. |
| Clic "Lancer" pendant un tirage en cours | Ignore (bouton desactive pendant l'animation). |

### Suppression

Un `AlertDialog` shadcn demande confirmation : "Supprimer [nom] ? Cette action est irreversible." Boutons "Annuler" / "Supprimer".

## Testing Strategy

Aucun framework de test n'est configure et on n'en ajoute pas dans cette iteration. La verification se fait manuellement :

### Verification par composant

| Composant | Comment verifier |
|-----------|-----------------|
| `use-restaurants` | Ajouter, modifier, supprimer un restaurant. Rafraichir la page : les donnees persistent. Vider localStorage manuellement : le seed se recharge. |
| `use-geolocation` | Tester avec permission accordee, refusee, et en mode avion. Verifier que le filtre distance se grise quand la geoloc est indisponible. |
| `use-filters` | Activer chaque filtre individuellement, puis en combinaison. Verifier que le compteur "X restaurants eligibles" est correct. Reinitialiser : tout reapparait. |
| `filter-bar` | Verifier que les categories listees correspondent aux restaurants existants. Ajouter un restaurant avec une nouvelle categorie : elle doit apparaitre dans le dropdown. |
| `spinner-view` | Lancer un tirage : l'animation decelere visiblement. Le resultat affiche tous les champs. "C'est parti !" incremente la recurrence (verifiable dans la liste). "Relancer" refait un tirage. |
| `restaurant-form` | Creer un restaurant avec tous les champs. Modifier un existant. Tester le geocodage d'adresse. Tester "Utiliser ma position". Verifier que sauvegarder sans nom est impossible. |
| `restaurant-list` | Supprimer un restaurant : le dialog de confirmation apparait. Confirmer : le restaurant disparait. Annuler : rien ne se passe. |
| Persistance | Ajouter des restaurants, fermer l'onglet, rouvrir : les donnees sont la. Ouvrir les DevTools > Application > Local Storage : verifier le contenu de `quequonmange_data`. |
| Migration | Manuellement editer localStorage pour retirer `budget`/`coords` d'un restaurant et mettre `version: 1`. Rafraichir : les champs doivent etre ajoutes automatiquement. |

### Verification build

- `npm run build` doit passer sans erreur.
- `npm run lint` doit passer sans erreur.

## Scope

### Inclus

- Modele de donnees enrichi (budget, coords)
- Restructuration du code en composants et hooks dedies
- Persistance localStorage avec versioning de schema et migration
- Filtres combinatoires : cuisine, budget, distance, frequence
- Geolocalisation navigateur pour filtre distance
- Geocodage d'adresse via API Nominatim (gratuit, pas de cle)
- Spinner ameliore : bug de deceleration corrige, pre-filtres, bouton "C'est parti !" qui incremente recurrence
- Corrections : `lang="fr"`, metadata francaise, utilisation tokens theme, shadcn Button, dialog confirmation suppression
- Accessibilite ciblee : Stars accessible, onglets avec roles ARIA, budget en fieldset

### Hors scope

- Backend / base de donnees / compte utilisateur
- Carte interactive (Leaflet, Mapbox, Google Maps)
- Import depuis API externe (Google Places, Yelp, OpenStreetMap)
- Historique des visites (journal date par date)
- Export / import de donnees (JSON, CSV)
- Synchronisation multi-appareils
- Tests automatises (pas de framework de test)
- PWA / service worker / manifest
- Routing Next.js (l'app reste single-page avec tabs en state)
- Refonte du style visuel (on garde glassmorphism/blobs/dark theme)

## Dependencies

### Existantes (inchangees)

- Next.js 16.2, React 19, TypeScript 5
- Tailwind CSS v4 via `@tailwindcss/postcss`
- shadcn/ui (radix-luma style, lucide icons)
- clsx, tailwind-merge, class-variance-authority, tw-animate-css

### A installer

- `npx shadcn add alert-dialog` — dialog de confirmation de suppression

### API externes

- **Nominatim / OpenStreetMap** (`nominatim.openstreetmap.org/search`) — geocodage d'adresse. Gratuit, pas de cle API, limite a 1 requete/seconde. Utilisable sans inscription.
- **Geolocation API** — API navigateur native, pas de dependance externe.

### Aucune nouvelle dependance npm

Pas de Zustand, Dexie, Leaflet, ou autre librairie. Tout est fait avec React hooks + APIs navigateur.
