/**
 * Archive extraction utility for ZIP files
 * Handles extracting ZIP files and repacking them with a root folder structure
 */

import { Readable } from 'stream';
import * as unzipper from 'unzipper';
import { Buffer } from 'buffer';
import { ZipArchive } from 'archiver';

export interface ExtractedFile {
  path: string;
  size: number;
  isDirectory: boolean;
}

/**
 * Extract ZIP file and repack with root folder
 * @param fileBuffer - The ZIP file buffer
 * @param rootFolderName - Name of the root folder to create (e.g., 'extracted_files')
 * @returns Promise<Buffer> - The repacked ZIP file buffer
 */
export async function extractAndRepackZip(
  fileBuffer: Buffer,
  rootFolderName: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    // Create a new ZIP archive using ZipArchive class
    const archive = new ZipArchive({
      zlib: { level: 6 },
    });

    // Collect output chunks
    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    archive.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    archive.on('error', (err: Error) => {
      reject(err);
    });

    // Extract and add files to new archive
    const readableStream = Readable.from([fileBuffer]);

    readableStream
      .pipe(unzipper.Parse())
      .on('entry', (entry: any) => {
        const fileName = entry.path;
        const type = entry.type; // 'Directory' or 'File'

        // Skip the root entry and add all files under the root folder
        if (fileName === '' || fileName === '/') {
          entry.autodrain();
          return;
        }

        const newPath = `${rootFolderName}/${fileName}`;

        if (type === 'Directory') {
          archive.append(Buffer.alloc(0), { name: newPath });
          entry.autodrain();
        } else {
          archive.append(entry, { name: newPath });
        }
      })
      .on('error', (err: Error) => {
        reject(err);
      })
      .on('finish', () => {
        archive.finalize();
      });
  });
}

/**
 * List files in a ZIP archive
 * @param fileBuffer - The ZIP file buffer
 * @returns Promise<ExtractedFile[]> - List of files in the archive
 */
export async function listZipFiles(fileBuffer: Buffer): Promise<ExtractedFile[]> {
  const files: ExtractedFile[] = [];

  return new Promise((resolve, reject) => {
    const readableStream = Readable.from([fileBuffer]);

    readableStream
      .pipe(unzipper.Parse())
      .on('entry', (entry: any) => {
        const fileName = entry.path;
        const type = entry.type;

        if (fileName && fileName !== '/' && fileName !== '') {
          files.push({
            path: fileName,
            size: entry.vars.uncompressedSize || 0,
            isDirectory: type === 'Directory',
          });
        }

        entry.autodrain();
      })
      .on('error', reject)
      .on('finish', () => {
        resolve(files);
      });
  });
}
