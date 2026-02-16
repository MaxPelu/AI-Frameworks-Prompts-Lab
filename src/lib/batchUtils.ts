
import { BatchRow } from '../types/index.ts';

export const parseCSV = (text: string): BatchRow[] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const rows: BatchRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        // Handle simple CSV (splitting by comma, naive approach not handling quoted commas for simplicity/no-deps)
        const values = lines[i].split(',');
        const row: BatchRow = { id: crypto.randomUUID() };
        
        headers.forEach((header, index) => {
            row[header] = values[index]?.trim() || '';
        });
        rows.push(row);
    }
    return rows;
};

export const extractVariables = (prompt: string): string[] => {
    const matches = prompt.match(/{{\s*(\w+)\s*}}/g);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.replace(/{{|}}/g, '').trim()))];
};

export const interpolatePrompt = (prompt: string, row: BatchRow): string => {
    let newPrompt = prompt;
    for (const key of Object.keys(row)) {
        if (key !== 'id') {
            // Replace all occurrences
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            newPrompt = newPrompt.replace(regex, row[key]);
        }
    }
    return newPrompt;
};

export const exportToCSV = (results: any[], headers: string[]): string => {
    const csvRows = [];
    // Add headers: Variables..., Output, Status
    csvRows.push([...headers, 'Output', 'Status'].join(','));

    for (const result of results) {
        const row = [
            ...headers.map(h => `"${(result.variables[h] || '').replace(/"/g, '""')}"`), // Escape quotes
            `"${(result.output || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`, // Flatten output for simple CSV
            result.status
        ];
        csvRows.push(row.join(','));
    }
    return csvRows.join('\n');
};
