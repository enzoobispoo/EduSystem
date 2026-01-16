"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, BookOpen, X, Eye } from "lucide-react";
import DeleteModal from "@/components/DeleteModal";
import TopBar from "@/components/TopBar";

interface Curso {
  id: string;
  nome: string;
  descricao?: string;
  valor: number | string;
  dataInicio: string;
  dataFim: string;
  status: string;
  matriculas: any[];
}

export default function CursosPage() {
  const [showModal, setShowModal] = useState(false);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, curso: null as any });
  const [editModal, setEditModal] = useState({ isOpen: false, curso: null as any });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const topBarActions = (
    <button 
      onClick={() => setShowModal(true)}
      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
    >
      <Plus className="w-4 h-4" />
      Novo Curso
    </button>
  );

  useEffect(() => {
    fetchCursos();
  }, []);

  const fetchCursos = async () => {
    try {
      const response = await fetch('/api/cursos');
      const data = await response.json();
      setCursos(data);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.curso) return;
    
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/cursos/${deleteModal.curso.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setDeleteModal({ isOpen: false, curso: null });
        fetchCursos();
      } else {
        alert('Erro ao excluir curso');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir curso');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setEditLoading(true);
    try {
      const response = await fetch(`/api/cursos/${editModal.curso.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.get('nome'),
          descricao: formData.get('descricao'),
          valor: formData.get('valor'),
          tipo: formData.get('tipo') || "Robótica",
          dataInicio: formData.get('dataInicio'),
          dataFim: formData.get('dataFim')
        })
      });
      
      if (response.ok) {
        setEditModal({ isOpen: false, curso: null });
        fetchCursos();
      } else {
        alert('Erro ao atualizar curso');
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao atualizar curso');
    } finally {
      setEditLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('/api/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.get('nome'),
          descricao: formData.get('descricao'),
          valor: formData.get('valor'),
          dataInicio: formData.get('dataInicio'),
          dataFim: formData.get('dataFim')
        })
      });
      
      if (response.ok) {
        setShowModal(false);
        fetchCursos();
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      console.error('Erro ao criar curso:', error);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Saudação e título */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Cursos</h1>
        <p className="text-gray-600 mt-1">Crie e gerencie cursos da plataforma</p>
      </div>
  
      {/* Botão */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Novo Curso
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <p>Carregando cursos...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">CURSO</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">ALUNOS</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">PERÍODO</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">VALOR</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cursos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-6 text-center text-gray-500">
                    Nenhum curso cadastrado
                  </td>
                </tr>
              ) : (
                cursos.map((curso) => (
                  <tr key={curso.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{curso.nome}</div>
                        <div className="text-sm text-gray-500">{curso.descricao}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{curso.matriculas?.length || 0}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">
                        {new Date(curso.dataInicio).toLocaleDateString('pt-BR')} - {new Date(curso.dataFim).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
  R$ {typeof curso.valor === 'number' ? curso.valor.toFixed(2) : Number(curso.valor).toFixed(2)}
</div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ativo
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium">
  <div className="flex items-center space-x-2">
    <button 
      onClick={() => setEditModal({ isOpen: true, curso })}
      className="text-blue-600 hover:text-blue-900"
    >
      <Edit className="w-4 h-4" />
    </button>
    <button 
      onClick={() => setDeleteModal({ isOpen: true, curso })}
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

      {/* Modal Curso */}
{showModal && (
  <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Novo Curso</h2>
              <p className="text-sm text-gray-600">Crie um novo curso para a plataforma</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Coluna Esquerda - Informações Básicas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <h3 className="font-semibold text-gray-900">Informações do Curso</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Curso *
                </label>
                <input
                  type="text"
                  name="nome"
                  required
                  placeholder="Ex: Games"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  placeholder="Aulas de Games para desenvolvimento criativo"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor do Curso *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    R$
                  </span>
                  <input
                    type="number"
                    name="valor"
                    step="0.01"
                    required
                    placeholder="1200.00"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Coluna Direita - Datas e Configurações */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <h3 className="font-semibold text-gray-900">Configurações</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Início *
                  </label>
                  <input
                    type="date"
                    name="dataInicio"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Fim *
                  </label>
                  <input
                    type="date"
                    name="dataFim"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
              </div>

              {/* Tipo de Curso */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Curso
                </label>
                <select
                    name="tipo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                >
                    <option value="Games">Games</option>
                    <option value="Robotica">Robótica</option>
                    <option value="Extra Curricular">Extra Curricular</option>
                    <option value="Curricular">Curricular</option>
                </select>
                </div>

              {/* Preview do Curso */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 text-sm mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview do Curso
                </h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium text-green-600">Ativo</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duração:</span>
                    <span className="font-medium">A calcular</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alunos matriculados:</span>
                    <span className="font-medium">0</span>
                  </div>
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
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-sm"
            >
              Criar Curso
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
  onClose={() => setDeleteModal({ isOpen: false, curso: null })}
  onConfirm={handleDelete}
  title="Excluir Curso"
  message="Tem certeza que deseja excluir este curso?"
  itemName={deleteModal.curso?.nome || ""}
  loading={deleteLoading}
/>

{/* Modal de Edição */}
{editModal.isOpen && (
  <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Editar Curso</h2>
              <p className="text-sm text-gray-600">Atualize as informações do curso</p>
            </div>
          </div>
          <button
            onClick={() => setEditModal({ isOpen: false, curso: null })}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <form onSubmit={handleEdit}>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Coluna Esquerda - Informações do Curso */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <h3 className="font-semibold text-gray-900">Informações do Curso</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Curso *
                </label>
                <input
                  type="text"
                  name="nome"
                  required
                  defaultValue={editModal.curso?.nome}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  defaultValue={editModal.curso?.descricao}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor do Curso *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    R$
                  </span>
                  <input
                    type="number"
                    name="valor"
                    step="0.01"
                    required
                    defaultValue={editModal.curso?.valor}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Coluna Direita - Configurações */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <h3 className="font-semibold text-gray-900">Configurações</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Início *
                  </label>
                  <input
                    type="date"
                    name="dataInicio"
                    required
                    defaultValue={editModal.curso?.dataInicio ? new Date(editModal.curso.dataInicio).toISOString().split('T')[0] : ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Fim *
                  </label>
                  <input
                    type="date"
                    name="dataFim"
                    required
                    defaultValue={editModal.curso?.dataFim ? new Date(editModal.curso.dataFim).toISOString().split('T')[0] : ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Curso
                </label>
                <select
                  name="tipo"
                  defaultValue={editModal.curso?.tipo}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                >
                  <option value="Games">Games</option>
                  <option value="Robotica">Robótica</option>
                  <option value="Extra Curricular">Extra Curricular</option>
                  <option value="Curricular">Curricular</option>
                </select>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 text-sm mb-2">📝 Alterações</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium text-green-600">Editando</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alunos matriculados:</span>
                    <span className="font-medium">{editModal.curso?.matriculas?.length || 0}</span>
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
              onClick={() => setEditModal({ isOpen: false, curso: null })}
              disabled={editLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={editLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-sm disabled:opacity-50"
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