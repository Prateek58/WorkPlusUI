import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

interface LoaderProps {
  open: boolean;
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ open, message = 'Loading...' }) => {
  const [showLoader, setShowLoader] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const textToType = 'CHOYAL';
  const typingSpeed = 100;

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
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        minWidth: '200px',
        minHeight: '100px'
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: '#ff0000',
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
            backgroundColor: '#ff0000',
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
          color: 'black',
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
            color: 'text.secondary',
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