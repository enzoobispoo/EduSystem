import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Listar todos os professores
export async function GET() {
  try {
    const professores = await prisma.professor.findMany({
      include: {
        cursos: {
          include: {
            curso: true
          }
        },
        pagamentos: {
          where: {
            mes: new Date().getMonth() + 1,
            ano: new Date().getFullYear()
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });
    
    return NextResponse.json(professores);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar professores' },
      { status: 500 }
    );
  }
}



// POST - Criar novo professor
// POST - Criar novo professor
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const professor = await prisma.professor.create({
      data: {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        cpf: data.cpf,
        valorHora: data.valorHora ? parseFloat(data.valorHora) : null,
        valorAluno: data.valorAluno ? parseFloat(data.valorAluno) : null,
        tipoPagamento: data.tipoPagamento || "Por Aluno"
      }
    });

    // Criar pagamento pendente automaticamente para o mês atual
    const agora = new Date();
    const mesAtual = agora.getMonth() + 1;
    const anoAtual = agora.getFullYear();

    // Calcular valor inicial baseado no tipo de pagamento
    let valor = 0;
    let horasTrabalhadas = null;
    let alunosAtendidos = null;

    if (professor.tipoPagamento === 'Por Hora' && professor.valorHora) {
      horasTrabalhadas = 40; // 40h padrão
      valor = horasTrabalhadas * Number(professor.valorHora);
    } else if (professor.tipoPagamento === 'Por Aluno' && professor.valorAluno) {
      // Para "Por Aluno", inicia com 0 até ter alunos matriculados
      alunosAtendidos = 0;
      valor = 0;
    }

    // Criar pagamento pendente se houver valor ou for do tipo "Por Aluno"
    if (valor > 0 || professor.tipoPagamento === 'Por Aluno') {
      await prisma.pagamento.create({
        data: {
          professorId: professor.id,
          valor: valor,
          mes: mesAtual,
          ano: anoAtual,
          horasTrabalhadas: horasTrabalhadas,
          alunosAtendidos: alunosAtendidos,
          status: 'pendente'
        }
      });

      // Criar notificação
      await prisma.notificacao.create({
        data: {
          titulo: 'Professor Cadastrado',
          mensagem: `Professor ${professor.nome} foi cadastrado com pagamento pendente`,
          tipo: 'financeiro'
        }
      });
    }
    
    return NextResponse.json(professor);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar professor' },
      { status: 500 }
    );
  }
}


