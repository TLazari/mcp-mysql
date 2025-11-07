// Script para testar a conexão com o banco de dados
// Execute com: node scripts/test-db-connection.js

import mysql from 'mysql2/promise';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

async function testConnection() {
  console.log('🔄 Testando conexão com MySQL...\n');

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'test',
  };

  console.log('📋 Configuração:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Port: ${dbConfig.port}`);
  console.log(`   User: ${dbConfig.user}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log();

  let connection;

  try {
    // Tentar conectar
    console.log('🔌 Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Testar query simples
    console.log('🔍 Testando query SELECT...');
    const [rows] = await connection.execute('SELECT VERSION() as version, DATABASE() as db_name');
    console.log('✅ Query executada com sucesso!');
    console.log(`   MySQL Version: ${rows[0].version}`);
    console.log(`   Database: ${rows[0].db_name}\n`);

    // Listar tabelas
    console.log('📊 Listando tabelas...');
    const [tables] = await connection.execute('SHOW TABLES');

    if (tables.length === 0) {
      console.log('⚠️  Nenhuma tabela encontrada no banco de dados.');
      console.log('   Execute o script examples/database-example.sql para criar tabelas de exemplo.\n');
    } else {
      console.log(`✅ Encontradas ${tables.length} tabela(s):`);
      tables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`   ${index + 1}. ${tableName}`);
      });
      console.log();
    }

    console.log('🎉 Todos os testes passaram! O banco de dados está configurado corretamente.\n');

  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:\n');
    console.error(`   Código: ${error.code || 'UNKNOWN'}`);
    console.error(`   Mensagem: ${error.message}`);
    console.error();

    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Dica: Verifique se o MySQL está rodando.');
      console.error('   - Docker: docker-compose up -d');
      console.error('   - Local: verifique o serviço MySQL');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Dica: Verifique as credenciais no arquivo .env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Dica: O banco de dados não existe. Crie-o primeiro:');
      console.error('   CREATE DATABASE ' + dbConfig.database + ';');
    }
    console.error();

    process.exit(1);

  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada.\n');
    }
  }
}

testConnection().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
