
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/sonner';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      console.log('User already logged in, redirecting to admin');
      navigate('/admin');
    }
  }, [user, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      toast.success('Connexion réussie');
      navigate('/admin');
    } catch (error: any) {
      console.error('Auth error:', error);
      
      if (error.message?.includes('Invalid login credentials')) {
        toast.error('Email ou mot de passe incorrect.');
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error('Veuillez confirmer votre email avant de vous connecter.');
      } else {
        toast.error(error.message || 'Échec de la connexion. Vérifiez vos identifiants.');
      }
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-2xl font-bold mb-2">
              Connexion Administrateur
            </h1>
            <p className="text-gray-600">
              Accédez au tableau de bord pour gérer les terrains et les réservations.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <Input 
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <Input 
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Button 
                type="submit" 
                className="btn-primary text-center w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </div>
          </form>
          
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
