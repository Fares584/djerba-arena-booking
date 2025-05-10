
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/sonner';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !message) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    
    // Simulate form submission
    toast.success('Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.');
    
    // In a real app, we would send this data to Supabase or via email
    console.log({ name, email, phone, subject, message });
    
    // Reset form
    setName('');
    setEmail('');
    setPhone('');
    setSubject('');
    setMessage('');
  };

  return (
    <>
      <Navbar />
      
      {/* Header */}
      <div className="bg-sport-dark text-white py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-4">Contactez-Nous</h1>
          <p className="text-xl max-w-2xl">
            Une question? Une demande spéciale? N'hésitez pas à nous contacter, nous vous répondrons dans les plus brefs délais.
          </p>
        </div>
      </div>
      
      {/* Contact Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input 
                    type="text"
                    className="w-full border rounded-md p-3"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom et prénom"
                    required
                  />
                </div>
                
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email *
                  </label>
                  <input 
                    type="email"
                    className="w-full border rounded-md p-3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input 
                    type="tel"
                    className="w-full border rounded-md p-3"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Votre numéro de téléphone"
                  />
                </div>
                
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet
                  </label>
                  <input 
                    type="text"
                    className="w-full border rounded-md p-3"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Sujet de votre message"
                  />
                </div>
                
                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea 
                    className="w-full border rounded-md p-3 h-32"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Votre message"
                    required
                  />
                </div>
                
                <div>
                  <button 
                    type="submit" 
                    className="btn-primary text-lg px-8 py-3 w-full"
                  >
                    Envoyer
                  </button>
                </div>
              </form>
            </div>
            
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Nos coordonnées</h2>
              
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {/* Map */}
                <div className="h-64 bg-sport-gray flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-gray-600 mb-2">Carte Google Maps</p>
                    <p className="text-sm text-gray-500">La carte interactive sera intégrée ici</p>
                  </div>
                </div>
                
                {/* Contact Details */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Address */}
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <svg className="w-6 h-6 text-sport-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h4 className="font-semibold text-lg">Adresse</h4>
                        <p className="text-gray-600">Route de Midoun, Djerba, Tunisie</p>
                      </div>
                    </div>
                    
                    {/* Phone */}
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <svg className="w-6 h-6 text-sport-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h4 className="font-semibold text-lg">Téléphone</h4>
                        <p className="text-gray-600">+216 12 345 678</p>
                      </div>
                    </div>
                    
                    {/* Email */}
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <svg className="w-6 h-6 text-sport-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h4 className="font-semibold text-lg">Email</h4>
                        <p className="text-gray-600">contact@planetsportsdjerba.com</p>
                      </div>
                    </div>
                    
                    {/* Hours */}
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <svg className="w-6 h-6 text-sport-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h4 className="font-semibold text-lg">Heures d'ouverture</h4>
                        <p className="text-gray-600">Lundi - Vendredi: 9h - 22h</p>
                        <p className="text-gray-600">Samedi: 9h - 23h</p>
                        <p className="text-gray-600">Dimanche: 10h - 22h</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Social Media */}
                  <div className="mt-8">
                    <h4 className="font-semibold text-lg mb-3">Suivez-nous</h4>
                    <div className="flex space-x-4">
                      <a href="#" className="bg-sport-green/10 hover:bg-sport-green/20 text-sport-green p-3 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                        </svg>
                      </a>
                      <a href="#" className="bg-sport-green/10 hover:bg-sport-green/20 text-sport-green p-3 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                        </svg>
                      </a>
                      <a href="#" className="bg-sport-green/10 hover:bg-sport-green/20 text-sport-green p-3 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                      <a href="#" className="bg-sport-green/10 hover:bg-sport-green/20 text-sport-green p-3 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Questions fréquentes</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-bold text-lg mb-2">Comment réserver un terrain?</h3>
                <p className="text-gray-600">
                  Vous pouvez réserver un terrain en ligne via notre site web, par téléphone, ou directement sur place. Le paiement se fait sur place avant votre session.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-bold text-lg mb-2">Puis-je annuler ma réservation?</h3>
                <p className="text-gray-600">
                  Oui, vous pouvez annuler votre réservation jusqu'à 24 heures avant l'heure prévue sans frais. Toute annulation tardive sera facturée à 50% du prix de la réservation.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-bold text-lg mb-2">Proposez-vous des cours de sport?</h3>
                <p className="text-gray-600">
                  Oui, nous proposons des cours de tennis et de padel pour tous les niveaux. Contactez-nous pour plus d'informations sur les horaires et les tarifs.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-bold text-lg mb-2">Peut-on louer du matériel?</h3>
                <p className="text-gray-600">
                  Oui, nous proposons à la location des raquettes de tennis et de padel, ainsi que des ballons de football. Le matériel est disponible à la réception.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Contact;
