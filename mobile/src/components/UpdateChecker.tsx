import React, { useEffect } from "react";
import { Alert, Linking } from "react-native";
import Constants from "expo-constants";
import { api } from "../api/client";

const CURRENT_VERSION = Constants.expoConfig?.version ?? "1.0.0";

export default function UpdateChecker() {
  useEffect(() => {
    const checkForUpdate = async () => {
      try {
        const { data } = await api.get<{ min_app_version?: string; latest_app_version?: string }>(
          "/health/"
        );
        const latest = data?.latest_app_version;
        if (!latest) return;
        if (latest !== CURRENT_VERSION) {
          Alert.alert(
            "Toleo Jipya Linapatikana",
            `Toleo ${latest} linapatikana (wewe una ${CURRENT_VERSION}). Tafadhali pakua APK mpya.`,
            [
              { text: "Baadaye", style: "cancel" },
              {
                text: "Pakua Sasa",
                onPress: () =>
                  Linking.openURL(
                    "https://expo.dev/accounts/ndar0n0v0/projects/yesaya_ministry/builds"
                  ),
              },
            ]
          );
        }
      } catch {
      }
    };
    const timer = setTimeout(checkForUpdate, 3000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
