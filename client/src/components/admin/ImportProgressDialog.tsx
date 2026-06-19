import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface ImportProgressDialogProps {
  isOpen: boolean;
  totalItems: number;
  currentItem: number;
  isProcessing: boolean;
  errors: string[];
  onCancel: () => void;
  onComplete: () => void;
}

export default function ImportProgressDialog({
  isOpen,
  totalItems,
  currentItem,
  isProcessing,
  errors,
  onCancel,
  onComplete,
}: ImportProgressDialogProps) {
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());

  useEffect(() => {
    if (currentItem > 0 && isProcessing) {
      const elapsedMs = Date.now() - startTime;
      const avgTimePerItem = elapsedMs / currentItem;
      const remainingItems = totalItems - currentItem;
      const estimatedRemainingMs = remainingItems * avgTimePerItem;
      setEstimatedTimeRemaining(Math.ceil(estimatedRemainingMs / 1000));
    }
  }, [currentItem, isProcessing, totalItems, startTime]);

  const progressPercent = totalItems > 0 ? (currentItem / totalItems) * 100 : 0;
  const hasErrors = errors.length > 0;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogTitle>Vokabeln werden importiert...</AlertDialogTitle>
        <AlertDialogDescription className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Fortschritt</span>
              <span className="font-semibold">{currentItem} / {totalItems}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="text-xs text-gray-500">
              {progressPercent.toFixed(1)}% abgeschlossen
            </div>
          </div>

          {/* Estimated Time */}
          {isProcessing && estimatedTimeRemaining > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                Geschätzte verbleibende Zeit: {estimatedTimeRemaining}s
              </span>
            </div>
          )}

          {/* Error Summary */}
          {hasErrors && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.length} Fehler gefunden</span>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {errors.slice(0, 5).map((error, idx) => (
                  <div key={idx} className="text-xs text-red-500 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                ))}
                {errors.length > 5 && (
                  <div className="text-xs text-gray-500">
                    ... und {errors.length - 5} weitere Fehler
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Message */}
          {!isProcessing && currentItem === totalItems && !hasErrors && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Import erfolgreich abgeschlossen!</span>
            </div>
          )}

          {/* Status Message */}
          {isProcessing && (
            <div className="text-sm text-gray-600">
              Bitte warten Sie, während die Vokabeln importiert werden...
            </div>
          )}
        </AlertDialogDescription>

        <div className="flex justify-end gap-2">
          {isProcessing && (
            <AlertDialogCancel onClick={onCancel}>
              Abbrechen
            </AlertDialogCancel>
          )}
          {!isProcessing && (
            <AlertDialogAction onClick={onComplete}>
              {hasErrors ? 'Schließen' : 'Fertig'}
            </AlertDialogAction>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
