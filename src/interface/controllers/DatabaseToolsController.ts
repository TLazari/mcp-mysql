import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { DatabaseService } from '../../application/services/DatabaseService.js';

export class DatabaseToolsController {
  constructor(
    private server: McpServer,
    private databaseService: DatabaseService
  ) {
    this.registerTools();
  }

  private registerTools(): void {
    this.registerQueryDatabaseTool();
    this.registerListTablesTool();
    this.registerDescribeTableTool();
  }

  private registerQueryDatabaseTool(): void {
    this.server.tool(
      'query-database',
      'Execute a SQL query on the MySQL database. Supports SELECT, INSERT, UPDATE, DELETE and other SQL commands. Use parameterized queries for security.',
      {
        query: z.string().min(1).describe('The SQL query to execute (e.g., "SELECT * FROM users WHERE id = ?")'),
        params: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional().describe('Optional parameters for parameterized queries (e.g., [1, "John"])'),
      },
      async ({ query, params = [] }) => {
        const result = await this.databaseService.executeQuery(query, params);

        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }
    );
  }

  private registerListTablesTool(): void {
    this.server.tool(
      'list-tables',
      'List all tables in the connected MySQL database.',
      {},
      async () => {
        const result = await this.databaseService.listTables();

        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }
    );
  }

  private registerDescribeTableTool(): void {
    this.server.tool(
      'describe-table',
      'Show the structure of a specific table including columns, types, keys, etc.',
      {
        tableName: z.string().min(1).describe('The name of the table to describe'),
      },
      async ({ tableName }) => {
        const result = await this.databaseService.describeTable(tableName);

        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }
    );
  }
}
