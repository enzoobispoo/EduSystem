// src/lib/notifications.ts

interface NotificationData {
    titulo: string;
    mensagem: string;
    tipo: 'aluno' | 'professor' | 'curso' | 'pagamento' | 'sistema';
    icone?: string;
    cor?: string;
    url?: string;
  }
  
  export const createNotification = async (data: NotificationData) => {
    try {
      const response = await fetch('/api/notificacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao criar notificação');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
    }
  };
  
  // Templates de notificações pré-definidos
  export const NotificationTemplates = {
    // Alunos
    novoAluno: (nomeAluno: string) => ({
      titulo: 'Novo Aluno Cadastrado',
      mensagem: `${nomeAluno} foi cadastrado no sistema`,
      tipo: 'aluno' as const,
      icone: 'user-plus',
      cor: 'green',
      url: '/alunos'
    }),
  
    alunoMatriculado: (nomeAluno: string, nomeCurso: string) => ({
      titulo: 'Nova Matrícula',
      mensagem: `${nomeAluno} se matriculou em ${nomeCurso}`,
      tipo: 'aluno' as const,
      icone: 'book-open',
      cor: 'blue',
      url: '/alunos'
    }),
  
    // Professores
    novoProfessor: (nomeProfessor: string) => ({
      titulo: 'Novo Professor Cadastrado',
      mensagem: `${nomeProfessor} foi adicionado à equipe`,
      tipo: 'professor' as const,
      icone: 'user-check',
      cor: 'purple',
      url: '/professores'
    }),
  
    // Cursos
    novoCurso: (nomeCurso: string) => ({
      titulo: 'Novo Curso Criado',
      mensagem: `O curso "${nomeCurso}" foi adicionado ao catálogo`,
      tipo: 'curso' as const,
      icone: 'book',
      cor: 'yellow',
      url: '/cursos'
    }),
  
    cursoIniciando: (nomeCurso: string, dias: number) => ({
      titulo: 'Curso Iniciando',
      mensagem: `O curso "${nomeCurso}" começa em ${dias} dias`,
      tipo: 'curso' as const,
      icone: 'calendar',
      cor: 'orange',
      url: '/cursos'
    }),
  
    // Pagamentos
    pagamentoRecebido: (valor: number, origem: string) => ({
      titulo: 'Pagamento Recebido',
      mensagem: `Recebido R$ ${valor.toFixed(2)} de ${origem}`,
      tipo: 'pagamento' as const,
      icone: 'dollar-sign',
      cor: 'green',
      url: '/financeiro'
    }),
  
    pagamentoPendente: (nomeAluno: string, nomeCurso: string) => ({
      titulo: 'Pagamento Pendente',
      mensagem: `${nomeAluno} tem pagamento pendente em ${nomeCurso}`,
      tipo: 'pagamento' as const,
      icone: 'alert-circle',
      cor: 'red',
      url: '/financeiro'
    }),
  
    // Sistema
    sistemaAtualizado: (versao: string) => ({
      titulo: 'Sistema Atualizado',
      mensagem: `EduSystem atualizado para versão ${versao}`,
      tipo: 'sistema' as const,
      icone: 'check-circle',
      cor: 'blue'
    }),
  
    backupRealizado: () => ({
      titulo: 'Backup Realizado',
      mensagem: 'Backup automático dos dados realizado com sucesso',
      tipo: 'sistema' as const,
      icone: 'database',
      cor: 'green'
    })
  };
  
  // Hook para usar notificações em componentes React
  export const useNotifications = () => {
    const notify = async (template: NotificationData) => {
      return await createNotification(template);
    };
  
    return { notify, templates: NotificationTemplates };
  };