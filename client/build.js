import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

// Create shared directory in client if it doesn't exist
const sharedDir = join(process.cwd(), 'src', 'shared');
if (!existsSync(sharedDir)) {
  mkdirSync(sharedDir, { recursive: true });
}

// Copy shared files from server
const serverSharedDir = join(process.cwd(), '..', 'server', 'shared');
const files = ['schema.ts', 'curriculum-schema.ts'];

files.forEach(file => {
  const srcPath = join(serverSharedDir, file);
  const destPath = join(sharedDir, file);
  if (existsSync(srcPath)) {
    copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} to client/src/shared/`);
  }
});

// Run vite build
try {
  execSync('vite build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}