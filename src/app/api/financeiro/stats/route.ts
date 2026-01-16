import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mes = parseInt(searchParams.get('mes') || '0');
    const ano = parseInt(searchParams.get('ano') || '0');

    // Data de início e fim do mês
    const startDate = new Date(ano, mes - 1, 1);
    const endDate = new Date(ano, mes, 0);

    // Receitas do mês (matrículas pagas)
    const receitas = await prisma.matricula.findMany({
      where: {
        dataMatricula: {
          gte: startDate,
          lte: endDate,
        },
        status: 'Pago'
      },
      include: {
        curso: true
      }
    });

    const receitaTotal = receitas.reduce((total, matricula) => {
      return total + Number(matricula.curso.valor);
    }, 0);

    // Despesas do mês (pagamentos de professores)
    const despesas = await prisma.pagamento.findMany({
      where: {
        mes: mes,
        ano: ano,
        status: 'pago'
      }
    });

    const despesasTotal = despesas.reduce((total, pagamento) => {
      return total + Number(pagamento.valor);
    }, 0);

    // Pagamentos pendentes e pagos
    const pagamentosPendentes = await prisma.pagamento.count({
      where: {
        mes: mes,
        ano: ano,
        status: 'pendente'
      }
    });

    const pagamentosPagos = await prisma.pagamento.count({
      where: {
        mes: mes,
        ano: ano,
        status: 'pago'
      }
    });

    // Total de alunos ativos
    const totalAlunos = await prisma.aluno.count({
      where: {
        status: 'ativo'
      }
    });

    // Ticket médio
    const ticketMedio = totalAlunos > 0 ? receitaTotal / totalAlunos : 0;

    // Crescimento mensal (comparar com mês anterior)
    const mesAnterior = mes === 1 ? 12 : mes - 1;
    const anoAnterior = mes === 1 ? ano - 1 : ano;
    
    const receitasAnterior = await prisma.matricula.findMany({
      where: {
        dataMatricula: {
          gte: new Date(anoAnterior, mesAnterior - 1, 1),
          lte: new Date(anoAnterior, mesAnterior, 0),
        },
        status: 'Pago'
      },
      include: {
        curso: true
      }
    });

    const receitaAnterior = receitasAnterior.reduce((total, matricula) => {
      return total + Number(matricula.curso.valor);
    }, 0);

    const crescimentoMensal = receitaAnterior > 0 
      ? ((receitaTotal - receitaAnterior) / receitaAnterior) * 100 
      : 0;

    const stats = {
      receitaTotal,
      despesasTotal,
      lucroTotal: receitaTotal - despesasTotal,
      pagamentosPendentes,
      pagamentosPagos,
      totalAlunos,
      ticketMedio,
      crescimentoMensal: parseFloat(crescimentoMensal.toFixed(2))
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}