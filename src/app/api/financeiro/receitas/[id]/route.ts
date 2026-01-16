import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const { id } = params;

    const matricula = await prisma.matricula.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        aluno: true,
        curso: true
      }
    });

    return NextResponse.json(matricula);
  } catch (error) {
    console.error('Erro ao atualizar matrícula:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}