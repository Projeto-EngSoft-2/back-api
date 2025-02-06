const isAdmin = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        message: 'Acesso negado. Apenas administradores podem realizar esta ação.' 
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ 
      message: 'Erro ao verificar permissões de administrador.' 
    });
  }
};

module.exports = isAdmin; 