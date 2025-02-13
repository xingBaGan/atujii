import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ImportStatus } from '../types';
import { useLocale } from '../contexts/LanguageContext';

interface DragOverlayProps {
  isDragging: boolean;
  importState: ImportStatus;
}

const DragOverlay: React.FC<DragOverlayProps> = ({ isDragging, importState }) => {
  const { t } = useLocale();

  if (!isDragging && importState === ImportStatus.Imported) return null;
  const isImporting = importState === ImportStatus.Importing || importState === ImportStatus.Tagging;
  
  return (
    <div className="flex fixed inset-0 z-10 justify-center items-center w-full h-full bg-black bg-opacity-30 backdrop-blur-sm">
      { isImporting ? <Loader2 className="mr-2 text-white animate-spin" size={24} /> : <div className="w-4 h-4 bg-white rounded-full animate-ping"></div>}
      {importState === ImportStatus.Tagging ? 
        <span className="text-lg text-white">{t('tagging')}</span> : 
        importState === ImportStatus.Importing ?
          <span className="text-lg text-white">{t('importing')}</span> : 
          <span className="text-lg text-white">{t('releaseToUpload')}</span>
      }
    </div>
  );
};

export default DragOverlay; 