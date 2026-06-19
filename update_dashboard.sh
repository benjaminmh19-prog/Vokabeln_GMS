#!/bin/bash

# Add Download import
sed -i 's/Minus,$/Minus,\n  Download,/' client/src/components/admin/TeacherDashboard.tsx

# Add export import
sed -i '/import { fetchDashboardStats, DashboardStats }/a import { exportDashboardToPDF } from '"'"'@\/lib\/dashboardPdfExport'"'"';' client/src/components/admin/TeacherDashboard.tsx

# Add export function after getTrendIcon
sed -i '/const getTrendIcon/,/};/{
  /^  };$/a\
\
  const handleExportPDF = () => {\
    if (stats) {\
      try {\
        exportDashboardToPDF(stats);\
        toast.success('"'"'PDF-Bericht erfolgreich heruntergeladen'"'"');\
      } catch (error) {\
        toast.error('"'"'Fehler beim Erstellen des PDF-Berichts'"'"');\
        console.error(error);\
      }\
    }\
  };
}' client/src/components/admin/TeacherDashboard.tsx

# Add export button to header
sed -i '/<RefreshCw className={`w-4 h-4 ${isLoading ? '"'"'animate-spin'"'"' : '"'"''"'"'}`} \/>/i\
          <Button\
            onClick={handleExportPDF}\
            className="bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg px-4 py-2"\
          >\
            <Download className="w-4 h-4" />\
          </Button>' client/src/components/admin/TeacherDashboard.tsx

