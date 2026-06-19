#!/bin/bash

# Find the line with the header buttons and add time filters before them
sed -i '/<div className="flex items-center gap-2">/i\
          {/* Time Range Filters */}\
          <div className="flex gap-1">\
            {(["all", "today", "week", "month"] as TimeRange[]).map((range) => {\
              const labels: Record<TimeRange, string> = {\
                all: "Alle",\
                today: "Heute",\
                week: "7 Tage",\
                month: "30 Tage",\
              };\
              return (\
                <Button\
                  key={range}\
                  onClick={() => handleTimeRangeChange(range)}\
                  className={`text-xs font-bold border-2 rounded-lg px-3 py-1 ${\
                    timeRange === range\
                      ? "bg-[#2E3192] text-white border-[#2E3192]"\
                      : "bg-white text-[#2E3192] border-[#2E3192] hover:bg-[#FFD93D]"\
                  }`}\
                >\
                  {labels[range]}\
                </Button>\
              );\
            })}\
          </div>' client/src/components/admin/TeacherDashboard.tsx

