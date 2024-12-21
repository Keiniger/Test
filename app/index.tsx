import React from "react";
import { createStackNavigator } from '@react-navigation/stack';
import ListScreen from './ListScreen';
import LoginScreen from './LoginScreen';
import ChartScreen from "./ChartScreen";
import { NavigationContainer, NavigationIndependentTree } from "@react-navigation/native";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="List" component={ListScreen} />
          <Stack.Screen name="Chart" component={ChartScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
