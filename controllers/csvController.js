// controllers/csvController.js
const CSVData = require('../models/csvData');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;

exports.uploadCSV = async (req, res) => {
  try {
    const { key } = req.body;
    
    if (!key) {
      return res.status(400).json({ success: false, message: 'Key is required' });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'CSV file is required' });
    }
    
    // Read the CSV file
    const filePath = req.file.path;
    const filename = req.file.originalname;
    
    // Parse the CSV file to get headers and convert to string for storage
    const results = [];
    const headers = [];
    let headersSet = false;
    
    const csvString = fs.readFileSync(filePath, 'utf8');
    
    // Parse the CSV to get headers
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (headerList) => {
        headerList.forEach(header => headers.push(header));
      })
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        // Check if a document with the given key already exists
        let csvDocument = await CSVData.findOne({ key });
        
        if (csvDocument) {
          // Update existing document
          csvDocument.filename = filename;
          csvDocument.csvData = csvString;
          csvDocument.headers = headers;
          csvDocument.lastModified = Date.now();
          
          await csvDocument.save();
          
          return res.status(200).json({ 
            success: true, 
            message: 'CSV updated successfully', 
            data: {
              key: csvDocument.key,
              filename: csvDocument.filename,
              uploadDate: csvDocument.uploadDate,
              lastModified: csvDocument.lastModified,
              headers: csvDocument.headers
            }
          });
        } else {
          // Create new document
          const newCSVData = new CSVData({
            key,
            filename,
            csvData: csvString,
            headers
          });
          
          await newCSVData.save();
          
          return res.status(201).json({ 
            success: true, 
            message: 'CSV uploaded successfully', 
            data: {
              key: newCSVData.key,
              filename: newCSVData.filename,
              uploadDate: newCSVData.uploadDate,
              lastModified: newCSVData.lastModified,
              headers: newCSVData.headers
            }
          });
        }
        
        // Clean up temporary file
        fs.unlinkSync(filePath);
      });
  } catch (error) {
    console.error('Error uploading CSV:', error);
    return res.status(500).json({ success: false, message: 'Error uploading CSV', error: error.message });
  }
};

exports.getCSVByKey = async (req, res) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({ success: false, message: 'Key is required' });
    }
    
    const csvDocument = await CSVData.findOne({ key });
    
    if (!csvDocument) {
      return res.status(404).json({ success: false, message: 'No CSV found with the provided key' });
    }
    
    // Return CSV data
    return res.status(200).json({
      success: true,
      data: {
        key: csvDocument.key,
        filename: csvDocument.filename,
        csvData: csvDocument.csvData,
        headers: csvDocument.headers,
        uploadDate: csvDocument.uploadDate,
        lastModified: csvDocument.lastModified
      }
    });
  } catch (error) {
    console.error('Error fetching CSV:', error);
    return res.status(500).json({ success: false, message: 'Error fetching CSV', error: error.message });
  }
};

exports.downloadCSVByKey = async (req, res) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({ success: false, message: 'Key is required' });
    }
    
    const csvDocument = await CSVData.findOne({ key });
    
    if (!csvDocument) {
      return res.status(404).json({ success: false, message: 'No CSV found with the provided key' });
    }
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${csvDocument.filename}"`);
    
    // Send the CSV data
    return res.status(200).send(csvDocument.csvData);
  } catch (error) {
    console.error('Error downloading CSV:', error);
    return res.status(500).json({ success: false, message: 'Error downloading CSV', error: error.message });
  }
};

exports.listAllCSVs = async (req, res) => {
  try {
    const csvDocuments = await CSVData.find({}, { csvData: 0 }); // Exclude the actual CSV data
    
    return res.status(200).json({
      success: true,
      count: csvDocuments.length,
      data: csvDocuments
    });
  } catch (error) {
    console.error('Error listing CSVs:', error);
    return res.status(500).json({ success: false, message: 'Error listing CSVs', error: error.message });
  }
};

exports.deleteCSVByKey = async (req, res) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({ success: false, message: 'Key is required' });
    }
    
    const result = await CSVData.deleteOne({ key });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'No CSV found with the provided key' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'CSV deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting CSV:', error);
    return res.status(500).json({ success: false, message: 'Error deleting CSV', error: error.message });
  }
};