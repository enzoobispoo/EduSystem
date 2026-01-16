import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { mes, ano } = await request.json();
    console.log('Dados recebidos:', { mes, ano });
    
    // Buscar um professor real do banco
    const professor = await prisma.professor.findFirst({
      where: { status: 'ativo' }
    });
    
    if (!professor) {
      return NextResponse.json({ error: 'Nenhum professor ativo encontrado' });
    }
    
    console.log('Professor encontrado:', professor.nome);
    
    // Criar pagamento real
    const pagamento = await prisma.pagamento.create({
      data: {
        professorId: professor.id,
        valor: 1000,
        mes: mes,
        ano: ano,
        status: 'pendente'
      }
    });
    
    console.log('Pagamento criado:', pagamento.id);
    
    return NextResponse.json({ 
      message: 'Pagamento criado com sucesso',
      pagamento: pagamento
    });
  } catch (error) {
    console.error('ERRO:', error);
    return NextResponse.json({ 
      error: 'Erro na criação',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}