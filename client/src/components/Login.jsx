import { useState } from 'react'
import { Link } from 'react-router-dom'

export const Login = ({ setToken }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const response = await fetch('/api/v1/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (response.ok) {
				localStorage.setItem('token', data.token);
				setToken(data.token);
			} else {
				setError(data.message || 'Login failed');
			}
		} catch (err) {
			setError('Network error');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<h1 className="text-2xl font-bold text-center mb-8">Login</h1>

				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>
					)}

					<div>
						<input
							type="email"
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>

					<div>
						<input
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:opacity-50"
					>
						{loading ? 'Logging in...' : 'Login'}
					</button>
				</form>

				<p className="text-center mt-4">
					Don't have an account?{' '}
					<Link to="/register" className="text-blue-500 hover:underline">
						Register
					</Link>
				</p>
			</div>
		</div>
	);
};
