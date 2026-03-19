import crypto from 'crypto';

export function generateSign(params: Record<string, any>, secret: string): string {
  const sortedKeys = Object.keys(params).sort();
  const paramStr = sortedKeys.map(key => `${key}${params[key]}`).join('');
  const signStr = params.appkey + paramStr + secret;
  return crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();
}

export function getTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export function getNonce(): string {
  return Math.random().toString(36).substring(2, 15);
}
