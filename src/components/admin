import React from 'react';

export function UserCard({ 
  user, 
  showActions = true, 
  onApprove, 
  onReject, 
  onDelete,
  onRevoke,
  isMainAdmin = false 
}) {
  const getStatusBadge = (status, isApproved) => {
    if (status === 'approved' || isApproved) {
      return <span className="badge bg-success">Aprovado</span>;
    }
    if (status === 'rejected') {
      return <span className="badge bg-danger">Rejeitado</span>;
    }
    return <span className="badge bg-warning">Pendente</span>;
  };

  const getCardClass = (status, isApproved) => {
    if (status === 'approved' || isApproved) {
      return 'card bg-dark border-success';
    }
    if (status === 'rejected') {
      return 'card bg-dark border-danger';
    }
    return 'card bg-dark border-warning';
  };

  return (
    <div className="col-12 col-md-6 col-lg-4 mb-3">
      <div className={getCardClass(user.status, user.is_approved)}>
        <div className="card-body d-flex flex-column">
          <div className="d-flex align-items-center mb-3">
            {user.profile_photo_url ? (
              <img
                src={user.profile_photo_url}
                alt="Avatar"
                className="rounded-circle me-3"
                width="50"
                height="50"
              />
            ) : (
              <div
                className={`rounded-circle ${
                  user.status === 'approved' || user.is_approved ? 'bg-success' : 
                  user.status === 'rejected' ? 'bg-danger' : 'bg-warning'
                } d-flex align-items-center justify-content-center me-3`}
                style={{ width: '50px', height: '50px' }}
              >
                <span className="text-white fw-bold">
                  {(user.full_name || user.user_email || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h6 className="card-title text-white mb-0">
                {user.full_name || user.name || 'Usuário'}
              </h6>
              <p className="card-text text-muted mb-0">{user.user_email || user.email}</p>
            </div>
          </div>
          
          <div className="mb-3">
            <small className="text-muted">
              <strong>Status:</strong> {getStatusBadge(user.status, user.is_approved)}
            </small>
            {user.created_at && (
              <div className="mt-1">
                <small className="text-muted">
                  <strong>Criado em:</strong> {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </small>
              </div>
            )}
            {user.approved_at && (
              <div className="mt-1">
                <small className="text-muted">
                  <strong>Aprovado em:</strong> {new Date(user.approved_at).toLocaleDateString('pt-BR')}
                </small>
              </div>
            )}
            {user.approved_by && (
              <div className="mt-1">
                <small className="text-muted">
                  <strong>Por:</strong> {user.approved_by}
                </small>
              </div>
            )}
          </div>

          {showActions && (
            <div className="mt-auto">
              <div className="d-grid gap-2">
                {onApprove && (user.status === 'pending' || !user.is_approved) && (
                  <button
                    className="btn btn-success"
                    onClick={() => onApprove(user)}
                  >
                    ✅ Aprovar
                  </button>
                )}
                {onReject && (user.status === 'pending' || !user.is_approved) && (
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => onReject(user)}
                  >
                    ❌ Rejeitar
                  </button>
                )}
                {onDelete && user.email !== 'guilhermesf.beasss@gmail.com' && (
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => onDelete(user)}
                    title="Excluir"
                  >
                    🗑️ Excluir
                  </button>
                )}
                {onRevoke && user.user_email !== 'guilhermesf.beasss@gmail.com' && (
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => onRevoke(user)}
                    title="Revogar Acesso"
                  >
                    🚫 Revogar Acesso
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
