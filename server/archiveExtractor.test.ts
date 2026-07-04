import { describe, it, expect, beforeAll } from 'vitest';
import { extractAndRepackZip, listZipFiles } from './archiveExtractor';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import * as unzipper from 'unzipper';

describe('Archive Extractor', () => {
  let testZipBuffer: Buffer;

  beforeAll(async () => {
    // Create a simple test ZIP file with some files
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    zip.file('file1.txt', 'Hello World');
    zip.file('folder1/file2.txt', 'Nested file');
    zip.folder('empty-folder');
    
    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    testZipBuffer = buffer;
  });

  it('should list files in a ZIP archive', async () => {
    const files = await listZipFiles(testZipBuffer);
    
    expect(files).toBeDefined();
    expect(files.length).toBeGreaterThan(0);
    
    const fileNames = files.map(f => f.path);
    expect(fileNames).toContain('file1.txt');
    expect(fileNames.some(f => f.includes('file2.txt'))).toBe(true);
  });

  it('should extract and repack ZIP with root folder', async () => {
    const repachedBuffer = await extractAndRepackZip(testZipBuffer, 'extracted_files');
    
    expect(repachedBuffer).toBeDefined();
    expect(repachedBuffer.length).toBeGreaterThan(0);
    
    // Verify the repacked ZIP contains files under root folder
    const files = await listZipFiles(repachedBuffer);
    const fileNames = files.map(f => f.path);
    
    expect(fileNames.some(f => f.startsWith('extracted_files/'))).toBe(true);
  });

  it('should preserve file content after extraction and repacking', async () => {
    const repachedBuffer = await extractAndRepackZip(testZipBuffer, 'test_root');
    
    // Read the repacked ZIP and verify content
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(repachedBuffer);
    
    const file1Content = await zip.file('test_root/file1.txt')?.async('string');
    expect(file1Content).toBe('Hello World');
  });
});
