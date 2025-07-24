import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { transactionAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ImportTransactions = () => {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const response = await transactionAPI.importCSV(file);
      setImportResult(response.data);
      toast.success(`Import completed! ${response.data.imported} transactions imported`);
    } catch (error) {
      console.error('Error importing transactions:', error);
      toast.error('Error importing transactions');
    } finally {
      setImporting(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false,
    disabled: importing
  });

  return (
    <div>
      <div className="flex-between mb-3">
        <h1>Import Transactions</h1>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <h3 className="card-title">Upload Chase CSV File</h3>
          <p className="card-subtitle">
            Import your Chase credit card transactions from a CSV file
          </p>
        </div>

        <div className="mb-3">
          <h4>Instructions:</h4>
          <ol className="text-sm text-gray">
            <li>Log into your Chase account</li>
            <li>Go to your credit card account</li>
            <li>Navigate to Statements & Activity</li>
            <li>Click "Download transactions" and select CSV format</li>
            <li>Upload the downloaded CSV file here</li>
          </ol>
        </div>

        <div 
          {...getRootProps()} 
          className={`dropzone ${isDragActive ? 'active' : ''} ${importing ? 'disabled' : ''}`}
        >
          <input {...getInputProps()} />
          {importing ? (
            <div className="flex-center gap-2">
              <div className="spinner"></div>
              <span>Importing transactions...</span>
            </div>
          ) : isDragActive ? (
            <p>Drop the CSV file here...</p>
          ) : (
            <div>
              <p><strong>Drag & drop</strong> your Chase CSV file here, or <strong>click to select</strong></p>
              <p className="text-sm text-gray">Only CSV files are accepted</p>
            </div>
          )}
        </div>
      </div>

      {/* Import Result */}
      {importResult && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Import Results</h3>
          </div>
          
          <div className="grid grid-3 mb-3">
            <div className="text-center">
              <div className="text-xl text-success">{importResult.imported}</div>
              <div className="text-sm text-gray">Imported</div>
            </div>
            <div className="text-center">
              <div className="text-xl text-warning">{importResult.skipped}</div>
              <div className="text-sm text-gray">Skipped (Duplicates)</div>
            </div>
            <div className="text-center">
              <div className="text-xl">{importResult.total}</div>
              <div className="text-sm text-gray">Total Processed</div>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={() => navigate('/transactions')}
              className="btn btn-primary"
            >
              View Transactions
            </button>
            <button
              onClick={() => navigate('/receipts')}
              className="btn btn-success"
            >
              Upload Receipts
            </button>
            <button
              onClick={() => setImportResult(null)}
              className="btn btn-secondary"
            >
              Import More
            </button>
          </div>
        </div>
      )}

      {/* CSV Format Information */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Expected CSV Format</h3>
          <p className="card-subtitle">
            Your Chase CSV should contain these columns:
          </p>
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Column Name</th>
                <th>Description</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>Transaction Date</code></td>
                <td>Date of the transaction</td>
                <td>01/15/2024</td>
              </tr>
              <tr>
                <td><code>Description</code></td>
                <td>Merchant name and details</td>
                <td>STARBUCKS STORE #12345</td>
              </tr>
              <tr>
                <td><code>Category</code></td>
                <td>Transaction category</td>
                <td>Food & Drink</td>
              </tr>
              <tr>
                <td><code>Amount</code></td>
                <td>Transaction amount (negative for debits)</td>
                <td>-4.50</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3 p-3 bg-gray-100 rounded">
          <p className="text-sm text-gray">
            <strong>Note:</strong> Duplicate transactions (same date, description, and amount) will be automatically skipped during import.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImportTransactions; 