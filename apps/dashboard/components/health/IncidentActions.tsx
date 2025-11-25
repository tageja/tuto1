'use client';

import { useState } from 'react';
import { Thermometer, Wind, Moon, Bandage } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useI18n } from '../../contexts/I18nContext';

interface IncidentActionsProps {
  studentId: string;
  onSuccess?: () => void;
}

export function IncidentActions({ studentId, onSuccess }: IncidentActionsProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState<string | null>(null);
  const [showTempInput, setShowTempInput] = useState(false);
  const [temperature, setTemperature] = useState('');

  const handleIncident = async (category: 'fever' | 'cough' | 'tired' | 'injury', meta?: any) => {
    setLoading(category);

    try {
      const response = await fetch('/api/health/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          category,
          meta: meta || {},
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to report incident');
      }

      setShowTempInput(false);
      setTemperature('');
      onSuccess?.();
      
      // Show success message (you can use a toast library here)
      alert(t('dashboard.health.toasts.incidentReported'));
    } catch (error: any) {
      console.error('Error reporting incident:', error);
      alert(error.message || 'Failed to report incident');
    } finally {
      setLoading(null);
    }
  };

  const handleFever = () => {
    if (showTempInput) {
      // Submit with temperature
      const temp = parseFloat(temperature);
      if (isNaN(temp)) {
        alert('Please enter a valid temperature');
        return;
      }
      handleIncident('fever', { temperature_c: temp });
    } else {
      // Show temperature input
      setShowTempInput(true);
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Health Reports</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button
          variant="outline"
          onClick={handleFever}
          disabled={loading !== null}
          className="flex flex-col items-center gap-2 h-auto py-3"
        >
          <Thermometer className="w-5 h-5" />
          <span>{t('dashboard.health.buttons.reportFever')}</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => handleIncident('cough')}
          disabled={loading !== null}
          className="flex flex-col items-center gap-2 h-auto py-3"
        >
          <Wind className="w-5 h-5" />
          <span>{t('dashboard.health.buttons.reportCough')}</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => handleIncident('tired')}
          disabled={loading !== null}
          className="flex flex-col items-center gap-2 h-auto py-3"
        >
          <Moon className="w-5 h-5" />
          <span>{t('dashboard.health.buttons.reportTired')}</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => handleIncident('injury')}
          disabled={loading !== null}
          className="flex flex-col items-center gap-2 h-auto py-3"
        >
          <Bandage className="w-5 h-5" />
          <span>{t('dashboard.health.buttons.reportInjury')}</span>
        </Button>
      </div>

      {showTempInput && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('dashboard.health.incident.temperature')} ({t('dashboard.health.incident.optional')})
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="37.5"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={handleFever}
              disabled={loading !== null}
              size="sm"
            >
              {loading === 'fever' ? t('common.loading') : 'Submit'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowTempInput(false);
                setTemperature('');
              }}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

