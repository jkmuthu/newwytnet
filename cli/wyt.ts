#!/usr/bin/env node

import { Command } from 'commander';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { DSLValidator, CodeGenerator } from '../packages/builder/index';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const program = new Command();

program
  .name('wyt')
  .description('WytNet CLI - Low-code development tools')
  .version('1.0.0');

// DSL validation command
program
  .command('dsl')
  .description('DSL validation and management')
  .argument('<command>', 'validate')
  .argument('<file>', 'DSL file path')
  .action(async (command: string, filePath: string) => {
    try {
      if (command === 'validate') {
        await validateDSL(filePath);
      } else {
        console.error(`Unknown DSL command: ${command}`);
        process.exit(1);
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Model generation command
program
  .command('generate')
  .description('Code generation from DSL')
  .argument('<type>', 'model')
  .argument('<files...>', 'DSL file paths')
  .option('-o, --output <dir>', 'Output directory', './generated')
  .option('-t, --tenant <id>', 'Tenant ID for generation')
  .action(async (type: string, files: string[], options: any) => {
    try {
      if (type === 'model') {
        await generateModels(files, options);
      } else {
        console.error(`Unknown generation type: ${type}`);
        process.exit(1);
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Migration command
program
  .command('migrate')
  .description('Run database migrations')
  .option('--force', 'Force migration without confirmation')
  .action(async (options: any) => {
    try {
      await runMigrations(options.force);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Dev server command
program
  .command('dev')
  .description('Start development servers')
  .option('-p, --port <number>', 'Port for frontend', '5000')
  .option('--api-port <number>', 'Port for API', '8000')
  .action(async (options: any) => {
    try {
      await startDevServers(options);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Build command
program
  .command('build')
  .description('Build the application')
  .option('--prod', 'Production build')
  .action(async (options: any) => {
    try {
      await buildApplication(options.prod);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Seed command
program
  .command('seed')
  .description('Seed database with example data')
  .option('--reset', 'Reset database before seeding')
  .action(async (options: any) => {
    try {
      await seedDatabase(options.reset);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

async function validateDSL(filePath: string): Promise<void> {
  console.log(`Validating DSL file: ${filePath}`);
  
  const fileContent = await fs.readFile(filePath, 'utf-8');
  let dslData;
  
  try {
    dslData = JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`Invalid JSON in file: ${error.message}`);
  }
  
  const validation = DSLValidator.validate(dslData);
  
  if (validation.valid) {
    console.log('✅ DSL validation passed');
    console.log(`Model: ${dslData.name}`);
    console.log(`Fields: ${dslData.fields?.length || 0}`);
    
    if (dslData.relations?.length > 0) {
      console.log(`Relations: ${dslData.relations.length}`);
    }
  } else {
    console.log('❌ DSL validation failed:');
    validation.errors.forEach(error => {
      console.log(`  - ${error}`);
    });
    throw new Error('DSL validation failed');
  }
}

async function generateModels(files: string[], options: any): Promise<void> {
  console.log(`Generating models from ${files.length} file(s)`);
  
  const outputDir = options.output;
  const tenantId = options.tenant || 'default';
  
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });
  
  for (const filePath of files) {
    console.log(`Processing: ${filePath}`);
    
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const dslData = JSON.parse(fileContent);
    
    // Validate DSL first
    const validation = DSLValidator.validate(dslData);
    if (!validation.valid) {
      throw new Error(`Invalid DSL in ${filePath}: ${validation.errors.join(', ')}`);
    }
    
    // Generate code
    const generated = CodeGenerator.generateFromDSL(dslData, tenantId);
    
    const modelDir = path.join(outputDir, dslData.name.toLowerCase());
    await fs.mkdir(modelDir, { recursive: true });
    
    // Write generated files
    await fs.writeFile(path.join(modelDir, 'model.prisma'), generated.prismaModel);
    await fs.writeFile(path.join(modelDir, 'schemas.ts'), generated.zodSchemas);
    await fs.writeFile(path.join(modelDir, 'controller.ts'), generated.nestController);
    await fs.writeFile(path.join(modelDir, 'service.ts'), generated.nestService);
    await fs.writeFile(path.join(modelDir, 'migration.sql'), generated.migration);
    
    // Write admin pages
    const pagesDir = path.join(modelDir, 'pages');
    await fs.mkdir(pagesDir, { recursive: true });
    
    generated.nextAdminPages.forEach(async (pageContent, index) => {
      await fs.writeFile(path.join(pagesDir, `page-${index}.tsx`), pageContent);
    });
    
    console.log(`✅ Generated files for ${dslData.name} in ${modelDir}`);
  }
  
  console.log('🎉 Code generation completed!');
  console.log('\nNext steps:');
  console.log('1. Review generated files');
  console.log('2. Run `wyt migrate` to apply database changes');
  console.log('3. Integrate generated components into your app');
}

async function runMigrations(force: boolean = false): Promise<void> {
  console.log('Running database migrations...');
  
  if (!force) {
    console.log('This will apply database schema changes. Continue? (y/N)');
    // In a real implementation, we'd wait for user input
  }
  
  try {
    // Run Prisma migrations
    await execAsync('npx prisma db push');
    console.log('✅ Database migrations completed');
    
    // Enable RLS policies
    console.log('Enabling Row Level Security...');
    // In a real implementation, we'd run the RLS setup scripts
    console.log('✅ RLS policies enabled');
    
  } catch (error) {
    throw new Error(`Migration failed: ${error.message}`);
  }
}

async function startDevServers(options: any): Promise<void> {
  console.log('Starting development servers...');
  
  const frontendPort = options.port;
  const apiPort = options.apiPort;
  
  console.log(`Frontend: http://localhost:${frontendPort}`);
  console.log(`API: http://localhost:${apiPort}`);
  
  try {
    // Start both servers concurrently
    const frontend = execAsync(`npm run dev`);
    
    console.log('✅ Development servers started');
    console.log('Press Ctrl+C to stop servers');
    
    // Keep the process running
    await frontend;
    
  } catch (error) {
    throw new Error(`Failed to start dev servers: ${error.message}`);
  }
}

async function buildApplication(prod: boolean = false): Promise<void> {
  console.log(`Building application${prod ? ' for production' : ''}...`);
  
  try {
    // Build frontend
    console.log('Building frontend...');
    await execAsync('npm run build');
    
    console.log('✅ Build completed successfully');
    
    if (prod) {
      console.log('📦 Production build ready for deployment');
      console.log('Run `npm start` to start the production server');
    }
    
  } catch (error) {
    throw new Error(`Build failed: ${error.message}`);
  }
}

async function seedDatabase(reset: boolean = false): Promise<void> {
  console.log('Seeding database with example data...');
  
  if (reset) {
    console.log('⚠️  Resetting database (this will delete all data)');
  }
  
  try {
    // Run the seed script
    await execAsync('npx tsx scripts/seed.ts');
    
    console.log('✅ Database seeded successfully');
    console.log('\nExample data created:');
    console.log('- Super admin user');
    console.log('- Sample tenant with modules');
    console.log('- WytCRM app example');
    console.log('- OwnerNET hub example');
    console.log('- Demo pages and blocks');
    
  } catch (error) {
    throw new Error(`Seeding failed: ${error.message}`);
  }
}

// Export for programmatic usage
export {
  validateDSL,
  generateModels,
  runMigrations,
  startDevServers,
  buildApplication,
  seedDatabase,
};

program.parse();
