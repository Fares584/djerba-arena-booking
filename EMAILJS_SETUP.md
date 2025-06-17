
# Configuration EmailJS

Pour configurer EmailJS et envoyer des emails de confirmation :

## 1. Créer un compte EmailJS
1. Allez sur https://www.emailjs.com/
2. Créez un compte gratuit
3. Connectez-vous à votre tableau de bord

## 2. Configurer un service email
1. Dans le tableau de bord, allez dans "Email Services"
2. Cliquez sur "Add New Service"
3. Choisissez votre fournisseur (Gmail, Outlook, Yahoo, etc.)
4. Suivez les instructions pour connecter votre compte email
5. Notez le **Service ID** généré

## 3. Créer un template d'email
1. Allez dans "Email Templates"
2. Cliquez sur "Create New Template"
3. Utilisez ce template HTML :

```html
Bonjour {{client_name}},

Merci pour votre demande de réservation !

Détails de votre réservation :
- Terrain : {{terrain_name}}
- Date : {{date}}
- Heure : {{heure}}
- Durée : {{duree}}h

Pour confirmer votre réservation, cliquez sur ce lien :
{{confirmation_link}}

⚠️ Attention : Ce lien expire dans 15 minutes !

Sport Center - Votre centre sportif de confiance
```

4. Configurez les paramètres :
   - To Email: {{to_email}}
   - Subject: {{subject}}
5. Notez le **Template ID** généré

## 4. Obtenir la clé publique
1. Allez dans "Account" > "General"
2. Notez votre **Public Key**

## 5. Mettre à jour le code
1. Ouvrez le fichier `src/hooks/useEmailJS.ts`
2. Remplacez :
   - `YOUR_SERVICE_ID` par votre Service ID
   - `YOUR_TEMPLATE_ID` par votre Template ID  
   - `YOUR_PUBLIC_KEY` par votre Public Key

## 6. Tester
1. Créez une réservation de test
2. Vérifiez que l'email de confirmation est bien reçu
3. Testez le lien de confirmation

## Limites du plan gratuit
- 200 emails/mois
- Branding EmailJS dans les emails
- Support communautaire

Pour plus d'emails ou retirer le branding, consultez les plans payants d'EmailJS.
