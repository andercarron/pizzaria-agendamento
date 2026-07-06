const { Pool } = require('pg');

const conexao = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'pizzaria_db',
    password: '1234',
    port: 5432
});

module.exports = conexao;