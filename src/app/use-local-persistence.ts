import { useEffect, useRef, useState } from 'react';
import type { AppData } from '../data';
import { saveLocalData } from '../local-data';
import { readProfile } from '../profile';
import { profileSaveMessage } from '../save-feedback';
import type { Notify } from './use-toasts';

export function useLocalPersistence(data: AppData, initialData: AppData, setToast: Notify) {
  const [savedData, setSavedData] = useState(initialData);
  const [saveFailed, setSaveFailed] = useState(false);
  const savedProfile = useRef(readProfile(initialData.profile));
  useEffect(() => {
    setSaveFailed(false);
    let active = true;
    // Start immediately so photos and edits do not depend on an unload callback.
    void saveLocalData(data).then(() => {
      if (!active) return;
      setSavedData(data);
      const currentProfile = readProfile(data.profile);
      const message = profileSaveMessage(currentProfile, savedProfile.current);
      savedProfile.current = currentProfile;
      if (message) setToast(message);
    }).catch(() => {
      if (!active) return;
      setSaveFailed(true);
      setToast('Não foi possível salvar as alterações neste navegador. Tente novamente.', 'error');
    });
    return () => { active = false; };
  }, [data, setToast]);
  return { savedData, saveFailed };
}
