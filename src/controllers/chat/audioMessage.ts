import path from 'path';
import fs from 'fs';

export const saveAudioFile = (audioBlob: string | NodeJS.ArrayBufferView, callback: (arg0: { success: boolean; message: string; filename?: string; }) => void) => {
  const filename = `audio-${Date.now()}.wav`;
  const filePath = path.join(__dirname, 'uploads', filename);

  // Write the audio blob to a file
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

module.exports = saveAudioFile;
