import React, { useState } from 'react';
import { Upload, X, FileText, Check, Loader2, AlertCircle } from 'lucide-react';

const IPFSUploaderDebug = ({ patientAddress = "0x1234567890abcdef", onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [ipfsCID, setIpfsCID] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [downloadLink, setDownloadLink] = useState('');
  const [debugLogs, setDebugLogs] = useState([]);
  const [error, setError] = useState('');

  // Mock blockchain context
  const uploadEncryptedReport = async (address, cid) => {
    addDebugLog(`📝 Recording on blockchain: ${address} -> ${cid}`);
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    addDebugLog('✅ Blockchain transaction completed');
  };

  const addDebugLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearDebugLogs = () => {
    setDebugLogs([]);
    setError('');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      addDebugLog(`📁 File selected: ${selectedFile.name} (${formatFileSize(selectedFile.size)})`);
      
      // File validation
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        setError('File size exceeds 10MB limit');
        addDebugLog('❌ File too large');
        return;
      }

      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png', '.zip'];
      const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        setError(`File type ${fileExtension} not allowed`);
        addDebugLog(`❌ Invalid file type: ${fileExtension}`);
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileSize(selectedFile.size);
      setUploadSuccess(false);
      setIpfsCID('');
      setDownloadLink('');
      setError('');
      addDebugLog('✅ File validation passed');
    }
  };

  const clearFile = () => {
    setFile(null);
    setFileName('');
    setFileSize(0);
    setUploadSuccess(false);
    setIpfsCID('');
    setDownloadLink('');
    setError('');
    addDebugLog('🗑️ File cleared');
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const simulateIPFSUpload = async (file) => {
    // Simulate IPFS upload with random CID
    const randomCID = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate potential network errors
    if (Math.random() < 0.1) { // 10% chance of failure
      throw new Error('Network timeout - IPFS node unreachable');
    }
    
    return {
      success: true,
      cid: randomCID,
      message: 'File uploaded successfully to IPFS'
    };
  };

  const uploadToIPFS = async () => {
    clearDebugLogs();
    addDebugLog('🚀 Starting upload process...');

    // Validation checks
    if (!file) {
      setError('Please select a file first');
      addDebugLog('❌ No file selected');
      return;
    }

    if (!patientAddress) {
      setError('Patient address is required');
      addDebugLog('❌ No patient address provided');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      addDebugLog('📤 Preparing file for upload...');
      
      // Check if backend is reachable (simulation)
      addDebugLog('🔍 Checking IPFS backend connection...');
      
      // Simulate the actual upload process your code does
      const formData = new FormData();
      formData.append('file', file);
      
      addDebugLog('📋 FormData prepared, making request to localhost:5000...');

      try {
        // In your real code, this would be the actual fetch call
        // const response = await fetch('http://localhost:5000/api/ipfs/upload', {
        //   method: 'POST',
        //   body: formData
        // });
        
        // For demo purposes, simulate the upload
        addDebugLog('⏳ Uploading to IPFS node...');
        const data = await simulateIPFSUpload(file);
        
        const cid = data.cid;
        setIpfsCID(cid);
        setDownloadLink(`https://gateway.pinata.cloud/ipfs/${cid}`);
        
        addDebugLog(`✅ IPFS upload successful! CID: ${cid}`);
        
        // Upload to blockchain
        addDebugLog('🔗 Starting blockchain transaction...');
        await uploadEncryptedReport(patientAddress, cid);
        
        setUploadSuccess(true);
        addDebugLog('🎉 Upload process completed successfully!');

        if (onUploadComplete) onUploadComplete(cid);
        
      } catch (fetchError) {
        throw new Error(`Backend connection failed: ${fetchError.message}`);
      }
      
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      setError(`Upload failed: ${error.message}`);
      addDebugLog(`❌ Upload failed: ${error.message}`);
      
      // Common error scenarios
      if (error.message.includes('fetch')) {
        addDebugLog('💡 Tip: Make sure your backend server is running on localhost:5000');
      }
      if (error.message.includes('CORS')) {
        addDebugLog('💡 Tip: Check CORS configuration in your backend');
      }
      if (error.message.includes('timeout')) {
        addDebugLog('💡 Tip: Check your internet connection and IPFS node status');
      }
      
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Main Upload Component */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Upload className="w-5 h-5 mr-2 text-indigo-600" />
          Upload Medical Report to IPFS (Debug Mode)
        </h3>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Upload encrypted medical reports securely to IPFS. The file will be stored on the decentralized network and the reference will be recorded on the blockchain.
          </p>

          {/* Error Display */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Patient Address Display */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Patient Address:</strong> {patientAddress || 'Not provided'}
            </p>
          </div>

          {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer" onClick={() => document.getElementById('file-upload').click()}>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.jpg,.png,.zip"
              />
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500 mt-1">PDF, DOC, TXT, JPG, PNG, ZIP (Max 10MB)</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{fileName}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(fileSize)}</p>
                  </div>
                </div>
                <button 
                  onClick={clearFile}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {uploadSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="font-medium text-green-800">Upload Successful!</p>
                    <p className="text-sm text-green-700 break-all">
                      IPFS CID: {ipfsCID}
                    </p>
                    <a 
                      href={downloadLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:underline mt-1 inline-block"
                    >
                      📥 Download File from IPFS
                    </a>
                  </div>
                </div>
              ) : (
                <button
                  onClick={uploadToIPFS}
                  disabled={uploading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center disabled:opacity-70"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Upload to IPFS
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          <p>* Files are encrypted and stored on IPFS (InterPlanetary File System)</p>
          <p>* Only authorized parties can access the uploaded files</p>
          <p>* The reference to the file is securely stored on the blockchain</p>
        </div>
      </div>

      {/* Debug Console */}
      <div className="bg-gray-900 rounded-2xl p-6 text-green-400 font-mono text-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold">Debug Console</h4>
          <button 
            onClick={clearDebugLogs}
            className="px-3 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
          >
            Clear Logs
          </button>
        </div>
        <div className="h-64 overflow-y-auto bg-black rounded p-3">
          {debugLogs.length === 0 ? (
            <p className="text-gray-500">No debug logs yet. Select a file and try uploading...</p>
          ) : (
            debugLogs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))
          )}
        </div>
      </div>

      {/* Common Issues Checklist */}
      <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
        <h4 className="font-semibold text-yellow-800 mb-3">Common Upload Issues Checklist:</h4>
        <div className="space-y-2 text-sm text-yellow-700">
          <div>🔍 <strong>Backend Server:</strong> Is your Node.js server running on localhost:5000?</div>
          <div>🌐 <strong>CORS:</strong> Does your backend allow requests from your frontend domain?</div>
          <div>📁 <strong>File Size:</strong> Is your file under 10MB?</div>
          <div>🔗 <strong>IPFS Node:</strong> Is your IPFS node running and reachable?</div>
          <div>🔑 <strong>Patient Address:</strong> Is a valid patient address provided?</div>
          <div>⛓️ <strong>Blockchain Context:</strong> Is the useHabitBlockchain hook working properly?</div>
          <div>🔒 <strong>Network:</strong> Check browser developer tools for network errors</div>
        </div>
      </div>
    </div>
  );
};

export default IPFSUploaderDebug;