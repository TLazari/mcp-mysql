# Guia Rápido de Início

Este guia mostra como configurar e testar rapidamente o servidor MCP conectando ao seu MySQL Docker existente.

## Pré-requisitos

- Node.js 16+
- MySQL 5.7+ rodando no Docker (você já tem!)

## Setup Rápido (3 minutos)

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo:

**Windows (PowerShell):**
```powershell
copy .env.example .env
```

**Linux/Mac:**
```bash
cp .env.example .env
```

### 3. Editar o arquivo .env

Abra o arquivo `.env` e configure com as credenciais do seu MySQL Docker:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=nome_do_seu_banco
```

### 4. Build do projeto

```bash
npm run build:windows    # Windows
# ou
npm run build            # Linux/Mac
```

### 5. Testar conexão com banco

```bash
npm run test-db
```

Se tudo estiver correto, você verá:
```
✅ Conexão estabelecida com sucesso!
✅ Query executada com sucesso!
   MySQL Version: 5.7.29
   Database: seu_banco
✅ Encontradas X tabela(s):
   1. sua_tabela1
   2. sua_tabela2
   ...
🎉 Todos os testes passaram!
```

### 6. Iniciar o servidor MCP

```bash
npm run server
```

Você deverá ver:
```
MySQL connection pool established successfully
Database tools enabled
MCP Server running on stdio
```

## Testando as Ferramentas

### Via Claude Desktop

Configure o servidor no arquivo de configuração do Claude:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Adicione (ajuste o caminho e credenciais):

```json
{
  "mcpServers": {
    "weather-and-database": {
      "command": "node",
      "args": ["C:\\Users\\DEV2\\Documents\\projetos\\MCP\\mcp-server-sample\\build\\main.js"],
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

Reinicie o Claude Desktop e teste com prompts como:

**Listar tabelas:**
> "Liste todas as tabelas do banco de dados"

**Consultar dados:**
> "Mostre os registros da tabela X"

**Análise de dados:**
> "Quantos registros existem na tabela Y?"

## Comandos Úteis

### Build e Execução

```bash
# Build do projeto
npm run build:windows    # Windows
npm run build            # Linux/Mac

# Testar conexão DB
npm run test-db

# Iniciar servidor
npm run server
```

### Verificar seu MySQL Docker

```bash
# Verificar se o container MySQL está rodando
docker ps | grep mysql

# Ver logs do MySQL
docker logs <nome_do_container_mysql>

# Conectar ao MySQL diretamente
docker exec -it <nome_do_container_mysql> mysql -u seu_usuario -p
```

## Exemplos de Uso

Depois de conectar via Claude, você pode fazer perguntas como:

### Exploração

- "Liste todas as tabelas disponíveis"
- "Mostre a estrutura da tabela X"
- "Quantos registros existem na tabela Y?"

### Consultas

- "Mostre os primeiros 10 registros da tabela X"
- "Busque registros onde campo = valor"
- "Conte quantos registros têm status 'ativo'"

### Análises

- "Agrupe por campo e conte"
- "Calcule a soma/média/máximo do campo X"
- "Mostre os registros mais recentes"

### Modificações

- "Adicione um novo registro na tabela X"
- "Atualize o campo Y onde id = Z"
- "Delete registros onde condição"

## Solução de Problemas

### MySQL não conecta

```bash
# Verificar se seu container MySQL está rodando
docker ps

# Verificar logs do container
docker logs <nome_do_container_mysql>

# Verificar se a porta 3306 está acessível
telnet localhost 3306
```

### Erro de permissão

```bash
# Verificar credenciais no .env
type .env  # Windows
cat .env   # Linux/Mac

# Testar conexão direta
docker exec -it <container_mysql> mysql -u seu_usuario -p
```

### Build falha

```bash
# Limpar e reinstalar
rm -rf node_modules build
npm install
npm run build:windows
```

### Erro "Database not found"

Certifique-se de que o banco de dados existe:

```bash
# Conectar ao MySQL
docker exec -it <container_mysql> mysql -u seu_usuario -p

# No MySQL
SHOW DATABASES;
USE seu_banco;
SHOW TABLES;
```

## Banco de Dados de Exemplo (Opcional)

Se quiser testar com dados de exemplo, execute:

```bash
# Importe o script SQL de exemplo
docker exec -i <container_mysql> mysql -u seu_usuario -p seu_banco < examples/database-example.sql
```

Isso criará tabelas de exemplo (users, products, categories, orders) com dados.

## Próximos Passos

- Leia a [documentação completa do banco de dados](DATABASE.md)
- Explore o código fonte em `src/`
- Use com suas próprias tabelas e queries
- Veja [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) para entender a arquitetura

## Dicas

### Múltiplos Bancos

Você pode conectar a diferentes bancos alterando o `.env` ou passando variáveis de ambiente:

```bash
DB_NAME=outro_banco npm run server
```

### Segurança

- Use sempre queries parametrizadas
- Crie um usuário MySQL específico com permissões limitadas
- Não commite o arquivo `.env` no Git
