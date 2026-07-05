import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import LoginScreen from "../screens/auth/LoginScreen";
import MainTabs from "./MainTabs";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/services";
import UpdateChecker from "../components/UpdateChecker";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, user, setAuth, clearAuth, setLoading, isLoading } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      const token = await SecureStore.getItemAsync("ym_access_token");
      if (token) {
        try {
          const { data } = await authApi.me();
          await setAuth(data, token);
        } catch {
          await clearAuth();
        }
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
