import { useState, useEffect } from 'react';
import Card from '../Cards/Card';
import { API } from '../api/api';


export default function SalaryHistory() {
  const [salaries, setSalaries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      const result = await API.salaries.getTutorSalaries();
      if (result.success) {
        setSalaries(result.data.data || []);
        setSummary(result.summary);
      }
    } catch (error) {
      console.error('Error fetching salaries:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900">Salary History</h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">View your salary records</p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">Total Earned</p>
            <p className="text-2xl font-bold text-green-600">Rs {summary.total_earned?.toLocaleString()}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">Pending Amount</p>
            <p className="text-2xl font-bold text-yellow-600">Rs {summary.pending_amount?.toLocaleString()}</p>
          </Card>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700">Month</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700">Base Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700">Allowances</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700">Deductions</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700">Net Salary</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {salaries.map((salary) => (
                <tr key={salary.id} className="hover:bg-purple-50">
                  <td className="px-6 py-4 text-sm">{salary.month}</td>
                  <td className="px-6 py-4 text-sm">Rs {salary.base_amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">Rs {salary.allowances.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">Rs {salary.deductions.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-semibold">Rs {salary.net_salary.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${salary.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {salary.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};