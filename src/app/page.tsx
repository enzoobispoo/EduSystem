"use client";

import { Users, BookOpen, DollarSign, TrendingUp, Calendar, Share2, UserPlus, Clock, BarChart3, ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";

interface DashboardData {
  totalAlunos: number;
  totalCursos: number;
  receita: number;
  lucro: number;
  professoresRecentes: any[];
  alunosRecentes: any[];
}

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("Esta Semana");
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalAlunos: 0,
    totalCursos: 0,
    receita: 0,
    lucro: 0,
    professoresRecentes: [],
    alunosRecentes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Alunos",
      value: dashboardData.totalAlunos.toString(),
      change: `+${dashboardData.totalAlunos}`,
      icon: Users,
      bgColor: "from-blue-500 to-blue-600"
    },
    {
      title: "Cursos", 
      value: dashboardData.totalCursos.toString(),
      change: `+${dashboardData.totalCursos}`,
      icon: BookOpen,
      bgColor: "from-emerald-500 to-emerald-600"
    },
    {
      title: "Receita",
      value: `R$ ${(dashboardData.receita / 1000).toFixed(1)}k`,
      change: "+100%",
      icon: DollarSign,
      bgColor: "from-green-500 to-green-600"
    },
    {
      title: "Lucro",
      value: `R$ ${(dashboardData.lucro / 1000).toFixed(1)}k`,
      change: "+100%",
      icon: TrendingUp,
      bgColor: "from-purple-500 to-purple-600"
    }
  ];

  const topBarActions = (
    <div className="flex items-center gap-2">
      <button className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
        <Share2 className="w-4 h-4" />
        <span className="hidden md:inline">Compartilhar</span>
      </button>
      <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all text-sm">
        <UserPlus className="w-4 h-4" />
        <span className="hidden sm:inline">Matricular</span>
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar 
        title="" 
        subtitle=""
        actions={topBarActions}
      />
      
      <div className="p-4 md:p-6">
        {/* Saudação e Data */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Boa Tarde, Gestor(a)!</h1>
          <p className="text-gray-600 mt-1">Segunda-feira, 8 de setembro</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <ArrowUp className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Atividades da Escola */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Atividades da Escola</h3>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <select 
                      value={selectedPeriod} 
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option>Esta Semana</option>
                      <option>Semana Passada</option>
                      <option>Este Mês</option>
                    </select>
                    
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                      Ver Todos
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-3">
                  {dashboardData.alunosRecentes.length === 0 && dashboardData.professoresRecentes.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium">Nenhuma atividade recente</p>
                      <p className="text-sm mt-1">Cadastre professores e alunos para ver as atividades</p>
                    </div>
                  ) : (
                    <>
                      {dashboardData.professoresRecentes.map((professor) => (
                        <div key={`prof-${professor.id}`} className="flex items-start gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900">Novo Professor Cadastrado</h4>
                                <p className="text-sm text-gray-600 mt-1">{professor.nome} foi adicionado à equipe</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-xs text-gray-500">Por: Gestor</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(professor.createdAt).toLocaleDateString('pt-BR')} às{' '}
                                    {new Date(professor.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                Concluído
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {dashboardData.alunosRecentes.map((aluno) => (
                        <div key={`aluno-${aluno.id}`} className="flex items-start gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserPlus className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900">Novo Aluno Matriculado</h4>
                                <p className="text-sm text-gray-600 mt-1">{aluno.nome} foi cadastrado no sistema</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-xs text-gray-500">Por: Sistema</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(aluno.createdAt).toLocaleDateString('pt-BR')} às{' '}
                                    {new Date(aluno.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {aluno.matriculas && aluno.matriculas.length > 0 && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                      {aluno.matriculas.length} curso(s)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                Matriculado
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Direita */}
          <div className="space-y-4">
            {/* Agenda */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Agenda</h3>
                  <p className="text-xs text-gray-500">Próximos eventos</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                    <div key={i}>{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {[15, 16, 17, 18, 19, 20, 21].map(date => (
                    <div key={date} className={`p-1.5 hover:bg-gray-100 rounded cursor-pointer ${
                      date === 17 ? 'bg-blue-600 text-white font-semibold' : ''
                    }`}>
                      {date}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 rounded-r-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3 h-3 text-blue-600" />
                  <h4 className="font-medium text-gray-900 text-sm">Sistema funcionando!</h4>
                </div>
                <p className="text-xs text-gray-600">Todos os CRUDs operacionais</p>
              </div>
            </div>

            {/* Resumo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Resumo</h3>
                  <p className="text-xs text-gray-500">Visão geral</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Total de Alunos</span>
                  <span className="text-sm font-bold text-blue-600">{dashboardData.totalAlunos}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Total de Cursos</span>
                  <span className="text-sm font-bold text-green-600">{dashboardData.totalCursos}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Receita Total</span>
                  <span className="text-sm font-bold text-emerald-600">R$ {dashboardData.receita.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}