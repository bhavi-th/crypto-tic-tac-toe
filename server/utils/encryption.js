import crypto from 'crypto';

export const encryptFile = (fileBuffer, encryptionKey) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
  const encryptedData = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
  return { encryptedData, iv };
};
