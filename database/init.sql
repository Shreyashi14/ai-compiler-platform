CREATE DATABASE IF NOT EXISTS ai_compiler_db;
USE ai_compiler_db;

CREATE TABLE IF NOT EXISTS metrics_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prompt TEXT NOT NULL,
    success_rate DECIMAL(5,2),
    retries INT DEFAULT 0,
    failure_types VARCHAR(255),
    latency_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS generated_schemas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prompt_id INT,
    ui_schema JSON,
    api_schema JSON,
    db_schema JSON,
    auth_schema JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);