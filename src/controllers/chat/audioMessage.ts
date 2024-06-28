import * as path from 'path';
import * as fs from 'fs';

export const saveAudioFile = (audioBlob: Buffer, callback: (result: { success: boolean; message: string; filename?: string }) => void) => {
  const uploadsDir = path.join(__dirname, 'uploads');
  const filename = `audio-${Date.now()}.wav`;
  const filePath = path.join(uploadsDir, filename);

  // Ensure the uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory at ${uploadsDir}`);
  }

  console.log(`Saving audio file to: ${filePath}`);

  fs.writeFile(filePath, audioBlob, (err) => {
    if (err) {
      console.error('Error saving audio file:', err);
      callback({ success: false, message: 'Error saving audio file' });
    } else {
      console.log('Audio file saved:', filename);
      callback({ success: true, message: 'Audio uploaded successfully', filename });
    }
  });
};
