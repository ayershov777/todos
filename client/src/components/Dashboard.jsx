import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalGoals: 0,
    completedGoals: 0,
    totalTasks: 0,
    completedTasks: 0
  });
  const [recentGoals, setRecentGoals] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');

      const [goalsRes, tasksRes] = await Promise.all([
        fetch('/api/v1/goals', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/v1/tasks', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
      ]);

      const goals = await goalsRes.json();
      const tasks = await tasksRes.json();

      setStats({
        totalGoals: goals.length,
        completedGoals: goals.filter(g => g.completed).length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
      });

      setRecentGoals(goals.slice(0, 3));
      setRecentTasks(tasks.slice(0, 5));
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-600">Goals</h3>
          <p className="text-2xl font-bold">{stats.completedGoals}/{stats.totalGoals}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-600">Tasks</h3>
          <p className="text-2xl font-bold">{stats.completedTasks}/{stats.totalTasks}</p>
        </div>
      </div>

      {/* Recent Goals */}
      <div className="bg-white rounded shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">Recent Goals</h2>
          <Link to="/goals" className="text-blue-500 text-sm">View All</Link>
        </div>
        <div className="p-4">
          {recentGoals.length === 0 ? (
            <p className="text-gray-500">No goals yet</p>
          ) : (
            <div className="space-y-2">
              {recentGoals.map(goal => (
                <div key={goal._id} className="flex items-center justify-between">
                  <span className={goal.completed ? 'line-through text-gray-500' : ''}>
                    {goal.title}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${goal.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {goal.completed ? 'Done' : 'In Progress'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">Recent Tasks</h2>
          <Link to="/tasks" className="text-blue-500 text-sm">View All</Link>
        </div>
        <div className="p-4">
          {recentTasks.length === 0 ? (
            <p className="text-gray-500">No tasks yet</p>
          ) : (
            <div className="space-y-2">
              {recentTasks.map(task => (
                <div key={task._id} className="flex items-center justify-between">
                  <span className={task.completed ? 'line-through text-gray-500' : ''}>
                    {task.title}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${task.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {task.completed ? 'Done' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
