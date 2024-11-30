import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import firebase from "@/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { Mail, UserMinus } from "lucide-react";
import React from "react";

const CalendarSubscribers = ({ calendarId }) => {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = React.useState([]);

  React.useEffect(() => {
    const fetchSubscribers = async () => {
      const ref = firebase.database.ref(`/calendars/${calendarId}/subscribers`);
      const snapshot = await ref.once("value");
      const data = snapshot.val() || [];
      setSubscribers(Object.values(data));
    };

    fetchSubscribers();
  }, [calendarId]);

  const handleRemoveSubscriber = async (email) => {
    try {
      const ref = firebase.database.ref(`/calendars/${calendarId}/subscribers`);
      const filtered = subscribers.filter(s => s.email !== email);
      await ref.set(filtered);
      setSubscribers(filtered);
      toast({
        title: "Success",
        description: "Subscriber removed successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to remove subscriber",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.map((subscriber) => (
              <TableRow key={subscriber.email}>
                <TableCell className="font-medium">{subscriber.email}</TableCell>
                <TableCell>{new Date(subscriber.joinedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.location.href = `mailto:${subscriber.email}`}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSubscriber(subscriber.email)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CalendarSubscribers; 