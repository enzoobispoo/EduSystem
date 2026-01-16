"use client";

import { Bell, Search, User, Calendar, MessageSquare, X, Check, Trash2, UserPlus, BookOpen, DollarSign, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  actions?: React.ReactNode;
}

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  icone: string;
  cor: string;
  url?: string;
  createdAt: string;
}

export default function TopBar({ title, subtitle, showSearch = true, actions }: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Atualizar notificações a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notificacoes');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notificacoes/${id}`, { method: 'PUT' });
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, lida: true } : notif
        )
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notificacoes/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await fetch('/api/notificacoes/marcar-todas-lidas', { method: 'POST' });
      setNotifications(prev => prev.map(notif => ({ ...notif, lida: true })));
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (icone: string, cor: string) => {
    const iconClass = `w-4 h-4`;
    const colorClass = cor === 'green' ? 'text-green-600' : 
                     cor === 'blue' ? 'text-blue-600' : 
                     cor === 'red' ? 'text-red-600' : 
                     cor === 'yellow' ? 'text-yellow-600' : 
                     cor === 'purple' ? 'text-purple-600' : 
                     'text-gray-600';

    switch (icone) {
      case 'user-plus': return <UserPlus className={`${iconClass} ${colorClass}`} />;
      case 'book-open': return <BookOpen className={`${iconClass} ${colorClass}`} />;
      case 'dollar-sign': return <DollarSign className={`${iconClass} ${colorClass}`} />;
      case 'alert-circle': return <AlertCircle className={`${iconClass} ${colorClass}`} />;
      case 'calendar': return <Calendar className={`${iconClass} ${colorClass}`} />;
      default: return <Bell className={`${iconClass} ${colorClass}`} />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('pt-BR');
  };

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.lida).length : 0;

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-500 truncate mt-0.5">{subtitle}</p>
              )}
            </div>

            {showSearch && (
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Pesquisar alunos, cursos, professores..."
                  className="w-80 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
            <a 
  href="/calendario"
  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
  title="Calendário"
>
  <Calendar className="w-4 h-4" />
</a>

              <button 
                onClick={() => alert('Funcionalidade de Mensagens em desenvolvimento!')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Mensagens"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              {/* Notifications Button */}
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Notificações"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </div>
                )}
              </button>
            </div>

            {actions && (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                {actions}
              </div>
            )}

            <div className="ml-2 pl-2 border-l border-gray-200">
              <button
                onClick={() => alert('Funcionalidade de Perfil em desenvolvimento!')}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                title="Perfil"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute right-4 top-16 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Notificações</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                  {unreadCount}
                </span>
              )}
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Marcando...' : 'Marcar todas como lidas'}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.lida ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => {
                      if (!notification.lida) {
                        markAsRead(notification.id);
                      }
                      if (notification.url) {
                        window.location.href = notification.url;
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        notification.cor === 'green' ? 'bg-green-100' :
                        notification.cor === 'blue' ? 'bg-blue-100' :
                        notification.cor === 'red' ? 'bg-red-100' :
                        notification.cor === 'yellow' ? 'bg-yellow-100' :
                        notification.cor === 'purple' ? 'bg-purple-100' :
                        'bg-gray-100'
                      }`}>
                        {getNotificationIcon(notification.icone, notification.cor)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">
                          {notification.titulo}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.mensagem}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {getTimeAgo(notification.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {!notification.lida && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-700 rounded"
                            title="Marcar como lida"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 text-red-600 hover:text-red-700 rounded"
                          title="Excluir"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}
    </>
  );
}