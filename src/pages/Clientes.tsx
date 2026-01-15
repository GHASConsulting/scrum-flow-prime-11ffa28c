import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const Clientes = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Clientes</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cadastro de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Gerencie os clientes cadastrados no sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Clientes;
