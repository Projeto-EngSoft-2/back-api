const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const authenticateToken = require('../middlewares/authenticateToken');
const isAdmin = require('../middlewares/isAdmin');

// Listar todos os reports (com filtros opcionais)
router.get('/reports', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};

    // Aplicar filtro de categoria se fornecido
    if (category) {
      query.category = category;
    }

    // Buscar reports com ordenação (urgentes primeiro)
    const reports = await Report.aggregate([
      { $match: query },
      {
        $addFields: {
          sortOrder: {
            $cond: { 
              if: { $eq: ["$status", "urgente"] }, 
              then: 0, 
              else: 1 
            }
          }
        }
      },
      { $sort: { 
        sortOrder: 1,
        createdAt: -1 
      }},
      { $project: { sortOrder: 0 }} // Remove o campo auxiliar
    ]);

    res.json({
      total: reports.length,
      reports
    });

  } catch (error) {
    console.error('Erro ao listar reports:', error);
    res.status(500).json({ 
      message: 'Erro ao listar reports.' 
    });
  }
});

// Deletar report por ID
router.delete('/reports/:reportId', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await Report.findOne({ reportId });
    
    if (!report) {
      return res.status(404).json({ 
        message: 'Report não encontrado.' 
      });
    }

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

// Rota para obter estatísticas dos reports
router.get('/reports/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          porCategoria: {
            $push: {
              categoria: "$category",
              status: "$status"
            }
          },
          urgentes: {
            $sum: { $cond: [{ $eq: ["$status", "urgente"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          urgentes: 1,
          categorias: {
            $reduce: {
              input: "$porCategoria",
              initialValue: {},
              in: {
                $mergeObjects: [
                  "$$value",
                  {
                    $literal: {
                      $concat: [
                        "$$this.categoria",
                        ": ",
                        { $add: [{ $indexOfArray: ["$porCategoria", "$$this"] }, 1] }
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ]);

    res.json(stats[0] || { total: 0, urgentes: 0, categorias: {} });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar estatísticas dos reports.' 
    });
  }
});

// Rota para administradores atualizarem reports
router.patch('/reports/:reportId', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { category, status } = req.body;

    const report = await Report.findOne({ reportId });

    if (!report) {
      return res.status(404).json({ 
        message: 'Report não encontrado.' 
      });
    }

    // Objeto para armazenar as atualizações
    const updateData = {};

    // Verifica e valida a categoria
    if (category) {
      if (!['Animal', 'Infraestrutura', 'Energia', 'Água', 'Sujeira', 'Ambiental'].includes(category)) {
        return res.status(400).json({ 
          message: 'Categoria inválida' 
        });
      }
      updateData.category = category;
      
      // Se a categoria for alterada para ambiental, atualiza o status para urgente
      if (category === 'Ambiental') {
        updateData.status = 'urgente';
      }
    }

    // Verifica e valida o status
    if (status && category !== 'Ambiental') {
      if (!['avaliação', 'aberto', 'solucionado', 'recusado', 'concluído', 'urgente'].includes(status)) {
        return res.status(400).json({ 
          message: 'Status inválido' 
        });
      }
      updateData.status = status;
    }

    // Se não houver dados para atualizar
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        message: 'Nenhum dado válido para atualização' 
      });
    }

    // Atualiza o report
    const updatedReport = await Report.findByIdAndUpdate(
      report._id,
      updateData,
      { new: true }
    );

    res.json({
      message: 'Report atualizado com sucesso',
      report: updatedReport
    });

  } catch (error) {
    console.error('Erro ao atualizar report:', error);
    res.status(500).json({ 
      message: 'Erro ao atualizar report.' 
    });
  }
});

// Rota para criar admin (sem autenticação, mas com chave secreta)
router.post('/create', async (req, res) => {
  try {
    const { nome, email, senha, secretKey } = req.body;

    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ 
        mensagem: 'Chave secreta inválida para criação de administrador.' 
      });
    }

    if (!nome || !email || !senha) {
      return res.status(400).json({ 
        mensagem: 'Todos os campos são obrigatórios.' 
      });
    }

    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ 
        mensagem: 'O e-mail já está em uso.' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoAdmin = new User({
      nome,
      email,
      senha: senhaHash,
      isAdmin: true
    });

    await novoAdmin.save();

    res.status(201).json({ 
      mensagem: 'Administrador registrado com sucesso!',
      admin: {
        nome: novoAdmin.nome,
        email: novoAdmin.email,
        isAdmin: novoAdmin.isAdmin
      }
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ 
      mensagem: 'Erro interno do servidor.' 
    });
  }
});

module.exports = router; 