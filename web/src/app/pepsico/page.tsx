"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import firebaseApp from "@/firebase/config";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const verifyStudentId = async (studentId: string) => {
  try {
    const idRef = firebaseApp.database.ref('id-to-email').child(studentId);
    const snapshot = await idRef.once('value');
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    
    const demoRef = firebaseApp.database.ref('demographics').child(studentId);
    const demoSnapshot = await demoRef.once('value');
    
    if (demoSnapshot.exists()) {
      return studentId;
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying student ID:', error);
    throw error;
  }
};

const checkInToPepsico = async (email: string) => {
    try {
      const pepsicoRef = firebaseApp.database.ref('pepsico');
      const snapshot = await pepsicoRef.once('value');
      const checkInTime = new Date().toLocaleTimeString();

      
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
};

export default function PepsicoCheckIn() {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const lastKeyTime = useRef(0);
  const keyBuffer = useRef("");

  useEffect(() => {
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      if (!keyBuffer.current && e.key !== ';') {
        return;
      }

      const currentTime = new Date().getTime();
      
      if (currentTime - lastKeyTime.current > 150) {
        keyBuffer.current = "";
      }
      
      lastKeyTime.current = currentTime;
      keyBuffer.current += e.key;


      if (keyBuffer.current.startsWith(';') && keyBuffer.current.length > 1) {
        inputRef.current?.focus();
      }

      if (keyBuffer.current.startsWith(';') && keyBuffer.current.includes('=') && keyBuffer.current.endsWith('?')) {
        const fullSwipe = keyBuffer.current;
        keyBuffer.current = "";
        setStudentId(fullSwipe);
        handleSubmit(new Event('submit'));
      }
    };

    document.addEventListener('keypress', handleGlobalKeyPress);
    return () => document.removeEventListener('keypress', handleGlobalKeyPress);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId || loading) return;
    setLoading(true);

    try {
      let processedId = studentId;
      
      if (processedId.startsWith(';')) {
        const idPart = processedId.split('=')[0];
        if (idPart) {
          processedId = idPart.replace(';', '').slice(-7);
        }
      } else if (!isNaN(Number(processedId))) {
        processedId = processedId.padStart(7, '0').slice(-7);
      }

      const email = await verifyStudentId(processedId);
      
      if (email) {
        await checkInToPepsico(email);
        toast.success(`${email} has been checked in`);
      } else {
        toast.error("Not a student/faculty");
      }
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error("Failed to check in");
    } finally {
      setStudentId("");
      setLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  return (
    <div className="bg-background">
      <div className="container h-14 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pepsico Check-In</h1>
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
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Checking in..." : "Check In"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}