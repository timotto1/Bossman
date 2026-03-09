interface ActivityTimelineItemProps {
  icon: JSX.Element;
  title: React.ReactNode;
  date: React.ReactNode;
}

export function ActivityTimelineItem({
  icon,
  title,
  date,
}: ActivityTimelineItemProps) {
  return (
    <div className="grid gap-1 text-sm relative">
      <div className="aspect-square w-[25px] h-[25px] bg-[#F0F0FE] rounded-full absolute left-0 translate-x-[-35.5px] z-10 top-1 flex items-center justify-center">
        {icon}
      </div>
      <div className="text-sm font-normal leading-5 text-left">{title}</div>
      <p className="text-xs font-normal leading-4 text-left text-[#1C1C1C66]">
        {date}
      </p>
    </div>
  );
}
