// Fonction pour normaliser un numéro tunisien vers 8 chiffres
export const normalizeTunisianPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Enlever tous les espaces et caractères non numériques sauf le +
  let cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  // Si le numéro commence par +216, enlever +216
  if (cleanPhone.startsWith('+216')) {
    cleanPhone = cleanPhone.substring(4);
  }
  // Si le numéro commence par 216, enlever 216
  else if (cleanPhone.startsWith('216')) {
    cleanPhone = cleanPhone.substring(3);
  }
  
  // Retourner seulement les 8 chiffres
  return cleanPhone.length >= 8 ? cleanPhone.substring(0, 8) : cleanPhone;
};

// Validation du nom - seulement des lettres et espaces, max 40 caractères
export const validateName = (name: string): string | null => {
  if (!name.trim()) {
    return "Le nom est requis";
  }
  
  if (name.length > 40) {
    return "Le nom ne peut pas dépasser 40 caractères";
  }
  
  const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
  if (!nameRegex.test(name)) {
    return "Le nom ne peut contenir que des lettres et des espaces";
  }
  
  return null;
};

// Validation du téléphone tunisien - 8 chiffres
export const validateTunisianPhone = (phone: string): string | null => {
  if (!phone.trim()) {
    return "Le numéro de téléphone est requis";
  }
  
  // Enlever tous les espaces et caractères non numériques sauf le +
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  // Formats acceptés: 12345678, +21612345678, 21612345678
  const tunisianPhoneRegex = /^(\+216|216)?[2-9]\d{7}$/;
  
  if (!tunisianPhoneRegex.test(cleanPhone)) {
    return "Veuillez entrer un numéro de téléphone tunisien valide (8 chiffres)";
  }
  
  return null;
};

// Validation de l'email
export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return "L'adresse email est requise";
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Veuillez entrer une adresse email valide";
  }
  
  return null;
};
