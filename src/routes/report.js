const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const multer = require('multer');
const { uploadImage } = require('../utils/storage');
const authenticateToken = require('../middlewares/authenticateToken');
const isAdmin = require('../middlewares/isAdmin');

// Configuração do multer para processar upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

// Rota protegida para criar um novo report
router.post('/create', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, location, category } = req.body;
    const userEmail = req.user.email;

    if (!title || !description || !location || !category || !req.file) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    // Upload da imagem para o Google Cloud Storage
    const imageUrl = await uploadImage(req.file);

    // Determina o status inicial baseado na categoria
    const initialStatus = category.toLowerCase() === 'ambiental' ? 'urgente' : 'avaliação';

    const report = new Report({
      title,
      description,
      location,
      imageUrl,
      category,
      status: initialStatus,
      userId: userEmail
    });

    await report.save();

    res.status(201).json({
      message: 'Report criado com sucesso',
      reportId: report._id,
      report
    });

  } catch (error) {
    console.error('Erro ao criar report:', error);
    res.status(500).json({ message: 'Erro ao criar report.' });
  }
});

// Rota protegida para buscar reports do usuário
router.get('/my-reports', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const reports = await Report.find({ userId: userEmail });
    
    res.json(reports);
  } catch (error) {
    console.error('Erro ao buscar reports:', error);
    res.status(500).json({ message: 'Erro ao buscar reports.' });
  }
});

// Rota protegida para deletar um report específico
router.delete('/delete/:reportId', authenticateToken, async (req, res) => {
  try {
    const reportId = req.params.reportId;
    const userEmail = req.user.email;

    // Busca o report e verifica se pertence ao usuário
    const report = await Report.findOne({ 
      reportId: reportId,
      userId: userEmail 
    });

    if (!report) {
      return res.status(404).json({ 
        message: 'Report não encontrado ou você não tem permissão para deletá-lo.' 
      });
    }

    // Deleta o report
    await Report.findByIdAndDelete(report._id);

    res.json({ 
      message: 'Report deletado com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao deletar report:', error);
    res.status(500).json({ 
      message: 'Erro ao deletar report.' 
    });
  }
});

module.exports = router; 