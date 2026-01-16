-- CreateTable
CREATE TABLE "public"."professores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "cpf" TEXT NOT NULL,
    "valorHora" DECIMAL(10,2),
    "valorAluno" DECIMAL(10,2),
    "tipoPagamento" TEXT NOT NULL DEFAULT 'Por Aluno',
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."alunos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "cpf" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alunos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cursos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."professor_cursos" (
    "id" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,

    CONSTRAINT "professor_cursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."matriculas" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "dataMatricula" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matriculas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pagamentos" (
    "id" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "horasTrabalhadas" INTEGER,
    "alunosAtendidos" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "professores_email_key" ON "public"."professores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "professores_cpf_key" ON "public"."professores"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "alunos_email_key" ON "public"."alunos"("email");

-- CreateIndex
CREATE UNIQUE INDEX "alunos_cpf_key" ON "public"."alunos"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "professor_cursos_professorId_cursoId_key" ON "public"."professor_cursos"("professorId", "cursoId");

-- CreateIndex
CREATE UNIQUE INDEX "matriculas_alunoId_cursoId_key" ON "public"."matriculas"("alunoId", "cursoId");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_professorId_mes_ano_key" ON "public"."pagamentos"("professorId", "mes", "ano");

-- AddForeignKey
ALTER TABLE "public"."professor_cursos" ADD CONSTRAINT "professor_cursos_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "public"."professores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."professor_cursos" ADD CONSTRAINT "professor_cursos_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "public"."cursos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matriculas" ADD CONSTRAINT "matriculas_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "public"."alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."matriculas" ADD CONSTRAINT "matriculas_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "public"."cursos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pagamentos" ADD CONSTRAINT "pagamentos_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "public"."professores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
