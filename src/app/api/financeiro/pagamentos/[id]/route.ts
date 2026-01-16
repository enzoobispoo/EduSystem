import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const { id } = params;

    const pagamento = await prisma.pagamento.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        professor: true
      }
    });

    return NextResponse.json(pagamento);
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}