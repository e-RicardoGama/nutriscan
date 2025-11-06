// /app/api/consentimento/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const consentData = await request.json();

    // Validações
    if (!consentData.email || !consentData.consentimentos) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    console.log('📥 Dados recebidos:', consentData);

    // Salva no banco
    const registro = await prisma.consentimento.create({
      data: {
        email: consentData.email,
        termos: consentData.consentimentos.termos,
        privacidade: consentData.consentimentos.privacidade,
        marketing: consentData.consentimentos.marketing || false,
        version: consentData.version,
        ip: consentData.ip || 'não-disponível',
        userAgent: consentData.userAgent || 'não-disponível',
        timestamp: new Date(consentData.timestamp)
      }
    });

    console.log('✅ Consentimento salvo no banco:', registro);

    return NextResponse.json({ 
      success: true, 
      id: registro.id,
      message: 'Consentimento registrado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao salvar:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar no banco de dados' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Rota GET para consultar consentimentos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      const todos = await prisma.consentimento.findMany({
        take: 100,
        orderBy: { timestamp: 'desc' }
      });
      return NextResponse.json({ consentimentos: todos });
    }

    const consentimentos = await prisma.consentimento.findMany({
      where: { email },
      orderBy: { timestamp: 'desc' }
    });

    return NextResponse.json({ consentimentos });

  } catch (error) {
    console.error('❌ Erro ao buscar:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
