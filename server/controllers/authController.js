import { verifyMessage } from 'ethers';
import UserModel from '../models/User.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRETKEY } from '../config/serverConfig.js';

export async function authController(req, res, next) {
  try {
    const { signature } = req.body;
    const { address } = req.query;

    if (!signature) {
      return res.status(400).json({ message: 'Signature is required' });
    }

    const recoveredAddress = verifyMessage('Welcome to Crypto Vault Website', signature);

    if (address.toLowerCase() === recoveredAddress.toLowerCase()) {
      const normalizedAddress = recoveredAddress.toLowerCase();

      const user = await UserModel.findOne({ userAddress: normalizedAddress });
      if (!user) {
        await UserModel.create({ userAddress: normalizedAddress });
      }

      const token = jwt.sign({ address: normalizedAddress }, JWT_SECRETKEY);
      res.status(200).json({ message: 'Authentication Successful', token });
    } else {
      res.status(400).json({ message: 'Authentication Failed' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
