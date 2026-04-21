# Spec : Application Pomodoro

## Overview

Application Pomodoro tout-en-un orientée focus. Une seule page, deux vues (Timer / Stats), persistance locale. Pas de tâches, pas de backend, pas de configuration utilisateur.

**Durées fixes :**
- Focus : 25 minutes
- Pause courte : 5 minutes
- Pause longue : 15 minutes (après 4 sessions focus)

**Hors scope :** gestion de tâches, sons d'ambiance, durées configurables, synchronisation multi-appareils, authentification.

**Dépendances :**
- Next.js 16 (static export)
- React 19
- Tailwind v4 + `@tailwindcss/postcss`
- `radix-ui` (unified package, style `radix-luma`)
- Motion (animations)
- Web Audio API (notifications sonores, built-in navigateur)
- localStorage (persistance)

---

## Architecture

Page unique (`app/page.tsx`) qui orchestre deux vues : `timer` et `stats`. La vue active est un state local `view: "timer" | "stats"`. La transition est animée via `AnimatePresence` de Motion.

Tout l'état du timer vit dans le hook `usePomodoro` instancié dans `page.tsx`. Les props sont passées aux composants enfants (prop-drilling max 2 niveaux — pas de Context ni Zustand nécessaires).

```
app/
  layout.tsx            ← root layout : font, fond global, métadonnées
  page.tsx              ← PomodoroApp : view state, instancie usePomodoro
  globals.css           ← variables CSS de phase + thème Tailwind v4

components/
  timer/
    TimerDisplay.tsx    ← anneau SVG + MM:SS
    TimerControls.tsx   ← boutons Start/Pause/Reset
    ModeSelector.tsx    ← pills Focus / Pause courte / Pause longue
  stats/
    StatsDashboard.tsx  ← conteneur tableau de bord
    StatsCard.tsx       ← carte métrique réutilisable
    SessionChart.tsx    ← graphe barres 7 jours

hooks/
  usePomodoro.ts        ← machine d'état timer + orchestration
  useStats.ts           ← calcul des métriques depuis localStorage
  useSound.ts           ← notification sonore Web Audio API

lib/
  storage.ts            ← abstraction localStorage typée
  constants.ts          ← DURATIONS, PHASES
```

---

## Components

### `usePomodoro` (hook)

Responsabilité unique : gérer l'état du timer et la progression des cycles.

**État interne :**
```ts
type Phase = "focus" | "short-break" | "long-break"
type TimerStatus = "idle" | "running" | "paused" | "completed"

{
  phase: Phase
  status: TimerStatus
  remaining: number        // secondes restantes
  cyclesCompleted: number  // 0–3, réinitialisé après long-break
}
```

**Interface exposée :**
```ts
{
  phase, status, remaining,
  start: () => void
  pause: () => void
  reset: () => void
  selectPhase: (p: Phase) => void  // change de phase, remet en idle
}
```

**Transitions :**
- `idle → running` : `start()` — enregistre `startTimestamp = Date.now()`
- `running → paused` : `pause()` — enregistre `remaining` courant
- `paused → running` : `start()` — reprend depuis `remaining`
- `running → completed` : tick naturel quand `remaining <= 0`
- `completed → idle` (phase suivante) : automatique après 300ms (délai pour jouer le son)
- `* → idle` : `reset()` — remet `remaining` à la durée de la phase courante

**Précision timer :** `setInterval` à 500ms. À chaque tick : `remaining = startTimestamp + totalDuration - Date.now()`. Corrige le drift et le throttling navigateur.

**Cycle long-break :** `cyclesCompleted` s'incrémente à chaque `focus` complété. Quand `cyclesCompleted === 4`, la prochaine pause est `long-break` et `cyclesCompleted` repart à 0.

**Effets de bord à `completed` :**
1. Appel `playNotification()` depuis `useSound`
2. Si la phase était `focus` : appel `addSession()` depuis `useStats`

---

### `useStats` (hook)

Responsabilité : lire/écrire les sessions dans localStorage et calculer les métriques.

**Interface exposée :**
```ts
{
  sessions: Session[]
  todayCount: number        // sessions focus du jour calendaire courant
  totalMinutes: number      // somme des durées en minutes
  currentStreak: number     // jours consécutifs avec ≥1 session (jusqu'à aujourd'hui)
  bestStreak: number        // max historique
  last7Days: { date: string; count: number }[]  // ISO date + nb sessions
  addSession: (s: Session) => void
  clearSessions: () => void
}
```

**Type Session :**
```ts
type Session = {
  id: string      // crypto.randomUUID()
  startedAt: number  // timestamp ms (Date.now() au début de la session)
  duration: number   // secondes (toujours 1500 pour focus 25min)
  phase: "focus"
}
```

**Calcul streak :** parcourir les jours en décroissant depuis aujourd'hui. Tant qu'il existe au moins une session ce jour-là, streak++. S'arrête au premier jour sans session. Le streak inclut aujourd'hui si au moins une session y est enregistrée.

---

### `useSound` (hook)

Responsabilité : jouer un son de notification court à la fin d'une session.

