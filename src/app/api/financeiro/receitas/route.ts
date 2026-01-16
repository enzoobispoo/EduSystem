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

    const matriculas = await prisma.matricula.findMany({
      where: {
        dataMatricula: {
          gte: startDate,
          lte: endDate,
        }
      },
      include: {
        aluno: true,
        curso: true
      },
      orderBy: {
        dataMatricula: 'desc'
      }
    });

    const matriculasFormatted = matriculas.map(matricula => ({
      id: matricula.id,
      alunoNome: matricula.aluno.nome,
      cursoNome: matricula.curso.nome,
      cursoValor: Number(matricula.curso.valor),
      status: matricula.status,
      dataMatricula: matricula.dataMatricula.toISOString(),
      dataPagamento: matricula.status === 'Pago' ? matricula.updatedAt.toISOString() : null
    }));

    return NextResponse.json(matriculasFormatted);
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}