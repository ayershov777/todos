import { useState, useEffect } from 'react'

export const Goals = () => {
  const [goals, setGoals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    targetDate: '',
    milestones: []
  })
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    dueDate: ''
  })

  useEffect(() => {
    fetchGoals()
  }, [])

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
      const url = editingGoal ? `/api/v1/goals/${editingGoal._id}` : '/api/v1/goals'
      const method = editingGoal ? 'PUT' : 'POST'
      
      // Prepare milestones - remove temporary IDs and let MongoDB generate them
      const processedMilestones = form.milestones.map(m => {
        const milestone = {
          title: m.title,
          description: m.description,
          dueDate: m.dueDate,
          completed: m.completed || false
        }
        
        // Only include _id if it looks like a real MongoDB ObjectId (24 hex chars)
        if (m._id && m._id.length === 24 && /^[0-9a-fA-F]{24}$/.test(m._id)) {
          milestone._id = m._id
        }
        
        return milestone
      })
      
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          targetDate: form.targetDate,
          milestones: processedMilestones
        })
      })

      setForm({ title: '', description: '', targetDate: '', milestones: [] })
      setNewMilestone({ title: '', description: '', dueDate: '' })
      setShowForm(false)
      setEditingGoal(null)
      fetchGoals()
    } catch (err) {
      console.error('Error saving goal:', err)
    }
  }

  const addMilestoneToForm = () => {
    if (!newMilestone.title.trim() || !newMilestone.description.trim() || !newMilestone.dueDate) {
      return
    }
    
    const milestone = {
      _id: `temp_${Date.now()}_${Math.random()}`, // Temporary ID that won't be sent to server
      title: newMilestone.title,
      description: newMilestone.description,
      dueDate: newMilestone.dueDate,
      completed: false
    }
    
    setForm({
      ...form,
      milestones: [...form.milestones, milestone]
    })
    
    setNewMilestone({ title: '', description: '', dueDate: '' })
  }

  const removeMilestoneFromForm = (milestoneId) => {
    setForm({
      ...form,
      milestones: form.milestones.filter(m => m._id !== milestoneId)
    })
  }

  const deleteGoal = async (id) => {
    if (!confirm('Delete this goal?')) return
    
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/v1/goals/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchGoals()
    } catch (err) {
      console.error('Error deleting goal:', err)
    }
  }

  const toggleComplete = async (goal) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/v1/goals/${goal._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...goal, completed: !goal.completed })
      })
      fetchGoals()
    } catch (err) {
      console.error('Error updating goal:', err)
    }
  }

  const startEdit = (goal) => {
    setEditingGoal(goal)
    setForm({
      title: goal.title,
      description: goal.description,
      targetDate: goal.targetDate.split('T')[0],
      milestones: goal.milestones || []
    })
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Goals</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            if (showForm) {
              setEditingGoal(null)
              setForm({ title: '', description: '', targetDate: '', milestones: [] })
              setNewMilestone({ title: '', description: '', dueDate: '' })
            }
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? 'Cancel' : 'Add Goal'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-4">
            {editingGoal ? 'Edit Goal' : 'Add New Goal'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Goal title"
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
              value={form.targetDate}
              onChange={(e) => setForm({...form, targetDate: e.target.value})}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            
            {/* Milestones Section */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Milestones (optional)</h3>
              
              {/* Add New Milestone */}
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <h4 className="text-sm font-medium mb-2">Add Milestone</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Milestone title"
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                    className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Milestone description"
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                    className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={newMilestone.dueDate}
                      onChange={(e) => setNewMilestone({...newMilestone, dueDate: e.target.value})}
                      className="flex-1 p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addMilestoneToForm}
                      className="px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
                      disabled={!newMilestone.title.trim() || !newMilestone.description.trim() || !newMilestone.dueDate}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Current Milestones List */}
              {form.milestones.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Current Milestones ({form.milestones.length})</h4>
                  {form.milestones.map((milestone) => (
                    <div key={milestone._id} className="p-3 bg-white border rounded">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium">{milestone.title}</h5>
                          <p className="text-xs text-gray-600 mt-1">{milestone.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMilestoneFromForm(milestone._id)}
                          className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {editingGoal ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingGoal(null)
                  setForm({ title: '', description: '', targetDate: '', milestones: [] })
                  setNewMilestone({ title: '', description: '', dueDate: '' })
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
        {goals.map(goal => (
          <div key={goal._id} className="bg-white rounded shadow">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className={`font-semibold ${goal.completed ? 'line-through text-gray-500' : ''}`}>
                      {goal.title}
                    </h3>
                    {goal.milestones && goal.milestones.length > 0 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} milestones
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{goal.description}</p>
                  <p className="text-gray-500 text-xs mt-2">
                    Due: {new Date(goal.targetDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => toggleComplete(goal)}
                    className={`text-xs px-2 py-1 rounded ${
                      goal.completed 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {goal.completed ? 'Done' : 'Mark Done'}
                  </button>
                  <button
                    onClick={() => startEdit(goal)}
                    className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteGoal(goal._id)}
                    className="text-xs px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No goals yet. Create your first goal to get started!
        </div>
      )}
    </div>
  )
}
