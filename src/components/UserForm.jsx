import React, { useState } from 'react';

export function UserForm({ onSubmit, loading = false, initialData = {} }) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim() && formData.email.trim()) {
      onSubmit(formData);
      setFormData({ name: '', email: '' });
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="card bg-dark border-secondary mb-4">
      <div className="card-header bg-secondary">
        <h5 className="text-white mb-0">
          <span role="img" aria-label="add">➕</span> Adicionar Novo Usuário
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label text-white">Nome</label>
              <input
                type="text"
                name="name"
                className="form-control bg-dark text-white border-secondary"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nome do usuário"
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label text-white">Email</label>
              <input
                type="email"
                name="email"
                className="form-control bg-dark text-white border-secondary"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@exemplo.com"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-blue"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Adicionando...
              </>
            ) : (
              <>
                <span role="img" aria-label="add">➕</span> Adicionar Usuário
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
