import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileDown, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export const downloadManualPDF = () => {
  // Open the PDF in a new tab for download
  const link = document.createElement('a');
  link.href = '/docs/Manual_Avanca_GHAS.pdf';
  link.download = 'Manual_Avanca_GHAS.pdf';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success('Manual baixado com sucesso!');
};

export const ManualDownloadCard = () => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Manual do Usuário
        </CardTitle>
        <CardDescription>
          Baixe o manual completo do sistema em PDF
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={downloadManualPDF} className="w-full">
          <FileDown className="h-4 w-4 mr-2" />
          Baixar Manual em PDF
        </Button>
      </CardContent>
    </Card>
  );
};
