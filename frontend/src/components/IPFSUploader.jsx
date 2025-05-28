import React, { useState } from 'react';
import { Upload, X, FileText, Check, Loader2 } from 'lucide-react';
import { useHabitBlockchain } from '../context/HabitBlockchainContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const IPFSUploader = ({ patientAddress, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [ipfsCID, setIpfsCID] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const { uploadEncryptedReport, loading } = useHabitBlockchain();

  // Pinata API credentials
  const PINATA_API_KEY = "2c3a3d9a5c5c9f0e9f0e";
  const PINATA_SECRET_API_KEY = "c0a9d7e8f0e9d7c0a9d7e8f0e9d7c0a9d7e8f0e9d7c0a9d7e8f0e9d7";
  const PINATA_GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/";

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileSize(selectedFile.size);
      setUploadSuccess(false);
      setIpfsCID('');
    }
  };

  const clearFile = () => {
    setFile(null);
    setFileName('');
    setFileSize(0);
    setUploadSuccess(false);
    setIpfsCID('');
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const uploadToIPFS = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    if (!patientAddress) {
      toast.error('Patient address is required');
      return;
    }

    try {
      setUploading(true);
      
      // Create form data for Pinata API
      const formData = new FormData();
      formData.append('file', file);
      
      // Add metadata
      const metadata = JSON.stringify({
        name: fileName,
        keyvalues: {
          patientAddress: patientAddress,
          uploadDate: new Date().toISOString(),
          fileType: file.type
        }
      });
      formData.append('pinataMetadata', metadata);
      
      // Add pinata options
      const pinataOptions = JSON.stringify({
        cidVersion: 0,
        wrapWithDirectory: false
      });
      formData.append('pinataOptions', pinataOptions);

      // Upload to Pinata
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          maxBodyLength: 'Infinity',
          headers: {
            'Content-Type': `multipart/form-data;`,
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_SECRET_API_KEY
          }
        }
      );

      // Get the IPFS CID
      const cid = response.data.IpfsHash;
      setIpfsCID(cid);
      
      // Store the CID in the blockchain
      await uploadEncryptedReport(patientAddress, cid);
      
      setUploadSuccess(true);
      toast.success('File uploaded to IPFS and recorded on blockchain');
      
      // Call the callback if provided
      if (onUploadComplete) {
        onUploadComplete(cid);
      }
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Upload className="w-5 h-5 mr-2 text-indigo-600" />
        Upload Medical Report to IPFS
      </h3>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-4">
          Upload encrypted medical reports securely to IPFS. The file will be stored on the decentralized network and the reference will be recorded on the blockchain.
        </p>
        
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
                    href={`${PINATA_GATEWAY_URL}${ipfsCID}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:underline mt-1 inline-block"
                  >
                    View on IPFS Gateway
                  </a>
                </div>
              </div>
            ) : (
              <button
                onClick={uploadToIPFS}
                disabled={uploading || loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center disabled:opacity-70"
              >
                {uploading || loading ? (
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
  );
};

export default IPFSUploader;