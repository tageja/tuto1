'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useI18n } from '../../../../../contexts/I18nContext';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { UploadStep } from '../../../../../components/school/import/UploadStep';
import { MappingStep } from '../../../../../components/school/import/MappingStep';
import { PreviewStep } from '../../../../../components/school/import/PreviewStep';
import { Toast } from '../../../../../components/ui/Toast';
import { autoMap } from '../../../../../lib/school/import/mapper';
import type { ImportEntity, ColumnMapping } from '../../../../../lib/school/import/types';

type Step = 'upload' | 'mapping' | 'preview';

export default function ImportDataPage() {
  const params = useParams();
  const { t } = useI18n();
  const schoolId = decodeURIComponent(params.schoolId as string);

  const [entity, setEntity] = useState<ImportEntity>('teachers');
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: { row: number; field: string; message: string; value?: string }[];
    preview: Record<string, string>[];
    totalRows: number;
  } | null>(null);
  const [saveMappingChecked, setSaveMappingChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const resetForEntity = useCallback(() => {
    setStep('upload');
    setFile(null);
    setHeaders([]);
    setRows([]);
    setMapping({});
    setValidationResult(null);
  }, []);

  const handleEntityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEntity = e.target.value as ImportEntity;
    setEntity(newEntity);
    resetForEntity();
  };

  const handleDownloadTemplate = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/school/${encodeURIComponent(schoolId)}/import/template?entity=${entity}`
      );
      if (!res.ok) throw new Error('Failed to download');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entity}-template.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setToast({ message: 'Failed to download template', type: 'error' });
    }
  }, [schoolId, entity]);

  const handleFileSelected = useCallback(
    async (selectedFile: File) => {
      setFile(selectedFile);
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('entity', entity);
        const [parseRes, mappingRes] = await Promise.all([
          fetch(`/api/school/${encodeURIComponent(schoolId)}/import/parse`, {
            method: 'POST',
            body: formData,
          }),
          fetch(
            `/api/school/${encodeURIComponent(schoolId)}/import/mapping?entity=${entity}`
          ),
        ]);
        const parseData = await parseRes.json();
        if (!parseData.success) throw new Error(parseData.error || 'Parse failed');
        setHeaders(parseData.data.headers);
        setRows(parseData.data.rows);
        const auto = autoMap(parseData.data.headers, entity);
        let merged = { ...auto.mapping };
        if (mappingRes.ok) {
          const mappingData = await mappingRes.json();
          if (mappingData.success && mappingData.data?.mapping) {
            const saved = mappingData.data.mapping as ColumnMapping;
            for (const h of parseData.data.headers) {
              if (saved[h]) merged[h] = saved[h];
            }
          }
        }
        setMapping(merged);
        setStep('mapping');
      } catch (err) {
        setToast({
          message: err instanceof Error ? err.message : 'Failed to parse file',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [schoolId, entity]
  );

  const handleClearFile = useCallback(() => {
    setFile(null);
    setHeaders([]);
    setRows([]);
    setMapping({});
    setStep('upload');
  }, []);

  const handleMappingNext = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/school/${encodeURIComponent(schoolId)}/import/validate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entity, mapping, rows }),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Validation failed');
      setValidationResult({
        valid: data.data.valid,
        errors: data.data.errors || [],
        preview: data.data.preview || [],
        totalRows: data.data.totalRows || 0,
      });
      setStep('preview');
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Validation failed',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, entity, mapping, rows]);

  const handleSaveMapping = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/school/${encodeURIComponent(schoolId)}/import/mapping`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entity, mapping }),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Save failed');
      setToast({ message: 'Mapping saved', type: 'success' });
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Failed to save mapping',
        type: 'error',
      });
    }
  }, [schoolId, entity, mapping]);

  const handleConfirmImport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/school/${encodeURIComponent(schoolId)}/import/execute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entity, mapping, rows }),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Import failed');
      setToast({
        message: `Imported ${data.data.successCount} of ${data.data.totalRows} row(s)`,
        type: 'success',
      });
      resetForEntity();
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Import failed',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, entity, mapping, rows, resetForEntity]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text">{t('importTitle') || 'Import Data'}</h1>
        <p className="text-sm text-text-muted mt-1">
          {t('importSubtitle') || 'Upload teachers, classes, or students from CSV or Excel files.'}
        </p>
      </div>

      <Card padding="lg" variant="bordered" className="mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-text">{t('importType') || 'Import type'}</label>
          <select
            value={entity}
            onChange={handleEntityChange}
            className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="teachers">{t('teachers')}</option>
            <option value="classes">{t('classes')}</option>
            <option value="students">{t('students')}</option>
          </select>
        </div>
      </Card>

      {step === 'upload' && (
        <UploadStep
          entity={entity}
          onFileSelected={handleFileSelected}
          onClear={handleClearFile}
          onDownloadTemplate={handleDownloadTemplate}
          isUploading={isLoading}
        />
      )}

      {step === 'mapping' && (
        <MappingStep
          entity={entity}
          headers={headers}
          mapping={mapping}
          onMappingChange={setMapping}
          onNext={handleMappingNext}
          onSaveMapping={handleSaveMapping}
          saveMappingChecked={saveMappingChecked}
          onSaveMappingCheckedChange={setSaveMappingChecked}
        />
      )}

      {step === 'preview' && validationResult && (
        <PreviewStep
          previewRows={validationResult.preview}
          errors={validationResult.errors}
          totalRows={validationResult.totalRows}
          isValid={validationResult.valid}
          onConfirm={handleConfirmImport}
          isImporting={isLoading}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
