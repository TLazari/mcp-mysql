import mysql from 'mysql2/promise';
import { DatabaseConfig, QueryResult, DatabaseError } from '../../domain/models/Database.js';

export class MySQLService {
  private pool: mysql.Pool | null = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  /**
   * Initializes the database connection pool
   */
  async connect(): Promise<void> {
    try {
      this.pool = mysql.createPool({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      });

      // Test the connection
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();

      console.log('MySQL connection pool established successfully');
    } catch (error) {
      console.error('Failed to connect to MySQL:', error);
      throw error;
    }
  }

  /**
   * Executes a SELECT query and returns results
   */
  async executeQuery(query: string, params: any[] = []): Promise<QueryResult> {
    if (!this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }

    try {
      const [rows, fields] = await this.pool.execute(query, params);

      // Transform field information
      const fieldInfo = (fields as mysql.FieldPacket[]).map(field => ({
        name: field.name,
        type: this.getFieldType(field.type ?? 0)
      }));

      return {
        fields: fieldInfo,
        rows: rows as Array<Record<string, any>>,
        rowCount: Array.isArray(rows) ? rows.length : 0
      };
    } catch (error: any) {
      const dbError: DatabaseError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Unknown database error',
        sqlState: error.sqlState
      };
      throw dbError;
    }
  }

  /**
   * Executes an INSERT, UPDATE or DELETE query
   */
  async executeNonQuery(query: string, params: any[] = []): Promise<{ affectedRows: number; insertId?: number }> {
    if (!this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }

    try {
      const [result] = await this.pool.execute(query, params);
      const resultSet = result as mysql.ResultSetHeader;

      return {
        affectedRows: resultSet.affectedRows,
        insertId: resultSet.insertId
      };
    } catch (error: any) {
      const dbError: DatabaseError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Unknown database error',
        sqlState: error.sqlState
      };
      throw dbError;
    }
  }

  /**
   * Lists all tables in the current database
   */
  async listTables(): Promise<string[]> {
    const result = await this.executeQuery('SHOW TABLES');
    return result.rows.map(row => Object.values(row)[0] as string);
  }

  /**
   * Describes the structure of a table
   */
  async describeTable(tableName: string): Promise<QueryResult> {
    return await this.executeQuery(`DESCRIBE ${mysql.escapeId(tableName)}`);
  }

  /**
   * Closes the connection pool
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('MySQL connection pool closed');
    }
  }

  /**
   * Maps MySQL field types to readable names
   */
  private getFieldType(type: number): string {
    const types: Record<number, string> = {
      0: 'DECIMAL',
      1: 'TINY',
      2: 'SHORT',
      3: 'LONG',
      4: 'FLOAT',
      5: 'DOUBLE',
      7: 'TIMESTAMP',
      8: 'LONGLONG',
      9: 'INT24',
      10: 'DATE',
      11: 'TIME',
      12: 'DATETIME',
      13: 'YEAR',
      15: 'VARCHAR',
      16: 'BIT',
      245: 'JSON',
      246: 'NEWDECIMAL',
      247: 'ENUM',
      248: 'SET',
      249: 'TINY_BLOB',
      250: 'MEDIUM_BLOB',
      251: 'LONG_BLOB',
      252: 'BLOB',
      253: 'VAR_STRING',
      254: 'STRING',
      255: 'GEOMETRY'
    };

    return types[type] || 'UNKNOWN';
  }
}
