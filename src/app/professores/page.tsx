"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, User, DollarSign, Clock, X } from "lucide-react";
import { maskCPF, maskPhone, applyMask } from "@/lib/masks";
import DeleteModal from "@/components/DeleteModal";


interface Professor {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf: string;
  valorHora?: number;
  valorAluno?: number;
  tipoPagamento: string;
  status: string;
}

export default function ProfessoresPage() {
  const [showModal, setShowModal] = useState(false);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, professor: null as Professor | null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, professor: null as Professor | null });
  const [editLoading, setEditLoading] = useState(false);

  // Carregar professores
  useEffect(() => {
    fetchProfessores();
  }, []);

  const fetchProfessores = async () => {
    try {
      const response = await fetch('/api/professores');
      const data: Professor[] = await response.json();
      setProfessores(data);
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setEditLoading(true);
    try {
      const response = await fetch(`/api/professores/${editModal.professor?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.get('nome'),
          email: formData.get('email'),
          telefone: formData.get('telefone'),
          cpf: formData.get('cpf'),
          valorAluno: Number(formData.get('valorAluno')),      //
          tipoPagamento: 'Por Aluno'
        })
      });
      
      if (response.ok) {
        setEditModal({ isOpen: false, professor: null });
        fetchProfessores();
      } else {
        alert('Erro ao atualizar professor');
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao atualizar professor');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.professor) return;
    
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/professores/${deleteModal.professor.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setDeleteModal({ isOpen: false, professor: null });
        fetchProfessores(); // Recarregar lista
      } else {
        alert('Erro ao excluir professor');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir professor');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Criar professor
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('/api/professores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.get('nome'),
          email: formData.get('email'),
          telefone: formData.get('telefone'),
          cpf: formData.get('cpf'),
          valorAluno: Number(formData.get('valorAluno')),    //
          tipoPagamento: 'Por Aluno'
        })
      });
      
      if (response.ok) {
        setShowModal(false);
        fetchProfessores(); // Recarregar lista
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      console.error('Erro ao criar professor:', error);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Saudação e título na área principal */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Professores</h1>
        <p className="text-gray-600 mt-1">Cadastre e gerencie professores do sistema</p>
      </div>
  
      {/* Botão */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Novo Professor
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <p>Carregando professores...</p>
        </div>
      ) : (
        /* Table */
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">PROFESSOR</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">VALOR/ALUNO</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">HORAS MÊS</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">COMISSÃO</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS PAGAMENTO</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {professores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-6 text-center text-gray-500">
                    Nenhum professor cadastrado
                  </td>
                </tr>
              ) : (
                professores.map((professor) => (
                  <tr key={professor.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{professor.nome}</div>
                        <div className="text-sm text-gray-500">{professor.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        R$ {professor.valorAluno || professor.valorHora || 0}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">0h</div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">R$ 0</div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        pago
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setEditModal({ isOpen: true, professor })}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, professor })}
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

      

      {/* Modal de Exclusão */}
<DeleteModal
  isOpen={deleteModal.isOpen}
  onClose={() => setDeleteModal({ isOpen: false, professor: null })}
  onConfirm={handleDelete}
  title="Excluir Professor"
  message="Tem certeza que deseja excluir este professor?"
  itemName={deleteModal.professor?.nome || ""}
  loading={deleteLoading}
/>

{/* Modal de Cadastro */}
{showModal && (
  <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Novo Professor</h2>
              <p className="text-sm text-gray-600">Complete as informações abaixo</p>
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
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <h3 className="font-semibold text-gray-900">Dados Pessoais</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  name="nome"
                  required
                  placeholder="João Silva"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="joao@escola.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    name="telefone"
                    placeholder="(11) 99999-9999"
                    onChange={(e) => applyMask(e, maskPhone)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                  <input
                    type="text"
                    name="cpf"
                    required
                    placeholder="000.000.000-00"
                    maxLength={14}
                    onChange={(e) => applyMask(e, maskCPF)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <h3 className="font-semibold text-gray-900">Configurações</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor por Aluno *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                  <input
                    type="number"
                    name="valorAluno"
                    step="0.01"
                    placeholder="50.00"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-sm"
            >
              Cadastrar Professor
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
)}

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
              <h2 className="text-xl font-bold text-gray-900">Editar Professor</h2>
              <p className="text-sm text-gray-600">Atualize as informações do professor</p>
            </div>
          </div>
          <button
            onClick={() => setEditModal({ isOpen: false, professor: null })}
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
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <h3 className="font-semibold text-gray-900">Dados Pessoais</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  name="nome"
                  required
                  defaultValue={editModal.professor?.nome}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={editModal.professor?.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    name="telefone"
                    defaultValue={editModal.professor?.telefone}
                    onChange={(e) => applyMask(e, maskPhone)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                  <input
                    type="text"
                    name="cpf"
                    required
                    defaultValue={editModal.professor?.cpf}
                    maxLength={14}
                    onChange={(e) => applyMask(e, maskCPF)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <h3 className="font-semibold text-gray-900">Configurações</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor por Aluno *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                  <input
                    type="number"
                    name="valorAluno"
                    step="0.01"
                    defaultValue={editModal.professor?.valorAluno}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setEditModal({ isOpen: false, professor: null })}
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