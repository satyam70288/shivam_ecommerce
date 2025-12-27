// components/admin/StatusHistory.jsx

// ❌ WRONG: exports.StatusHistory = ...
// ✅ CORRECT: const StatusHistory = ...

const StatusHistory = ({ order }) => {
    
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Status History</h3>
      
      {!order.statusHistory || order.statusHistory.length === 0 ? (
        <p className="text-gray-500">No status history available</p>
      ) : (
        <div className="space-y-4">
          {order.statusHistory.map((change, index) => (
            <div 
              key={index} 
              className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg dark:bg-gray-800 dark:border-blue-400"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      change.status === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      change.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                      change.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      change.status === 'CONFIRMED' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                      change.status === 'PACKED' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {change.status}
                    </span>
                    {change.changedBy?.name && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        by {change.changedBy.name}
                      </span>
                    )}
                  </div>
                  
                  {change.reason && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {change.reason}
                    </p>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(change.changedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(change.changedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ✅ Add export at the end
export default StatusHistory;
// OR
// export { StatusHistory };