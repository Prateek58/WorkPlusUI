import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { useThemeContext } from '../../../theme/ThemeProvider';

interface LoaderProps {
  open: boolean;
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ open, message = 'Loading...' }) => {
  const [showLoader, setShowLoader] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const textToType = 'CHOYAL';
  const typingSpeed = 100;
  const theme = useTheme();
  const { mode } = useThemeContext();

  useEffect(() => {
    if (open) {
      setShowLoader(true);
      setDisplayText('');
      
      let currentIndex = 0;
      let timeout: number;

      const animate = () => {
        setDisplayText(textToType.substring(0, currentIndex + 1));
        currentIndex = (currentIndex + 1) % textToType.length;
        timeout = setTimeout(animate, typingSpeed);
      };

      animate();

      return () => {
        clearTimeout(timeout);
      };
    } else {
      setShowLoader(false);
      setDisplayText('');
    }
  }, [open]);

  if (!showLoader) return null;

  // Theme-aware colors
  const backgroundColor = mode === 'dark' 
    ? theme.palette.background.paper 
    : theme.palette.background.default;
  
  const primaryTextColor = mode === 'dark' 
    ? theme.palette.primary.main 
    : '#ff0000';
  
  const secondaryTextColor = mode === 'dark' 
    ? theme.palette.text.primary 
    : theme.palette.text.primary;
  
  const boxShadow = mode === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.4)'
    : '0 4px 20px rgba(0, 0, 0, 0.15)';

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor,
        borderRadius: '8px',
        boxShadow,
        minWidth: '200px',
        minHeight: '100px',
        border: mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: primaryTextColor,
          fontWeight: 'bold',
          fontFamily: 'monospace',
          letterSpacing: '2px',
          position: 'relative',
          minHeight: '2em',
          display: 'flex',
          alignItems: 'center',
          fontStyle: 'italic',
          '&::after': {
            content: '""',
            position: 'absolute',
            right: '-4px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '2px',
            height: '1.2em',
            backgroundColor: primaryTextColor,
            animation: 'blink 1s step-end infinite',
          },
          '@keyframes blink': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0 }
          }
        }}
      >
        {displayText}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mt: 1,
          color: secondaryTextColor,
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}
      >
        loading...
      </Typography>
      {message && (
        <Typography
          variant="body2"
          sx={{
            mt: 2,
            color: theme.palette.text.secondary,
            textAlign: 'center'
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default Loader; 