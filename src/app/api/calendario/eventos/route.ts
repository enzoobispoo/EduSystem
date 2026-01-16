import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const eventos = await prisma.evento.findMany({
      include: {
        professor: true,
        curso: true
      },
      orderBy: {
        data: 'asc'
      }
    });

    const eventosFormatted = eventos.map(evento => ({
      id: evento.id,
      titulo: evento.titulo,
      descricao: evento.descricao,
      data: evento.data.toISOString().split('T')[0],
      horaInicio: evento.horaInicio,
      horaFim: evento.horaFim,
      professorId: evento.professorId,
      professorNome: evento.professor?.nome,
      cursoId: evento.cursoId,
      cursoNome: evento.curso?.nome,
      sala: evento.sala,
      tipo: evento.tipo,
      cor: evento.cor
    }));

    return NextResponse.json(eventosFormatted);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const evento = await prisma.evento.create({
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
        cor: data.cor
      }
    });

    return NextResponse.json(evento);
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}