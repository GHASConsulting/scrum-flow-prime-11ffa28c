import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

const SharepointTreinamentos = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Treinamentos</h2>
          <p className="text-muted-foreground mt-1">Materiais de treinamento da GHAS</p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Construction className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground">Em Desenvolvimento</h3>
            <p className="text-muted-foreground mt-2 text-center max-w-md">
              Esta funcionalidade está em desenvolvimento e estará disponível em breve.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SharepointTreinamentos;
