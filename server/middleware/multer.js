import multer from 'multer';

const storage = multer.memoryStorage();

export const uploadUserImage = multer({ storage }).single('file');
