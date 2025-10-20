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
const patchMatch = versionContent.match(/patch:\s*(\d+)/);
if (!patchMatch) {
  console.error('Erro: Não foi possível encontrar a versão patch');
  process.exit(1);
}

const currentPatch = parseInt(patchMatch[1]);
const newPatch = currentPatch + 1;

// Atualiza o arquivo
const newContent = versionContent.replace(
  /patch:\s*\d+/,
  `patch: ${newPatch}`
);

fs.writeFileSync(VERSION_FILE, newContent);

console.log(`✅ Versão atualizada: V 1.0.${newPatch.toString().padStart(2, '0')}`);
console.log(`📝 Arquivo atualizado: ${VERSION_FILE}`);
