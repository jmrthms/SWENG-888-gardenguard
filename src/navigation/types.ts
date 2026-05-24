import type {
  CompositeNavigationProp,
  NavigatorScreenParams,
  RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { PlantPrefill } from '../models/types';

export type AuthStackParamList = {
  Login: { registeredEmail?: string } | undefined;
  Register: undefined;
};

export type GardenStackParamList = {
  MyGarden: undefined;
  PlantDetail: { plantId: string };
  AddEditPlant: { plantId?: string; prefill?: PlantPrefill } | undefined;
};

export type MainTabsParamList = {
  GardenTab: NavigatorScreenParams<GardenStackParamList> | undefined;
  RecommendationsTab: undefined;
  MapTab: { focusPlantId?: string } | undefined;
  SettingsTab: undefined;
};

/** Navigation prop for a Garden-stack screen that can also switch tabs. */
export type GardenScreenNav = CompositeNavigationProp<
  NativeStackNavigationProp<GardenStackParamList>,
  BottomTabNavigationProp<MainTabsParamList>
>;

/** Navigation prop for a tab-level screen (can switch tabs + open the garden stack). */
export type TabScreenNav = BottomTabNavigationProp<MainTabsParamList>;

export type AuthScreenNav = NativeStackNavigationProp<AuthStackParamList>;

export type PlantDetailRoute = RouteProp<GardenStackParamList, 'PlantDetail'>;
export type AddEditPlantRoute = RouteProp<GardenStackParamList, 'AddEditPlant'>;
export type MapTabRoute = RouteProp<MainTabsParamList, 'MapTab'>;
