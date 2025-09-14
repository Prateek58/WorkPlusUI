import React, { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

export interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

interface ConfirmContextType {
  showConfirmDialog: (props: ConfirmDialogProps) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [dialogProps, setDialogProps] = useState<ConfirmDialogProps>({
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    showCancel: true
  });

  const showConfirmDialog = useCallback((props: ConfirmDialogProps) => {
    setDialogProps({
      ...props,
      confirmText: props.confirmText || 'Confirm',
      cancelText: props.cancelText || 'Cancel',
      showCancel: props.showCancel !== undefined ? props.showCancel : true
    });
    setOpen(true);
  }, []);

  const handleConfirm = useCallback(() => {
    setOpen(false);
    dialogProps.onConfirm();
  }, [dialogProps]);

  const handleCancel = useCallback(() => {
    setOpen(false);
    if (dialogProps.onCancel) {
      dialogProps.onCancel();
    }
  }, [dialogProps]);

  return (
    <ConfirmContext.Provider value={{ showConfirmDialog }}>
      {children}
      <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogProps.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogProps.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {dialogProps.showCancel && (
            <Button onClick={handleCancel} color="inherit">
              {dialogProps.cancelText}
            </Button>
          )}
          <Button onClick={handleConfirm} color="primary" variant="contained" autoFocus>
            {dialogProps.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmContextType => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};