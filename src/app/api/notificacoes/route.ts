// src/app/api/notificacoes/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar todas as notificações
export async function GET() {
  try {
    const notificacoes = await prisma.notificacao.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50 // Limita a 50 notificações mais recentes
    });

    return NextResponse.json(notificacoes);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar notificações' },
      { status: 500 }
    );
  }
}

// POST - Criar nova notificação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { titulo, mensagem, tipo, icone, cor, url } = body;

    const notificacao = await prisma.notificacao.create({
      data: {
        titulo,
        mensagem,
        tipo,
        icone: icone || 'bell',
        cor: cor || 'blue',
        url: url || null
      }
    });

    return NextResponse.json(notificacao, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar notificação' },
      { status: 500 }
    );
  }
}