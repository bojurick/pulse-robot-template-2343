
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const TaskSkeleton = () => (
  <div className="space-y-4">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="glass-widget">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="skeleton w-5 h-5 rounded" />
            <div className="flex-1">
              <div className="skeleton h-4 w-3/4 mb-2" />
              <div className="skeleton h-3 w-1/2" />
            </div>
            <div className="skeleton w-16 h-6 rounded-full" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
