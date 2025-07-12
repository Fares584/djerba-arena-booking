
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PendingItem {
  id: string;
  type: 'reservation' | 'abonnement';
  data: any;
  timestamp: number;
  action: 'create' | 'update' | 'delete';
}

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);

  useEffect(() => {
    // Écouter les changements de connexion
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingItems();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Charger les éléments en attente au démarrage
    loadPendingItems();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPendingItems = () => {
    try {
      const stored = localStorage.getItem('pendingSync');
      if (stored) {
        setPendingItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données en attente:', error);
    }
  };

  const savePendingItems = (items: PendingItem[]) => {
    try {
      localStorage.setItem('pendingSync', JSON.stringify(items));
      setPendingItems(items);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde locale:', error);
    }
  };

  const addPendingItem = (type: 'reservation' | 'abonnement', data: any, action: 'create' | 'update' | 'delete') => {
    const newItem: PendingItem = {
      id: crypto.randomUUID(),
      type,
      data,
      action,
      timestamp: Date.now()
    };

    const updatedItems = [...pendingItems, newItem];
    savePendingItems(updatedItems);

    // Si en ligne, essayer de synchroniser immédiatement
    if (isOnline) {
      syncPendingItems();
    }
  };

  const syncPendingItems = async () => {
    if (!isOnline || pendingItems.length === 0) return;

    const itemsToSync = [...pendingItems];
    const syncedIds: string[] = [];

    for (const item of itemsToSync) {
      try {
        await syncItemToSupabase(item);
        syncedIds.push(item.id);
      } catch (error) {
        console.error('Erreur de synchronisation pour l\'élément:', item.id, error);
        // On continue avec les autres éléments
      }
    }

    // Supprimer les éléments synchronisés avec succès
    if (syncedIds.length > 0) {
      const remainingItems = pendingItems.filter(item => !syncedIds.includes(item.id));
      savePendingItems(remainingItems);
    }
  };

  const syncItemToSupabase = async (item: PendingItem) => {
    switch (item.type) {
      case 'reservation':
        return await syncReservation(item);
      case 'abonnement':
        return await syncAbonnement(item);
      default:
        throw new Error(`Type non supporté: ${item.type}`);
    }
  };

  const syncReservation = async (item: PendingItem) => {
    const { data, error } = await supabase
      .from('reservations')
      .insert(item.data);
    
    if (error) throw error;
    return data;
  };

  const syncAbonnement = async (item: PendingItem) => {
    const { data, error } = await supabase
      .from('abonnements')
      .insert(item.data);
    
    if (error) throw error;
    return data;
  };

  // Stockage local des données pour consultation hors ligne
  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde locale:', error);
    }
  };

  const getFromLocalStorage = (key: string) => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.data;
      }
    } catch (error) {
      console.error('Erreur lors de la lecture locale:', error);
    }
    return null;
  };

  return {
    isOnline,
    pendingItems,
    addPendingItem,
    syncPendingItems,
    saveToLocalStorage,
    getFromLocalStorage
  };
}
