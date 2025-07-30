import React, { useState, useEffect } from 'react';
import { Box, Chip } from '@mui/material';
import { Wifi, WifiOff, Sync } from '@mui/icons-material';
import networkService from '../services/networkService';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(networkService.getOnlineStatus());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnlineStatusChange = (online) => {
      setIsOnline(online);
      if (online) {
        setIsSyncing(true);
        // Reset syncing status after a short delay
        setTimeout(() => setIsSyncing(false), 2000);
      }
    };

    networkService.addListener(handleOnlineStatusChange);

    return () => {
      networkService.removeListener(handleOnlineStatusChange);
    };
  }, []);

  if (isOnline && !isSyncing) {
    return null; // Don't show anything when online and not syncing
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    >
      <Chip
        icon={isSyncing ? <Sync /> : <WifiOff />}
        label={isSyncing ? 'Syncing...' : 'Offline'}
        size="small"
        color={isSyncing ? 'primary' : 'default'}
        sx={{
          opacity: 0.8,
          fontSize: '0.75rem'
        }}
      />
    </Box>
  );
};

export default OfflineIndicator; 