import React, { useEffect } from "react";
import { Alert } from "react-native";
import * as Updates from "expo-updates";

export default function UpdateChecker() {
  useEffect(() => {
    const checkForUpdate = async () => {
      try {
        if (__DEV__) return;
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          Alert.alert(
            "Toleo Jipya Linapatikana",
            "Kuna maboresho mapya ya app. Ungependa kusakinisha sasa?",
            [
              { text: "Baadaye", style: "cancel" },
              {
                text: "Sasisha Sasa",
                onPress: async () => {
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                },
              },
            ]
          );
        }
      } catch {
      }
    };
    checkForUpdate();
  }, []);

  return null;
}
