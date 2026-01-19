import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileDown, BookOpen } from 'lucide-react';
import jsPDF from 'jspdf';
import { manualSections } from '@/lib/manualContent';
import { toast } from 'sonner';

export const downloadManualPDF = () => {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageHeight = 280;
  const marginLeft = 20;
  const marginRight = 190;
  const lineHeight = 6;

  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  manualSections.forEach((section, index) => {
    // Add section title
    if (section.level === 0) {
      addNewPageIfNeeded(30);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(section.title, marginLeft, yPosition);
      yPosition += 15;
    } else if (section.level === 1) {
      addNewPageIfNeeded(20);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(section.title, marginLeft, yPosition);
      yPosition += 10;
    }

    // Add section content
    if (section.content) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const lines = doc.splitTextToSize(section.content, marginRight - marginLeft);
      
      lines.forEach((line: string) => {
        addNewPageIfNeeded(lineHeight);
        doc.text(line, marginLeft, yPosition);
        yPosition += lineHeight;
      });
      
      yPosition += 8; // Space after section
    }
  });

  // Save the PDF
  doc.save('Manual_Usuario_GHAS.pdf');
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
