import React from 'react';
import { UserCard } from './UserCard';

export function UserList({ 
  users, 
  title, 
  emptyMessage = "Nenhum usuário encontrado",
  showActions = true,
  onApprove,
  onReject,
  onDelete,
  onRevoke
}) {
  if (users.length === 0) {
    return (
      <div className="card bg-dark border-secondary">
        <div className="card-header bg-secondary">
          <h5 className="text-white mb-0">
            <span role="img" aria-label="list">📋</span> {title} ({users.length})
          </h5>
        </div>
        <div className="card-body text-center py-5">
          <div className="text-muted">
            <span role="img" aria-label="empty">😴</span>
            <p className="mb-0">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-dark border-secondary">
      <div className="card-header bg-secondary">
        <h5 className="text-white mb-0">
          <span role="img" aria-label="list">📋</span> {title} ({users.length})
        </h5>
      </div>
      <div className="card-body p-0">
        <div className="row p-3">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              showActions={showActions}
              onApprove={onApprove}
              onReject={onReject}
              onDelete={onDelete}
              onRevoke={onRevoke}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
