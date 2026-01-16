import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Atualizar curso
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    
    const curso = await prisma.curso.update({
      where: { id },
      data: {
        nome: data.nome,
        descricao: data.descricao,
        valor: parseFloat(data.valor),
        tipo: data.tipo,
        dataInicio: new Date(data.dataInicio),
        dataFim: new Date(data.dataFim)
      }
    });
    
    return NextResponse.json(curso);
  } catch (error) {
    console.error('Erro ao atualizar curso:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar curso' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir curso
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const curso = await prisma.curso.findUnique({
      where: { id }
    });
    
    if (!curso) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      );
    }
    
    await prisma.curso.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Curso excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir curso:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir curso' },
      { status: 500 }
    );
  }
}