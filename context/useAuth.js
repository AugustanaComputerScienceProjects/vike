import auth from '@react-native-firebase/auth';
import {useRouter, useSegments} from 'expo-router';
import React, {createContext, useEffect, useState} from 'react';

export const AuthContext = createContext({
  user: null,
  initialized: false,
});
export function useAuth() {
  return React.useContext(AuthContext);
}

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    auth().onAuthStateChanged(userState => {
      setUser(userState);
      setInitialized(true);
    });
  }, []);

  const useProtectedRoute = () => {
    useEffect(() => {
      const inTabsGroup = segments[0] === '(tabs)';

      if (!user && inTabsGroup) {
        router.replace('/auth');
        console.log('NOT AUTHENTICATED: ');
      } else if (user && !inTabsGroup) {
        console.log('AUTHENTICATED: ', user);
        router.replace('/(tabs)/home');
      }
    }, [user, segments]);
  };

  useProtectedRoute();

  const value = {
    user,
    initialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
