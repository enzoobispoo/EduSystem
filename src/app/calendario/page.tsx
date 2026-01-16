'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar,
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  MapPin,
  Users,
  BookOpen,
  Edit,
  Trash2,
  X,
  Save,
  Search,
  Filter,
  MoreHorizontal,
  Repeat,
  AlertCircle
} from 'lucide-react';

interface Evento {
  id: string;
  titulo: string;
  descricao?: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  professorId?: string;
  professorNome?: string;
  cursoId?: string;
  cursoNome?: string;
  sala?: string;
  tipo: 'aula' | 'reuniao' | 'evento' | 'feriado';
  cor: string;
  recorrente?: boolean;
  padraoRecorrencia?: 'diario' | 'semanal' | 'mensal';
  fimRecorrencia?: string;
}

interface NovoEvento {
  titulo: string;
  descricao: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  professorId: string;
  cursoId: string;
  sala: string;
  tipo: 'aula' | 'reuniao' | 'evento' | 'feriado';
  recorrente: boolean;
  padraoRecorrencia: 'diario' | 'semanal' | 'mensal';
  fimRecorrencia: string;
}

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const diasSemanaAbrev = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];

const tiposEvento = [
  { value: 'aula', label: 'Aula', cor: 'bg-blue-500' },
  { value: 'reuniao', label: 'Reunião', cor: 'bg-purple-500' },
  { value: 'evento', label: 'Evento', cor: 'bg-green-500' },
  { value: 'feriado', label: 'Feriado', cor: 'bg-red-500' }
];

const coresEvento = [
  { value: 'bg-blue-500', label: 'Azul' },
  { value: 'bg-purple-500', label: 'Roxo' },
  { value: 'bg-green-500', label: 'Verde' },
  { value: 'bg-red-500', label: 'Vermelho' },
  { value: 'bg-yellow-500', label: 'Amarelo' },
  { value: 'bg-pink-500', label: 'Rosa' },
  { value: 'bg-indigo-500', label: 'Índigo' },
  { value: 'bg-teal-500', label: 'Azul-verde' }
];

