import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'America/Sao_Paulo';

export const formatDateTime = (dateString: string): string => {
  const date = parseISO(dateString);
  const zonedDate = toZonedTime(date, TIMEZONE);
  return format(zonedDate, 'dd/MM/yyyy HH:mm');
};

export const formatDate = (dateString: string): string => {
  // Extrair apenas a parte da data (yyyy-MM-dd) ignorando hora e timezone
  // Isso evita problemas de conversão de timezone que mudam o dia
  const datePart = dateString.split('T')[0].split(' ')[0];
  // Parsear com T12:00:00 para garantir que a data não mude com timezone
  const date = parseISO(`${datePart}T12:00:00`);
  return format(date, 'dd/MM/yyyy');
};

export const statusLabels: Record<string, string> = {
  todo: 'Fazer',
  doing: 'Fazendo',
  done: 'Feito',
  validated: 'Validado'
};

export const prioridadeLabels: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta'
};
