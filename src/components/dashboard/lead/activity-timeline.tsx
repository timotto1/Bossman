import {
  BuildingLibraryIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentIcon,
  CloudArrowUpIcon,
  InboxArrowDownIcon,
  PaperAirplaneIcon,
  ScaleIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";

import { ActivityTimelineItem } from "./activity-timeline-item";

export function ActivityTimeline() {
  return (
    <div className="py-4 px-2">
      <div className="after:absolute after:inset-y-0 after:w-px after:bg-gray-500/20 relative pl-6 after:left-0 grid gap-10 dark:after:bg-gray-400/20">
        <ActivityTimelineItem
          icon={<CloudArrowUpIcon color="#26045D" className="w-4 h-4" />}
          title="Jamie Cohen uploaded Hinel Karimi"
          date="12 Jan 2023"
        />
        <ActivityTimelineItem
          icon={<PaperAirplaneIcon color="#26045D" className="w-4 h-4" />}
          title="Jamie Cohen invited Hinel Karimi to Stairpay"
          date="14 Jan 2023"
        />
        <ActivityTimelineItem
          icon={<UserPlusIcon color="#26045D" className="w-4 h-4" />}
          title="Hinel Karimi created an account on Stairpay"
          date="14 Jan 2023"
        />
        <ActivityTimelineItem
          icon={<BuildingLibraryIcon color="#26045D" className="w-4 h-4" />}
          title="Hinel Karimi obtained a mortgage in principal from Tembo"
          date="28 Feb 2023"
        />
        <ActivityTimelineItem
          icon={<ClipboardDocumentIcon color="#26045D" className="w-4 h-4" />}
          title="Hinel Karimi started a staircasing application"
          date="28 Feb 2023"
        />
        <ActivityTimelineItem
          icon={<BuildingStorefrontIcon color="#26045D" className="w-4 h-4" />}
          title="Hinel Karimi obtained a RICS Valuation"
          date="01 Mar 2023"
        />
        <ActivityTimelineItem
          icon={<ScaleIcon color="#26045D" className="w-4 h-4" />}
          title="Hinel Karimi instructed Direction Law"
          date="03 Mar 2023"
        />
        <ActivityTimelineItem
          icon={<InboxArrowDownIcon color="#26045D" className="w-4 h-4" />}
          title={
            <span>
              Hinel Karimi submitted{" "}
              <Link href="#" className="underline text-[#9847FF]">
                a staircasing application
              </Link>
            </span>
          }
          date="05 Mar 2023"
        />
      </div>
    </div>
  );
}
