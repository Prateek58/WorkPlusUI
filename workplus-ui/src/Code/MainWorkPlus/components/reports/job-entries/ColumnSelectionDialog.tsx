import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  Box,
  Typography,
  IconButton,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import DeselectIcon from '@mui/icons-material/Deselect';
import { ColumnDefinition } from './jobEntryReportService';

interface ColumnSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedColumns: string[], exportType: 'excel' | 'csv' | 'pdf') => void;
  availableColumns: ColumnDefinition[];
  exportType: 'excel' | 'csv' | 'pdf';
}

const ColumnSelectionDialog: React.FC<ColumnSelectionDialogProps> = ({
  open,
  onClose,
  onConfirm,
  availableColumns,
  exportType
}) => {
  const theme = useTheme();
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  useEffect(() => {
    if (open && availableColumns.length > 0) {
      // Initialize with default columns
      const defaultColumns = availableColumns
        .filter(col => col.isDefault)
        .map(col => col.key);
      setSelectedColumns(defaultColumns);
    }
  }, [open, availableColumns]);

  const handleToggleColumn = (columnKey: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const handleSelectAll = () => {
    setSelectedColumns(availableColumns.map(col => col.key));
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  const handleConfirm = () => {
    onConfirm(selectedColumns, exportType);
    onClose();
  };

  const getExportTypeLabel = () => {
    switch (exportType) {
      case 'excel': return 'Excel';
      case 'csv': return 'CSV';
      case 'pdf': return 'PDF';
      default: return 'Export';
    }
  };

  const getDataTypeColor = (dataType: string) => {
    switch (dataType) {
      case 'number': return 'primary';
      case 'currency': return 'success';
      case 'date': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          minHeight: '500px'
        }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="h6" component="div">
          Select Columns for {getExportTypeLabel()} Export
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              color: theme.palette.text.primary,
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Action Buttons */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Button
                startIcon={<SelectAllIcon />}
                onClick={handleSelectAll}
                size="small"
                variant="outlined"
              >
                Select All
              </Button>
            </Grid>
            <Grid item>
              <Button
                startIcon={<DeselectIcon />}
                onClick={handleDeselectAll}
                size="small"
                variant="outlined"
              >
                Deselect All
              </Button>
            </Grid>
            <Grid item xs>
              <Typography variant="body2" color="text.secondary">
                {selectedColumns.length} of {availableColumns.length} columns selected
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Column List */}
        <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
          {availableColumns.map((column, index) => (
            <React.Fragment key={column.key}>
              <ListItem
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                  backgroundColor: selectedColumns.includes(column.key) 
                    ? theme.palette.action.selected 
                    : 'transparent'
                }}
                onClick={() => handleToggleColumn(column.key)}
              >
                <ListItemIcon>
                  <Checkbox
                    checked={selectedColumns.includes(column.key)}
                    onChange={() => handleToggleColumn(column.key)}
                    color="primary"
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">
                        {column.label}
                      </Typography>
                      <Chip
                        label={column.dataType}
                        size="small"
                        color={getDataTypeColor(column.dataType) as any}
                        variant="outlined"
                      />
                      {column.isDefault && (
                        <Chip
                          label="Default"
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={`Column Key: ${column.key}`}
                />
              </ListItem>
              {index < availableColumns.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          disabled={selectedColumns.length === 0}
          sx={{
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          Export {getExportTypeLabel()} ({selectedColumns.length} columns)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnSelectionDialog; 