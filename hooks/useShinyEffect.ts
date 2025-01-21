import { useState, useEffect, useRef } from 'react';

export function useShinyEffect(isProcessing: boolean) {
  const [isShiny, setIsShiny] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isProcessing) {
      timer = setTimeout(() => setIsShiny(true), 1000);
    } else {
      setIsShiny(false);
    }
    return () => clearTimeout(timer);
  }, [isProcessing]);

  useEffect(() => {
    if (buttonRef.current) {
      if (isShiny) {
        buttonRef.current.classList.add('active');
      } else {
        buttonRef.current.classList.remove('active');
      }
    }
  }, [isShiny]);

  return { isShiny, buttonRef };
}

