import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE - Excluir professor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Verificar se professor existe
    const professor = await prisma.professor.findUnique({
      where: { id }
    });
    
    if (!professor) {
      return NextResponse.json(
        { error: 'Professor não encontrado' },
        { status: 404 }
      );
    }
    
    // Excluir professor (cascata vai excluir relacionamentos)
    await prisma.professor.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Professor excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir professor:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir professor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar professor
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { id } = params;
      const data = await request.json();
      
      const professor = await prisma.professor.update({
        where: { id },
        data: {
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          cpf: data.cpf,
          valorAluno: data.valorAluno ? parseFloat(data.valorAluno) : null,
          tipoPagamento: data.tipoPagamento || "Por Aluno"
        }
      });
      
      return NextResponse.json(professor);
    } catch (error) {
      console.error('Erro ao atualizar professor:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar professor' },
        { status: 500 }
      );
    }
  }