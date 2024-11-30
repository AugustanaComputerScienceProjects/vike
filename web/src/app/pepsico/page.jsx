"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { checkInService } from "@/lib/firebase/check-in";
import { useRef, useState } from "react";

export default function PepsicoCheckIn() {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const { toast } = useToast();

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
        await checkInService.checkInToPepsico(email);
        toast({
          title: "Check-in Successful",
          description: `${email} has been checked in`,
          variant: "success"
        });
      } else {
        toast({
          title: "Check-in Failed",
          description: "Not a student/faculty",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check in",
        variant: "destructive"
      });
    } finally {
      setStudentId("");
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
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
  );
}