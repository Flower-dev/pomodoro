'use client';

import { useState, useCallback } from 'react';

interface GeolocationState {
  position: { lat: number; lng: number } | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: false,
  });

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        position: null,
        error: "La géolocalisation n'est pas disponible sur ce navigateur",
        loading: false,
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
          loading: false,
        });
      },
      (err) => {
        let message: string;
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = "Vous avez refusé l'accès à votre position";
            break;
          case err.POSITION_UNAVAILABLE:
            message = 'Impossible de récupérer votre position';
            break;
          case err.TIMEOUT:
            message = 'Impossible de récupérer votre position';
            break;
          default:
            message = 'Impossible de récupérer votre position';
        }
        setState({ position: null, error: message, loading: false });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { ...state, requestPosition };
}
