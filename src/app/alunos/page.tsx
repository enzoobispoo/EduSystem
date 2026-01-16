"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, User, X, Clock, Check } from "lucide-react";
import { maskCPF, maskPhone, applyMask } from "@/lib/masks";
import DeleteModal from "@/components/DeleteModal";

interface Aluno {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
    cpf: string;
    status: string;
    createdAt: string;
    matriculas: {
      id: string;
      status: string;
      curso: {
        id: string;
        nome: string;
        valor: number;
      }
    }[];
  }

export default function AlunosPage() {
  const [showModal, setShowModal] = useState(false);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategorias, setShowCategorias] = useState(false);
  const [cursos, setCursos] = useState<any[]>([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, aluno: null as any });
  const [editModal, setEditModal] = useState({ isOpen: false, aluno: null as any });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedCursos, setSelectedCursos] = useState<string[]>([]);

  useEffect(() => {
    fetchAlunos();
    fetchCursos();
  }, []);

  const fetchAlunos = async () => {
    try {
      const response = await fetch('/api/alunos');
      const data = await response.json();
      setAlunos(data);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoboticaChange = (checked: boolean) => {
    setShowCategorias(checked);
  };

  const handleCursoChange = (cursoId: string, checked: boolean) => {
    if (checked) {
      setSelectedCursos(prev => [...prev, cursoId]);
    } else {
      setSelectedCursos(prev => prev.filter(id => id !== cursoId));
      // Se desmarcou um curso de robótica, verificar se ainda há algum selecionado
      const curso = cursos.find(c => c.id === cursoId);
      if (curso?.tipo === 'Robotica') {
        const outrosRoboticaSelecionados = selectedCursos.some(id => {
          const c = cursos.find(curso => curso.id === id);
          return c?.tipo === 'Robotica' && id !== cursoId;
        });
        if (!outrosRoboticaSelecionados) {
          setShowCategorias(false);
        }
      }
    }
  };
  
  const getResumoMatricula = () => {
    const cursosInfo = cursos.filter(curso => selectedCursos.includes(curso.id));
    const total = cursosInfo.reduce((sum, curso) => sum + parseFloat(curso.valor), 0);
    
    return {
      quantidade: cursosInfo.length,
      total: total,
      cursos: cursosInfo
    };
  };
  

  const handleDelete = async () => {
    if (!deleteModal.aluno) return;
    
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/alunos/${deleteModal.aluno.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setDeleteModal({ isOpen: false, aluno: null });
        fetchAlunos();
      } else {
        alert('Erro ao excluir aluno');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir aluno');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setEditLoading(true);
    try {
      const response = await fetch(`/api/alunos/${editModal.aluno.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.get('nome'),
          email: formData.get('email'),
          telefone: formData.get('telefone'),
          cpf: formData.get('cpf')
        })
      });
      
      if (response.ok) {
        setEditModal({ isOpen: false, aluno: null });
        fetchAlunos();
      } else {
        alert('Erro ao atualizar aluno');
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao atualizar aluno');
    } finally {
      setEditLoading(false);
    }
  };

const fetchCursos = async () => {
  try {
    const response = await fetch('/api/cursos');
    const data = await response.json();
    setCursos(data);
  } catch (error) {
    console.error('Erro ao carregar cursos:', error);
  }
};

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Coletar cursos selecionados
    const cursosCheckboxes = e.currentTarget.querySelectorAll('input[name="cursos"]:checked') as NodeListOf<HTMLInputElement>;
    const cursosSelecionados = Array.from(cursosCheckboxes).map(checkbox => checkbox.value);
    
    // Coletar categorias selecionadas (se houver)
    const categoriasCheckboxes = e.currentTarget.querySelectorAll('input[name="categorias"]:checked') as NodeListOf<HTMLInputElement>;
    const categoriasSelecionadas = Array.from(categoriasCheckboxes).map(checkbox => checkbox.value);
    
    // Validar se pelo menos um curso foi selecionado
    if (cursosSelecionados.length === 0) {
      alert('Selecione pelo menos um curso para matricular o aluno');
      return;
    }
    
    try {
      const response = await fetch('/api/alunos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.get('nome'),
          email: formData.get('email'),
          telefone: formData.get('telefone'),
          cpf: formData.get('cpf'),
          cursos: cursosSelecionados,
          categorias: categoriasSelecionadas,
          statusPagamento: formData.get('statusPagamento') || 'Pendente'
        })
      });
      
      if (response.ok) {
        setShowModal(false);
        setSelectedCursos([]); // ADICIONE ESTA LINHA
        setShowCategorias(false);
        fetchAlunos();
        (e.target as HTMLFormElement).reset();
      } else {
        const errorData = await response.json();
        console.error('Erro do servidor:', errorData);
        alert('Erro ao cadastrar aluno: ' + (errorData.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao criar aluno:', error);
      alert('Erro de conexão ao cadastrar aluno');
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Saudação e título na área principal */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Alunos</h1>
        <p className="text-gray-600 mt-1">Matricule e gerencie alunos do sistema</p>
      </div>

      {/* Botão */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Novo Aluno
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <p>Carregando alunos...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">ALUNO</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">CONTATO</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">CURSO</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">DATA MATRÍCULA</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alunos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 px-6 text-center text-gray-500">
                    Nenhum aluno cadastrado
                  </td>
                </tr>
              ) : (
                alunos.map((aluno) => (
                  <tr key={aluno.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{aluno.nome}</div>
                        <div className="text-xs text-gray-500">ID: {aluno.id.slice(0, 8)}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">{aluno.email}</div>
                      {aluno.telefone && (
                        <div className="text-sm text-gray-500">{aluno.telefone}</div>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{aluno.cpf}</div>
                    </td>
                    <td className="py-4 px-6">
  <div className="text-sm text-gray-900">
    {aluno.matriculas.length === 0 ? (
      <span className="text-gray-500">Nenhum curso</span>
    ) : (
      <div className="space-y-1">
        {aluno.matriculas.map((matricula) => (
          <div key={matricula.id} className="flex items-center gap-2">
            <span className="font-medium">{matricula.curso.nome}</span>
            <span className={`px-1.5 py-0.5 text-xs rounded-full ${
              matricula.status === 'Pago' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {matricula.status}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                            {new Date().toLocaleDateString('pt-BR')}
                        </div>
                        </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ativo
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setEditModal({ isOpen: true, aluno })}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, aluno })}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Aluno - Design Original */}
{showModal && (
  <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Novo Aluno</h2>
              <p className="text-sm text-gray-600">Matricule um novo aluno no sistema</p>
            </div>
          </div>
          <button
  onClick={() => {
    setShowModal(false);
    setSelectedCursos([]);
    setShowCategorias(false);
  }}
  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
>
  <X className="w-5 h-5 text-gray-500" />
</button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Coluna Esquerda - Dados Pessoais */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                <h3 className="font-semibold text-gray-900">Dados Pessoais</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="nome"
                  required
                  placeholder="Ex: Maria Silva"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="maria@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  placeholder="(11) 99999-9999"
                  onChange={(e) => applyMask(e, maskPhone)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF *
                </label>
                <input
                  type="text"
                  name="cpf"
                  required
                  placeholder="000.000.000-00"
                  maxLength={14}
                  onChange={(e) => applyMask(e, maskCPF)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
            </div>

            {/* Coluna Direita - Cursos e Status */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <h3 className="font-semibold text-gray-900">Cursos</h3>
              </div>

              {/* Seleção de Cursos */}
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Selecione os Cursos *
  </label>
  <div className="space-y-2">
    {cursos.length === 0 ? (
      <div className="text-center py-4 text-gray-500 text-sm">
        Nenhum curso disponível
      </div>
    ) : (
      cursos.map((curso) => (
        <div key={curso.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="cursos"
              value={curso.id}
              onChange={(e) => {
                const checked = e.target.checked;
                handleCursoChange(curso.id, checked);
                if (curso.tipo === 'Robotica' && checked) {
                  setShowCategorias(true);
                }
              }}
              className="mt-1 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900 text-sm">{curso.nome}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  R$ {parseFloat(curso.valor).toFixed(2)}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {curso.tipo}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  {new Date(curso.dataInicio).toLocaleDateString('pt-BR')} - {new Date(curso.dataFim).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </label>
        </div>
      ))
    )}
  </div>
  <p className="text-xs text-gray-600 mt-2">
    Selecione pelo menos um curso para matricular o aluno
  </p>
</div>

              {showCategorias && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categorias de Robótica
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    <label className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        name="categorias"
                        value="Inventors"
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm">Inventors</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        name="categorias"
                        value="Creators"
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm">Creators</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        name="categorias"
                        value="Coding"
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm">Coding</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Selecione as categorias específicas de robótica</p>
                </div>
              )}

              {/* Status do Pagamento */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Status do Pagamento *
  </label>
  <div className="grid grid-cols-2 gap-2">
    <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
      <input
        type="radio"
        name="statusPagamento"
        value="Pendente"
        defaultChecked
        className="text-teal-600 focus:ring-teal-500"
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">Pendente</span>
        <span className="text-xs text-gray-500">Aguardando pagamento</span>
      </div>
    </label>
    <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
      <input
        type="radio"
        name="statusPagamento"
        value="Pago"
        className="text-teal-600 focus:ring-teal-500"
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">Pago</span>
        <span className="text-xs text-gray-500">Pagamento confirmado</span>
      </div>
    </label>
  </div>
</div>

              

              {/* Resumo da Matrícula - Dinâmico */}
<div className="bg-gray-50 rounded-lg p-4">
  <h4 className="font-medium text-gray-900 text-sm mb-2">Resumo da Matrícula</h4>
  <div className="space-y-2 text-xs">
    <div className="flex justify-between">
      <span className="text-gray-600">Total de cursos:</span>
      <span className="font-medium">{getResumoMatricula().quantidade} selecionados</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600">Valor total:</span>
      <span className="font-medium">R$ {getResumoMatricula().total.toFixed(2)}</span>
    </div>
    {getResumoMatricula().cursos.length > 0 && (
      <div className="mt-2 pt-2 border-t border-gray-200">
        <span className="text-gray-600 text-xs">Cursos selecionados:</span>
        <div className="mt-1">
          {getResumoMatricula().cursos.map((curso) => (
            <div key={curso.id} className="flex justify-between items-center py-1">
              <span className="text-xs text-gray-700">{curso.nome}</span>
              <span className="text-xs font-medium text-green-600">R$ {parseFloat(curso.valor).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
</div>
            </div>
          </div>
        </div>

        {/* Footer Fixo */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
          <div className="flex gap-3">
          <button
  type="button"
  onClick={() => {
    setShowModal(false);
    setSelectedCursos([]);
    setShowCategorias(false);
  }}
  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
>
  Cancelar
</button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:from-teal-600 hover:to-blue-700 transition-all font-medium shadow-sm"
            >
              Matricular Aluno
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
)}

{/* Modal de Exclusão */}
<DeleteModal
  isOpen={deleteModal.isOpen}
  onClose={() => setDeleteModal({ isOpen: false, aluno: null })}
  onConfirm={handleDelete}
  title="Excluir Aluno"
  message="Tem certeza que deseja excluir este aluno?"
  itemName={deleteModal.aluno?.nome || ""}
  loading={deleteLoading}
/>

{/* Modal de Edição */}
{editModal.isOpen && (
  <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Editar Aluno</h2>
              <p className="text-sm text-gray-600">Atualize as informações do aluno</p>
            </div>
          </div>
          <button
            onClick={() => setEditModal({ isOpen: false, aluno: null })}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <form onSubmit={handleEdit}>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                <h3 className="font-semibold text-gray-900">Dados Pessoais</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="nome"
                  required
                  defaultValue={editModal.aluno?.nome}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={editModal.aluno?.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  defaultValue={editModal.aluno?.telefone}
                  onChange={(e) => applyMask(e, maskPhone)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF *
                </label>
                <input
                  type="text"
                  name="cpf"
                  required
                  defaultValue={editModal.aluno?.cpf}
                  maxLength={14}
                  onChange={(e) => applyMask(e, maskCPF)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <h3 className="font-semibold text-gray-900">Informações</h3>
              </div>

              <div className="bg-teal-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 text-sm mb-2">📝 Alterações</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium text-teal-600">Editando</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Matrículas:</span>
                    <span className="font-medium">{editModal.aluno?.matriculas?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setEditModal({ isOpen: false, aluno: null })}
              disabled={editLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={editLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all font-medium shadow-sm disabled:opacity-50"
            >
              {editLoading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}