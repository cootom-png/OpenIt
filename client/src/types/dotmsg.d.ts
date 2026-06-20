declare module "dotmsg" {
  export class DotMsgParser {
    parseBuffer(data: Uint8Array): Promise<void>;
    getSubject(): string | undefined;
    getSenderName(): string | undefined;
    getSenderEmail(): string | undefined;
    getTo(): string | undefined;
    getCC(): string[] | undefined;
    getBCC(): string[] | undefined;
    getSentDate(): string | undefined;
    getReceivedDate(): string | undefined;
    getReceivedByName(): string | undefined;
    getReceivedByEmail(): string | undefined;
    getTextContent(): string | undefined;
    getHTMLContent(): string | undefined;
    getPriority(): string | undefined;
    getReplyTo(): string | undefined;
    getImportance(): string | undefined;
    getDeliveryReceiptRequested(): string | undefined;
    getAttachments(): Array<{
      getFilename(): string;
      getContent(): Buffer;
      filename?: string;
      content?: Buffer;
    }>;
  }
}
