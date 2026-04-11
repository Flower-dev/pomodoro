'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Restaurant } from '@/lib/types';
import { Stars } from '@/components/stars';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface RestaurantFormProps {
  restaurant?: Restaurant | null;
  onSave: (data: Omit<Restaurant, 'id'>) => void;
  onCancel: () => void;
  onRequestPosition: () => void;
  userPosition: { lat: number; lng: number } | null;
  geoLoading: boolean;
}

const EMPTY_FORM: Omit<Restaurant, 'id'> = {
  name: '',
  category: '',
  description: '',
  emoji: '🍴',
  appreciation: 3,
  recurrence: 1,
  budget: 2,
  coords: null,
};

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

export function RestaurantForm({
  restaurant,
  onSave,
  onCancel,
  onRequestPosition,
  userPosition,
  geoLoading,
}: RestaurantFormProps) {
  const isEditing = !!restaurant;
  const [form, setForm] = useState<Omit<Restaurant, 'id'>>(
    restaurant ? { ...EMPTY_FORM, ...restaurant } : EMPTY_FORM
  );

  // Geocoding state
  const [addressQuery, setAddressQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [geoSearching, setGeoSearching] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const geocodeAddress = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setGeoSearching(true);
    setGeoError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=0`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      if (res.status === 429) {
        setGeoError('Trop de requetes, reessayez dans quelques secondes');
        setSuggestions([]);
        return;
      }
      if (!res.ok) {
        setGeoError("Impossible de rechercher l'adresse");
        setSuggestions([]);
        return;
      }
      const data = (await res.json()) as NominatimResult[];
      if (data.length === 0) {
        setGeoError('Aucune adresse trouvee');
        setSuggestions([]);
      } else {
        setSuggestions(data);
      }
    } catch {
      setGeoError("Impossible de rechercher l'adresse");
      setSuggestions([]);
    } finally {
      setGeoSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (addressQuery.trim().length < 3) {
      setSuggestions([]);
      setGeoError(null);
      return;
    }
    debounceRef.current = setTimeout(() => {
      geocodeAddress(addressQuery);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [addressQuery, geocodeAddress]);

  const prevPositionRef = useRef(userPosition);
  useEffect(() => {
    if (userPosition && userPosition !== prevPositionRef.current) {
      setForm((prev) => ({ ...prev, coords: userPosition }));
      prevPositionRef.current = userPosition;
    }
  }, [userPosition]);

  const selectSuggestion = (s: NominatimResult) => {
    setForm((prev) => ({
      ...prev,
      coords: { lat: parseFloat(s.lat), lng: parseFloat(s.lon) },
    }));
    setAddressQuery(s.display_name);
    setSuggestions([]);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  const inputClass =
    'w-full px-3 py-2.5 bg-cream border border-parchment rounded-lg text-ink placeholder-warm-gray/60 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta/40 transition-all';

  return (
    <section className="w-full max-w-lg mx-auto animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-2xl font-black italic text-ink tracking-tight">
            {isEditing ? 'Modifier' : 'Nouvelle adresse'}
          </h2>
          <p className="text-xs text-warm-gray mt-0.5">
            {isEditing ? 'Mettre a jour les informations' : 'Ajouter un restaurant a ta liste'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs text-warm-gray hover:text-ink transition-colors font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Retour
        </button>
      </div>

      <div className="rounded-xl border border-parchment bg-white p-5 sm:p-6 shadow-sm space-y-5">
        {/* Row 1: Emoji + Name */}
        <div className="grid grid-cols-[5rem_1fr] gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-warm-gray uppercase tracking-wider mb-1.5">
              Emoji
            </label>
            <input
              type="text"
              value={form.emoji}
              onChange={(e) => setForm({ ...form, emoji: e.target.value })}
              className={cn(inputClass, 'text-2xl text-center px-2')}
              maxLength={4}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-warm-gray uppercase tracking-wider mb-1.5">
              Nom *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nom du restaurant"
              className={inputClass}
            />
          </div>
        </div>

        {/* Row 2: Category + Description */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-warm-gray uppercase tracking-wider mb-1.5">
              Categorie
            </label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Japonais, Pizzeria..."
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-warm-gray uppercase tracking-wider mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Courte description"
              className={inputClass}
            />
          </div>
        </div>

        {/* Row 3: Stars + Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-warm-gray uppercase tracking-wider mb-1.5">
              Appreciation
            </label>
            <div className="text-xl">
              <Stars
                count={form.appreciation}
                onChange={(v) => setForm({ ...form, appreciation: v })}
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-warm-gray uppercase tracking-wider mb-1.5">
              Recurrence
            </label>
            <div className="text-xl">
              <Stars
                count={form.recurrence}
                onChange={(v) => setForm({ ...form, recurrence: v })}
              />
            </div>
          </div>
          <fieldset>
            <legend className="block text-[11px] font-semibold text-warm-gray uppercase tracking-wider mb-1.5">
              Budget
            </legend>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((b) => {
                const active = form.budget === b;
                const labels = { 1: '€', 2: '€€', 3: '€€€' } as const;
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setForm({ ...form, budget: b })}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-bold border transition-all duration-200',
                      active
                        ? 'bg-terracotta/10 border-terracotta/30 text-terracotta'
                        : 'bg-cream border-parchment text-warm-gray hover:border-warm-gray/40 hover:text-ink-muted'
                    )}
                  >
                    {labels[b]}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* Row 4: Location */}
        <div>
          <label className="block text-[11px] font-semibold text-warm-gray uppercase tracking-wider mb-1.5">
            Localisation
            <span className="normal-case text-warm-gray/50 ml-1">(optionnel)</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-gray/50" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                value={addressQuery}
                onChange={(e) => setAddressQuery(e.target.value)}
                placeholder="Rechercher une adresse..."
                className={cn(inputClass, 'pl-9')}
              />
              {geoSearching && (
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-gray animate-plate-spin" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRequestPosition}
              disabled={geoLoading}
              className="rounded-lg border-parchment bg-cream text-warm-gray hover:text-ink hover:bg-cream-dark shrink-0"
            >
              {geoLoading ? (
                <svg className="w-4 h-4 animate-plate-spin" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              )}
              <span className="hidden sm:inline ml-1.5">Ma position</span>
            </Button>
          </div>

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <div className="mt-2 rounded-lg border border-parchment bg-white overflow-hidden divide-y divide-parchment/50 shadow-md">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => selectSuggestion(s)}
                  className="w-full text-left px-3 py-2.5 text-xs text-ink-muted hover:bg-cream hover:text-ink transition-colors"
                >
                  📍 {s.display_name}
                </button>
              ))}
            </div>
          )}

          {geoError && (
            <p className="text-[11px] text-burgundy mt-1.5">{geoError}</p>
          )}

          {form.coords && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-sage font-medium">
                📍 {form.coords.lat.toFixed(4)}, {form.coords.lng.toFixed(4)}
              </span>
              <button
                type="button"
                onClick={() => {
                  setForm({ ...form, coords: null });
                  setAddressQuery('');
                }}
                className="text-[11px] text-warm-gray hover:text-burgundy transition-colors underline underline-offset-2"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-parchment" />

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-warm-gray hover:text-ink"
          >
            Annuler
          </Button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim()}
            className="px-6 py-2.5 rounded-lg text-sm font-bold bg-terracotta text-white hover:bg-terracotta-dark disabled:bg-parchment disabled:text-warm-gray disabled:cursor-not-allowed transition-all active:scale-[0.97] shadow-sm shadow-terracotta/15"
          >
            {isEditing ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </div>
    </section>
  );
}
