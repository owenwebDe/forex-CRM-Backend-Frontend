import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const ID_TYPES = [
  "Passport",
  "National ID",
  "Driver's License",
  "Voter's Card",
  "Other",
];

export const DocumentUpload = () => {
  const [idType, setIdType] = useState(ID_TYPES[0]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      setPreview(null);
      setMessage("Please select a valid image file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select an image file.");
      return;
    }
    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("document_type", idType);
    formData.append("document_number", "N/A"); // Optionally add a field for document number
    formData.append("file", file);
    try {
      await axios.post(`${API_BASE_URL}/api/kyc/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setMessage("Document uploaded successfully!");
      setFile(null);
      setPreview(null);
    } catch (error) {
      setMessage("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900 p-6 rounded-lg border border-gray-800 mt-8">
      <h2 className="text-xl font-bold text-white mb-4">
        Upload Compliance Document
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white mb-2">
            Type of Identification
          </label>
          <select
            value={idType}
            onChange={(e) => setIdType(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          >
            {ID_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-white mb-2">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-2 rounded-md max-h-40"
            />
          )}
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="w-full py-3 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </button>
        {message && (
          <div className="text-center text-sm text-white mt-2">{message}</div>
        )}
      </form>
    </div>
  );
};
