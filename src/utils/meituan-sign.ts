import crypto from 'crypto';

/**
 * 生成美团联盟 API 签名
 * 签名算法：MD5(appkey + param1 + param2 + ... + secret)
 */
export function generateSign(params: Record<string, any>, secret: string): string {
  // 按参数名排序
  const sortedKeys = Object.keys(params).sort();
  
  // 拼接参数字符串
  const paramStr = sortedKeys
    .map(key => `${key}${params[key]}`)
    .join('');
  
  // 拼接 appkey 和 secret
  const signStr = params.appkey + paramStr + secret;
  
  // MD5 加密并转大写
  return crypto
    .createHash('md5')
    .update(signStr)
    .digest('hex')
    .toUpperCase();
}

/**
 * 生成时间戳（秒）
 */
export function getTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * 生成随机数
 */
export function getNonce(): string {
  return Math.random().toString(36).substring(2, 15);
}
