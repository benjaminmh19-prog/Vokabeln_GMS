#!/bin/bash

# Add TimeRange import
sed -i "s/import { fetchDashboardStats, DashboardStats }/import { fetchDashboardStats, DashboardStats, TimeRange }/" client/src/components/admin/TeacherDashboard.tsx

# Add timeRange state after lastUpdated
sed -i "/const \[lastUpdated, setLastUpdated\]/a\  const [timeRange, setTimeRange] = useState<TimeRange>('all');" client/src/components/admin/TeacherDashboard.tsx

# Update loadStats function
sed -i 's/const loadStats = async () => {/const loadStats = async (range: TimeRange = timeRange) => {/' client/src/components/admin/TeacherDashboard.tsx
sed -i 's/const data = await fetchDashboardStats();/const data = await fetchDashboardStats(range);/' client/src/components/admin/TeacherDashboard.tsx

# Add handleTimeRangeChange function after loadStats
sed -i '/finally {$/a\
\
  const handleTimeRangeChange = (range: TimeRange) => {\
    setTimeRange(range);\
    loadStats(range);\
  };' client/src/components/admin/TeacherDashboard.tsx

