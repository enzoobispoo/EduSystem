import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mes = parseInt(searchParams.get('mes') || '0');
    const ano = parseInt(searchParams.get('ano') || '0');

    const pagamentos = await prisma.pagamento.findMany({
      where: {
        mes: mes,
        ano: ano
      },
      include: {
        professor: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const pagamentosFormatted = pagamentos.map(pagamento => ({
      id: pagamento.id,
      professorId: pagamento.professorId,
      professorNome: pagamento.professor.nome,
      valor: Number(pagamento.valor),
      mes: pagamento.mes,
      ano: pagamento.ano,
      horasTrabalhadas: pagamento.horasTrabalhadas,
      alunosAtendidos: pagamento.alunosAtendidos,
      status: pagamento.status,
      createdAt: pagamento.createdAt.toISOString(),
      tipoPagamento: pagamento.professor.tipoPagamento
    }));

    return NextResponse.json(pagamentosFormatted);
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}