'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  CreditCard,
  PiggyBank,
  Receipt,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  X,
  Loader2,
  Target,
  Sparkles,
  Search,
  Bell,
  RefreshCw
} from 'lucide-react';

interface PagamentoData {
  id: string;
  professorId: string;
  professorNome: string;
  valor: number;
  mes: number;
  ano: number;
  horasTrabalhadas?: number;
  alunosAtendidos?: number;
  status: string;
  createdAt: string;
  tipoPagamento: string;
}

interface FinanceiroStats {
  receitaTotal: number;
  despesasTotal: number;
  lucroTotal: number;
  pagamentosPendentes: number;
  pagamentosPagos: number;
  totalAlunos: number;
  ticketMedio: number;
  crescimentoMensal: number;
}

interface MatriculaFinanceira {
  id: string;
  alunoNome: string;
  cursoNome: string;
  cursoValor: number;
  status: string;
  dataMatricula: string;
  dataPagamento?: string;
}

interface GerarPagamentosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Componente Modal compacto
function GerarPagamentosModal({ isOpen, onClose, onSuccess }: GerarPagamentosModalProps) {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const handleGerarPagamentos = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/financeiro/gerar-pagamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mes, ano })
      });

      if (response.ok) {
        const result = await response.json();
        
        await fetch('/api/notificacoes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: 'Pagamentos Gerados',
            mensagem: result.message,
            tipo: 'financeiro'
          })
        });

        onSuccess();
        onClose();
      } else {
        throw new Error('Erro ao gerar pagamentos');
      }
    } catch (error) {
      console.error('Erro ao gerar pagamentos:', error);
      alert('Erro ao gerar pagamentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gerar Pagamentos</h3>
              <p className="text-gray-500 text-sm">Automatize os pagamentos mensais</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período de Referência
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mês</label>
                <select
                  value={mes}
                  onChange={(e) => setMes(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                >
                  {meses.map((mesNome, index) => (
                    <option key={index} value={index + 1}>{mesNome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ano</label>
                <select
                  value={ano}
                  onChange={(e) => setAno(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-start">
              <DollarSign className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900">Como funciona?</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Calcula automaticamente baseado nas configurações dos professores.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <div className="flex items-start">
              <Bell className="w-5 h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900">Período: {meses[mes - 1]} {ano}</h4>
                <p className="text-sm text-amber-700">
                  Pagamentos duplicados serão ignorados automaticamente.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all text-sm font-medium"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleGerarPagamentos}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 flex items-center justify-center transition-all text-sm font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Pagamentos
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FinanceiroPage() {
  const [stats, setStats] = useState<FinanceiroStats>({
    receitaTotal: 0,
    despesasTotal: 0,
    lucroTotal: 0,
    pagamentosPendentes: 0,
    pagamentosPagos: 0,
    totalAlunos: 0,
    ticketMedio: 0,
    crescimentoMensal: 0
  });

  const [pagamentos, setPagamentos] = useState<PagamentoData[]>([]);
  const [matriculasFinanceiras, setMatriculasFinanceiras] = useState<MatriculaFinanceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'pagamentos' | 'receitas'>('overview');
  const [filtroMes, setFiltroMes] = useState<number>(new Date().getMonth() + 1);
  const [filtroAno, setFiltroAno] = useState<number>(new Date().getFullYear());
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);
  const [selectedPagamento, setSelectedPagamento] = useState<PagamentoData | null>(null);
  const [showGerarPagamentosModal, setShowGerarPagamentosModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchFinanceiroData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, pagamentosRes, matriculasRes] = await Promise.all([
        fetch(`/api/financeiro/stats?mes=${filtroMes}&ano=${filtroAno}`),
        fetch(`/api/financeiro/pagamentos?mes=${filtroMes}&ano=${filtroAno}`),
        fetch(`/api/financeiro/receitas?mes=${filtroMes}&ano=${filtroAno}`)
      ]);
  
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
  
      if (pagamentosRes.ok) {
        const pagamentosData = await pagamentosRes.json();
        setPagamentos(pagamentosData);
      }
  
      if (matriculasRes.ok) {
        const matriculasData = await matriculasRes.json();
        setMatriculasFinanceiras(matriculasData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  }, [filtroMes, filtroAno]);

  useEffect(() => {
    fetchFinanceiroData();
  }, [fetchFinanceiroData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFinanceiroData();
    setRefreshing(false);
  };

  const handleStatusPagamento = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/financeiro/pagamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchFinanceiroData();
        setShowPagamentoModal(false);
        
        await fetch('/api/notificacoes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: `Pagamento ${status === 'pago' ? 'Aprovado' : 'Atualizado'}`,
            mensagem: `Pagamento de ${selectedPagamento?.professorNome} foi ${status === 'pago' ? 'aprovado' : 'atualizado'}`,
            tipo: 'financeiro'
          })
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
    }
  };

  const handleStatusMatricula = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/financeiro/receitas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchFinanceiroData();
        
        await fetch('/api/notificacoes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: `Pagamento ${status === 'Pago' ? 'Recebido' : 'Atualizado'}`,
            mensagem: `Pagamento de matrícula foi ${status === 'Pago' ? 'recebido' : 'atualizado'}`,
            tipo: 'financeiro'
          })
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar matrícula:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
      case 'Pago':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'pendente':
      case 'Pendente':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Cancelado':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
      case 'Pago':
        return <CheckCircle className="w-4 h-4" />;
      case 'pendente':
      case 'Pendente':
        return <Clock className="w-4 h-4" />;
      case 'Cancelado':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredPagamentos = pagamentos.filter(pagamento =>
    pagamento.professorNome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMatriculas = matriculasFinanceiras.filter(matricula =>
    matricula.alunoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    matricula.cursoNome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-80 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header compacto */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-600 mt-1">Gestão completa das finanças da escola</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mt-4 lg:mt-0">
          {/* Filtros compactos */}
          <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm border">
            <Calendar className="w-4 h-4 text-gray-400 ml-2" />
            <select 
              value={filtroMes} 
              onChange={(e) => setFiltroMes(Number(e.target.value))}
              className="px-2 py-1 border-0 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none bg-transparent text-sm"
            >
              {meses.map((mes, index) => (
                <option key={index} value={index + 1}>{mes}</option>
              ))}
            </select>
            
            <div className="w-px h-4 bg-gray-200"></div>
            
            <select 
              value={filtroAno} 
              onChange={(e) => setFiltroAno(Number(e.target.value))}
              className="px-2 py-1 border-0 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none bg-transparent text-sm"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
            </select>
          </div>

          {/* Botões compactos */}
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm border text-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>

          <button className="flex items-center px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm border text-sm">
            <Download className="w-4 h-4 mr-1" />
            Exportar
          </button>

          <button 
            onClick={() => setShowGerarPagamentosModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-1" />
            Gerar Pagamentos
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas compactos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Receita Total</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.receitaTotal)}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600 font-medium">+{stats.crescimentoMensal}%</span>
                <span className="text-xs text-gray-500 ml-1">vs mês anterior</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Despesas Total</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.despesasTotal)}</p>
              <div className="flex items-center mt-2">
                <Receipt className="w-3 h-3 text-gray-600 mr-1" />
                <span className="text-xs text-gray-600 font-medium">{stats.pagamentosPagos}</span>
                <span className="text-xs text-gray-500 ml-1">pagamentos</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Lucro Líquido</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.lucroTotal)}</p>
              <div className="flex items-center mt-2">
                <Target className="w-3 h-3 text-blue-600 mr-1" />
                <span className="text-xs text-blue-600 font-medium">{((stats.lucroTotal / stats.receitaTotal) * 100).toFixed(1)}%</span>
                <span className="text-xs text-gray-500 ml-1">margem</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Ticket Médio</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.ticketMedio)}</p>
              <div className="flex items-center mt-2">
                <Users className="w-3 h-3 text-purple-600 mr-1" />
                <span className="text-xs text-purple-600 font-medium">{stats.totalAlunos}</span>
                <span className="text-xs text-gray-500 ml-1">alunos ativos</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs compactos */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-6 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('pagamentos')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                activeTab === 'pagamentos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>Pagamentos Professores</span>
              {stats.pagamentosPendentes > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {stats.pagamentosPendentes}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('receitas')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'receitas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Receitas Alunos
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Search Bar compacto */}
          {(activeTab === 'pagamentos' || activeTab === 'receitas') && (
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Buscar ${activeTab === 'pagamentos' ? 'professor' : 'aluno ou curso'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>
          )}

          {/* Tab: Visão Geral */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resumo Mensal compacto */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    Resumo {meses[filtroMes - 1]} {filtroAno}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                      <span className="text-gray-700 font-medium">Receitas:</span>
                      <span className="font-bold text-green-600">{formatCurrency(stats.receitaTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                      <span className="text-gray-700 font-medium">Despesas:</span>
                      <span className="font-bold text-red-600">-{formatCurrency(stats.despesasTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-100 rounded-lg border border-blue-200">
                      <span className="font-semibold text-gray-900">Lucro Líquido:</span>
                      <span className="font-bold text-blue-600">{formatCurrency(stats.lucroTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Pagamentos compacto */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    Status dos Pagamentos
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-gray-700 font-medium">Pagos:</span>
                      </div>
                      <span className="font-bold text-green-600">{stats.pagamentosPagos}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-amber-600 mr-2" />
                        <span className="text-gray-700 font-medium">Pendentes:</span>
                      </div>
                      <span className="font-bold text-amber-600">{stats.pagamentosPendentes}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border border-green-200">
                      <span className="font-semibold text-gray-900">Taxa de Sucesso:</span>
                      <span className="font-bold text-green-600">
                        {((stats.pagamentosPagos / (stats.pagamentosPagos + stats.pagamentosPendentes)) * 100 || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Indicadores rápidos compactos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 font-medium text-sm">Pendências</p>
                      <p className="text-xl font-bold text-purple-700">{stats.pagamentosPendentes}</p>
                    </div>
                    <Bell className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 font-medium text-sm">Alunos Ativos</p>
                      <p className="text-xl font-bold text-orange-700">{stats.totalAlunos}</p>
                    </div>
                    <Users className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
                
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cyan-600 font-medium text-sm">Crescimento</p>
                      <p className="text-xl font-bold text-cyan-700">+{stats.crescimentoMensal}%</p>
                    </div>
                    <TrendingUp className="w-6 h-6 text-cyan-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Pagamentos compacto */}
          {activeTab === 'pagamentos' && (
            <div className="space-y-4">
              {filteredPagamentos.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum pagamento encontrado</h3>
                  <p className="text-gray-500 text-sm">Não há pagamentos para este período ou termo de busca</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Professor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalhes</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPagamentos.map((pagamento) => (
                          <tr key={pagamento.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-medium text-sm">
                                  {pagamento.professorNome.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{pagamento.professorNome}</div>
                                  <div className="text-xs text-gray-500">ID: {pagamento.professorId.slice(-8)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {meses[pagamento.mes - 1]} {pagamento.ano}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{pagamento.tipoPagamento}</div>
                              {pagamento.horasTrabalhadas && (
                                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
                                  {pagamento.horasTrabalhadas}h
                                </div>
                              )}
                              {pagamento.alunosAtendidos && (
                                <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded mt-1 inline-block">
                                  {pagamento.alunosAtendidos} alunos
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(pagamento.valor)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(pagamento.status)}`}>
                                {getStatusIcon(pagamento.status)}
                                <span className="ml-1 capitalize">{pagamento.status}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedPagamento(pagamento);
                                    setShowPagamentoModal(true);
                                  }}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {pagamento.status === 'pendente' && (
                                  <button
                                    onClick={() => handleStatusPagamento(pagamento.id, 'pago')}
                                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Receitas compacto */}
          {activeTab === 'receitas' && (
            <div className="space-y-4">
              {filteredMatriculas.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma receita encontrada</h3>
                  <p className="text-gray-500 text-sm">Não há receitas para este período ou termo de busca</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Matrícula</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredMatriculas.map((matricula) => (
                          <tr key={matricula.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-medium text-sm">
                                  {matricula.alunoNome.charAt(0)}
                                </div>
                                <div className="text-sm font-medium text-gray-900">{matricula.alunoNome}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {matricula.cursoNome}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(matricula.cursoValor)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(matricula.dataMatricula).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(matricula.status)}`}>
                                {getStatusIcon(matricula.status)}
                                <span className="ml-1">{matricula.status}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {matricula.status === 'Pendente' && (
                                <button
                                  onClick={() => handleStatusMatricula(matricula.id, 'Pago')}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes compacto */}
      {showPagamentoModal && selectedPagamento && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Detalhes do Pagamento</h3>
                  <p className="text-gray-500 text-sm">Informações completas</p>
                </div>
              </div>
              <button
                onClick={() => setShowPagamentoModal(false)}
                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Professor</label>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{selectedPagamento.professorNome}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Período</label>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {meses[selectedPagamento.mes - 1]} {selectedPagamento.ano}
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <label className="text-xs font-medium text-blue-600 uppercase">Valor Total</label>
                <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(selectedPagamento.valor)}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Tipo</label>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{selectedPagamento.tipoPagamento}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-1 ${getStatusColor(selectedPagamento.status)}`}>
                    {getStatusIcon(selectedPagamento.status)}
                    <span className="ml-1 capitalize">{selectedPagamento.status}</span>
                  </div>
                </div>
              </div>
              
              {(selectedPagamento.horasTrabalhadas || selectedPagamento.alunosAtendidos) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedPagamento.horasTrabalhadas && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Horas</label>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{selectedPagamento.horasTrabalhadas}h</p>
                    </div>
                  )}
                  
                  {selectedPagamento.alunosAtendidos && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Alunos</label>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{selectedPagamento.alunosAtendidos}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPagamentoModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium"
              >
                Fechar
              </button>
              
              {selectedPagamento.status === 'pendente' && (
                <button
                  onClick={() => handleStatusPagamento(selectedPagamento.id, 'pago')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium"
                >
                  ✓ Marcar como Pago
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Gerar Pagamentos */}
      <GerarPagamentosModal
        isOpen={showGerarPagamentosModal}
        onClose={() => setShowGerarPagamentosModal(false)}
        onSuccess={() => fetchFinanceiroData()}
      />
    </div>
  );
}