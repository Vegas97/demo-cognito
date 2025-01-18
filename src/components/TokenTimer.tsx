'use client';

import { useEffect, useState } from 'react';
import { CopyButton } from './CopyButton';

interface TimerProps {
  expiresAt?: number;
  label: string;
  token?: string;
}

interface Session {
  tokens: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
  };
  timing: {
    accessTokenExpiresAt: number;
    refreshTokenExpiresAt: number;
  };
  expires: string;
}

function formatTimeLeft(timeLeft: number): string {
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return "Expired";

    const years = Math.floor(seconds / (365 * 24 * 3600));
    const months = Math.floor((seconds % (365 * 24 * 3600)) / (30 * 24 * 3600));
    const days = Math.floor((seconds % (30 * 24 * 3600)) / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const parts = [];

    if (years > 0) {
      parts.push(`${years}Y ${months}M ${days}D ${hours}h ${minutes}m ${remainingSeconds}s`);
    } else if (months > 0) {
      parts.push(`${months}M ${days}D ${hours}h ${minutes}m ${remainingSeconds}s`);
    } else if (days > 0) {
      parts.push(`${days}D ${hours}h ${minutes}m ${remainingSeconds}s`);
    } else if (hours > 0) {
      parts.push(`${hours}h ${minutes}m ${remainingSeconds}s`);
    } else if (minutes > 0) {
      parts.push(`${minutes}m ${remainingSeconds}s`);
    } else {
      parts.push(`${remainingSeconds}s`);
    }

    return parts.join(" ");
  };

  return formatTime(timeLeft);
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
      setDebug(
        `Now: ${now} (${new Date(now * 1000).toISOString()})\n` +
        `ExpiresAt: ${expiresAt} (${new Date(expiresAt * 1000).toISOString()})\n` +
        `Diff: ${timeLeft}s`
      );
      
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
    timeZone: 'Europe/Paris',
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

export function TokenTimers({ session }: { session: Session }) {
  const { tokens, timing, expires } = session;

  // Convert ISO string to Unix timestamp
  const sessionExpiresAt = expires ? Math.floor(new Date(expires).getTime() / 1000) : undefined;

  return (
    <div className="space-y-4">
      <div className="space-y-6">
        {/* Session */}
        <ExpirationTimer
          expiresAt={sessionExpiresAt}
          label="Session"
        />
        
        {/* Access Token */}
        <ExpirationTimer
          expiresAt={timing.accessTokenExpiresAt}
          label="Access Token"
          token={tokens.accessToken}
        />

        {/* ID Token */}
        <ExpirationTimer
          expiresAt={timing.accessTokenExpiresAt} // ID token expires same time as access token
          label="ID Token"
          token={tokens.idToken}
        />

        {/* Refresh Token */}
        <ExpirationTimer
          expiresAt={timing.refreshTokenExpiresAt}
          label="Refresh Token"
          token={tokens.refreshToken}
        />
      </div>
    </div>
  );
}
