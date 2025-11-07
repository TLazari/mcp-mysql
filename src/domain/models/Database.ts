// Database domain models and interfaces

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface QueryResult {
  fields: Array<{
    name: string;
    type: string;
  }>;
  rows: Array<Record<string, any>>;
  rowCount: number;
}

export interface DatabaseError {
  code: string;
  message: string;
  sqlState?: string;
}
