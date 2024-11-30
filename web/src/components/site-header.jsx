"use client";
import { siteConfig } from "@/config/site";
import firebase from "@/firebase/config";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MainNav } from "./main-nav";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

export const SiteHeader = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("");

  const signInOrOut = () => {
    if (firebase.auth.currentUser) {
      firebase.signOut().then(() => {
        alert("You've signed out.");
        router.push("/");
        router.refresh();
      });
    } else {
      firebase.signIn();
    }
  };

  const checkRole = (user) => {
    const roles = ["admin", "leaders"];
    roles.forEach((role) => {
      firebase.database
        .ref(role)
        .once("value")
        .then(function (snapshot) {
          if (snapshot.hasChild(user.email.replace(".", ","))) {
            setUserRole(role.charAt(0).toUpperCase() + role.slice(1)); // Capitalize the first letter
          }
        });
    });
  };

  useEffect(() => {
    firebase.auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        checkRole(user);
      } else {
        setUser(null);
        setUserRole("");
      }
    });
  }, []);
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <ThemeToggle />
            {user ? `${user.email} (${userRole})` : ""}
            <Button
              className="bg-primary px-4 py-2 rounded-md"
              onClick={signInOrOut}
            >
              {user ? "Sign Out" : "Sign In"}
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};
