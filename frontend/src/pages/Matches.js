import React, { useState, useEffect } from 'react';
import { matchAPI } from '../services/api';
import { toast } from 'react-toastify';

const Matches = () => {
  const [pendingMatches, setPendingMatches] = useState([]);
  const [confirmedMatches, setConfirmedMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadMatches();
  }, []);

  // Helper function to format dates without timezone conversion
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Parse as local date to avoid timezone shifts
    // Database format: YYYY-MM-DD
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    return date.toLocaleDateString();
  };

  const loadMatches = async () => {
    setLoading(true);
    try {
      const [pendingResponse, allResponse] = await Promise.all([
        matchAPI.getPending(),
        matchAPI.getAll()
      ]);
      
      setPendingMatches(pendingResponse.data || []);
      setConfirmedMatches(
        allResponse.data.filter(match => match.user_confirmed) || []
      );
    } catch (error) {
      console.error('Error loading matches:', error);
      toast.error('Error loading matches');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (matchId) => {
    try {
      await matchAPI.confirm(matchId);
      toast.success('Match confirmed');
      loadMatches(); // Refresh the data
    } catch (error) {
      toast.error('Error confirming match');
    }
  };

  const handleReject = async (matchId) => {
    try {
      await matchAPI.reject(matchId);
      toast.success('Match rejected');
      loadMatches(); // Refresh the data
    } catch (error) {
      toast.error('Error rejecting match');
    }
  };

  const handleDelete = async (matchId) => {
    if (!window.confirm('Are you sure you want to delete this match?')) {
      return;
    }
    
    try {
      await matchAPI.delete(matchId);
      toast.success('Match deleted');
      loadMatches(); // Refresh the data
    } catch (error) {
      toast.error('Error deleting match');
    }
  };

  const getConfidenceBadge = (confidence) => {
    const badgeClass = 
      confidence >= 80 ? 'badge-success' :
      confidence >= 60 ? 'badge-warning' :
      'badge-danger';
    
    return <span className={`badge ${badgeClass}`}>{confidence}%</span>;
  };

  const formatAmount = (amount) => {
    const isDebit = amount < 0;
    return (
      <span className={isDebit ? 'text-danger' : 'text-success'}>
        {isDebit ? '-' : '+'}${Math.abs(amount).toFixed(2)}
      </span>
    );
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
        <h1>Matches</h1>
        <div className="text-sm text-gray">
          {pendingMatches.length} pending, {confirmedMatches.length} confirmed
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-3">
        <div className="flex gap-2 mb-3">
          <button
            className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Matches ({pendingMatches.length})
          </button>
          <button
            className={`btn ${activeTab === 'confirmed' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('confirmed')}
          >
            Confirmed Matches ({confirmedMatches.length})
          </button>
        </div>

        {/* Pending Matches */}
        {activeTab === 'pending' && (
          <div>
            <h3 className="card-title mb-2">Pending Matches</h3>
            <p className="text-sm text-gray mb-3">
              Review and confirm or reject these suggested matches
            </p>
            
            {pendingMatches.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Receipt</th>
                      <th>Transaction</th>
                      <th>Date</th>
                      <th>Amount Comparison</th>
                      <th>Confidence</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingMatches.map((match) => (
                      <tr key={match.id}>
                        <td>
                          <div className="text-sm">
                            <strong>{match.original_filename}</strong>
                            {match.extracted_merchant && (
                              <div className="text-gray">{match.extracted_merchant}</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">
                            <strong>{match.description}</strong>
                            <div className="text-gray">
                              {formatDate(match.transaction_date)}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">
                            <div>Receipt: {match.extracted_date || 'Unknown'}</div>
                            <div>Transaction: {formatDate(match.transaction_date)}</div>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">
                            <div>Receipt: ${match.extracted_amount?.toFixed(2) || '?'}</div>
                            <div>Transaction: {formatAmount(match.transaction_amount)}</div>
                          </div>
                        </td>
                        <td>
                          {getConfidenceBadge(match.match_confidence)}
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleConfirm(match.id)}
                              className="btn btn-sm btn-success"
                            >
                              ✓ Confirm
                            </button>
                            <button
                              onClick={() => handleReject(match.id)}
                              className="btn btn-sm btn-danger"
                            >
                              ✗ Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray">
                <p>No pending matches</p>
                <p className="text-sm">Upload receipts to generate matches</p>
              </div>
            )}
          </div>
        )}

        {/* Confirmed Matches */}
        {activeTab === 'confirmed' && (
          <div>
            <h3 className="card-title mb-2">Confirmed Matches</h3>
            <p className="text-sm text-gray mb-3">
              Successfully matched receipts and transactions
            </p>
            
            {confirmedMatches.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Receipt</th>
                      <th>Transaction</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Confidence</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmedMatches.map((match) => (
                      <tr key={match.id}>
                        <td>
                          <div className="text-sm">
                            <strong>{match.original_filename}</strong>
                            {match.extracted_merchant && (
                              <div className="text-gray">{match.extracted_merchant}</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">
                            <strong>{match.description}</strong>
                            <div className="text-gray">
                              {formatDate(match.transaction_date)}
                            </div>
                          </div>
                        </td>
                        <td>
                          {formatDate(match.transaction_date)}
                        </td>
                        <td>
                          {formatAmount(match.transaction_amount)}
                        </td>
                        <td>
                          {getConfidenceBadge(match.match_confidence)}
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(match.id)}
                            className="btn btn-sm btn-danger"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray">
                <p>No confirmed matches yet</p>
                <p className="text-sm">Confirm pending matches to see them here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches; 