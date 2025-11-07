import { MySQLService } from '../../infrastructure/services/MySQLService.js';
import { QueryResult } from '../../domain/models/Database.js';

export class DatabaseService {
  constructor(private mysqlService: MySQLService) {}

  /**
   * Executes a SQL query and formats the result as text
   */
  async executeQuery(query: string, params: any[] = []): Promise<string> {
    try {
      // Determine query type
      const queryType = this.getQueryType(query);

      if (queryType === 'SELECT') {
        const result = await this.mysqlService.executeQuery(query, params);
        return this.formatQueryResult(result);
      } else {
        const result = await this.mysqlService.executeNonQuery(query, params);
        return this.formatNonQueryResult(result, queryType);
      }
    } catch (error: any) {
      return `Error executing query: ${error.message}\nSQL State: ${error.sqlState || 'N/A'}\nError Code: ${error.code || 'UNKNOWN'}`;
    }
  }

  /**
   * Lists all tables in the database
   */
  async listTables(): Promise<string> {
    try {
      const tables = await this.mysqlService.listTables();

      if (tables.length === 0) {
        return 'No tables found in the database.';
      }

      return `Tables in database:\n${tables.map((table, index) => `${index + 1}. ${table}`).join('\n')}`;
    } catch (error: any) {
      return `Error listing tables: ${error.message}`;
    }
  }

  /**
   * Describes the structure of a table
   */
  async describeTable(tableName: string): Promise<string> {
    try {
      const result = await this.mysqlService.describeTable(tableName);
      return `Structure of table '${tableName}':\n\n${this.formatQueryResult(result)}`;
    } catch (error: any) {
      return `Error describing table '${tableName}': ${error.message}`;
    }
  }

  /**
   * Formats query results as a readable table
   */
  private formatQueryResult(result: QueryResult): string {
    if (result.rowCount === 0) {
      return 'Query executed successfully. No rows returned.';
    }

    const lines: string[] = [];

    // Header
    const headers = result.fields.map(f => f.name);
    lines.push(headers.join(' | '));
    lines.push(headers.map(h => '-'.repeat(h.length)).join('-+-'));

    // Rows
    for (const row of result.rows) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null) return 'NULL';
        if (value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      });
      lines.push(values.join(' | '));
    }

    lines.push('');
    lines.push(`Total rows: ${result.rowCount}`);

    return lines.join('\n');
  }

  /**
   * Formats non-query results (INSERT, UPDATE, DELETE)
   */
  private formatNonQueryResult(result: { affectedRows: number; insertId?: number }, queryType: string): string {
    const lines: string[] = [];
    lines.push(`${queryType} query executed successfully.`);
    lines.push(`Affected rows: ${result.affectedRows}`);

    if (result.insertId !== undefined && result.insertId > 0) {
      lines.push(`Insert ID: ${result.insertId}`);
    }

    return lines.join('\n');
  }

  /**
   * Determines the type of SQL query
   */
  private getQueryType(query: string): string {
    const trimmed = query.trim().toUpperCase();

    if (trimmed.startsWith('SELECT')) return 'SELECT';
    if (trimmed.startsWith('INSERT')) return 'INSERT';
    if (trimmed.startsWith('UPDATE')) return 'UPDATE';
    if (trimmed.startsWith('DELETE')) return 'DELETE';
    if (trimmed.startsWith('CREATE')) return 'CREATE';
    if (trimmed.startsWith('ALTER')) return 'ALTER';
    if (trimmed.startsWith('DROP')) return 'DROP';

    return 'UNKNOWN';
  }
}
