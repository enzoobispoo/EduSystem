'use client';

import { useState } from 'react';
import { Calendar, DollarSign, X, Loader2 } from 'lucide-react';

interface GerarPagamentosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function GerarPagamentosModal({ isOpen, onClose, onSuccess }: GerarPagamentosModalProps) {
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
        
        // Criar notificação de sucesso
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
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Gerar Pagamentos</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {meses.map((mesNome, index) => (
                    <option key={index} value={index + 1}>
                      {mesNome}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ano</label>
                <select
                  value={ano}
                  onChange={(e) => setAno(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <DollarSign className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Como funciona?</h4>
                <p className="text-sm text-blue-700 mt-1">
                  O sistema irá calcular automaticamente os pagamentos de todos os professores 
                  ativos baseado no tipo de pagamento configurado:
                </p>
                <ul className="text-sm text-blue-700 mt-2 list-disc list-inside">
                  <li><strong>Por Aluno:</strong> Valor por aluno × Alunos atendidos</li>
                  <li><strong>Por Hora:</strong> Valor por hora × Horas trabalhadas</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900">Atenção</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Período selecionado: <strong>{meses[mes - 1]} {ano}</strong>
                </p>
                <p className="text-sm text-yellow-700">
                  Pagamentos já existentes para este período não serão duplicados.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleGerarPagamentos}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Gerar Pagamentos
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}