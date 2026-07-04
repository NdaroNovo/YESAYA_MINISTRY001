import { useState, useCallback } from "react";
import * as Location from "expo-location";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capture = useCallback(async (): Promise<LocationData | null> => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Ruhusa ya location haijatolewa.");
        return null;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const data = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
      };
      setLocation(data);
      return data;
    } catch (err: any) {
      setError(err?.message || "Imeshindwa kupata location.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { location, loading, error, capture };
}
