#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const VERSION_FILE = path.join(__dirname, '../src/lib/version.js');

// Lê o arquivo de versão
const versionContent = fs.readFileSync(VERSION_FILE, 'utf8');

// Extrai a versão atual
const minorMatch = versionContent.match(/minor:\s*(\d+)/);
const patchMatch = versionContent.match(/patch:\s*(\d+)/);

if (!minorMatch || !patchMatch) {
  console.error('Erro: Não foi possível encontrar a versão minor/patch');
  process.exit(1);
}

const currentMinor = parseInt(minorMatch[1]);
const newMinor = currentMinor + 1;

// Atualiza o arquivo
const newContent = versionContent
  .replace(/minor:\s*\d+/, `minor: ${newMinor}`)
  .replace(/patch:\s*\d+/, `patch: 0`);

fs.writeFileSync(VERSION_FILE, newContent);

console.log(`🚀 Deploy version: V 1.${newMinor}.00`);
console.log(`📝 Arquivo atualizado: ${VERSION_FILE}`);
