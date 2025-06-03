import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';

export class GoogleDriveService {
  private oauth2Client: OAuth2Client;

  constructor() {
    // Get the correct redirect URI for Replit
    const redirectUri = this.getRedirectUri();
    console.log('Google OAuth configured with redirect URI:', redirectUri);
    
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );
  }

  private getRedirectUri(): string {
    // For Replit deployment
    if (process.env.REPLIT_DOMAINS) {
      const domain = process.env.REPLIT_DOMAINS.split(',')[0]; // Use first domain
      return `https://${domain}/api/google/callback`;
    }
    
    // For local development
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:5000/api/google/callback';
    }
    
    // Fallback
    return process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/google/callback';
  }

  isConfigured(): boolean {
    return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }

  setCredentials(accessToken: string, refreshToken?: string) {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  async listFiles(pageToken?: string) {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    
    try {
      const response = await drive.files.list({
        pageSize: 50,
        pageToken,
        fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, webViewLink)',
        q: "mimeType='application/vnd.google-apps.document' or mimeType='application/pdf' or mimeType='text/plain'",
        orderBy: 'modifiedTime desc',
      });

      return response.data;
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error('Failed to list Google Drive files');
    }
  }

  async getFileContent(fileId: string) {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    
    try {
      // Get file metadata first
      const metadata = await drive.files.get({
        fileId,
        fields: 'name, mimeType, modifiedTime',
      });

      let content = '';
      
      // Handle different file types
      if (metadata.data.mimeType === 'application/vnd.google-apps.document') {
        // Export Google Docs as plain text
        const response = await drive.files.export({
          fileId,
          mimeType: 'text/plain',
        });
        content = response.data as string;
      } else if (metadata.data.mimeType === 'text/plain') {
        // Get plain text files directly
        const response = await drive.files.get({
          fileId,
          alt: 'media',
        });
        content = response.data as string;
      } else {
        throw new Error(`Unsupported file type: ${metadata.data.mimeType}`);
      }

      return {
        name: metadata.data.name,
        mimeType: metadata.data.mimeType,
        modifiedTime: metadata.data.modifiedTime,
        content,
      };
    } catch (error) {
      console.error('Error getting file content:', error);
      throw new Error('Failed to get file content from Google Drive');
    }
  }

  async updateFileContent(fileId: string, content: string) {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    
    try {
      // Get current file metadata
      const metadata = await drive.files.get({
        fileId,
        fields: 'mimeType',
      });

      if (metadata.data.mimeType === 'application/vnd.google-apps.document') {
        // For Google Docs (product specifications), we need to use the Docs API
        const docs = google.docs({ version: 'v1', auth: this.oauth2Client });
        
        // First, clear the document
        const doc = await docs.documents.get({ documentId: fileId });
        const endIndex = doc.data.body?.content?.[doc.data.body.content.length - 1]?.endIndex || 1;
        
        await docs.documents.batchUpdate({
          documentId: fileId,
          requestBody: {
            requests: [
              {
                deleteContentRange: {
                  range: {
                    startIndex: 1,
                    endIndex: endIndex - 1,
                  },
                },
              },
              {
                insertText: {
                  location: { index: 1 },
                  text: content,
                },
              },
            ],
          },
        });
      } else {
        // For other text files, update directly
        await drive.files.update({
          fileId,
          media: {
            mimeType: 'text/plain',
            body: content,
          },
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating file:', error);
      throw new Error('Failed to update file in Google Drive');
    }
  }

  async createProductSpecification(name: string, content: string) {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    
    try {
      const response = await drive.files.create({
        requestBody: {
          name,
          mimeType: 'application/vnd.google-apps.document',
        },
      });

      const fileId = response.data.id;
      if (fileId && content) {
        // Add content to the new document
        await this.updateFileContent(fileId, content);
      }

      return response.data;
    } catch (error) {
      console.error('Error creating document:', error);
      throw new Error('Failed to create product specification in Google Drive');
    }
  }
}

export const googleDriveService = new GoogleDriveService();