export default function CalendarioPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [professores, setProfessores] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados do calendário
  const [dataAtual, setDataAtual] = useState(new Date());
  const [visualizacao, setVisualizacao] = useState<'day' | 'week' | 'month'>('week');
  const [filtroAtivo, setFiltroAtivo] = useState('all');
  const [buscaTexto, setBuscaTexto] = useState('');
  const [eventoDragando, setEventoDragando] = useState<Evento | null>(null);
  
  // Estados dos modais
  const [showEventoModal, setShowEventoModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showFiltrosModal, setShowFiltrosModal] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);
  const [editandoEvento, setEditandoEvento] = useState<Evento | null>(null);
  
  // Estado do formulário
  const [novoEvento, setNovoEvento] = useState<NovoEvento>({
    titulo: '',
    descricao: '',
    data: '',
    horaInicio: '08:00',
    horaFim: '09:00',
    professorId: '',
    cursoId: '',
    sala: '',
    tipo: 'aula',
    recorrente: false,
    padraoRecorrencia: 'semanal',
    fimRecorrencia: ''
  });

  const [corSelecionada, setCorSelecionada] = useState('bg-blue-500');

  useEffect(() => {
    fetchDados();
  }, []);

  // Eventos filtrados com busca inteligente
  const eventosFiltrados = useMemo(() => {
    let eventosFilter = eventos;

    // Filtro por tipo
    if (filtroAtivo !== 'all') {
      const tipoMap: { [key: string]: string } = {
        'events': 'evento',
        'meetings': 'reuniao', 
        'classes': 'aula',
        'holidays': 'feriado'
      };
      eventosFilter = eventosFilter.filter(evento => evento.tipo === tipoMap[filtroAtivo]);
    }

    // Busca inteligente
    if (buscaTexto.trim()) {
      const termo = buscaTexto.toLowerCase();
      eventosFilter = eventosFilter.filter(evento => 
        evento.titulo.toLowerCase().includes(termo) ||
        evento.descricao?.toLowerCase().includes(termo) ||
        evento.professorNome?.toLowerCase().includes(termo) ||
        evento.cursoNome?.toLowerCase().includes(termo) ||
        evento.sala?.toLowerCase().includes(termo) ||
        evento.data.includes(termo)
      );
    }

    return eventosFilter;
  }, [eventos, filtroAtivo, buscaTexto]);

  const fetchDados = async () => {
    try {
      setLoading(true);
      const [eventosRes, professoresRes, cursosRes] = await Promise.all([
        fetch('/api/calendario/eventos'),
        fetch('/api/professores'),
        fetch('/api/cursos')
      ]);

      if (eventosRes.ok) {
        const eventosData = await eventosRes.json();
        setEventos(eventosData);
      }

      if (professoresRes.ok) {
        const professoresData = await professoresRes.json();
        setProfessores(professoresData);
      }

      if (cursosRes.ok) {
        const cursosData = await cursosRes.json();
        setCursos(cursosData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarEvento = async () => {
    try {
      const professorSelecionado = professores.find(p => p.id === novoEvento.professorId);
      const cursoSelecionado = cursos.find(c => c.id === novoEvento.cursoId);

      const eventoData = {
        ...novoEvento,
        professorNome: professorSelecionado?.nome || '',
        cursoNome: cursoSelecionado?.nome || '',
        cor: corSelecionada
      };

      const url = editandoEvento ? `/api/calendario/eventos/${editandoEvento.id}` : '/api/calendario/eventos';
      const method = editandoEvento ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventoData)
      });

      if (response.ok) {
        fetchDados();
        setShowEventoModal(false);
        resetForm();
        
        // Criar notificação
        await fetch('/api/notificacoes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: editandoEvento ? 'Evento Atualizado' : 'Novo Evento',
            mensagem: `${eventoData.titulo} foi ${editandoEvento ? 'atualizado' : 'agendado'} para ${formatarData(eventoData.data)}`,
            tipo: 'calendario'
          })
        });
      }
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    }
  };

  const resetForm = () => {
    setNovoEvento({
      titulo: '',
      descricao: '',
      data: '',
      horaInicio: '08:00',
      horaFim: '09:00',
      professorId: '',
      cursoId: '',
      sala: '',
      tipo: 'aula',
      recorrente: false,
      padraoRecorrencia: 'semanal',
      fimRecorrencia: ''
    });
    setEditandoEvento(null);
    setCorSelecionada('bg-blue-500');
  };

  const abrirModalEvento = (data?: Date, hora?: string) => {
    resetForm();
    if (data) {
      setNovoEvento(prev => ({
        ...prev,
        data: data.toISOString().split('T')[0],
        horaInicio: hora || '08:00'
      }));
    }
    setShowEventoModal(true);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarHora = (hora: string) => {
    return hora.substring(0, 5);
  };

  const navegarPeriodo = (direcao: 'anterior' | 'proximo') => {
    setDataAtual(prev => {
      const novaData = new Date(prev);
      const dias = visualizacao === 'day' ? 1 : visualizacao === 'week' ? 7 : 30;
      if (direcao === 'anterior') {
        novaData.setDate(prev.getDate() - dias);
      } else {
        novaData.setDate(prev.getDate() + dias);
      }
      return novaData;
    });
  };

  const irParaHoje = () => {
    setDataAtual(new Date());
  };

  const obterSemanaAtual = () => {
    const inicio = new Date(dataAtual);
    const diaSemana = inicio.getDay() === 0 ? 7 : inicio.getDay();
    inicio.setDate(inicio.getDate() - diaSemana + 1);
    
    const dias = [];
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicio);
      dia.setDate(inicio.getDate() + i);
      dias.push(dia);
    }
    return dias;
  };

  const obterMesAtual = () => {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    
    const inicioCalendario = new Date(primeiroDia);
    const diaSemana = primeiroDia.getDay() === 0 ? 7 : primeiroDia.getDay();
    inicioCalendario.setDate(1 - diaSemana + 1);
    
    const dias = [];
    for (let i = 0; i < 42; i++) {
      const dia = new Date(inicioCalendario);
      dia.setDate(inicioCalendario.getDate() + i);
      dias.push(dia);
    }
    
    return dias;
  };

  const obterEventosDoDia = (data: Date) => {
    const dataStr = data.toISOString().split('T')[0];
    return eventosFiltrados.filter(evento => evento.data === dataStr);
  };

  const gerarHorarios = () => {
    const horarios = [];
    for (let hora = 6; hora <= 22; hora++) {
      horarios.push(`${hora.toString().padStart(2, '0')}:00`);
    }
    return horarios;
  };

  const calcularPosicaoEvento = (evento: Evento) => {
    const inicio = parseInt(evento.horaInicio.split(':')[0]);
    const fim = parseInt(evento.horaFim.split(':')[0]);
    const minutosInicio = parseInt(evento.horaInicio.split(':')[1]);
    const minutosFim = parseInt(evento.horaFim.split(':')[1]);
    
    const top = ((inicio - 6) * 60 + minutosInicio) * (60 / 60);
    const height = ((fim - inicio) * 60 + (minutosFim - minutosInicio)) * (60 / 60);
    
    return { top, height: Math.max(height, 30) };
  };

  // Drag and Drop handlers
  const handleDragStart = (evento: Evento, e: React.DragEvent) => {
    setEventoDragando(evento);
    e.dataTransfer.setData('text/plain', evento.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (data: Date, hora: string, e: React.DragEvent) => {
    e.preventDefault();
    
    if (!eventoDragando) return;

    const novaData = data.toISOString().split('T')[0];
    const [horaInicio, minutoInicio] = eventoDragando.horaInicio.split(':');
    const [horaFim, minutoFim] = eventoDragando.horaFim.split(':');
    
    const duracaoMinutos = (parseInt(horaFim) * 60 + parseInt(minutoFim)) - (parseInt(horaInicio) * 60 + parseInt(minutoInicio));
    
    const [novaHoraInicio] = hora.split(':');
    const novaHoraFim = Math.floor((parseInt(novaHoraInicio) * 60 + duracaoMinutos) / 60);
    const novaMinutoFim = (parseInt(novaHoraInicio) * 60 + duracaoMinutos) % 60;

    try {
      const response = await fetch(`/api/calendario/eventos/${eventoDragando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventoDragando,
          data: novaData,
          horaInicio: hora,
          horaFim: `${novaHoraFim.toString().padStart(2, '0')}:${novaMinutoFim.toString().padStart(2, '0')}`
        })
      });

      if (response.ok) {
        fetchDados();
        
        await fetch('/api/notificacoes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: 'Evento Movido',
            mensagem: `${eventoDragando.titulo} foi reagendado para ${formatarData(novaData)}`,
            tipo: 'calendario'
          })
        });
      }
    } catch (error) {
      console.error('Erro ao mover evento:', error);
    }

    setEventoDragando(null);
  };

  const contarEventosPorTipo = (tipo: string) => {
    if (tipo === 'all') return eventosFiltrados.length;
    
    const tipoMap: { [key: string]: string } = {
      'events': 'evento',
      'meetings': 'reuniao', 
      'classes': 'aula',
      'holidays': 'feriado'
    };
    
    return eventosFiltrados.filter(evento => evento.tipo === tipoMap[tipo]).length;
  };

  const renderVisualizacaoSemana = () => {
    const diasSemana = obterSemanaAtual();
    const horarios = gerarHorarios();

    return (
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Time Column */}
          <div className="w-16 border-r border-gray-200 bg-gray-50">
            <div className="h-12"></div>
            {horarios.map((hora) => (
              <div key={hora} className="h-15 border-b border-gray-100 px-2 py-1">
                <span className="text-xs text-gray-500">{hora}</span>
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="flex-1 overflow-x-auto">
            <div className="grid grid-cols-7 h-full">
              {diasSemana.map((dia, index) => {
                const isHoje = dia.toDateString() === new Date().toDateString();
                return (
                  <div key={index} className="border-r border-gray-200 last:border-r-0">
                    <div className="h-12 border-b border-gray-200 flex flex-col items-center justify-center bg-gray-50">
                      <span className="text-xs text-gray-500 font-medium">
                        {diasSemanaAbrev[index]}
                      </span>
                      <span className={`text-lg font-semibold ${
                        isHoje ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {dia.getDate()}
                      </span>
                    </div>
                    
                    <div className="relative">
                      {horarios.map((hora) => (
                        <div
                          key={hora}
                          className="h-15 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={() => abrirModalEvento(dia, hora)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(dia, hora, e)}
                        ></div>
                      ))}
                      
                      {obterEventosDoDia(dia).map((evento) => {
                        const { top, height } = calcularPosicaoEvento(evento);
                        return (
                          <div
                            key={evento.id}
                            className={`absolute left-1 right-1 ${evento.cor} text-white text-xs p-1 rounded shadow-sm cursor-move hover:shadow-md transition-shadow`}
                            style={{ top: `${top}px`, height: `${height}px` }}
                            draggable
                            onDragStart={(e) => handleDragStart(evento, e)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEventoSelecionado(evento);
                              setShowDetalhesModal(true);
                            }}
                          >
                            <div className="font-medium truncate flex items-center">
                              {evento.recorrente && <Repeat className="w-3 h-3 mr-1" />}
                              {evento.titulo}
                            </div>
                            <div className="text-xs opacity-90">
                              {formatarHora(evento.horaInicio)} - {formatarHora(evento.horaFim)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVisualizacaoMes = () => {
    const diasMes = obterMesAtual();
    const mesAtual = dataAtual.getMonth();

    return (
      <div className="flex-1 overflow-hidden">
        <div className="h-full">
          {/* Headers dos dias da semana */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {diasSemanaAbrev.map((dia) => (
              <div key={dia} className="p-4 text-center text-sm font-medium text-gray-700">
                {dia}
              </div>
            ))}
          </div>

          {/* Grid do calendário */}
          <div className="grid grid-cols-7 flex-1">
            {diasMes.map((dia, index) => {
              const isHoje = dia.toDateString() === new Date().toDateString();
              const isMesAtual = dia.getMonth() === mesAtual;
              const eventos = obterEventosDoDia(dia);

              return (
                <div
                  key={index}
                  className={`border-r border-b border-gray-200 min-h-[120px] p-2 cursor-pointer hover:bg-gray-50 ${
                    !isMesAtual ? 'bg-gray-50 text-gray-400' : ''
                  }`}
                  onClick={() => abrirModalEvento(dia)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(dia, '08:00', e)}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    isHoje ? 'text-blue-600' : isMesAtual ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {dia.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {eventos.slice(0, 3).map((evento) => (
                      <div
                        key={evento.id}
                        className={`${evento.cor} text-white text-xs p-1 rounded cursor-move truncate`}
                        draggable
                        onDragStart={(e) => handleDragStart(evento, e)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEventoSelecionado(evento);
                          setShowDetalhesModal(true);
                        }}
                      >
                        <div className="flex items-center">
                          {evento.recorrente && <Repeat className="w-3 h-3 mr-1" />}
                          {evento.titulo}
                        </div>
                      </div>
                    ))}
                    {eventos.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{eventos.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
            <p className="text-gray-600">Organize e acompanhe sua agenda personalizada</p>
          </div>
          
          <button
            onClick={() => abrirModalEvento()}
            className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo
          </button>
        </div>

        {/* Navigation Tabs com contadores */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <button 
              className={`pb-2 text-sm font-medium border-b-2 flex items-center space-x-2 ${
                filtroAtivo === 'all' 
                  ? 'text-gray-900 border-gray-900' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
              onClick={() => setFiltroAtivo('all')}
            >
              <span>Todos Agendados</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {contarEventosPorTipo('all')}
              </span>
            </button>
            <button 
              className={`pb-2 text-sm font-medium border-b-2 flex items-center space-x-2 ${
                filtroAtivo === 'events' 
                  ? 'text-gray-900 border-gray-900' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
              onClick={() => setFiltroAtivo('events')}
            >
              <span>Eventos</span>
              <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
                {contarEventosPorTipo('events')}
              </span>
            </button>
            <button 
              className={`pb-2 text-sm font-medium border-b-2 flex items-center space-x-2 ${
                filtroAtivo === 'meetings' 
                  ? 'text-gray-900 border-gray-900' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
              onClick={() => setFiltroAtivo('meetings')}
            >
              <span>Reuniões</span>
              <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs">
                {contarEventosPorTipo('meetings')}
              </span>
            </button>
            <button 
              className={`pb-2 text-sm font-medium border-b-2 flex items-center space-x-2 ${
                filtroAtivo === 'classes' 
                  ? 'text-gray-900 border-gray-900' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
              onClick={() => setFiltroAtivo('classes')}
            >
              <span>Aulas</span>
              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                {contarEventosPorTipo('classes')}
              </span>
            </button>
            <button 
              className={`pb-2 text-sm font-medium border-b-2 flex items-center space-x-2 ${
                filtroAtivo === 'holidays' 
                  ? 'text-gray-900 border-gray-900' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
              onClick={() => setFiltroAtivo('holidays')}
            >
              <span>Feriados</span>
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                {contarEventosPorTipo('holidays')}
              </span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {/* Busca Inteligente */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Buscar eventos, professores, cursos..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
              {buscaTexto && (
                <button
                  onClick={() => setBuscaTexto('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <button 
              onClick={() => setShowFiltrosModal(true)}
              className="flex items-center px-3 py-2 text-gray-600 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filtros
            </button>
            
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {meses[dataAtual.getMonth()]} {dataAtual.getFullYear()}
            </h2>
            <button
              onClick={irParaHoje}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              Hoje
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => navegarPeriodo('anterior')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => navegarPeriodo('proximo')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setVisualizacao('day')}
                className={`px-3 py-1 text-sm rounded ${
                  visualizacao === 'day' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'
                }`}
              >
                Dia
              </button>
              <button
                onClick={() => setVisualizacao('week')}
                className={`px-3 py-1 text-sm rounded ${
                  visualizacao === 'week' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setVisualizacao('month')}
                className={`px-3 py-1 text-sm rounded ${
                  visualizacao === 'month' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'
                }`}
              >
                Mês
              </button>
            </div>

            <div className="text-sm text-gray-600">
              {visualizacao === 'month' ? (
                `${meses[dataAtual.getMonth()]} ${dataAtual.getFullYear()}`
              ) : (
                (() => {
                  const diasSemana = obterSemanaAtual();
                  return `${diasSemana[0].getDate()} ${meses[diasSemana[0].getMonth()].substring(0, 3)} - ${diasSemana[6].getDate()} ${meses[diasSemana[6].getMonth()].substring(0, 3)} ${diasSemana[6].getFullYear()}`;
                })()
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Views */}
      {visualizacao === 'week' && renderVisualizacaoSemana()}
      {visualizacao === 'month' && renderVisualizacaoMes()}
      {visualizacao === 'day' && renderVisualizacaoSemana()}

      {/* Modal Novo/Editar Evento - Com Eventos Recorrentes */}
      {showEventoModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {editandoEvento ? 'Editar Evento' : 'Criar Novo Evento'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editandoEvento ? 'Atualize as informações do evento' : 'Preencha os detalhes do seu evento'}
                  </p>
                </div>
                <button
                  onClick={() => setShowEventoModal(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:scale-105"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Título */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Título do Evento *
                  </label>
                  <input
                    type="text"
                    value={novoEvento.titulo}
                    onChange={(e) => setNovoEvento(prev => ({ ...prev, titulo: e.target.value }))}
                    className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder-gray-400"
                    placeholder="Ex: Reunião de planejamento, Aula de JavaScript..."
                  />
                </div>

                {/* Tipo - Cards visuais */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de Evento</label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {tiposEvento.map((tipo) => (
                      <button
                        key={tipo.value}
                        type="button"
                        onClick={() => setNovoEvento(prev => ({ ...prev, tipo: tipo.value as any }))}
                        className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                          novoEvento.tipo === tipo.value
                            ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg mx-auto mb-2 ${tipo.cor} flex items-center justify-center`}>
                          {tipo.value === 'aula' && <BookOpen className="w-4 h-4 text-white" />}
                          {tipo.value === 'reuniao' && <Users className="w-4 h-4 text-white" />}
                          {tipo.value === 'evento' && <Calendar className="w-4 h-4 text-white" />}
                          {tipo.value === 'feriado' && <Clock className="w-4 h-4 text-white" />}
                        </div>
                        <span className={`text-sm font-medium ${
                          novoEvento.tipo === tipo.value ? 'text-blue-700' : 'text-gray-700'
                        }`}>
                          {tipo.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Data e Horário */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Data *</label>
                    <input
                      type="date"
                      value={novoEvento.data}
                      onChange={(e) => setNovoEvento(prev => ({ ...prev, data: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Início *</label>
                    <input
                      type="time"
                      value={novoEvento.horaInicio}
                      onChange={(e) => setNovoEvento(prev => ({ ...prev, horaInicio: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fim *</label>
                    <input
                      type="time"
                      value={novoEvento.horaFim}
                      onChange={(e) => setNovoEvento(prev => ({ ...prev, horaFim: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Evento Recorrente */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <input
                      type="checkbox"
                      id="recorrente"
                      checked={novoEvento.recorrente}
                      onChange={(e) => setNovoEvento(prev => ({ ...prev, recorrente: e.target.checked }))}
                      className="w-5 h-5 text-purple-600 bg-gray-100 border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label htmlFor="recorrente" className="flex items-center text-sm font-semibold text-purple-900 cursor-pointer">
                      <Repeat className="w-5 h-5 mr-2" />
                      Evento Recorrente
                    </label>
                  </div>

                  {novoEvento.recorrente && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-purple-700 mb-2">Repetir</label>
                        <select
                          value={novoEvento.padraoRecorrencia}
                          onChange={(e) => setNovoEvento(prev => ({ ...prev, padraoRecorrencia: e.target.value as any }))}
                          className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all bg-white"
                        >
                          <option value="diario">Diariamente</option>
                          <option value="semanal">Semanalmente</option>
                          <option value="mensal">Mensalmente</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-purple-700 mb-2">Terminar em</label>
                        <input
                          type="date"
                          value={novoEvento.fimRecorrencia}
                          onChange={(e) => setNovoEvento(prev => ({ ...prev, fimRecorrencia: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {novoEvento.recorrente && (
                    <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                        <div className="text-sm text-purple-700">
                          <p className="font-medium">Evento será repetido:</p>
                          <p>
                            {novoEvento.padraoRecorrencia === 'diario' && 'Todos os dias'}
                            {novoEvento.padraoRecorrencia === 'semanal' && 'Todas as semanas no mesmo dia'}
                            {novoEvento.padraoRecorrencia === 'mensal' && 'Todos os meses no mesmo dia'}
                            {novoEvento.fimRecorrencia && ` até ${formatarData(novoEvento.fimRecorrencia)}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Campos condicionais para aulas */}
                {novoEvento.tipo === 'aula' && (
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Detalhes da Aula
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-blue-700 mb-2">Professor</label>
                        <select
                          value={novoEvento.professorId}
                          onChange={(e) => setNovoEvento(prev => ({ ...prev, professorId: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                        >
                          <option value="">Selecionar professor</option>
                          {professores.map((professor) => (
                            <option key={professor.id} value={professor.id}>
                              {professor.nome}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-700 mb-2">Curso</label>
                        <select
                          value={novoEvento.cursoId}
                          onChange={(e) => setNovoEvento(prev => ({ ...prev, cursoId: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                        >
                          <option value="">Selecionar curso</option>
                          {cursos.map((curso) => (
                            <option key={curso.id} value={curso.id}>
                              {curso.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Local */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Local
                  </label>
                  <input
                    type="text"
                    value={novoEvento.sala}
                    onChange={(e) => setNovoEvento(prev => ({ ...prev, sala: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder-gray-400"
                    placeholder="Ex: Sala 101, Laboratório, Auditório..."
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Observações</label>
                  <textarea
                    value={novoEvento.descricao}
                    onChange={(e) => setNovoEvento(prev => ({ ...prev, descricao: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none placeholder-gray-400"
                    rows={4}
                    placeholder="Adicione detalhes importantes sobre o evento..."
                  />
                </div>

                {/* Seletor de cores funcional */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Cor do Evento</label>
                  <div className="flex space-x-3">
                    {coresEvento.map((cor) => (
                      <button
                        key={cor.value}
                        type="button"
                        onClick={() => setCorSelecionada(cor.value)}
                        className={`w-10 h-10 rounded-full ${cor.value} border-4 hover:scale-110 transition-all shadow-lg hover:shadow-xl ${
                          corSelecionada === cor.value ? 'border-gray-600' : 'border-white'
                        }`}
                        title={cor.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                * Campos obrigatórios
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowEventoModal(false)}
                  className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-200 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarEvento}
                  disabled={!novoEvento.titulo || !novoEvento.data || !novoEvento.horaInicio || !novoEvento.horaFim}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editandoEvento ? 'Atualizar Evento' : 'Criar Evento'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes do Evento */}
      {showDetalhesModal && eventoSelecionado && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Detalhes do Evento</h3>
              <button
                onClick={() => setShowDetalhesModal(false)}
                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 text-lg flex items-center">
                  {eventoSelecionado.recorrente && <Repeat className="w-5 h-5 mr-2 text-purple-600" />}
                  {eventoSelecionado.titulo}
                </h4>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white mt-2 ${eventoSelecionado.cor}`}>
                  {tiposEvento.find(t => t.value === eventoSelecionado.tipo)?.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatarData(eventoSelecionado.data)}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatarHora(eventoSelecionado.horaInicio)} - {formatarHora(eventoSelecionado.horaFim)}
                </div>
              </div>

              {eventoSelecionado.sala && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {eventoSelecionado.sala}
                </div>
              )}

              {eventoSelecionado.professorNome && (
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  Professor: {eventoSelecionado.professorNome}
                </div>
              )}

              {eventoSelecionado.cursoNome && (
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Curso: {eventoSelecionado.cursoNome}
                </div>
              )}

              {eventoSelecionado.recorrente && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex items-center text-sm text-purple-700">
                    <Repeat className="w-4 h-4 mr-2" />
                    <span className="font-medium">
                      Repete {eventoSelecionado.padraoRecorrencia === 'diario' ? 'diariamente' : 
                             eventoSelecionado.padraoRecorrencia === 'semanal' ? 'semanalmente' : 
                             eventoSelecionado.padraoRecorrencia === 'mensal' ? 'mensalmente' : 'anualmente'}
                    </span>
                  </div>
                  {eventoSelecionado.fimRecorrencia && (
                    <div className="text-xs text-purple-600 mt-1">
                      Até {formatarData(eventoSelecionado.fimRecorrencia)}
                    </div>
                  )}
                </div>
              )}

              {eventoSelecionado.descricao && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Descrição:</label>
                  <p className="text-sm text-gray-600 mt-1">{eventoSelecionado.descricao}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowDetalhesModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Fechar
              </button>
              
              <button
                onClick={() => {
                  setNovoEvento({
                    titulo: eventoSelecionado.titulo,
                    descricao: eventoSelecionado.descricao || '',
                    data: eventoSelecionado.data,
                    horaInicio: eventoSelecionado.horaInicio,
                    horaFim: eventoSelecionado.horaFim,
                    professorId: eventoSelecionado.professorId || '',
                    cursoId: eventoSelecionado.cursoId || '',
                    sala: eventoSelecionado.sala || '',
                    tipo: eventoSelecionado.tipo,
                    recorrente: eventoSelecionado.recorrente || false,
                    padraoRecorrencia: eventoSelecionado.padraoRecorrencia || 'semanal',
                    fimRecorrencia: eventoSelecionado.fimRecorrencia || ''
                  });
                  setCorSelecionada(eventoSelecionado.cor);
                  setEditandoEvento(eventoSelecionado);
                  setShowDetalhesModal(false);
                  setShowEventoModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Editar
              </button>

              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/calendario/eventos/${eventoSelecionado.id}`, {
                      method: 'DELETE'
                    });

                    if (response.ok) {
                      fetchDados();
                      setShowDetalhesModal(false);
                      
                      await fetch('/api/notificacoes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          titulo: 'Evento Excluído',
                          mensagem: 'Evento foi removido do calendário',
                          tipo: 'calendario'
                        })
                      });
                    }
                  } catch (error) {
                    console.error('Erro ao excluir evento:', error);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Filtros Avançados */}
      {showFiltrosModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Filtros Avançados</h3>
              <button
                onClick={() => setShowFiltrosModal(false)}
                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Professor</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Todos os professores</option>
                  {professores.map((professor) => (
                    <option key={professor.id} value={professor.id}>
                      {professor.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Curso</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Todos os cursos</option>
                  {cursos.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Data inicial"
                  />
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Data final"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Opções</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded" />
                    <span className="ml-2 text-sm">Apenas eventos recorrentes</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded" />
                    <span className="ml-2 text-sm">Eventos sem professor</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded" />
                    <span className="ml-2 text-sm">Eventos sem sala</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowFiltrosModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={() => {
                  // Aplicar filtros avançados aqui
                  setShowFiltrosModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de drag and drop */}
      {eventoDragando && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Arraste para reagendar: {eventoDragando.titulo}</span>
        </div>
      )}

      {/* Resultados da busca */}
      {buscaTexto && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-40">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">Resultados da Busca</h4>
            <button
              onClick={() => setBuscaTexto('')}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            {eventosFiltrados.length} evento(s) encontrado(s)
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {eventosFiltrados.slice(0, 5).map((evento) => (
              <div
                key={evento.id}
                className="p-2 border border-gray-100 rounded cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  setEventoSelecionado(evento);
                  setShowDetalhesModal(true);
                  setBuscaTexto('');
                }}
              >
                <div className="font-medium text-sm">{evento.titulo}</div>
                <div className="text-xs text-gray-500">
                  {formatarData(evento.data)} • {formatarHora(evento.horaInicio)}
                </div>
              </div>
            ))}
            {eventosFiltrados.length > 5 && (
              <div className="text-xs text-gray-500 text-center py-1">
                +{eventosFiltrados.length - 5} mais resultados...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}