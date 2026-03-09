import { Card, CardContent } from "@/components/ui/card";

interface ProfileItem {
  title: string;
  value: string;
}

interface ProfileCardProps {
  title: string;
  items: ProfileItem[];
}

export function ProfileCard({ title, items }: ProfileCardProps) {
  return (
    <div className="space-y-2 mb-8">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium leading-5 text-left text-[#26045D]">
          {title}
        </p>
      </div>
      <Card className="rounded-[12px] h-full">
        <CardContent className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(({ title, value }, index) => (
              <div key={index} className="space-y-4">
                <h6 className="text-sm font-medium leading-5 text-left text-[#26045D]">
                  {title}
                </h6>
                <p className="text-xs font-normal leading-4 text-left text-[#26045D]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
