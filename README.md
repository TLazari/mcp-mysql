# MCP MySQL Server

Servidor MCP (Model Context Protocol) para executar queries em bancos de dados MySQL através do Claude AI.

Este repositório contém uma implementação completa de um servidor MCP em Node.js/TypeScript que permite ao Claude executar queries SQL, listar tabelas e explorar estruturas de bancos de dados MySQL.

## Funcionalidades

### Ferramentas de Banco de Dados MySQL
- **query-database**: Executa queries SQL (SELECT, INSERT, UPDATE, DELETE) com suporte a queries parametrizadas
- **list-tables**: Lista todas as tabelas do banco de dados conectado
- **describe-table**: Mostra a estrutura de uma tabela específica (colunas, tipos, chaves)

### Características Técnicas
- Validação de entrada usando [Zod](https://github.com/colinhacks/zod)
- Conexão com MySQL usando `mysql2` com pool de conexões
- Queries parametrizadas para segurança (prevenção de SQL injection)
- Comunicação via _stdio_ usando o protocolo MCP (`@modelcontextprotocol/sdk`)
- Suporte para MySQL 5.7+

## Arquitetura

O projeto segue uma arquitetura em camadas inspirada em padrões de **Domain-Driven Design** (DDD):

- **Domain** (`src/domain`):
  Definição de interfaces e tipos que representam as estruturas de dados do banco (ex: `DatabaseConfig`, `QueryResult`, `DatabaseError`)

- **Infrastructure** (`src/infrastructure`):
  Implementação de serviços externos, como o `MySQLService`, responsável pela comunicação com o banco de dados MySQL

- **Application** (`src/application`):
  Contém a lógica de negócio no `DatabaseService`, que processa e formata os resultados das queries

- **Interface** (`src/interface`):
  Inclui controladores (`DatabaseToolsController`) que registram as ferramentas no servidor MCP, definem schemas de validação e retornam os resultados

- **Entry Point** (`src/main.ts`):
  Inicializa o `McpServer`, configura o transporte (`StdioServerTransport`), instancia serviços e controladores, e inicia escuta em _stdio_

A estrutura de pastas é a seguinte:

```
src/
├── domain/
│   └── models/           # Interfaces de domínio (Database)
├── infrastructure/
│   └── services/         # Implementação do cliente MySQL
├── application/
│   └── services/         # Lógica de negócio e formatação de dados
├── interface/
│   └── controllers/      # Registro das ferramentas MCP e validação
└── main.ts               # Ponto de entrada do servidor
build/                     # Código JavaScript compilado
```

## Instalação

```bash
git clone <REPOSITÓRIO_URL>
cd mcp-server-sample
npm install
npm run build:windows    # Windows
# ou
npm run build            # Linux/Mac
```

## Configuração do Banco de Dados

Para conectar ao seu MySQL Docker existente:

### 1. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo:
```bash
# No Windows (PowerShell)
copy .env.example .env

# No Linux/Mac
cp .env.example .env
```

### 2. Editar Credenciais

Edite o arquivo `.env` com as credenciais do seu MySQL Docker:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=seu_banco
```

### 3. Testar Conexão

```bash
npm run test-db
```

Se a conexão for bem-sucedida, você verá:
```
✅ Conexão estabelecida com sucesso!
✅ Query executada com sucesso!
🎉 Todos os testes passaram!
```

## Uso

Após o build, você pode executar o servidor diretamente:

```bash
npm run server
```

Você deverá ver:
```
MySQL connection pool established successfully
✅ Database tools enabled
🚀 MCP MySQL Server running on stdio
```

### Integração com Claude Desktop

Configure o servidor no arquivo de configuração do Claude:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Adicione (ajuste o caminho e credenciais):

```json
{
  "mcpServers": {
    "mysql": {
      "command": "node",
      "args": ["C:\\caminho\\completo\\para\\build\\main.js"],
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "3306",
        "DB_USER": "seu_usuario",
        "DB_PASSWORD": "sua_senha",
        "DB_NAME": "seu_banco"
      }
    }
  }
}
```

Reinicie o Claude Desktop e teste!

### Exemplos de Uso

**Listar tabelas:**
> "Liste todas as tabelas do banco de dados"

**Consultar dados:**
> "Mostre os primeiros 10 registros da tabela users"

**Análise de dados:**
> "Quantos usuários ativos existem?"

**Estrutura de tabela:**
> "Mostre a estrutura da tabela products"

### Exemplos de JSON (Formato MCP)

**Listar tabelas:**
```json
{
  "name": "list-tables"
}
```

**Descrever estrutura de uma tabela:**
```json
{
  "name": "describe-table",
  "arguments": {
    "tableName": "users"
  }
}
```

**Executar query SELECT:**
```json
{
  "name": "query-database",
  "arguments": {
    "query": "SELECT * FROM users WHERE active = ? LIMIT 10",
    "params": [1]
  }
}
```

**Executar INSERT:**
```json
{
  "name": "query-database",
  "arguments": {
    "query": "INSERT INTO users (name, email) VALUES (?, ?)",
    "params": ["João Silva", "joao@example.com"]
  }
}
```

## Scripts Disponíveis

```bash
npm run build:windows    # Build TypeScript (Windows)
npm run build            # Build TypeScript (Linux/Mac)
npm run server           # Inicia o servidor MCP
npm run test-db          # Testa conexão com MySQL
```

## Documentação Adicional

- [SETUP-MYSQL.md](SETUP-MYSQL.md) - Guia rápido de setup (3 passos)
- [QUICKSTART.md](QUICKSTART.md) - Guia completo de início rápido
- [DATABASE.md](DATABASE.md) - Documentação detalhada das ferramentas
- [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) - Arquitetura e estrutura do projeto

## Segurança

- ✅ Queries parametrizadas (prevenção de SQL injection)
- ✅ Pool de conexões com limite de recursos
- ✅ Validação de entrada com Zod
- ✅ Variáveis de ambiente para credenciais
- ✅ Tratamento estruturado de erros

### Recomendações

- Use um usuário MySQL com permissões limitadas
- Não commite o arquivo `.env` no Git
- Configure SSL/TLS para conexão em produção
- Implemente rate limiting em ambientes públicos

## Contribuição

Pull requests são bem-vindos! Sinta-se à vontade para abrir issues e discutir melhorias.

## Licença

ISC

## Créditos

Baseado no projeto educacional do [Código Fonte TV](https://youtu.be/NUOzYPSNaNk).
