import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import MyGardenScreen from '../screens/MyGardenScreen';
import PlantDetailScreen from '../screens/PlantDetailScreen';
import AddEditPlantScreen from '../screens/AddEditPlantScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import MapScreen from '../screens/MapScreen';
import SettingsScreen from '../screens/SettingsScreen';
import type { GardenStackParamList, MainTabsParamList } from './types';

const GardenStack = createNativeStackNavigator<GardenStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

function GardenStackNavigator() {
  const theme = useTheme();
  return (
    <GardenStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <GardenStack.Screen name="MyGarden" component={MyGardenScreen} options={{ title: 'My Garden' }} />
      <GardenStack.Screen name="PlantDetail" component={PlantDetailScreen} options={{ title: '' }} />
      <GardenStack.Screen
        name="AddEditPlant"
        component={AddEditPlantScreen}
        options={{ title: 'Add Plant', presentation: 'modal' }}
      />
    </GardenStack.Navigator>
  );
}

const TAB_ICONS: Record<keyof MainTabsParamList, keyof typeof MaterialCommunityIcons.glyphMap> = {
  GardenTab: 'sprout',
  RecommendationsTab: 'shield-check',
  MapTab: 'map-marker',
  SettingsTab: 'cog',
};

export default function MainNavigator() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: { fontWeight: '600' },
        headerShown: route.name !== 'GardenTab',
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline },
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name={TAB_ICONS[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="GardenTab" component={GardenStackNavigator} options={{ title: 'Garden' }} />
      <Tab.Screen
        name="RecommendationsTab"
        component={RecommendationsScreen}
        options={{ title: 'Recommend', headerTitle: 'Recommendations' }}
      />
      <Tab.Screen name="MapTab" component={MapScreen} options={{ title: 'Map' }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}
