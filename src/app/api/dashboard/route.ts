import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Contar alunos
    const totalAlunos = await prisma.aluno.count();
    
    // Contar cursos
    const totalCursos = await prisma.curso.count();
    
    // Calcular receita (soma dos valores dos cursos * número de matrículas)
    const cursos = await prisma.curso.findMany({
      include: {
        matriculas: true
      }
    });
    
    const receita = cursos.reduce((total, curso) => {
      return total + (Number(curso.valor) * curso.matriculas.length);
    }, 0);
    
    // Buscar atividades recentes
    const professores = await prisma.professor.findMany({
      take: 3,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const alunos = await prisma.aluno.findMany({
      take: 3,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const estatisticas = {
      totalAlunos,
      totalCursos,
      receita,
      lucro: receita * 0.95, // Supondo 5% de custos
      professoresRecentes: professores,
      alunosRecentes: alunos
    };
    
    return NextResponse.json(estatisticas);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
  
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}