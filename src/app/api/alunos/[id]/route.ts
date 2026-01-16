import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Atualizar aluno
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    
    const aluno = await prisma.aluno.update({
      where: { id },
      data: {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        cpf: data.cpf
      }
    });
    
    return NextResponse.json(aluno);
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar aluno' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir aluno
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const aluno = await prisma.aluno.findUnique({
      where: { id }
    });
    
    if (!aluno) {
      return NextResponse.json(
        { error: 'Aluno não encontrado' },
        { status: 404 }
      );
    }
    
    await prisma.aluno.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Aluno excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir aluno:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir aluno' },
      { status: 500 }
    );
  }
}