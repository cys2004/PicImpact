import { useEffect, useState } from 'react';

/**
 * 判断当前环境是否为客户端（浏览器）
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}