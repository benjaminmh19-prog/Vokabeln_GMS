import React from 'react';
import { useProgress } from '@/contexts/ProgressContext';
import { CheckCircle2, Circle } from 'lucide-react';

interface ProgressIndicatorProps {
  collectionId: string;
  unit: number;
  page: number;
  showLabel?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  collectionId,
  unit,
  page,
  showLabel = true,
}) => {
  const { getPageProgress } = useProgress();
  const progress = getPageProgress(collectionId, unit, page);
  const isCompleted = progress?.completed || false;
  const score = progress?.score || 0;

  return (
    <div className="flex items-center gap-2">
      {isCompleted ? (
        <CheckCircle2 className="w-5 h-5 text-green-500" />
      ) : (
        <Circle className="w-5 h-5 text-gray-300" />
      )}
      {showLabel && (
        <div className="text-sm">
          {isCompleted ? (
            <span className="text-green-600 font-semibold">
              ✓ {score}%
            </span>
          ) : (
            <span className="text-gray-500">Nicht gestartet</span>
          )}
        </div>
      )}
    </div>
  );
};

interface CollectionProgressBarProps {
  collectionId: string;
  totalPages: number;
  completedPages: number;
}

export const CollectionProgressBar: React.FC<CollectionProgressBarProps> = ({
  collectionId,
  totalPages,
  completedPages,
}) => {
  const percentage = totalPages > 0 ? (completedPages / totalPages) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-semibold text-[#2E3192]">
          Fortschritt
        </span>
        <span className="text-sm text-gray-600">
          {completedPages}/{totalPages}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#FFD93D] to-[#FF9F1C] h-full transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface UnitProgressProps {
  collectionId: string;
  unit: number;
  totalPages: number;
  completedPages: number;
}

export const UnitProgress: React.FC<UnitProgressProps> = ({
  collectionId,
  unit,
  totalPages,
  completedPages,
}) => {
  const percentage = totalPages > 0 ? (completedPages / totalPages) * 100 : 0;

  return (
    <div className="bg-white p-3 rounded-lg border-2 border-[#2E3192]">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-[#2E3192]">Unit {unit}</span>
        <span className="text-sm text-gray-600">
          {completedPages}/{totalPages}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-[#2E3192] h-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
