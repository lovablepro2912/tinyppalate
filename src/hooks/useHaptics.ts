import { useCallback } from 'react';

export function useHaptics() {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const light = useCallback(() => {
    if (isSupported) navigator.vibrate(10);
  }, [isSupported]);

  const medium = useCallback(() => {
    if (isSupported) navigator.vibrate(20);
  }, [isSupported]);

  const heavy = useCallback(() => {
    if (isSupported) navigator.vibrate(30);
  }, [isSupported]);

  const success = useCallback(() => {
    if (isSupported) navigator.vibrate([10, 50, 10]);
  }, [isSupported]);

  const error = useCallback(() => {
    if (isSupported) navigator.vibrate([30, 50, 30, 50, 30]);
  }, [isSupported]);

  const selection = useCallback(() => {
    if (isSupported) navigator.vibrate(5);
  }, [isSupported]);

  return { light, medium, heavy, success, error, selection, isSupported };
}