**Implémentation :** génère un bip court (440 Hz, 200ms, envelope ADSR simple) via Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`). Pas de fichier audio externe.

**Interface :**
```ts
{ playNotification: () => void }
```

**Erreur :** si `AudioContext` n'est pas disponible ou si une exception est levée, `playNotification` fait un no-op silencieux.

---

### `storage.ts`

Abstraction localStorage. Toutes les opérations sont dans un try/catch. En cas d'échec (localStorage désactivé, quota dépassé, JSON corrompu), le fallback est un tableau vide en mémoire — l'app ne crashe pas.

```ts
getSessions(): Session[]
saveSessions(sessions: Session[]): void
```

---

### `TimerDisplay`

Affiche le temps restant et l'anneau de progression.

- Grand texte `MM:SS` en DM Mono (~7rem), centré
- SVG circulaire : `stroke-dashoffset` animé avec Motion (`animate={{ strokeDashoffset: ... }}`, `transition={{ duration: 0.5, ease: "linear" }}`)
- Couleur de l'anneau = variable CSS `--phase-color`, changée selon la phase courante
- Props : `remaining: number`, `totalDuration: number`, `phase: Phase`

**Formatage :** `Math.ceil(remaining)` → `String(minutes).padStart(2,"0") + ":" + String(seconds).padStart(2,"0")`

---

### `TimerControls`

- Bouton principal : label `"DÉMARRER"` (idle/paused) ou `"PAUSE"` (running) — plein, couleur de phase, min 48px
- Bouton reset : icône `RotateCcw` (lucide-react), discret, visible uniquement si `status !== "idle"`
- Props : `status: TimerStatus`, `onStart`, `onPause`, `onReset`

---

### `ModeSelector`

3 pills horizontaux : Focus / Pause courte / Pause longue. Le pill actif est mis en avant (fond coloré). Clic sur un pill inactif appelle `selectPhase()` — réinitialise le timer sur cette phase (si `running`, demande confirmation via `AlertDialog` de radix-ui : "Abandonner la session en cours ?").

---

### `StatsDashboard`

4 cartes `StatsCard` en grille 2×2 :
- Sessions aujourd'hui
- Temps total (ex : "3h 20min")
- Streak actuel (ex : "5 jours")
- Meilleur streak

`SessionChart` en dessous : 7 barres verticales (une par jour), hauteur proportionnelle au max de la semaine, label jour court (ex : "Lun").

Bouton "Effacer les données" en bas : ouvre une `AlertDialog` de confirmation avant d'appeler `clearSessions()`.

---

## Data Flow

```
[tick setInterval]
       │
       ▼
usePomodoro
  ├── remaining--  (drift-corrected)
  ├── status === "completed" ?
  │     ├── useSound.playNotification()
  │     ├── phase === "focus" → useStats.addSession()
  │     └── → calcule phase suivante → status = "idle"
  └── expose { phase, status, remaining, ... }
       │
       ▼
page.tsx
  ├── view === "timer" → <TimerDisplay> + <TimerControls> + <ModeSelector>
  └── view === "stats" → <StatsDashboard>
```

```
useStats.addSession()
  → storage.getSessions() → push → storage.saveSessions()
  → recalcule métriques (todayCount, streaks, last7Days)
```

---

## Error Handling

| Scénario | Comportement |
|---|---|
| `localStorage` indisponible | `storage.ts` catch silencieux → sessions stockées en mémoire pour la session courante, métriques calculées depuis ce tableau temporaire |
| JSON corrompu dans localStorage | `getSessions()` catch → retourne `[]`, écrase avec tableau vide au prochain `saveSessions()` |
| `AudioContext` indisponible | `useSound` catch dans `playNotification` → no-op, aucune notification visuelle de substitution (le timer continue) |
| Onglet mis en veille (throttling) | Correction drift : au retour, `remaining = startTimestamp + totalDuration - Date.now()`. Si `<= 0`, session marquée completed immédiatement |
| Clic "changer de phase" pendant une session active | `AlertDialog` de confirmation. "Continuer" = annule le changement. "Abandonner" = `selectPhase()` sans enregistrer la session |

---

## UI & Visual Design

**Thème :** fond `#0a0a0a`, pas de blanc pur — texte `#f0f0f0`. Couleurs de phase via CSS variables :
```css
--phase-color: /* focus: #e85d04 | short-break: #52b788 | long-break: #7b5ea7 */
```

**Typographie :**
- Timer : `DM Mono` (Google Fonts)
- Titres/labels : `Syne` (Google Fonts)
- Body/boutons : `Syne`

**Animations (Motion) :**
- Transition de vue Timer↔Stats : `AnimatePresence` + slide horizontal
- Changement de phase : fondu croisé de `--phase-color` (0.4s)
- Anneau SVG : `animate` sur `strokeDashoffset` en continu
- Fin de session : pulse scale (1 → 1.05 → 1) sur le `TimerDisplay`

**Responsive :**
- Desktop : largeur max `480px`, centré verticalement et horizontalement
- Mobile : full-width, padding 16px, boutons min 48px

---

## Testing Strategy

Tests unitaires avec **Vitest + React Testing Library**, fichiers dans `__tests__/` adjacents à la source.

| Unité | Ce qui est testé |
|---|---|
| `usePomodoro` | idle→running→paused→running, idle→running→completed, calcul cycle long-break (après 4 focus), correction drift (mock Date.now) |
| `storage.ts` | getSessions retourne [] si localStorage vide, addSession persist, getSessions retourne [] si JSON corrompu, pas de crash si localStorage.setItem throw |
| `useStats` | todayCount filtre le bon jour, streak 0 si aucune session, streak N jours consécutifs, bestStreak max historique, last7Days longueur 7 |
| `TimerDisplay` | 90 → "01:30", 0 → "00:00", 1500 → "25:00" |
| `StatsDashboard` | rendu des 4 cartes avec données mockées, bouton "Effacer" ouvre la dialog |
