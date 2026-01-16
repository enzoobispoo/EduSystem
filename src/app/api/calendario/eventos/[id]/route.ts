import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { id } = params;

    const evento = await prisma.evento.update({
      where: { id },
      data: {
        titulo: data.titulo,
        descricao: data.descricao,
        data: new Date(data.data),
        horaInicio: data.horaInicio,
        horaFim: data.horaFim,
        professorId: data.professorId || null,
        cursoId: data.cursoId || null,
        sala: data.sala,
        tipo: data.tipo,
        cor: data.cor,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(evento);
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.evento.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Evento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir evento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}