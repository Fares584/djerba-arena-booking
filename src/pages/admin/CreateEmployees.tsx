
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRequireRole } from '@/hooks/useRequireRole';
import { supabase } from '@/integrations/supabase/client';

const CreateEmployees = () => {
  const { role, loading } = useRequireRole(['admin']);
  const [isCreating, setIsCreating] = useState(false);
  const [employeeAccounts, setEmployeeAccounts] = useState<any[]>([]);

  const createEmployeeAccounts = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-employee-accounts');
      
      if (error) {
        throw error;
      }

      setEmployeeAccounts(data.results);
      toast.success('Comptes employés créés avec succès!');
    } catch (error: any) {
      console.error('Error creating employee accounts:', error);
      toast.error('Erreur lors de la création des comptes: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  if (role !== 'admin') {
    return <div className="flex items-center justify-center h-64">Accès non autorisé</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Création des Comptes Employés</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Créer les Comptes Employés</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Cliquez sur le bouton ci-dessous pour créer automatiquement les comptes des employés avec accès limité au planning.
          </p>
          <Button 
            onClick={createEmployeeAccounts} 
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? 'Création en cours...' : 'Créer les Comptes Employés'}
          </Button>
        </CardContent>
      </Card>

      {employeeAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comptes Créés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employeeAccounts.map((account, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Email:</strong> {account.email}
                    </div>
                    <div>
                      <strong>Mot de passe:</strong> {account.password}
                    </div>
                    <div className="col-span-2">
                      <strong>Statut:</strong> 
                      {account.user_created ? (
                        <span className="text-green-600 ml-2">✓ Utilisateur créé</span>
                      ) : (
                        <span className="text-red-600 ml-2">✗ Erreur: {account.error}</span>
                      )}
                      {account.role_assigned && (
                        <span className="text-green-600 ml-2">✓ Rôle assigné</span>
                      )}
                      {account.role_error && (
                        <span className="text-red-600 ml-2">✗ Erreur rôle: {account.role_error}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreateEmployees;
