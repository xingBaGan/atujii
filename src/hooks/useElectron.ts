import { useCallback } from 'react';

export const useElectron = () => {
  const openInEditor = useCallback(async (filePath: string) => {
    try {
      const result = await window.electron.openInEditor(filePath);
      if (!result.success) {
        console.error('Failed to open in Photoshop:', result.error);
      }
    } catch (error) {
      console.error('Error opening file in Photoshop:', error);
    }
  }, []);


  const showInFolder = useCallback(async (filePath: string) => {
    try {
      const result = await window.electron.showInFolder(filePath);
      if (!result.success) {
        console.error('Failed to show in folder:', result.error);
      }
    } catch (error) {
      console.error('Error showing file in folder:', error);
    }
  }, []);

  return {
    openInEditor,
    showInFolder
  };
}; 