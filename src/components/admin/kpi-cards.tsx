import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const StatsCard = ({ title, value, change, isPositive, icon: Icon }) => {
  function renderDifferenceStyles() {
    const isBadChange = title === "Reported Users" && isPositive;

    if (isBadChange) {
      return isPositive ? "text-red-500" : "text-green-500";
    } else {
      return isPositive ? "text-green-500" : "text-red-500";
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center pt-1">
          {isPositive ? (
            <ArrowUpRight
              className={`mr-1 h-4 w-4 ${renderDifferenceStyles()}`}
            />
          ) : (
            <ArrowDownRight
              className={`mr-1 h-4 w-4 ${renderDifferenceStyles()}`}
            />
          )}
          <span className={`text-xs ${renderDifferenceStyles()}`}>
            {change}% from last week
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const KPIDashboard = ({
  stats,
}: {
  stats: {
    title: string;
    value: string;
    change: number;
    isPositive: boolean;
    icon: Icon;
  }[];
}) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {stats?.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            isPositive={stat.isPositive}
            icon={stat.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default KPIDashboard;
