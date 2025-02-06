const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../models/User');
const authenticateToken = require('../middlewares/authenticateToken');
const Report = require('../models/Report');

const router = express.Router();

router.post('/user', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensagem: 'O e-mail já está em uso.' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoUsuario = new Usuario({
      nome,
      email,
      senha: senhaHash,
    });

    await novoUsuario.save();

    res.status(201).json({ mensagem: 'Usuário registrado com sucesso!' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});

// Nova rota para deletar próprio usuário
router.delete('/delete', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Encontra e deleta o usuário
    const usuario = await Usuario.findOneAndDelete({ email: userEmail });

    if (!usuario) {
      return res.status(404).json({ 
        mensagem: 'Usuário não encontrado.' 
      });
    }

    // Deleta todos os reports associados ao usuário
    await Report.deleteMany({ userId: userEmail });

    res.json({ 
      mensagem: 'Usuário e seus reports deletados com sucesso.' 
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ 
      mensagem: 'Erro ao deletar usuário.' 
    });
  }
});

module.exports = router;
