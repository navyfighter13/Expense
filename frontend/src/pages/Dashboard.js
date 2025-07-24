import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matchAPI, transactionAPI, receiptAPI } from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [pendingMatches, setPendingMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load statistics
      const statsResponse = await matchAPI.getStats();
      setStats(statsResponse.data);

      // Load recent transactions
      const transactionsResponse = await transactionAPI.getAll(1, 5);
      setRecentTransactions(transactionsResponse.data.transactions || []);

      // Load recent receipts
      const receiptsResponse = await receiptAPI.getAll(1, 5);
      setRecentReceipts(receiptsResponse.data.receipts || []);

      // Load pending matches
      const matchesResponse = await matchAPI.getPending();
      setPendingMatches(matchesResponse.data.slice(0, 5) || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
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

  const handleAutoMatch = async () => {
    try {
      const response = await matchAPI.autoMatch(70);
      toast.success(`Auto-matched ${response.data.matched} receipts!`);
      loadDashboardData(); // Refresh data
    } catch (error) {
      toast.error('Error running auto-match');
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
        <h1>Dashboard</h1>
        <button className="btn btn-primary" onClick={handleAutoMatch}>
          🤖 Auto-Match Receipts
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-4 mb-3">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Total Matches</h3>
          </div>
          <div className="text-xl text-center">
            {stats.total_matches || 0}
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Confirmed Matches</h3>
          </div>
          <div className="text-xl text-center text-success">
            {stats.confirmed_matches || 0}
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pending Matches</h3>
          </div>
          <div className="text-xl text-center text-warning">
            {stats.pending_matches || 0}
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Unmatched Receipts</h3>
          </div>
          <div className="text-xl text-center text-danger">
            {stats.unmatched_receipts || 0}
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <div className="flex-between">
              <h3 className="card-title">Recent Transactions</h3>
              <Link to="/transactions" className="btn btn-sm btn-secondary">
                View All
              </Link>
            </div>
          </div>
          
          {recentTransactions.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{formatDate(transaction.transaction_date)}</td>
                      <td>{transaction.description}</td>
                      <td className={transaction.amount < 0 ? 'text-danger' : 'text-success'}>
                        ${Math.abs(transaction.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray text-center">No transactions found</p>
          )}
        </div>

        {/* Recent Receipts */}
        <div className="card">
          <div className="card-header">
            <div className="flex-between">
              <h3 className="card-title">Recent Receipts</h3>
              <Link to="/receipts" className="btn btn-sm btn-secondary">
                View All
              </Link>
            </div>
          </div>
          
          {recentReceipts.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Filename</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReceipts.map((receipt) => (
                    <tr key={receipt.id}>
                      <td>{receipt.original_filename}</td>
                      <td>
                        {receipt.extracted_amount ? 
                          `$${receipt.extracted_amount.toFixed(2)}` : 
                          '-'
                        }
                      </td>
                      <td>
                        <span className={`badge badge-${
                          receipt.processing_status === 'completed' ? 'success' :
                          receipt.processing_status === 'processing' ? 'warning' :
                          'danger'
                        }`}>
                          {receipt.processing_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray text-center">No receipts found</p>
          )}
        </div>
      </div>

      {/* Pending Matches */}
      {pendingMatches.length > 0 && (
        <div className="card mt-3">
          <div className="card-header">
            <div className="flex-between">
              <h3 className="card-title">Pending Matches</h3>
              <Link to="/matches" className="btn btn-sm btn-secondary">
                Review All
              </Link>
            </div>
          </div>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Transaction</th>
                  <th>Confidence</th>
                  <th>Amount Match</th>
                </tr>
              </thead>
              <tbody>
                {pendingMatches.map((match) => (
                  <tr key={match.id}>
                    <td>{match.original_filename}</td>
                    <td>{match.description}</td>
                    <td>
                      <span className={`badge badge-${
                        match.match_confidence >= 80 ? 'success' :
                        match.match_confidence >= 60 ? 'warning' :
                        'danger'
                      }`}>
                        {match.match_confidence}%
                      </span>
                    </td>
                    <td>
                      ${Math.abs(match.transaction_amount).toFixed(2)} / 
                      ${match.extracted_amount?.toFixed(2) || '?'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card mt-3">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/import" className="btn btn-primary">
            📄 Import Transactions
          </Link>
          <Link to="/receipts" className="btn btn-success">
            📷 Upload Receipt
          </Link>
          <Link to="/matches" className="btn btn-warning">
            🔗 Review Matches
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 