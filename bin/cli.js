#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectName = process.argv[2];

if (!projectName) {
  console.error('❌ Please specify the project directory:');
  console.log('   npx create-motoko-mcp-server <project-name>');
  process.exit(1);
}

const currentDir = process.cwd();
const projectDir = path.resolve(currentDir, projectName);

if (fs.existsSync(projectDir)) {
  console.error(`❌ Directory '${projectName}' already exists.`);
  process.exit(1);
}

fs.mkdirSync(projectDir, { recursive: true });

const templateDir = path.resolve(__dirname, '..', 'template');

// A simple recursive copy function
function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log(`🚀 Creating a new MCP server in ${projectDir}...`);
copyDir(templateDir, projectDir);

// Update the package.json with the correct project name
const projectPackageJsonPath = path.join(projectDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(projectPackageJsonPath, 'utf8'));
packageJson.name = projectName;
fs.writeFileSync(projectPackageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('✅ Project created successfully!');
console.log('\nNext steps:');
console.log(`   cd ${projectName}`);
console.log('   npm install');
console.log('   mops install');
console.log('   dfx start --background');
console.log('   dfx deploy');