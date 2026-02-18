import * as XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const wb = XLSX.utils.book_new();

// Header row
const headers = [
  '', '', 'ID', 'Nome da Tarefa', 'ID Pai', 'Status', 'Duração (dias)', 'Data Início', 'Data Fim', 'Responsável'
];

// Example rows
const exampleRows = [
  ['', '', 1, 'Fase de Planejamento', '', 'Pendente', 5, '01/03/2025', '07/03/2025', 'João Silva'],
  ['', '', 2, 'Levantamento de Requisitos', 1, 'Pendente', 3, '01/03/2025', '05/03/2025', 'Maria Santos'],
  ['', '', 3, 'Documentação', 1, 'Pendente', 2, '05/03/2025', '07/03/2025', 'João Silva'],
  ['', '', 4, 'Fase de Execução', '', 'Pendente', 10, '10/03/2025', '21/03/2025', ''],
  ['', '', 5, 'Desenvolvimento', 4, 'Fazendo', 8, '10/03/2025', '19/03/2025', 'Carlos Lima'],
  ['', '', 6, 'Testes', 4, 'Pendente', 2, '19/03/2025', '21/03/2025', 'Ana Costa'],
];

const wsData = [headers, ...exampleRows];
const ws = XLSX.utils.aoa_to_sheet(wsData);

// Column widths
ws['!cols'] = [
  { wch: 5 }, { wch: 5 }, { wch: 8 }, { wch: 40 }, { wch: 10 },
  { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 25 }
];

XLSX.utils.book_append_sheet(wb, ws, 'Prioridades GHAS');

const outputPath = join(__dirname, '../public/templates/GHAS_-_Arquivo_Modelo_de_Importacao_Prioridades.xlsx');
XLSX.writeFile(wb, outputPath);
console.log('Template gerado em:', outputPath);
