import { useState, useEffect } from 'react'

export const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [goals, setGoals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    goalId: '',
    milestoneId: ''
  })

  useEffect(() => {
    fetchTasks()
    fetchGoals()
  }, [])

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setTasks(data)
    } catch (err) {
      console.error('Error fetching tasks:', err)
    }
  }

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/goals', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setGoals(data)
    } catch (err) {
      console.error('Error fetching goals:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    
    try {
      const url = editingTask ? `/api/v1/tasks/${editingTask._id}` : '/api/v1/tasks'
      const method = editingTask ? 'PUT' : 'POST'
      
      // Prepare the data, excluding empty values
      const taskData = {
        title: form.title,
        description: form.description,
        dueDate: form.dueDate
      }
      
      // Only include goalId and milestoneId if they have values
      if (form.goalId) taskData.goalId = form.goalId
      if (form.milestoneId) taskData.milestoneId = form.milestoneId
      
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      })

      setForm({ title: '', description: '', dueDate: '', goalId: '', milestoneId: '' })
      setShowForm(false)
      setEditingTask(null)
      fetchTasks()
    } catch (err) {
      console.error('Error saving task:', err)
    }
  }

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return
    
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/v1/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchTasks()
    } catch (err) {
      console.error('Error deleting task:', err)
    }
  }

  const toggleComplete = async (task) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/v1/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...task, completed: !task.completed })
      })
      fetchTasks()
    } catch (err) {
      console.error('Error updating task:', err)
    }
  }

  const startEdit = (task) => {
    setEditingTask(task)
    
    // If task has a milestoneId, find the goal that contains that milestone
    let goalId = task.goalId || ''
    if (task.milestoneId && !goalId) {
      const goalWithMilestone = goals.find(goal => 
        goal.milestones && goal.milestones.some(m => m._id === task.milestoneId)
      )
      goalId = goalWithMilestone ? goalWithMilestone._id : ''
    }
    
    setForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.split('T')[0],
      goalId: goalId,
      milestoneId: task.milestoneId || ''
    })
    setShowForm(true)
  }

  const getGoalTitle = (goalId) => {
    const goal = goals.find(g => g._id === goalId)
    return goal ? goal.title : 'Unknown Goal'
  }

  const getMilestoneTitle = (goalId, milestoneId) => {
    if (!milestoneId) return 'Unknown Milestone'
    
    // If we have goalId, use it
    if (goalId) {
      const goal = goals.find(g => g._id === goalId)
      if (goal && goal.milestones) {
        const milestone = goal.milestones.find(m => m._id === milestoneId)
        return milestone ? milestone.title : 'Unknown Milestone'
      }
    }
    
    // If no goalId, search through all goals for the milestone
    for (const goal of goals) {
      if (goal.milestones) {
        const milestone = goal.milestones.find(m => m._id === milestoneId)
        if (milestone) return milestone.title
      }
    }
    
    return 'Unknown Milestone'
  }

  const getAvailableMilestones = () => {
    const selectedGoal = goals.find(g => g._id === form.goalId)
    return selectedGoal ? selectedGoal.milestones : []
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? 'Cancel' : 'Add Task'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-4">
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              required
            />
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({...form, dueDate: e.target.value})}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal (optional)</label>
              <select
                value={form.goalId}
                onChange={(e) => setForm({...form, goalId: e.target.value, milestoneId: ''})}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No goal selected</option>
                {goals.map(goal => (
                  <option key={goal._id} value={goal._id}>{goal.title}</option>
                ))}
              </select>
            </div>
            {form.goalId && getAvailableMilestones().length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Milestone (optional)</label>
                <select
                  value={form.milestoneId}
                  onChange={(e) => setForm({...form, milestoneId: e.target.value})}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No milestone selected</option>
                  {getAvailableMilestones().map(milestone => (
                    <option key={milestone._id} value={milestone._id}>{milestone.title}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {editingTask ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingTask(null)
                  setForm({ title: '', description: '', dueDate: '', goalId: '', milestoneId: '' })
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task._id} className="bg-white p-4 rounded shadow border-l-4 border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </h3>
                  {task.completed && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Completed</span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                <p className="text-gray-500 text-xs mt-2">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
                {(task.goalId || task.milestoneId) && (
                  <div className="mt-2 space-y-1">
                    {task.goalId && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Goal</span>
                        <span className="text-xs text-blue-600">{getGoalTitle(task.goalId)}</span>
                      </div>
                    )}
                    {task.milestoneId && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">Milestone</span>
                        <span className="text-xs text-purple-600">{getMilestoneTitle(task.goalId, task.milestoneId)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => toggleComplete(task)}
                  className={`text-xs px-2 py-1 rounded ${
                    task.completed 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {task.completed ? 'Done' : 'Mark Done'}
                </button>
                <button
                  onClick={() => startEdit(task)}
                  className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(task._id)}
                  className="text-xs px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No tasks yet. Create your first task to get started!
        </div>
      )}
    </div>
  )
}
