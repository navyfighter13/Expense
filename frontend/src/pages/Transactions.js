import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import { toast } from 'react-toastify';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadTransactions(currentPage);
  }, [currentPage]);

  const loadTransactions = async (page = 1) => {
    setLoading(true);
    try {
      const response = await transactionAPI.getAll(page, 50);
      setTransactions(response.data.transactions || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Error loading transactions');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const formatAmount = (amount) => {
    const isDebit = amount < 0;
    return (
      <span className={isDebit ? 'text-danger' : 'text-success'}>
        {isDebit ? '-' : '+'}${Math.abs(amount).toFixed(2)}
      </span>
    );
  };

  // Helper function to format dates without timezone conversion
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Parse as local date to avoid timezone shifts
    // Database format: YYYY-MM-DD
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    return date.toLocaleDateString();
  };

  const getReceiptStatus = (receiptCount) => {
    if (receiptCount > 0) {
      return <span className="badge badge-success">Matched</span>;
    }
    return <span className="badge badge-warning">Unmatched</span>;
  };

  const handleDelete = async (transactionId, description) => {
    if (window.confirm(`Are you sure you want to delete this transaction?\n\n"${description}"\n\nThis action cannot be undone.`)) {
      try {
        await transactionAPI.delete(transactionId);
        toast.success('Transaction deleted successfully');
        // Refresh the current page of transactions
        loadTransactions(currentPage);
      } catch (error) {
        console.error('Error deleting transaction:', error);
        toast.error('Error deleting transaction');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-3">
        <h1>Transactions</h1>
        <div className="text-sm text-gray">
          Total: {pagination.total || 0} transactions
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Transactions</h3>
          <p className="card-subtitle">
            Imported Chase credit card transactions
          </p>
        </div>

        {transactions.length > 0 ? (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Transaction ID</th>
                    <th>Sales Tax</th>
                    <th>Amount</th>
                    <th>Receipt Status</th>
                    <th>Receipts</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        {formatDate(transaction.transaction_date)}
                      </td>
                      <td>
                        <div className="text-sm">
                          {transaction.description}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {transaction.category || 'Other'}
                        </span>
                      </td>
                      <td>
                        <div className="text-sm text-gray">
                          {transaction.external_transaction_id || 'N/A'}
                        </div>
                      </td>
                      <td>
                        {transaction.sales_tax ? formatAmount(transaction.sales_tax) : 'N/A'}
                      </td>
                      <td>{formatAmount(transaction.amount)}</td>
                      <td>{getReceiptStatus(transaction.receipt_count)}</td>
                      <td>
                        {transaction.receipts ? (
                          <div className="text-sm">
                            {transaction.receipts.split(',').map((receipt, index) => (
                              <div key={index}>{receipt}</div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray">None</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(transaction.id, transaction.description)}
                          className="btn btn-sm btn-danger"
                          title="Delete transaction"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex-center mt-3 gap-2">
                <button
                  className="btn btn-sm btn-secondary"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>
                
                <span className="text-sm">
                  Page {currentPage} of {pagination.pages}
                </span>
                
                <button
                  className="btn btn-sm btn-secondary"
                  disabled={currentPage >= pagination.pages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray">
            <p>No transactions found</p>
            <p className="text-sm">Import your Chase CSV file to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions; 