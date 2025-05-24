import { alpha } from '@mui/material/styles';

// Table header style utility
export const getTableHeaderStyle = () => ({
  backgroundColor: (theme: any) => alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.08 : 0.12),
  '& .MuiTableCell-root': {
    backgroundColor: (theme: any) => alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.08 : 0.01),
    fontWeight: 600,
    fontSize: '12px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: (theme: any) => theme.palette.text.primary,
  }
}); 