import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, FileText, Copy, Check, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface ClientStatus {
  id: string;
  nome: string;
  responsavel: string;
  geral: string;
  metodologia: string;
  prioridades: string;
  produtividade: string;
  riscos: string;
}

interface ClientAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientes: ClientStatus[];
  periodo?: {
    inicio: string;
    fim: string;
  };
}

export const ClientAnalysisDialog = ({
  open,
  onOpenChange,
  clientes,
  periodo,
}: ClientAnalysisDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [copied, setCopied] = useState(false);
  const analysisRef = useRef<HTMLDivElement>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setAnalysis('');
      setIsLoading(true);
      generateAnalysis();
    }
  }, [open]);

  const generateAnalysis = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-clients`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            clientes: clientes.map(c => ({
              id: c.id,
              nome: c.nome,
              responsavel: c.responsavel,
              geral: c.geral,
              metodologia: c.metodologia,
              prioridades: c.prioridades,
              produtividade: c.produtividade,
              riscos: c.riscos,
            })),
            periodo,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar análise');
      }

      if (!response.body) {
        throw new Error('Resposta sem corpo');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullAnalysis = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullAnalysis += content;
              setAnalysis(fullAnalysis);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullAnalysis += content;
              setAnalysis(fullAnalysis);
            }
          } catch { /* ignore */ }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar análise');
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(analysis);
      setCopied(true);
      toast.success('Análise copiada para a área de transferência');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let yPosition = margin;

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo Executivo - Análise de Clientes', margin, yPosition);
      yPosition += 15;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const lines = analysis.split('\n');
      
      for (const line of lines) {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        // Headers
        if (line.startsWith('### ')) {
          yPosition += 5;
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          const text = line.slice(4).replace(/\*\*/g, '');
          doc.text(text, margin, yPosition);
          yPosition += 8;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
        } else if (line.startsWith('## ')) {
          yPosition += 5;
          doc.setFontSize(13);
          doc.setFont('helvetica', 'bold');
          const text = line.slice(3).replace(/\*\*/g, '');
          doc.text(text, margin, yPosition);
          yPosition += 10;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
        } else if (line.startsWith('# ')) {
          yPosition += 5;
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          const text = line.slice(2).replace(/\*\*/g, '');
          doc.text(text, margin, yPosition);
          yPosition += 10;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
        } else if (line.match(/^[-*•]\s/) || line.match(/^\d+\.\s/)) {
          // List items
          const content = line.replace(/^[-*•]\s/, '• ').replace(/^\d+\.\s/, '').replace(/\*\*/g, '');
          const splitLines = doc.splitTextToSize(content, maxWidth - 10);
          for (const splitLine of splitLines) {
            if (yPosition > pageHeight - margin) {
              doc.addPage();
              yPosition = margin;
            }
            doc.text(splitLine, margin + 5, yPosition);
            yPosition += 5;
          }
        } else if (line.trim()) {
          // Regular text
          const cleanText = line.replace(/\*\*/g, '');
          const splitLines = doc.splitTextToSize(cleanText, maxWidth);
          for (const splitLine of splitLines) {
            if (yPosition > pageHeight - margin) {
              doc.addPage();
              yPosition = margin;
            }
            doc.text(splitLine, margin, yPosition);
            yPosition += 5;
          }
        } else {
          yPosition += 3;
        }
      }

      const today = new Date().toISOString().split('T')[0];
      doc.save(`Resumo_Executivo_${today}.pdf`);
      toast.success('PDF exportado com sucesso');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  // Parse markdown-like content to styled elements
  const renderAnalysis = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let inList = false;
    let listItems: JSX.Element[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc pl-6 space-y-1 my-2">
            {listItems}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    lines.forEach((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={index} className="text-lg font-bold text-foreground mt-6 mb-3 border-b pb-2">
            {line.slice(4).replace(/\*\*/g, '')}
          </h3>
        );
        return;
      }
      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={index} className="text-xl font-bold text-foreground mt-6 mb-3">
            {line.slice(3).replace(/\*\*/g, '')}
          </h2>
        );
        return;
      }
      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={index} className="text-2xl font-bold text-foreground mt-4 mb-4">
            {line.slice(2).replace(/\*\*/g, '')}
          </h1>
        );
        return;
      }

      // List items
      if (line.match(/^[-*•]\s/) || line.match(/^\d+\.\s/)) {
        inList = true;
        const content = line.replace(/^[-*•]\s/, '').replace(/^\d+\.\s/, '');
        listItems.push(
          <li key={index} className="text-sm text-muted-foreground">
            {renderInlineFormatting(content)}
          </li>
        );
        return;
      }

      // Horizontal rule
      if (line.match(/^---+$/)) {
        flushList();
        elements.push(<hr key={index} className="my-4 border-border" />);
        return;
      }

      // Regular paragraph
      if (line.trim()) {
        flushList();
        elements.push(
          <p key={index} className="text-sm text-muted-foreground mb-2">
            {renderInlineFormatting(line)}
          </p>
        );
      } else {
        flushList();
      }
    });

    flushList();
    return elements;
  };

  const renderInlineFormatting = (text: string): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = [];
    let remaining = text;
    let keyCounter = 0;

    // Bold text
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(
        <strong key={keyCounter++} className="font-semibold text-foreground">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5" />
              Resumo Executivo - Análise de Clientes
            </DialogTitle>
            {analysis && !isLoading && (
              <div className="flex gap-2 mr-8">
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <FileDown className="h-4 w-4 mr-1" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 pr-4">
          <div ref={analysisRef} className="pb-4">
            {isLoading && !analysis && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Analisando indicadores dos clientes...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Isso pode levar alguns segundos
                </p>
              </div>
            )}

            {analysis && (
              <div className="space-y-1">
                {renderAnalysis(analysis)}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground mt-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Gerando análise...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
