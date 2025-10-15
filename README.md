# BarberTime - Sistema de Gestão para Barbearias

## Sobre o Projeto

**BarberTime** é um sistema completo de gestão para barbearias, desenvolvido com React, TypeScript e Supabase. O sistema oferece:

- 🎯 **Sistema de Agendamento** - Clientes podem agendar horários online
- 👨‍💼 **Painel Administrativo** - Gestão completa da barbearia
- 🔐 **Sistema de Aprovação** - Controle de acesso rigoroso para administradores
- 📱 **PWA** - Funciona como aplicativo móvel
- 🎨 **Design Moderno** - Interface responsiva e elegante

## Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Bootstrap
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Autenticação**: Google OAuth, Supabase Auth
- **PWA**: Service Workers, Manifest

## Funcionalidades

### Para Clientes
- Visualização de serviços
- Agendamento online
- Galeria de trabalhos
- Informações de contato

### Para Administradores
- Sistema de login com Google OAuth
- Painel de aprovação de usuários
- Gestão de agendamentos
- Controle de serviços
- Notificações em tempo real

## Como Executar Localmente

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Conta no Google Cloud Console (para OAuth)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/soarxs/barbearia.git

# 2. Navegue para o diretório
cd barbearia

# 3. Instale as dependências
npm install

# 4. Configure as variáveis de ambiente
# Crie um arquivo .env.local com suas credenciais do Supabase

# 5. Execute o script SQL no Supabase
# Execute o arquivo setup-complete-approval-system.sql no SQL Editor

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

### Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o script SQL fornecido em `setup-complete-approval-system.sql`
3. Configure as variáveis de ambiente com suas credenciais

### Configuração do Google OAuth

1. Acesse o [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto ou selecione um existente
3. Ative a API do Google Identity
4. Configure as credenciais OAuth
5. Adicione as URLs de redirecionamento no Supabase

## Deploy

### Vercel (Recomendado)

```bash
# 1. Instale o Vercel CLI
npm i -g vercel

# 2. Faça login
vercel login

# 3. Deploy
vercel

# 4. Configure as variáveis de ambiente no painel do Vercel
```

### Outras Plataformas

O projeto pode ser deployado em qualquer plataforma que suporte React:
- Netlify
- GitHub Pages
- Railway
- Render

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── componentes/         # Componentes específicos do admin
├── hooks/              # Custom hooks
├── lib/                # Configurações e utilitários
├── pages/              # Páginas da aplicação
└── assets/             # Imagens e recursos
```

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## Contato

- **Desenvolvedor**: Guilherme
- **Email**: guilhermesf.beasss@gmail.com
- **GitHub**: [@soarxs](https://github.com/soarxs)

---

**BarberTime** - Estilo não se corta, se cria! 💈