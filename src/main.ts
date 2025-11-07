import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { config } from "dotenv";
import { MySQLService } from "./infrastructure/services/MySQLService.js";
import { DatabaseService } from "./application/services/DatabaseService.js";
import { DatabaseToolsController } from "./interface/controllers/DatabaseToolsController.js";

// Load environment variables
config();

async function main() {
  // Criação da instância do servidor MCP
  const server = new McpServer({
    name: "mysql-database-server",
    version: "1.0.0",
    capabilities: {
      resources: {},
      tools: {},
    },
  });

  // Inicializando serviços de banco de dados
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'test',
  };

  // Verificar se há configuração do banco
  if (!process.env.DB_HOST && !process.env.DB_USER) {
    console.error("❌ Database configuration not found!");
    console.error("Please create a .env file with:");
    console.error("  DB_HOST=localhost");
    console.error("  DB_PORT=3306");
    console.error("  DB_USER=your_user");
    console.error("  DB_PASSWORD=your_password");
    console.error("  DB_NAME=your_database");
    process.exit(1);
  }

  try {
    const mysqlService = new MySQLService(dbConfig);
    await mysqlService.connect();

    const databaseService = new DatabaseService(mysqlService);

    // Controlador que registra as ferramentas de banco de dados
    new DatabaseToolsController(server, databaseService);

    console.error("✅ Database tools enabled");
  } catch (error) {
    console.error("❌ Failed to initialize database tools:", error);
    process.exit(1);
  }

  // Configurando e iniciando o servidor
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 MCP MySQL Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
