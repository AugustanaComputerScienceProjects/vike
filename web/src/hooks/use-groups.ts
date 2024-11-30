import firebase from "@/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export interface UseGroupsResult {
  groups: string[];
  isLoading: boolean;
  error: Error | null;
}

export const useGroups = (): UseGroupsResult => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        const snapshot = await firebase.database.ref('groups').once('value');
        const data = snapshot.val();
        
        // Convert to array and handle different data formats
        const groupsArray = data ? 
          (Array.isArray(data) ? data : Object.values(data)) as string[] : 
          [];
          
        // Remove duplicates and sort
        const uniqueGroups = Array.from(new Set(groupsArray)).sort();
        setGroups(uniqueGroups);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setError(error instanceof Error ? error : new Error('Failed to fetch groups'));
        toast({
          title: "Error",
          description: "Failed to load groups",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [toast]);

  return { groups, isLoading, error };
}; 