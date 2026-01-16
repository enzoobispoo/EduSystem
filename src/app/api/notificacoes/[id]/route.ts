// src/app/api/notificacoes/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Marcar notificação como lida
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const notificacao = await prisma.notificacao.update({
      where: { id },
      data: { lida: true }
    });

    return NextResponse.json(notificacao);
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return NextResponse.json(
      { error: 'Erro ao marcar notificação como lida' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir notificação
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.notificacao.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir notificação:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir notificação' },
      { status: 500 }
    );
  }
}

// Endpoint para marcar TODAS as notificações como lidas
// src/app/api/notificacoes/marcar-todas-lidas/route.ts

export async function POST() {
  try {
    await prisma.notificacao.updateMany({
      where: { lida: false },
      data: { lida: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar todas notificações como lidas:', error);
    return NextResponse.json(
      { error: 'Erro ao marcar todas notificações como lidas' },
      { status: 500 }
    );
  }
}