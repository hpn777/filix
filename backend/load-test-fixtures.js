#!/usr/bin/env node

/**
 * Load test fixtures into the database
 * This script ensures that all required seed data is present before the appservice starts
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'postgrestest',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'appData',
  user: process.env.DB_USER || 'filix_user',
  password: process.env.DB_PASSWORD || 'filix_pass',
};

console.log('Loading test fixtures...');
console.log('Database config:', { ...DB_CONFIG, password: '***' });

async function loadFixtures() {
  const client = new Client(DB_CONFIG);
  
  try {
    await client.connect();
    console.log('Connected to database');

    // Load roles from fixtures
    const rolesData = require('./src/fixtures/roles.json');
    console.log(`Loading ${rolesData.length} roles...`);
    
    for (const role of rolesData) {
      await client.query(
        `INSERT INTO app_role (id, "roleName") 
         VALUES ($1, $2) 
         ON CONFLICT (id) DO NOTHING`,
        [role.id, role.roleName]
      );
    }
    console.log('✓ Roles loaded');

    // Load admin user
    const adminData = require('./src/fixtures/adminData.json');
    console.log('Loading admin user...');
    
    const admin = adminData.admin;
    // user_data table uses primary key 'id', but we don't have id in fixture, so skip id
    await client.query(
      `INSERT INTO user_data ("userName", password, email, config, "displayName", active) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        admin.userName,
        admin.password,
        admin.email,
        admin.config || null,
        admin.displayName,
        admin.active !== false
      ]
    );
    console.log('✓ Admin user loaded');

    // Load admin user roles
    console.log('Loading admin user roles...');
    //  Get the user_id of the just-inserted admin
    const userResult = await client.query(`SELECT id FROM user_data WHERE "userName" = $1`, [admin.userName]);
    const userId = userResult.rows[0]?.id;
    
    if (userId && adminData.roles) {
      for (const userRole of adminData.roles) {
        await client.query(
          `INSERT INTO user_roles (user_id, roles_id) 
           VALUES ($1, $2)`,
          [userId, userRole.roles_id]
        );
      }
    }
    console.log('✓ Admin user roles loaded');

    // Load test user (admin/admin123) for integration tests
    console.log('Loading test user (admin/admin123)...');
    const crypto = require('crypto');
    const testPassword = crypto.createHash('sha256').update('admin123').digest('hex');
    
    await client.query(
      `INSERT INTO user_data ("userName", password, email, config, "displayName", active) 
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [
        'admin',
        testPassword,
        'admin@test.com',
        '{"settings":[]}',
        'Admin Test User',
        true
      ]
    );
    
    // Get test user ID and assign role
    const testUserResult = await client.query(`SELECT id FROM user_data WHERE "userName" = 'admin'`);
    const testUserId = testUserResult.rows[0]?.id;
    
    if (testUserId) {
      await client.query(
        `INSERT INTO user_roles (user_id, roles_id) 
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [testUserId, 1]
      );
    }
    console.log('✓ Test user loaded');

    // Note: Additional fixtures (UI modules, tab presets, control presets, etc.) 
    // are loaded dynamically by the application on first startup
    // when it detects empty tables. This is handled by the Dashboard module.

    console.log('\n✅ Essential fixtures loaded successfully!');
    
  } catch (error) {
    console.error('❌ Error loading fixtures:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Wait for database to be ready
async function waitForDatabase(maxAttempts = 30) {
  const client = new Client(DB_CONFIG);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      console.log('✓ Database is ready');
      return true;
    } catch (error) {
      console.log(`Waiting for database... (attempt ${attempt}/${maxAttempts})`);
      await client.end().catch(() => {});
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error('Database did not become ready in time');
}

async function main() {
  try {
    await waitForDatabase();
    await loadFixtures();
  } catch (error) {
    console.error('Failed to load fixtures:', error);
    process.exit(1);
  }
}

main();
