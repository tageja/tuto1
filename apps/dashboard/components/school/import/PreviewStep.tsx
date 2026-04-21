'use client';

import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { ValidationError } from '../../../lib/school/import/types';

interface PreviewStepProps {
  previewRows: Record<string, string>[];
  errors: ValidationError[];
  totalRows: number;
  isValid: boolean;
  onConfirm: () => void;
  isImporting?: boolean;
}

export function PreviewStep({
  previewRows,
  errors,
  totalRows,
  isValid,
  onConfirm,
  isImporting = false,
}: PreviewStepProps) {
  const columns = previewRows[0] ? Object.keys(previewRows[0]) : [];

  return (
    <div className="space-y-6">
      <Card padding="lg" variant="bordered">
        <div className="space-y-4">
          <h3 className="text-base font-medium text-text">Preview</h3>
          <p className="text-sm text-text-muted">
            {totalRows} row(s) ready to import. Review the data below.
          </p>

          {errors.length > 0 && (
            <div className="rounded-lg border border-warning/50 bg-warning/10 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-text">
                    {errors.length} validation error(s) found
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-text-muted max-h-32 overflow-y-auto">
                    {errors.slice(0, 10).map((e, i) => (
                      <li key={i}>
                        Row {e.row}: {e.field} — {e.message}
                        {e.value && ` (value: "${e.value}")`}
                      </li>
                    ))}
                    {errors.length > 10 && (
                      <li className="text-text-muted">...and {errors.length - 10} more</li>
                    )}
                  </ul>
                  <p className="mt-2 text-xs text-text-muted">
                    Rows with errors will be skipped during import.
                  </p>
                </div>
              </div>
            </div>
          )}

          {columns.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-2 text-left font-medium text-text"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.slice(0, 10).map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-border last:border-0 hover:bg-surface/50"
                    >
                      {columns.map((col) => (
                        <td
                          key={col}
                          className="px-4 py-2 text-text-muted max-w-[200px] truncate"
                          title={String(row[col] ?? '')}
                        >
                          {String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewRows.length > 10 && (
                <p className="px-4 py-2 text-xs text-text-muted border-t border-border">
                  Showing first 10 of {previewRows.length} rows
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              {isValid ? (
                <CheckCircle className="w-5 h-5 text-success" />
              ) : (
                <AlertCircle className="w-5 h-5 text-warning" />
              )}
              <span className="text-sm text-text">
                {isValid
                  ? 'All rows valid'
                  : `${errors.length} row(s) have errors and will be skipped`}
              </span>
            </div>
            <Button onClick={onConfirm} disabled={isImporting}>
              {isImporting ? 'Importing...' : `Import ${totalRows} row(s)`}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
