
# Sistema de Reports - Documentação


## 📋 Sobre o Projeto

Sistema de gerenciamento de reports que permite usuários registrarem ocorrências com imagens, descrições e localizações. Administradores podem gerenciar todos os reports.


## 🏗 Arquitetura

```plaintext
EngSoft2/Back/src/
├── config/
│   └── google-cloud-key.json
├── middlewares/
│   ├── authenticateToken.js
│   └── isAdmin.js
├── models/
│   ├── Report.js
│   └── User.js
├── routes/
│   ├── admin.js
│   ├── auth.js
│   ├── report.js
│   └── user.js
├── tests/
│   ├── auth.test.js
│   └── user.test.js
├── utils/
│   └── storage.js
├── .env
└── server.js
```


## 🚀 Tecnologias Utilizadas

- Node.js
- Express
- MongoDB
- Google Cloud Storage
- JWT para autenticação
- Multer para upload de arquivos
- Jest para testes


## ⚙️ Instalação

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd EngSoft2/Back
```


2. Instale as dependências:
```bash
npm install
```


3. Configure as variáveis de ambiente (.env):
```plaintext
MONGODB_URI=sua_uri_mongodb
JWT_SECRET=sua_chave_secreta
PORT=5000
GOOGLE_CLOUD_PROJECT_ID=seu_project_id
GOOGLE_CLOUD_BUCKET_NAME=seu_bucket_name
ADMIN_SECRET_KEY=sua_chave_admin
```


4. Configure as credenciais do Google Cloud Storage:

- Coloque o arquivo `google-cloud-key.json` em `src/config/`


5. Inicie o servidor:
```bash
npm start
```


## 📡 Rotas da API

### 🔐 Autenticação (`auth.js`)
```plaintext
POST /logar
Body: { email, senha }
Response: { token, user: { email, isAdmin } }
```

### 👤 Usuários (`user.js`)
```plaintext
# Criar usuário
POST /create/user
Body: { nome, email, senha }

# Deletar próprio usuário
DELETE /create/delete
Headers: Authorization: Bearer {token}
```

### 📝 Reports (`report.js`)
```plaintext
# Criar report
POST /reports/create
Headers: Authorization: Bearer {token}
Body (multipart/form-data):
- title
- description
- location
- category
- image

# Listar meus reports
GET /reports/my-reports
Headers: Authorization: Bearer {token}

# Deletar meu report
DELETE /reports/delete/{reportId}
Headers: Authorization: Bearer {token}
```

### 👑 Admin (`admin.js`)
```plaintext
# Criar admin
POST /admin/create
Body: { nome, email, senha, secretKey }

# Listar todos os reports
GET /admin/reports
Headers: Authorization: Bearer {token}

# Listar reports por categoria
GET /admin/reports?category={categoria}
Headers: Authorization: Bearer {token}

# Atualizar report
PATCH /admin/reports/{reportId}
Headers: Authorization: Bearer {token}
Body: { category, status }

# Deletar report
DELETE /admin/reports/{reportId}
Headers: Authorization: Bearer {token}
```


## 📊 Valores Válidos

### Categorias:
- Animal
- Infraestrutura
- Energia
- Água
- Sujeira
- Ambiental

### Status:
- avaliação
- aberto
- solucionado
- recusado
- concluído
- urgente


## 🧪 Testes

Para executar os testes:
```plaintext
npm test
```


## 🔒 Autenticação e Autorização
- Todas as rotas (exceto login e registro) requerem token JWT
- Rotas admin requerem usuário com `isAdmin: true`
- Token deve ser enviado no header: `Authorization: Bearer {token}`


## 📁 Upload de Imagens
- Armazenamento: Google Cloud Storage
- Limite de tamanho: 5MB
- Formatos aceitos: imagens (jpg, png, etc)
- URL pública gerada automaticamente


## ⚠️ Observações

1. Primeiro admin deve ser criado usando a rota `/admin/create` com a chave secreta

2. Reports da categoria "Ambiental" são marcados automaticamente como "urgente"

3. Ao deletar um usuário, todos seus reports são deletados automaticamente

