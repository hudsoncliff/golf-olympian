import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OpeningScreen from '../screens/OpeningScreen';
import StartScreen from '../screens/StartScreen';
import HoleInputScreen from '../screens/HoleInputScreen';
import ResultScreen from '../screens/ResultScreen';
import RateCalcScreen from '../screens/RateCalcScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { Player, HoleResult } from '../models/types';
import { PointConfig } from '../config/gameConfig';

export type RootStackParamList = {
  Opening: undefined;
  Start: undefined;
  HoleInput: { players: Player[]; pointConfig: PointConfig };
  Result: { players: Player[]; holeResults: HoleResult[]; pointConfig: PointConfig };
  RateCalc: { players: Player[]; holeResults: HoleResult[]; pointConfig: PointConfig };
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#0a1628' } }}>
        <Stack.Screen name="Opening" component={OpeningScreen} />
        <Stack.Screen name="Start" component={StartScreen} />
        <Stack.Screen name="HoleInput" component={HoleInputScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="RateCalc" component={RateCalcScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
