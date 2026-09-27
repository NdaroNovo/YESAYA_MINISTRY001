import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import LoginScreen from "../screens/auth/LoginScreen";
import MainTabs from "./MainTabs";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/services";
import { ACCESS_KEY, loadServerUrl, setAuthFailureHandler } from "../api/client";
import UpdateChecker from "../components/UpdateChecker";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, setAuth, clearAuth, setLoading, isLoading } = useAuthStore();

  useEffect(() => {
    setAuthFailureHandler(() => {
      clearAuth();
    });
    const init = async () => {
      await loadServerUrl();
      const token = await SecureStore.getItemAsync(ACCESS_KEY);
      if (token) {
        try {
          const { data } = await authApi.me();
          await setAuth(data, (await SecureStore.getItemAsync(ACCESS_KEY)) || token);
        } catch (err: any) {
          // Toka tu kama server imekataa token; bila mtandao endelea na user aliyehifadhiwa
          if (err?.response?.status === 401) await clearAuth();
        }
      } else {
        await clearAuth();
      }
      setLoading(false);
    };
    init();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <UpdateChecker />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
