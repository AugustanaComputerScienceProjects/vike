import firebase from "@/firebase/config";
import { User } from "firebase/auth";
import { useEffect, useState } from "react";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = firebase.auth.onAuthStateChanged(
      (user) => {
        setAuthState({
          user,
          loading: false,
          error: null,
        });
      },
      (error) => {
        setAuthState({
          user: null,
          loading: false,
          error: error as Error,
        });
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await firebase.auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error as Error,
      }));
    }
  };

  const signOut = async () => {
    try {
      await firebase.auth.signOut();
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error as Error,
      }));
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await firebase.auth.createUserWithEmailAndPassword(email, password);
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error as Error,
      }));
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signOut,
    signUp,
  };
} 