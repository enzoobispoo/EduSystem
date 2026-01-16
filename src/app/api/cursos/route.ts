import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Listar todos os cursos
export async function GET() {
  try {
    const cursos = await prisma.curso.findMany({
      include: {
        matriculas: {
          include: {
            aluno: true
          }
        },
        professores: {
          include: {
            professor: true
          }
        }
      }
    });
    
    return NextResponse.json(cursos);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar cursos' },
      { status: 500 }
    );
  }
}

// POST - Criar novo curso
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const curso = await prisma.curso.create({
        data: {
          nome: data.nome,
          descricao: data.descricao,
          valor: parseFloat(data.valor),
          tipo: data.tipo || "Games", // ADICIONE ESTA LINHA
          dataInicio: new Date(data.dataInicio),
          dataFim: new Date(data.dataFim)
        }
      });
    
    return NextResponse.json(curso);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar curso' },
      { status: 500 }
    );
  }
}