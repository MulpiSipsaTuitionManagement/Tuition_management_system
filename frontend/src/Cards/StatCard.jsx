import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from './Card';

export default function StatCard({ value, label, change, changeType, icon, loading }) {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      {loading ? (
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              {icon}
            </div>
            {change && (
              <div className={`flex items-center text-sm font-medium ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {changeType === 'positive' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {change}
              </div>
            )}
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
          <p className="text-sm text-gray-600">{label}</p>
        </>
      )}
    </Card>
  );
}