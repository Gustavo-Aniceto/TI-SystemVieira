import React, { useState } from 'react';
import { useData }  from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { StickyNote, Plus, Edit, Trash2, X, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Note } from '../types';

interface ChecklistEntry {
  text: string;
  completed: boolean;
}

interface NoteFormData {
  title: string;
  content: string;
  type: 'note' | 'checklist';
  color: string;
  isPublic: boolean;
  checklistItems: ChecklistEntry[];
}

// Listas de tarefas são guardadas em `conteudo` como linhas "[ ] item" / "[x] item"
const CHECKLIST_LINE = /^\[( |x)\] (.*)$/;

const parseChecklist = (content: string): ChecklistEntry[] | null => {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0 || !lines.every(line => CHECKLIST_LINE.test(line))) return null;
  return lines.map(line => {
    const [, mark, text] = line.match(CHECKLIST_LINE)!;
    return { text, completed: mark === 'x' };
  });
};

const serializeChecklist = (items: ChecklistEntry[]) =>
  items.map(item => `[${item.completed ? 'x' : ' '}] ${item.text}`).join('\n');

const emptyForm = (): NoteFormData => ({
  title: '',
  content: '',
  type: 'note',
  color: '#ffffff',
  isPublic: false,
  checklistItems: [],
});

const Notes = () => {
  const { notes, users, addNote, updateNote, deleteNote } = useData();
  const { user, isAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentNote, setCurrentNote] = useState<number | null>(null);
  const [showOnlyMine, setShowOnlyMine] = useState(!isAdmin);
  const [formData, setFormData] = useState<NoteFormData>(emptyForm);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Usuários veem as próprias anotações e as públicas; admin pode ver todas
  const filteredNotes = notes.filter(note => {
    if (isAdmin && !showOnlyMine) return true;
    return note.criado_por === user?.id || note.tornar_publico;
  });

  const resetForm = () => {
    setFormData(emptyForm());
    setNewChecklistItem('');
    setCurrentNote(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalMode('add');
    setIsModalOpen(true);
  };

  const openEditModal = (note: Note) => {
    const checklist = parseChecklist(note.conteudo);
    setFormData({
      title: note.titulo,
      content: checklist ? '' : note.conteudo,
      type: checklist ? 'checklist' : 'note',
      color: note.cor_fundo || '#ffffff',
      isPublic: note.tornar_publico,
      checklistItems: checklist ?? [],
    });
    setCurrentNote(note.id);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddChecklistItem = () => {
    const text = newChecklistItem.replace(/\s+/g, ' ').trim();
    if (!text) return;

    setFormData(prev => ({
      ...prev,
      checklistItems: [...prev.checklistItems, { text, completed: false }],
    }));
    setNewChecklistItem('');
  };

  const handleRemoveChecklistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.filter((_, i) => i !== index),
    }));
  };

  const toggleChecklistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.map((item, i) =>
        i === index ? { ...item, completed: !item.completed } : item
      ),
    }));
  };

  // Marca/desmarca um item direto no card, salvando no banco
  const toggleNoteItem = (note: Note, index: number) => {
    const items = parseChecklist(note.conteudo);
    if (!items) return;
    items[index] = { ...items[index], completed: !items[index].completed };
    updateNote(note.id, { conteudo: serializeChecklist(items) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.type === 'checklist' && formData.checklistItems.length === 0) {
      toast.error('Adicione ao menos um item à lista.');
      return;
    }

    const payload = {
      titulo: formData.title.trim(),
      conteudo: formData.type === 'checklist' ? serializeChecklist(formData.checklistItems) : formData.content,
      cor_fundo: formData.color,
      tornar_publico: formData.isPublic,
    };

    const ok = modalMode === 'add'
      ? await addNote({ ...payload, criado_por: user?.id ?? null })
      : currentNote !== null && await updateNote(currentNote, payload);

    if (ok) closeModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta anotação?')) {
      deleteNote(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anotações</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie suas anotações e listas de tarefas
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {isAdmin && (
            <button
              onClick={() => setShowOnlyMine(!showOnlyMine)}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              {showOnlyMine ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
              {showOnlyMine ? 'Mostrar todas' : 'Mostrar apenas minhas'}
            </button>
          )}
          <button
            onClick={openAddModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-5 h-5 mr-1" />
            Nova Anotação
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg border border-gray-200 p-6 text-center">
            <StickyNote className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Sem anotações</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando sua primeira anotação.
            </p>
            <div className="mt-6">
              <button
                onClick={openAddModal}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-1" />
                Nova Anotação
              </button>
            </div>
          </div>
        ) : (
          filteredNotes.map(note => {
            const checklist = parseChecklist(note.conteudo);
            const isOwner = note.criado_por === user?.id;
            const author = !isOwner ? users.find(u => u.id === note.criado_por)?.nome : undefined;
            return (
            <div
              key={note.id}
              className="group relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]"
              style={{ backgroundColor: note.cor_fundo || '#ffffff' }}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{note.titulo}</h3>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(isOwner || isAdmin) && (
                      <>
                        <button
                          onClick={() => openEditModal(note)}
                          className="text-gray-600 hover:text-blue-600 p-1 rounded-full hover:bg-white/50 transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="text-gray-600 hover:text-red-600 p-1 rounded-full hover:bg-white/50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {!checklist ? (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{note.conteudo}</p>
                ) : (
                  <div className="space-y-2">
                    {checklist.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <button
                          onClick={() => toggleNoteItem(note, index)}
                          className="text-gray-500 hover:text-blue-600 disabled:cursor-default disabled:hover:text-gray-500"
                          disabled={!isOwner}
                        >
                          {item.completed ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                        <span className={`ml-2 text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    {note.tornar_publico ? (
                      <Eye className="w-3 h-3 mr-1" />
                    ) : (
                      <EyeOff className="w-3 h-3 mr-1" />
                    )}
                    <span>{note.tornar_publico ? 'Pública' : 'Privada'}{author ? ` · ${author}` : ''}</span>
                  </div>
                  <span>
                    {new Date(note.criado_em).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Nova Anotação' : 'Editar Anotação'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="note">Anotação</option>
                    <option value="checklist">Lista de Tarefas</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {formData.type === 'note' ? (
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                      Conteúdo *
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    ></textarea>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Itens da Lista
                    </label>
                    <div className="space-y-2">
                      {formData.checklistItems.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <button
                            type="button"
                            onClick={() => toggleChecklistItem(index)}
                            className="text-gray-500 hover:text-blue-600"
                          >
                            {item.completed ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                          <span className="flex-1 ml-2 text-sm">{item.text}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveChecklistItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={newChecklistItem}
                          onChange={(e) => setNewChecklistItem(e.target.value)}
                          placeholder="Novo item"
                          className="flex-1 rounded-md border border-gray-300 py-1 px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddChecklistItem();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddChecklistItem}
                          className="ml-2 p-1 text-blue-600 hover:text-blue-800"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                    Cor de Fundo
                  </label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="w-10 h-10 rounded-md border border-gray-300 p-1 mr-2"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={handleChange}
                      name="color"
                      className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                    Tornar pública
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {modalMode === 'add' ? 'Adicionar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;