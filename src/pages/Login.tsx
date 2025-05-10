
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/sonner';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs.');
      return;
    }
    
    // Simulate login attempt
    // In a real app, we would connect to Supabase for authentication
    toast.info('Cette fonctionnalité nécessite une intégration avec Supabase.');
    
    console.log({ email, password });
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-[80vh] flex items-center justify-center bg-sport-gray py-12">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="flex items-center justify-center mb-4">
              <span className="text-sport-green font-bold text-3xl">Planet</span>
              <span className="text-sport-dark font-bold text-3xl">Sports</span>
            </Link>
            <h1 className="text-2xl font-bold mb-2">Connexion Administrateur</h1>
            <p className="text-gray-600">
              Accédez au tableau de bord pour gérer les terrains et les réservations.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <input 
                id="email"
                type="email"
                className="w-full border rounded-md p-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input 
                id="password"
                type="password"
                className="w-full border rounded-md p-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input 
                  id="remember_me" 
                  name="remember_me" 
                  type="checkbox" 
                  className="h-4 w-4 text-sport-green border-gray-300 rounded" 
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>
              
              <div className="text-sm">
                <a href="#" className="text-sport-green hover:underline">
                  Mot de passe oublié?
                </a>
              </div>
            </div>
            
            <div>
              <button 
                type="submit" 
                className="btn-primary text-center w-full"
              >
                Se connecter
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              Cette interface est réservée aux administrateurs. Pour réserver un terrain, veuillez utiliser la <Link to="/reservation" className="text-sport-green hover:underline">page de réservation</Link>.
            </p>
          </div>
          
          <div className="mt-8 py-4 border-t text-center text-sm">
            <div className="flex justify-center space-x-6">
              <Link to="/" className="text-gray-600 hover:text-sport-green">
                Accueil
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-sport-green">
                Contact
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-sport-green">
                À Propos
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Login;
