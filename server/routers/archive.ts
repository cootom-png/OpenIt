/**
 * Archive extraction tRPC router
 * Handles ZIP file extraction and repacking
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { extractAndRepackZip } from '../archiveExtractor';
import { storagePut } from '../storage';

export const archiveRouter = router({
  /**
   * Extract a ZIP file and create a downloadable archive with root folder
   * @param s3Url - URL of the ZIP file to extract
   * @param fileName - Original file name (for folder naming)
   * @returns Download URL for the extracted ZIP
   */
  extractAndDownload: protectedProcedure
    .input(
      z.object({
        s3Url: z.string().url(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Download the ZIP file from S3
        const response = await fetch(input.s3Url);
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

        // Upload the repacked ZIP to S3
        const newFileName = `${baseName}_extracted_${timestamp}.zip`;
        const fileKey = `${ctx.user.id}/extracted-archives/${newFileName}`;

        const { url } = await storagePut(fileKey, repachedBuffer, 'application/zip');

        return {
          success: true,
          downloadUrl: url,
          fileName: newFileName,
        };
      } catch (error: any) {
        console.error('Archive extraction error:', error);
        throw new Error(`Failed to extract archive: ${error.message}`);
      }
    }),
});
