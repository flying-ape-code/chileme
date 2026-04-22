/**
 * Issue #41: 邀请链接处理 Hook
 * 处理 ?ref=CODE 参数，记录点击转化
 */

import { useEffect, useRef } from 'react';
import { extractRefCode, trackConversion } from '../services/shareService';

export function useReferral() {
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const refCode = extractRefCode();
    if (refCode) {
      // 记录点击转化
      trackConversion(refCode, 'click');
      
      // 存储邀请码供注册时使用
      localStorage.setItem('chileme_ref_code', refCode);
      
      console.log(`[Referral] 检测到邀请码: ${refCode}`);
    }
  }, []);

  /**
   * 获取存储的邀请码并清除
   */
  const getAndClearRefCode = (): string | null => {
    const refCode = localStorage.getItem('chileme_ref_code');
    if (refCode) {
      localStorage.removeItem('chileme_ref_code');
    }
    return refCode;
  };

  return { getAndClearRefCode };
}

export default useReferral;
