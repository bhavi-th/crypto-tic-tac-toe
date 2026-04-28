import { createBrowserRouter, Navigate } from 'react-router-dom';
import Wallet from '../pages/Wallet';
import GameLobby from '../pages/GameLobby';
import GameBoard from '../pages/GameBoard';
import Vault from '../pages/Vault';
import AppLayout from '../components/AppLayout';

export const routes = createBrowserRouter([
  { path: '/', element: <Wallet /> },
  {
    element: <AppLayout />,
    children: [
      { path: '/lobby', element: <GameLobby /> },
      { path: '/game/:gameId', element: <GameBoard /> },
      { path: '/vault', element: <Vault /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
