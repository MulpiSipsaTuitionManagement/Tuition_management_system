import { useState } from 'react';
import { X } from 'lucide-react';
import Card from '../Cards/Card';
import { API } from '../api/api';

export default function RecordPaymentModal({ fee, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        payment_method: 'Cash',
        paid_date: new Date().toISOString().split('T')[0],
        remarks: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await API.fees.recordPayment(fee.id, formData);
            if (result.success) {
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Error recording payment:', error);
            alert('Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-purple-900">Record Payment</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-gray-600">Student: <span className="font-semibold text-gray-900">{fee.student?.full_name}</span></p>
                    <p className="text-sm text-gray-600">Amount: <span className="font-semibold text-gray-900">Rs {fee.amount.toLocaleString()}</span></p>
                    <p className="text-sm text-gray-600">Fee Type: <span className="font-semibold text-gray-900">{fee.fee_type}</span></p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                        <select
                            value={formData.payment_method}
                            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Card">Card</option>
                            <option value="Online">Online</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Paid Date *</label>
                        <input
                            type="date"
                            value={formData.paid_date}
                            onChange={(e) => setFormData({ ...formData, paid_date: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                        <textarea
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            rows="3"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Recording...' : 'Record Payment'}
                    </button>
                </div>
            </Card>
        </div>
    );
};