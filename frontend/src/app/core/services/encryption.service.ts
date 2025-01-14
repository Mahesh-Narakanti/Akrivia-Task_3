// encryption.service.ts
import * as CryptoJS from 'crypto-js';

export class EncryptionService {
  private secretKey = 'your-secret-key'; // Use a secure key

  // Encrypt the data
  encryptData(data: any): string {
    const stringData = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(
      stringData,
      this.secretKey
    ).toString();
    return encrypted;
  }

  // Decrypt the data
  decryptData(encryptedData: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  }
}
