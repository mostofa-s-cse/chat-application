import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const activeUser = useSelector((state) => state.activeUser);

  useEffect(() => {
    let socketInstance = null;

    const initializeSocket = () => {
      if (!activeUser?.id) return;

      try {
        socketInstance = io('http://localhost:4000', {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          autoConnect: true,
          withCredentials: true,
          forceNew: true,
          path: '/socket.io/',
          extraHeaders: {
            "my-custom-header": "abcd"
          }
        });

        socketInstance.on('connect', () => {
          console.log('Socket connected:', socketInstance.id);
          setIsConnected(true);
          // Setup user after connection is established
          socketInstance.emit('setup', activeUser);
        });

        socketInstance.on('connected', () => {
          console.log('User setup complete');
        });

        socketInstance.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setIsConnected(false);
        });

        socketInstance.on('setup_error', (error) => {
          console.error('Setup error:', error);
        });

        setSocket(socketInstance);
      } catch (error) {
        console.error('Socket initialization error:', error);
      }
    };

    if (activeUser?.id) {
      initializeSocket();
    }

    return () => {
      if (socketInstance) {
        console.log('Cleaning up socket connection');
        socketInstance.disconnect();
        socketInstance = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [activeUser?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};