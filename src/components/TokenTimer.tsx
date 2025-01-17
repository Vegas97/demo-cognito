'use client';

import { useEffect, useState } from 'react';
import { CopyButton } from './CopyButton';

interface TimerProps {
  expiresAt?: number;
  label: string;
  token?: string;
}

function formatTimeLeft(timeLeft: number): string {
  if (timeLeft <= 0) return 'Expired';
  
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = Math.floor(timeLeft % 60);

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
}

function ExpirationTimer({ expiresAt, label, token }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [debug, setDebug] = useState<string>('');

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = Math.max(0, expiresAt - now);
      
      // Debug information
      setDebug(`Now: ${now} (${new Date(now * 1000).toISOString()}), ExpiresAt: ${expiresAt} (${new Date(expiresAt * 1000).toISOString()}), Diff: ${timeLeft}s`);
      
      return timeLeft;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      // Clear interval if expired
      if (newTimeLeft <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  if (!expiresAt) return null;

  const expirationDate = new Date(expiresAt * 1000).toLocaleString('en-US', {
    timeZone: 'Europe/Paris', // Using the user's timezone
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const isExpired = timeLeft <= 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-gray-600 font-medium">{label}:</span>
        <span className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
          {formatTimeLeft(timeLeft)}
        </span>
      </div>
      <div className="text-sm text-gray-500">
        Expires: {expirationDate}
      </div>
      {token && (
        <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
          <div className="flex-1 font-mono text-xs truncate">
            {token}
          </div>
          <CopyButton text={token} />
        </div>
      )}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 break-all">
          {debug}
        </div>
      )}
    </div>
  );
}

export function TokenTimers({ session }: { session: any }) {
  // Debug log to see all available tokens
  console.log('Session data:', session);

  return (
    <div className="space-y-4">
      <div className="space-y-6">
        {/* Session */}
        <ExpirationTimer
          expiresAt={session.expires ? Math.floor(new Date(session.expires).getTime() / 1000) : undefined}
          label="Session"
        />
        
        {/* Access Token */}
        <ExpirationTimer
          expiresAt={session.expiresAt}
          label="Access Token"
          token={session.accessToken}
        />

        {/* ID Token */}
        <ExpirationTimer
          expiresAt={session.idTokenExpires ? Math.floor(new Date(session.idTokenExpires).getTime() / 1000) : undefined}
          label="ID Token"
          token={session.idToken}
        />

        {/* Refresh Token */}
        <ExpirationTimer
          expiresAt={session.refreshTokenExpires ? Math.floor(new Date(session.refreshTokenExpires).getTime() / 1000) : undefined}
          label="Refresh Token"
          token={session.refreshToken}
        />
      </div>
    </div>
  );
}
