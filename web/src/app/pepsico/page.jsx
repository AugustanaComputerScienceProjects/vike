"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import firebaseApp from "@/firebase/config";
import useRoleData from "@/hooks/use-role";
import { useEffect, useRef, useState } from "react";

const checkInService = {
  async verifyStudentId(studentId) {
    try {
      const idRef = firebaseApp.database.ref('id-to-email').child(studentId);
      const snapshot = await idRef.once('value');
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      
      // If not found in id-to-email, check demographics
      const demoRef = firebaseApp.database.ref('demographics').child(studentId);
      const demoSnapshot = await demoRef.once('value');
      
      if (demoSnapshot.exists()) {
        return studentId; // Return the ID itself if it exists in demographics
      }
      
      return null;
    } catch (error) {
      console.error('Error verifying student ID:', error);
      throw error;
    }
  },

  async checkInToPepsico(email, checkInTime) {
    try {
      const pepsicoRef = firebaseApp.database.ref('pepsico');
      const snapshot = await pepsicoRef.once('value');
      
      snapshot.forEach((child) => {
        const eventKey = child.key;
        pepsicoRef
          .child(eventKey)
          .child('users')
          .child(email)
          .child(checkInTime)
          .set(true);
      });
    } catch (error) {
      console.error('Error checking in to Pepsico:', error);
      throw error;
    }
  }
};

export default function PepsicoCheckIn() {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);
  const { adminSignedIn, leaderSignedIn } = useRoleData();
  const [userText, setUserText] = useState("");

  useEffect(() => {
    const unsubscribe = firebaseApp.auth.onAuthStateChanged((user) => {
      if (user) {
        if (!adminSignedIn && !leaderSignedIn) {
          setUserText(`${user.email} (Student)`);
        } else if (adminSignedIn) {
          setUserText(`${user.email} (Admin)`);
        } else {
          setUserText(`${user.email} (Leader)`);
        }
      } else {
        setUserText("");
      }
    });

    return () => unsubscribe();
  }, [adminSignedIn, leaderSignedIn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let processedId = studentId;
      if (processedId[0] === ';' && processedId.length === 16) {
        processedId = processedId.slice(3, 10);
      } else if (!isNaN(Number(processedId[0]))) {
        while (processedId.length < 7) {
          processedId = '0' + processedId;
        }
      }

      const email = await checkInService.verifyStudentId(processedId);
      
      if (email) {
        const checkInTime = new Date().toLocaleTimeString();
        await checkInService.checkInToPepsico(email, checkInTime);
        setMessage(`${email} has been checked in`);
      } else {
        setMessage("Not a student/faculty");
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setMessage("Failed to check in");
    } finally {
      setStudentId("");
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSignInOut = () => {
    if (firebaseApp.auth.currentUser) {
      firebaseApp.signOut();
    } else {
      firebaseApp.signIn();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container h-14 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Pepsico Check-In</h1>
          <div className="flex items-center gap-4">
            {userText && (
              <span className="text-sm text-muted-foreground">{userText}</span>
            )}
            <Button 
              variant="outline" 
              onClick={handleSignInOut}
              className="h-8"
            >
              {firebaseApp.auth.currentUser ? "Sign Out" : "Sign In"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto py-8">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Swipe card or enter student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              autoFocus
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Checking in..." : "Check In"}
            </Button>
          </form>
        </Card>
        {message && (
          <div className={`mt-4 p-4 rounded-md ${
            message.includes("checked in") 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}