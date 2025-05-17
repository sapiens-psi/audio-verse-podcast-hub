
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

export const StatCard = ({ title, value, icon: Icon }: StatCardProps) => {
  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-podcast/5 to-podcast/10 border-b">
        <CardTitle className="text-gray-800 flex items-center">
          <span className="w-8 h-8 rounded-full bg-podcast/10 flex items-center justify-center mr-2">
            <Icon className="h-4 w-4 text-podcast" />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-3xl font-bold text-podcast">
          {value}
        </div>
      </CardContent>
    </Card>
  );
};
