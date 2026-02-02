import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, LayoutGrid, Building2, FolderOpen, ListTodo } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export type CadastroType = 
  | 'area-sprint' 
  | 'tipo-sprint' 
  | 'tipo-documento-cliente' 
  | 'prestador-servico' 
  | 'clientes' 
  | 'setor' 
  | 'tipo-documento'
  | 'pessoas';

interface CadastrosSidebarProps {
  selectedCadastro: CadastroType | null;
  onSelectCadastro: (cadastro: CadastroType) => void;
}

interface MenuGroup {
  id: string;
  name: string;
  icon: React.ElementType;
  items: {
    id: CadastroType;
    name: string;
  }[];
}

const menuGroups: MenuGroup[] = [
  {
    id: 'pmo-cet',
    name: 'PMO/CET',
    icon: ListTodo,
    items: [
      { id: 'area-sprint', name: 'Área Sprint' },
      { id: 'tipo-sprint', name: 'Tipo Sprint' },
    ],
  },
  {
    id: 'cliente',
    name: 'CLIENTE',
    icon: Building2,
    items: [
      { id: 'tipo-documento-cliente', name: 'Tipo de Documento Cliente' },
    ],
  },
  {
    id: 'ghas',
    name: 'GHAS',
    icon: FolderOpen,
    items: [
      { id: 'pessoas', name: 'Pessoas' },
      { id: 'prestador-servico', name: 'Prestador de Serviço' },
      { id: 'clientes', name: 'Clientes' },
      { id: 'setor', name: 'Setor' },
      { id: 'tipo-documento', name: 'Tipo de Documento' },
    ],
  },
];

export const CadastrosSidebar = ({ selectedCadastro, onSelectCadastro }: CadastrosSidebarProps) => {
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const isGroupOpen = (groupId: string) => openGroups.includes(groupId);

  const getGroupForCadastro = (cadastro: CadastroType): string | undefined => {
    return menuGroups.find(g => g.items.some(i => i.id === cadastro))?.id;
  };

  return (
    <div className="w-64 border-r bg-card h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Cadastros Gerais</h3>
        </div>
      </div>
      
      <nav className="p-2 space-y-1">
        {menuGroups.map((group) => {
          const Icon = group.icon;
          const isOpen = isGroupOpen(group.id);
          const hasSelectedItem = group.items.some(item => item.id === selectedCadastro);

          return (
            <Collapsible 
              key={group.id} 
              open={isOpen}
              onOpenChange={() => toggleGroup(group.id)}
            >
              <CollapsibleTrigger className="w-full">
                <div
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    "hover:bg-muted",
                    hasSelectedItem && "bg-primary/10 text-primary"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>Cadastros Gerais - {group.name}</span>
                  </div>
                  <ChevronRight 
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isOpen && "rotate-90"
                    )}
                  />
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-1">
                <div className="ml-4 pl-4 border-l space-y-1">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSelectCadastro(item.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                        "hover:bg-muted",
                        selectedCadastro === item.id && "bg-primary text-primary-foreground font-medium"
                      )}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>
    </div>
  );
};
