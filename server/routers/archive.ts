/**
 * Archive extraction tRPC router
 * Handles ZIP file extraction and repacking
 */

import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { extractAndRepackZip } from '../archiveExtractor';

export const archiveRouter = router({
  /**
   * Extract a ZIP file and create a downloadable archive with root folder
   * @param s3Url - URL of the ZIP file to extract
   * @param fileName - Original file name (for folder naming)
   * @returns Download URL for the extracted ZIP
   */
  extractAndDownload: publicProcedure
    .input(
      z.object({
        s3Url: z.string().url(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Download the ZIP file from S3 (with 60s timeout)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60_000);

        const response = await fetch(input.s3Url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`Failed to fetch file from S3: ${response.statusText}`);
        }

        const fileBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(fileBuffer);

        // Generate root folder name from original filename
        // Remove extension and add timestamp for uniqueness
        const baseName = input.fileName.replace(/\.[^.]+$/, '');
        const timestamp = Date.now();
        const rootFolderName = `${baseName}_${timestamp}`;

        // Extract and repack the ZIP
        const repachedBuffer = await extractAndRepackZip(buffer, rootFolderName);

        // Return as base64 so the client can download directly without S3 upload
        const base64 = repachedBuffer.toString('base64');
        const newFileName = `${baseName}_extracted_${timestamp}.zip`;

        return {
          success: true,
          base64,
          fileName: newFileName,
        };
      } catch (error: any) {
        console.error('Archive extraction error:', error);
        throw new Error(`Failed to extract archive: ${error.message}`);
      }
    }),
});
