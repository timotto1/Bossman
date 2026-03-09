import { ClockIcon } from "@heroicons/react/24/solid";

import { ActivityTimeline } from "./activity-timeline";
import { Card, CardContent } from "@/components/ui/card";

export function ActivityLog() {
  return (
    <Card className="rounded-lg shadow-md max-w-[273px] max-h-fit h-full">
      <CardContent className="p-6">
        <div className="flex items-center gap-1">
          <ClockIcon color="#26045D" className="w-5 h-5" />
          <p className="text-sm font-semibold leading-5 text-left">
            Key activity log
          </p>
        </div>
        <ActivityTimeline />
      </CardContent>
    </Card>
  );
}
