import { useState, useEffect } from 'react';
import Card from '../Cards/Card';
import { API } from '../api/api';

export default function StudentFees() {
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const result = await API.fees.getStudentFees({ sort: 'asc' });
      if (result.success) {
        setFees(result.data.data || []);
        setSummary(result.summary);
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900">Fee History</h2>
        <p className="text-sm text-gray-600 mt-1">View your fee payment history</p>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">Total Fees</p>
            <p className="text-2xl font-bold text-gray-900">Rs {summary.total_fees?.toLocaleString()}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">Paid</p>
            <p className="text-2xl font-bold text-green-600">Rs {summary.paid?.toLocaleString()}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-red-600">Rs {summary.pending?.toLocaleString()}</p>
          </Card>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700">Fee Month</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700">Due Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700">Paid Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fees.map((fee) => (
                <tr key={fee.fee_id} className="hover:bg-purple-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">
                    {new Date(fee.due_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">Rs {fee.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(fee.due_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {fee.paid_date ? new Date(fee.paid_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${fee.status === 'paid' ? 'bg-green-100 text-green-700' :
                        fee.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                      }`}>
                      {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
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
}