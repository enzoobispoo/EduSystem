import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Função helper para criar notificação (opcional)
const createNotification = async (data: any) => {
  try {
  //  await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notificacoes`, {
   //   method: 'POST',
    //  headers: { 'Content-Type': 'application/json' },
   //   body: JSON.stringify(data)
   // });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    // Não quebra o fluxo se a notificação falhar
  }
};

// GET - Listar todos os alunos
export async function GET() {
  try {
    const alunos = await prisma.aluno.findMany({
      include: {
        matriculas: {
          include: {
            curso: true
          }
        }
      }
    });
    
    return NextResponse.json(alunos);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar alunos' },
      { status: 500 }
    );
  }
}

// POST - Criar novo aluno
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Verificar se já existe um aluno com este email
    const alunoExistente = await prisma.aluno.findUnique({
      where: { email: data.email }
    });
    
    if (alunoExistente) {
      return NextResponse.json(
        { error: 'Já existe um aluno cadastrado com este email' },
        { status: 400 }
      );
    }
    
    // Verificar se já existe um aluno com este CPF
    const cpfExistente = await prisma.aluno.findUnique({
      where: { cpf: data.cpf }
    });
    
    if (cpfExistente) {
      return NextResponse.json(
        { error: 'Já existe um aluno cadastrado com este CPF' },
        { status: 400 }
      );
    }
    
    // Criar o aluno
    const aluno = await prisma.aluno.create({
      data: {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        cpf: data.cpf
      }
    });
    
    // Se há cursos selecionados, criar as matrículas
    if (data.cursos && data.cursos.length > 0) {
      const matriculas = data.cursos.map((cursoId: string) => ({
        alunoId: aluno.id,
        cursoId: cursoId,
        status: data.statusPagamento || 'Pendente'
      }));
      
      await prisma.matricula.createMany({
        data: matriculas
      });

      // Criar notificações para cada matrícula (opcional)
      for (const cursoId of data.cursos) {
        try {
          const curso = await prisma.curso.findUnique({ where: { id: cursoId } });
          if (curso) {
            await createNotification({
              titulo: 'Nova Matrícula',
              mensagem: `${aluno.nome} se matriculou em ${curso.nome}`,
              tipo: 'aluno',
              icone: 'book-open',
              cor: 'blue',
              url: '/alunos'
            });
          }
        } catch (error) {
          console.error('Erro ao criar notificação de matrícula:', error);
        }
      }
    }
    
    // Criar notificação de novo aluno (opcional)
    await createNotification({
      titulo: 'Novo Aluno Cadastrado',
      mensagem: `${aluno.nome} foi cadastrado no sistema`,
      tipo: 'aluno',
      icone: 'user-plus',
      cor: 'green',
      url: '/alunos'
    });
    
    return NextResponse.json(aluno);
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
}
}