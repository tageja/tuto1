'use client';

import { useCallback, useState } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { useI18n } from '../../../contexts/I18nContext';
import { Upload, FileSpreadsheet, X } from 'lucide-react';

interface UploadStepProps {
  entity: string;
  onFileSelected: (file: File) => void;
  onClear?: () => void;
  onDownloadTemplate: () => void;
  isUploading?: boolean;
}

export function UploadStep({
  entity,
  onFileSelected,
  onClear,
  onDownloadTemplate,
  isUploading = false,
}: UploadStepProps) {
  const { t } = useI18n();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
        setSelectedFile(file);
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    onClear?.();
  }, [onClear]);

  return (
    <div className="space-y-6">
      <Card padding="lg" variant="bordered">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-text">
              {entity === 'teachers' ? t('importTeachersTemplate') : entity === 'classes' ? t('importClassesTemplate') : t('importStudentsTemplate')}
            </h3>
            <Button variant="outline" size="sm" onClick={onDownloadTemplate} disabled={isUploading}>
              {t('downloadTemplate') || 'Download CSV template'}
            </Button>
          </div>
          <p className="text-sm text-text-muted">
            {t('importTemplateDesc')}
          </p>
        </div>
      </Card>

      <Card padding="lg" variant="bordered">
        <div className="space-y-4">
          <h3 className="text-base font-medium text-text">{t('importUploadFile')}</h3>
          <p className="text-sm text-text-muted">
            {t('importUploadDesc')}
          </p>

          {selectedFile ? (
            <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-surface">
              <FileSpreadsheet className="w-8 h-8 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{selectedFile.name}</p>
                <p className="text-xs text-text-muted">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFile}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-10 h-10 mx-auto mb-3 text-text-muted" />
              <p className="text-sm text-text">
                {t('importDragDrop')}
              </p>
              <p className="text-xs text-text-muted mt-1">{t('importFileTypes')}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
