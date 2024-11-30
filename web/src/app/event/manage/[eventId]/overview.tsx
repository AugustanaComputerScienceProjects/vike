"use client";

import { Card } from "@/components/ui/card";
import { Event } from "@/firebase/types";
import ManageEventForm, { FormData } from "./manage-form";

interface OverviewProps {
  event: Event;
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting?: boolean;
}

const Overview = ({ event, onSubmit, isSubmitting = false }: OverviewProps) => {
  return (
    <Card className="p-6">
      <ManageEventForm
        event={event}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    </Card>
  );
};

export default Overview;
