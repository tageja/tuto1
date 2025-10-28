import { Card } from '../../../../components/ui/Card';

export default function ParentHealthPage() {
  const studentName = 'Emily Chen';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Health Records</h1>
        <p className="text-gray-600">{studentName} - Comprehensive health information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <h3 className="font-semibold mb-4">Physical Metrics</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Height</p>
              <p className="text-2xl font-bold text-blue-600">135 cm</p>
              <p className="text-xs text-gray-500">↑ +3cm from last check</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Weight</p>
              <p className="text-2xl font-bold text-blue-600">32 kg</p>
              <p className="text-xs text-gray-500">↑ +2kg from last check</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">BMI</p>
              <p className="text-2xl font-bold text-green-600">17.5</p>
              <p className="text-xs text-gray-500">✓ Normal range</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100">
          <h3 className="font-semibold mb-4">Allergies & Conditions</h3>
          <div className="space-y-2">
            <div className="p-3 bg-white rounded-lg">
              <p className="font-medium text-red-700">🥜 Peanut Allergy</p>
              <p className="text-xs text-gray-600">Severity: Severe</p>
              <p className="text-xs text-gray-600">EpiPen required</p>
            </div>
            <p className="text-xs text-gray-500 mt-4">Last updated: Oct 15, 2025</p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <h3 className="font-semibold mb-4">Vaccinations</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>💉 Flu Vaccine 2025</span>
              <span className="text-green-600">✓</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>💉 COVID-19 Booster</span>
              <span className="text-green-600">✓</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>💉 Routine Immunizations</span>
              <span className="text-green-600">✓</span>
            </div>
            <p className="text-xs text-gray-500 mt-4">All required vaccines up to date</p>
          </div>
        </Card>
      </div>

      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Growth Chart</h3>
        <div className="h-64 flex items-end justify-around gap-4">
          {['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Oct'].map((month, i) => {
            const height = 50 + i * 5;
            const weight = 40 + i * 6;
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full space-y-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">Height</span>
                    <span className="font-medium">{125 + i * 2}cm</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: `${height}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-2 mb-1">
                    <span className="text-gray-600">Weight</span>
                    <span className="font-medium">{28 + i}kg</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600" style={{ width: `${weight}%` }}></div>
                  </div>
                </div>
                <span className="text-xs text-gray-600 font-medium">{month}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-600 rounded"></div><span>Height (cm)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-600 rounded"></div><span>Weight (kg)</span></div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Medical Notes</h3>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Important:</strong> Student has severe peanut allergy. EpiPen is stored in the nurse's office. In case of exposure, administer EpiPen immediately and call emergency services.
          </p>
        </div>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700">
            Regular health check-ups scheduled quarterly. Next appointment: January 15, 2026.
          </p>
        </div>
      </Card>
    </div>
  );
}
