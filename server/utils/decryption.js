import crypto from 'crypto';

export const decryptData = (encryptedData, iv, encryptionKey) => {
  if (typeof iv === 'object' && iv.type === 'Buffer' && Array.isArray(iv.data)) {
    iv = Buffer.from(iv.data);
  }

  if (typeof encryptedData === 'object' && encryptedData.type === 'Buffer' && Array.isArray(encryptedData.data)) {
    encryptedData = Buffer.from(encryptedData.data);
  }

  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
  const decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  return decryptedData;
};
