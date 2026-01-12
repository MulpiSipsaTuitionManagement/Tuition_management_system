import { ChevronLeft,ChevronRight } from 'lucide-react';


export default function Pagination ({ currentPage, totalPages, onPageChange }) {
  <div className="flex items-center justify-center space-x-2 mt-6">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="p-2 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ChevronLeft className="w-5 h-5" />
    </button>
    <span className="text-sm text-gray-600">
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="p-2 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ChevronRight className="w-5 h-5" />
    </button>
  </div>
};