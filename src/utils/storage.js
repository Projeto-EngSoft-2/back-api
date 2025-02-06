const { Storage } = require('@google-cloud/storage');
const path = require('path');
require('dotenv').config();

const storage = new Storage({
  keyFilename: path.join(__dirname, '../config/google-cloud-key.json'),
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
});

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;

const uploadImage = async (file) => {
  try {
    if (!file) {
      throw new Error('Nenhum arquivo foi enviado');
    }

    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.originalname}`;
    const fileUpload = storage.bucket(bucketName).file(fileName);
    
    // Upload do arquivo sem configuração de ACL
    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype
      }
    });

    // Gera URL pública usando o padrão do Google Cloud Storage
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    return publicUrl;

  } catch (error) {
    console.error('Erro no upload:', error);
    throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
  }
};

module.exports = { uploadImage }; 