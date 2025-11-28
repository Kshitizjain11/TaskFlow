import { FolderKanban } from 'lucide-react';
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [showFilter, setShowFilter] = useState(false);
  const [taskMenuOpen, setTaskMenuOpen] = useState(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (showFilter) setShowFilter(false);
      if (taskMenuOpen) setTaskMenuOpen(null);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showFilter, taskMenuOpen]);

  const handleDeleteTask = async (id) => {
    await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
    setTasks(tasks => tasks.filter(t => t._id !== id));
  };

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [taskFilter, setTaskFilter] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [editTask, setEditTask] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/projects`).then(r => r.json()).then(setProjects);
  }, []);

  useEffect(() => {
    let url = `${API_URL}/tasks?`;
    if (selectedProject) url += `projectId=${selectedProject}&`;
    if (taskFilter) url += `status=${taskFilter}&`;
    if (taskSearch) url += `search=${taskSearch}`;
    fetch(url).then(r => r.json()).then(setTasks);
  }, [selectedProject, taskFilter, taskSearch]);

  // Handle edit task modal state
  useEffect(() => {
    const modal = document.getElementById('edit-task-modal');
    if (!modal) return;
    
    if (editTask) {
      modal.showModal();
    } else {
      modal.close();
    }
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setEditTask(null);
      }
    };
    
    modal.addEventListener('keydown', handleKeyDown);
    return () => {
      modal.removeEventListener('keydown', handleKeyDown);
    };
  }, [editTask]);

  const [projectError, setProjectError] = useState('');
  const createProject = async e => {
    e.preventDefault();
    setProjectError('');
    const res = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProject)
    });
    if (!res.ok) {
      const err = await res.json();
      setProjectError(err.error || 'Could not create project');
      return;
    }
    const data = await res.json();
    setProjects([...projects, data]);
    setNewProject({ name: '', description: '' });
  };


  const createTask = async e => {
    e.preventDefault();
    if (!selectedProject) return;
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTask, projectId: selectedProject })
    });
    const data = await res.json();
    setTasks([...tasks, data]);
    setNewTask({ title: '', description: '' });
  };

  const updateTaskStatus = async (id, status) => {
    await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setTasks(tasks.map(t => t._id === id ? { ...t, status } : t));
  };

  // Task progress calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Group tasks by project for sidebar
  const tasksByProject = projects.map(project => ({
    ...project,
    tasks: tasks.filter(task => task.projectId === project._id)
  }));

  return (
    <div className="min-h-screen flex font-sans bg-[#15171a]">
      {/* Sidebar */}
      <aside className="w-72 bg-[#18181b] border-r border-[#23262b] flex flex-col justify-between min-h-screen p-0">
        <div>
          <div className="flex items-center gap-3 px-6 pt-6 pb-2">
            <div className="text-blue-500 rounded-lg flex items-center justify-center bg-blue-900/20 p-2">
              {/* <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#fff"/><path d="M7 17V7h10v10H7Z" fill="#2563eb"/></svg> */}
              <FolderKanban className="h-7 w-7 text-primary"  />
            </div>
            <span className="font-extrabold text-2xl neucha tracking-tight text-white">TaskFlow</span>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <button onClick={() => { setSelectedProject(''); }} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition w-full ${selectedProject === '' ? 'bg-blue-600 text-white' : 'text-[#bbb] hover:bg-[#23262b]' }`}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill={selectedProject === '' ? '#fff' : '#60a5fa'} d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg>
              All Tasks
            </button>
            <div className="uppercase text-xs text-[#7c7f85] font-bold px-6 mt-6 mb-2">Projects</div>
            <ul className="flex flex-col gap-1">
              {projects.length === 0 && <li className="text-[#555] italic px-6">No projects yet.</li>}
              {projects.map(project => (
                <li key={project._id}>
                  <button onClick={() => setSelectedProject(project._id)} className={`flex items-center gap-2 px-6 py-2 rounded-lg w-full text-left transition ${selectedProject === project._id ? 'bg-blue-700 text-white' : 'text-[#bbb] hover:bg-[#23262b]' }`}>
                    <span className={`h-3 w-3 rounded-full ${project.color || 'bg-blue-500'}`}></span>
                    <span className="font-medium">{project.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <form onSubmit={e => { e.preventDefault(); createProject(e); }} className="flex gap-2 p-6 border-t border-[#23262b]">
          <input
            className="border border-[#23262b] rounded-lg px-3 py-2 bg-[#23262b] text-white flex-1 placeholder:text-[#555] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
            placeholder="New Project"
            value={newProject.name}
            onChange={e => setNewProject({ ...newProject, name: e.target.value })}
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow transition active:scale-95" title="Add Project">+</button>
        </form>
        {projectError && (
          <div className="text-red-400 text-xs px-6 pb-2">{projectError}</div>
        )}

      </aside>
      {/* Main content */}
      <main className="flex-1 p-10 bg-[#23262b] min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1 flex items-center gap-4 relative">
            <input
              className="bg-[#18181b] border border-[#23262b] rounded-lg px-4 py-2 text-white w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Search tasks..."
              value={taskSearch}
              onChange={e => setTaskSearch(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  className="p-2 rounded-lg bg-[#23262b] border border-blue-600 text-blue-400 hover:text-blue-200 shadow transition flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={e => { e.stopPropagation(); setShowFilter(f => !f); }}
                  type="button"
                  style={{ minWidth: 40 }}
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M10 3h4m-2 0v2m-7 7h2m10 0h2m-2 7h-2m-7 0H5m8.5-5.5-2.5 3-1.5-1.5"/></svg>
                </button>
                {showFilter && (
                  <div className="absolute z-50 mt-2 right-0 w-48 bg-[#23262b] border border-[#23262b] rounded-xl shadow-xl py-2 text-sm text-white">
                    <div className="px-4 py-2 text-xs text-[#bbb]">Filter by Status</div>
                    <button className={`flex items-center w-full px-4 py-2 hover:bg-[#18181b] ${taskFilter === '' ? 'text-blue-400' : ''}`} onClick={() => { setTaskFilter(''); setShowFilter(false); }}>
                      {taskFilter === '' && <span className="mr-2">✓</span>}
                      All Tasks
                    </button>
                    <button className={`flex items-center w-full px-4 py-2 hover:bg-[#18181b] ${taskFilter === 'pending' ? 'text-blue-400' : ''}`} onClick={() => { setTaskFilter('pending'); setShowFilter(false); }}>
                      {taskFilter === 'pending' && <span className="mr-2">✓</span>}
                      Pending
                    </button>
                    <button className={`flex items-center w-full px-4 py-2 hover:bg-[#18181b] ${taskFilter === 'completed' ? 'text-blue-400' : ''}`} onClick={() => { setTaskFilter('completed'); setShowFilter(false); }}>
                      {taskFilter === 'completed' && <span className="mr-2">✓</span>}
                      Completed
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow flex items-center gap-2"
            onClick={() => document.getElementById('add-task-modal').showModal()}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M11 11V7h2v4h4v2h-4v4h-2v-4H7v-2h4Z"/></svg>
            Add Task
          </button>
        </div>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-bold text-white text-xl">All Tasks</h2>
            <span className="text-[#bbb] text-sm">{totalTasks} tasks</span>
            <span className="text-[#bbb] text-sm">{completedTasks} completed</span>
            <div className="flex-1" />
            <span className="text-green-500 font-bold text-sm">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-[#18181b] rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {tasks
            .filter(task => selectedProject === '' || task.projectId === selectedProject)
            .map(task => {
            const project = projects.find(p => p._id === task.projectId);
            return (
              <div
                key={task._id}
                className={`bg-[#18181b] border border-[#23262b] rounded-xl p-5 flex justify-between items-center shadow ${task.status === 'completed' ? 'opacity-70' : ''}`}
                onClick={e => { if (taskMenuOpen) setTaskMenuOpen(null); }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <button
                      className={`rounded-full h-6 w-6 flex items-center justify-center border-2 ${task.status === 'completed' ? 'border-green-500 bg-green-500' : 'border-[#23262b] bg-[#18181b]'} mr-2`}
                      onClick={() => updateTaskStatus(task._id, task.status === 'completed' ? 'pending' : 'completed')}
                    >
                      {task.status === 'completed' ? (
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M9 16.2l-3.5-3.5 1.4-1.4L9 13.4l7.1-7.1 1.4 1.4z"/></svg>
                      ) : null}
                    </button>
                    <span className={`font-bold text-lg ${task.status === 'completed' ? 'line-through text-green-400' : 'text-white'}`}>{task.title}</span>
                  </div>
                  <div className="text-[#bbb] text-sm">{task.description}</div>
                </div>
                <div className="flex items-center gap-3 relative">
                  {project && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#23262b] text-blue-400 border border-[#23262b]">
                      {project.name}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${task.status === 'completed' ? 'bg-green-900 text-green-400' : 'bg-[#23262b] text-[#bbb] border border-[#23262b]'}`}>{task.status}</span>
                  {/* Three dots menu */}
                  <div className="relative">
                    <button
                      className="p-2 rounded-full hover:bg-[#23262b] text-[#888] hover:text-blue-400 transition"
                      onClick={e => { e.stopPropagation(); setTaskMenuOpen(taskMenuOpen === task._id ? null : task._id); }}
                      type="button"
                    >
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="19" cy="12" r="2" fill="currentColor"/></svg>
                    </button>
                    {taskMenuOpen === task._id && (
                      <div className="absolute right-0 z-50 mt-2 w-32 bg-[#23262b] border border-[#23262b] rounded-xl shadow-xl py-2" onClick={e => e.stopPropagation()}>
                        <button
                          className="w-full text-left px-4 py-2 text-blue-400 hover:bg-[#18181b]"
                          onClick={e => { e.stopPropagation(); setEditTask(task); setTaskMenuOpen(null); }}
                        >
                          Edit
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-red-400 hover:bg-[#18181b]"
                          onClick={e => { e.stopPropagation(); handleDeleteTask(task._id); setTaskMenuOpen(null); }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {tasks.length === 0 && (
            <div className="text-[#555] italic text-center py-8">No tasks found.</div>
          )}
        </div>
        <dialog id="add-task-modal" className="rounded-xl p-0 bg-[#18181b] border border-[#23262b] shadow-xl">
          <form method="dialog" className="p-6 flex flex-col gap-4 min-w-[320px]">
            <div className="font-bold text-lg text-white mb-2">Add Task</div>
            <select
              className="border border-[#23262b] rounded px-3 py-2 bg-[#23262b] text-white"
              required
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
            >
              <option value="">Select Project</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            <input
              className="border border-[#23262b] rounded px-3 py-2 bg-[#23262b] text-white"
              required
              placeholder="Task Title"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            />
            <input
              className="border border-[#23262b] rounded px-3 py-2 bg-[#23262b] text-white"
              placeholder="Description"
              value={newTask.description}
              onChange={e => setNewTask({ ...newTask, description: e.target.value })}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow mt-2"
              onClick={e => {
                createTask(e);
                setTimeout(() => document.getElementById('add-task-modal').close(), 300);
              }}
            >
              Add Task
            </button>
          </form>
        </dialog>
        <dialog 
          id="edit-task-modal" 
          className="rounded-xl p-0 bg-[#18181b] border border-[#23262b] shadow-xl backdrop:bg-black/50"
          onClick={(e) => {
            const dialogDimensions = e.target.getBoundingClientRect();
            if (
              e.clientX < dialogDimensions.left ||
              e.clientX > dialogDimensions.right ||
              e.clientY < dialogDimensions.top ||
              e.clientY > dialogDimensions.bottom
            ) {
              setEditTask(null);
            }
          }}
        >
          {editTask && (
            <form method="dialog" className="p-6 flex flex-col gap-4 min-w-[320px]" onSubmit={async e => {
              e.preventDefault();
              await fetch(`${API_URL}/tasks/${editTask._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editTask)
              });
              setTasks(tasks => tasks.map(t => t._id === editTask._id ? editTask : t));
              setEditTask(null);
            }}>
              <div className="font-bold text-lg text-white mb-2">Edit Task</div>
              <input
                className="border border-[#23262b] rounded px-3 py-2 bg-[#23262b] text-white"
                required
                placeholder="Task Title"
                value={editTask.title}
                onChange={e => setEditTask({ ...editTask, title: e.target.value })}
              />
              <input
                className="border border-[#23262b] rounded px-3 py-2 bg-[#23262b] text-white"
                placeholder="Description"
                value={editTask.description}
                onChange={e => setEditTask({ ...editTask, description: e.target.value })}
              />
              <select
                className="border border-[#23262b] rounded px-3 py-2 bg-[#23262b] text-white"
                value={editTask.status}
                onChange={e => setEditTask({ ...editTask, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow mt-2"
                type="submit"
              >
                Save Changes
              </button>
            </form>
          )}
        </dialog>
      </main>
    </div>
  );
}

export default App;
