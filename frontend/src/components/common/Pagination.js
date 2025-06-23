import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalItems, 
  pageSize, 
  onPageChange,
  maxVisibleButtons = 5
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }
  
  // Calculate range of visible page buttons
  const getVisiblePageRange = () => {
    // Basic range: keep 5 buttons (or fewer if there's not enough pages)
    let start = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let end = start + maxVisibleButtons - 1;
    
    // Adjust if end is beyond totalPages
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisibleButtons + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePageRange();
  
  return (
    <div className="flex justify-center my-4">
      <nav className="inline-flex shadow-sm rounded-md -space-x-px">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-l-md text-sm font-medium ${
            currentPage === 1
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-default'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          } border border-gray-300 dark:border-gray-600`}
        >
          &laquo; Prev
        </button>
        
        {/* First page button if not in visible range */}
        {visiblePages[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              1
            </button>
            {visiblePages[0] > 2 && (
              <span className="px-3 py-2 text-sm text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                ...
              </span>
            )}
          </>
        )}
        
        {/* Page number buttons */}
        {visiblePages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 text-sm font-medium ${
              page === currentPage
                ? 'bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-300 z-10'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } border border-gray-300 dark:border-gray-600`}
          >
            {page}
          </button>
        ))}
        
        {/* Last page button if not in visible range */}
        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <span className="px-3 py-2 text-sm text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                ...
              </span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {totalPages}
            </button>
          </>
        )}
        
        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-r-md text-sm font-medium ${
            currentPage === totalPages
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-default'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          } border border-gray-300 dark:border-gray-600`}
        >
          Next &raquo;
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
