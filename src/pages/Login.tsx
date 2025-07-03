
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const Login = () => {
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
    
    if (!password) {
      toast.error('Veuillez saisir le mot de passe.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Utiliser un email fixe pour l'administrateur
      const adminEmail = 'admin@planetsports.com';
      await signIn(adminEmail, password);
      toast.success('Connexion réussie');
      navigate('/admin');
    } catch (error: any) {
      console.error('Auth error:', error);
      
      if (error.message?.includes('Invalid login credentials')) {
        toast.error('Mot de passe incorrect.');
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error('Veuillez confirmer votre email avant de vous connecter.');
      } else {
        toast.error(error.message || 'Échec de la connexion. Vérifiez votre mot de passe.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sport-gray px-4 py-8 sm:py-12">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="flex items-center justify-center mb-4">
            <span className="text-sport-green font-bold text-2xl sm:text-3xl">Planet</span>
            <span className="text-sport-dark font-bold text-2xl sm:text-3xl">Sports</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold mb-2">
            Connexion Administrateur
          </h1>
          <p className="text-gray-600 text-sm sm:text-base px-2">
            Saisissez le mot de passe pour accéder au tableau de bord.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe administrateur
            </label>
            <Input 
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className="btn-primary text-center w-full h-12"
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
      </div>
    </div>
  );
};

export default Login;
