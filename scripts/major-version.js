#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VERSION_FILE = path.join(__dirname, '../src/lib/version.js');

// Lê o arquivo de versão
const versionContent = fs.readFileSync(VERSION_FILE, 'utf8');

// Extrai a versão atual
const majorMatch = versionContent.match(/major:\s*(\d+)/);

if (!majorMatch) {
  console.error('Erro: Não foi possível encontrar a versão major');
  process.exit(1);
}

const currentMajor = parseInt(majorMatch[1]);
const newMajor = currentMajor + 1;

// Atualiza o arquivo
const newContent = versionContent
  .replace(/major:\s*\d+/, `major: ${newMajor}`)
  .replace(/minor:\s*\d+/, `minor: 1`)
  .replace(/patch:\s*\d+/, `patch: 0`);

fs.writeFileSync(VERSION_FILE, newContent);

console.log(`🎯 Major version: V ${newMajor}.1.0`);
console.log(`📝 Arquivo atualizado: ${VERSION_FILE}`);
