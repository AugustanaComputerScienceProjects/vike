import firebase from "@/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export interface UseTagsResult {
  tags: string[];
  isLoading: boolean;
  error: Error | null;
}

export const useTags = (): UseTagsResult => {
  const { toast } = useToast();
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const snapshot = await firebase.database.ref('tags').once('value');
        const data = snapshot.val();
        
        // Convert to array and handle different data formats
        const tagsArray = data ? 
          (Array.isArray(data) ? data : Object.values(data)) as string[] : 
          [];
          
        // Remove duplicates and sort
        const uniqueTags = Array.from(new Set(tagsArray)).sort();
        setTags(uniqueTags);
      } catch (error) {
        console.error('Error fetching tags:', error);
        setError(error instanceof Error ? error : new Error('Failed to fetch tags'));
        toast({
          title: "Error",
          description: "Failed to load tags",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, [toast]);

  return { tags, isLoading, error };
}; 