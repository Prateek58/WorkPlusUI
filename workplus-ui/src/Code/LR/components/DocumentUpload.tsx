import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  useTheme
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';
import Loader from '../../Common/components/Loader';
import Notification from '../../Common/components/Notification';
import { useLRService } from '../services/lrService';
import { Document, DocumentType } from '../services/lrService';

interface DocumentUploadProps {
  lrEntryId: number;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ lrEntryId }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number>(0);
  const [dragActive, setDragActive] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const { getDocuments, getDocumentTypes, uploadDocument, deleteDocument } = useLRService();

  useEffect(() => {
    if (lrEntryId) {
      loadData();
    }
  }, [lrEntryId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [documentsData, typesData] = await Promise.all([
        getDocuments(lrEntryId),
        getDocumentTypes()
      ]);
      setDocuments(documentsData);
      setDocumentTypes(typesData);
      if (typesData.length > 0 && selectedTypeId === 0) {
        setSelectedTypeId(typesData[0].typeId);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setNotification({
        open: true,
        message: 'Error loading documents',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [selectedTypeId]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (!selectedTypeId) {
      setNotification({
        open: true,
        message: 'Please select a document type first',
        severity: 'error'
      });
      return;
    }

    const selectedType = documentTypes.find(t => t.typeId === selectedTypeId);
    if (!selectedType) {
      setNotification({
        open: true,
        message: 'Invalid document type selected',
        severity: 'error'
      });
      return;
    }

    const allowedExtensions = selectedType.allowedExtensions.split(',').map(ext => ext.trim().toLowerCase());
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        setNotification({
          open: true,
          message: `File ${file.name} has invalid extension. Allowed: ${selectedType.allowedExtensions}`,
          severity: 'error'
        });
        continue;
      }

      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setNotification({
          open: true,
          message: `File ${file.name} is too large. Maximum size is 10MB.`,
          severity: 'error'
        });
        continue;
      }

      setLoading(true);
      try {
        await uploadDocument(lrEntryId, selectedTypeId, file);
        setNotification({
          open: true,
          message: `File ${file.name} uploaded successfully`,
          severity: 'success'
        });
        await loadData(); // Reload documents
      } catch (error) {
        console.error('Error uploading file:', error);
        setNotification({
          open: true,
          message: `Error uploading file ${file.name}`,
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteDocument = async (documentId: number, fileName: string) => {
    if (window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      setLoading(true);
      try {
        await deleteDocument(documentId);
        setNotification({
          open: true,
          message: 'Document deleted successfully',
          severity: 'success'
        });
        await loadData(); // Reload documents
      } catch (error) {
        console.error('Error deleting document:', error);
        setNotification({
          open: true,
          message: 'Error deleting document',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
        `}
      </style>
      
      <Loader open={loading} message="Processing documents..." />
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleNotificationClose}
      />
      
      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📤 Upload Documents
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                  Step 1: Select Document Type
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Choose Document Type *</InputLabel>
                  <Select
                    value={selectedTypeId}
                    onChange={(e) => setSelectedTypeId(Number(e.target.value))}
                    label="Choose Document Type *"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: theme.palette.background.paper,
                      }
                    }}
                  >
                    <MenuItem value={0} disabled>
                      <em>Please select a document type</em>
                    </MenuItem>
                    {documentTypes.map((type) => (
                      <MenuItem key={type.typeId} value={type.typeId}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Typography variant="body1" fontWeight="bold">
                            📄 {type.typeName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Accepts: {type.allowedExtensions.toUpperCase()}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {selectedTypeId > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                    Step 2: Upload Files
                  </Typography>
                  
                  {/* Drag and Drop Area */}
                  <Paper
                    sx={{
                      border: `3px dashed ${dragActive ? theme.palette.primary.main : theme.palette.grey[400]}`,
                      borderRadius: 3,
                      p: 6,
                      textAlign: 'center',
                      backgroundColor: dragActive 
                        ? theme.palette.mode === 'dark' 
                          ? theme.palette.primary.dark + '30' 
                          : theme.palette.primary.light + '20'
                        : theme.palette.mode === 'dark'
                          ? theme.palette.grey[800]
                          : theme.palette.grey[50],
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      minHeight: 200,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: theme.palette.mode === 'dark'
                          ? theme.palette.primary.dark + '20'
                          : theme.palette.primary.light + '10',
                        transform: 'scale(1.02)'
                      }
                    }}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <CloudUploadIcon 
                      sx={{ 
                        fontSize: 64, 
                        color: dragActive ? theme.palette.primary.main : theme.palette.text.secondary,
                        mb: 2,
                        animation: dragActive ? 'pulse 1s infinite' : 'none'
                      }} 
                    />
                    <Typography variant="h5" gutterBottom fontWeight="bold" color={dragActive ? 'primary' : 'text.primary'}>
                      {dragActive ? '📁 Drop your files here!' : '📤 Upload Documents'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {dragActive ? 'Release to upload' : 'Drag & drop files here or click to browse'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Supports: {documentTypes.find(t => t.typeId === selectedTypeId)?.allowedExtensions.toUpperCase()} • Max 10MB each
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<CloudUploadIcon />}
                      sx={{ 
                        mt: 1,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        boxShadow: 3,
                        '&:hover': {
                          boxShadow: 6
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById('file-input')?.click();
                      }}
                    >
                      Choose Files
                    </Button>
                    <input
                      id="file-input"
                      type="file"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handleFileInput}
                      accept={documentTypes.find(t => t.typeId === selectedTypeId)?.allowedExtensions.split(',').map(ext => `.${ext.trim()}`).join(',')}
                    />
                  </Paper>
                </Box>
              )}

              {selectedTypeId === 0 && (
                <Box sx={{ textAlign: 'center', py: 6, backgroundColor: theme.palette.grey[50], borderRadius: 2 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    👆 Please select a document type first
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose from the dropdown above to enable file upload
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Documents List */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Uploaded Documents ({documents.length})
              </Typography>
              
              {documents.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No documents uploaded yet. Upload some documents to get started.
                </Typography>
              ) : (
                <List>
                  {documents.map((doc) => (
                    <ListItem key={doc.documentId} divider>
                      <FileIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                      <ListItemText
                        primary={doc.documentName}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Chip 
                              label={doc.typeName} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                            />
                            <Typography variant="caption" color="text.secondary">
                              Uploaded: {formatDate(doc.uploadedAt)}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteDocument(doc.documentId, doc.documentName)}
                          color="error"
                          title="Delete document"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default DocumentUpload; 