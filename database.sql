-- MySQL database initialization script for Profitly API

CREATE DATABASE IF NOT EXISTS profitly_db;
USE profitly_db;

-- Product Sales table
CREATE TABLE product_sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productName VARCHAR(255) NOT NULL,
    sellingPrice DECIMAL(10,2) NOT NULL,
    productionCost DECIMAL(10,2) NOT NULL,
    quantitySold INT NOT NULL,
    createdAtMillis BIGINT NOT NULL
);

-- Index on createdAtMillis for efficient date-based queries
CREATE INDEX idx_product_sales_created_at ON product_sales (createdAtMillis);

-- Expenses table
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    createdAtMillis BIGINT NOT NULL
);

-- Index on createdAtMillis for efficient date-based queries
CREATE INDEX idx_expenses_created_at ON expenses (createdAtMillis);