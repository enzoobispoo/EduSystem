"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  BookOpen, 
  UserCheck, 
  DollarSign,
  FileBarChart, 
  Settings,
  Search,
  User,
  ChevronLeft
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Cursos", href: "/cursos", icon: BookOpen },
  { name: "Alunos", href: "/alunos", icon: Users },
  { name: "Professores", href: "/professores", icon: UserCheck },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign },
  { name: "Relatórios", href: "/relatorios", icon: FileBarChart }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`${collapsed ? 'w-16' : 'w-56'} bg-white border-r border-gray-200 min-h-screen flex flex-col shadow-sm transition-all duration-300`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">TechPlay</h1>
                <p className="text-xs text-gray-500">Gestão Educacional</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 text-gray-500 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Pesquisar..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? "bg-blue-50 text-blue-700 border border-blue-200" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.name : ''}
              >
                <item.icon className={`w-4 h-4 transition-colors ${
                  isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                }`} />
                {!collapsed && item.name}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Quick Stats */}
      {!collapsed && (
        <div className="p-3 border-t border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
            <h3 className="text-xs font-semibold text-gray-900 mb-2">Resumo</h3>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Alunos</span>
                <span className="text-xs font-semibold text-blue-600">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Cursos</span>
                <span className="text-xs font-semibold text-green-600">1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Receita</span>
                <span className="text-xs font-semibold text-emerald-600">R$ 1.2k</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className="p-3 border-t border-gray-200">
        <div className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Gestor</p>
              <p className="text-xs text-gray-500 truncate">admin@edu.com</p>
            </div>
          )}
          {!collapsed && <Settings className="w-3 h-3 text-gray-400" />}
        </div>
      </div>
    </div>
  );
}