import React from 'react';

export function AppointmentCard({ 
  appointment, 
  service, 
  barber, 
  showActions = true,
  onConfirm,
  onCancel,
  onWhatsApp
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmado':
        return <span className="badge bg-success">Confirmado</span>;
      case 'pendente':
        return <span className="badge bg-warning text-dark">Pendente</span>;
      case 'cancelado':
        return <span className="badge bg-danger">Cancelado</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="timeline-item booked">
      <div className="timeline-marker">
        <div className="marker-dot"></div>
      </div>
      <div className="timeline-content">
        <div className="d-flex justify-content-between align-items-center">
          <div className="timeline-time">{appointment.time}</div>
          <div className="timeline-status">
            <div className="d-flex align-items-center gap-2">
              {getStatusBadge(appointment.status)}
              {showActions && (
                <div className="btn-group btn-group-sm">
                  {onConfirm && (
                    <button 
                      className={`btn ${appointment.status === 'confirmado' ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => onConfirm(appointment.id)}
                      title={appointment.status === 'confirmado' ? 'Confirmado' : 'Confirmar'}
                    >
                      <i className={`fas ${appointment.status === 'confirmado' ? 'fa-check' : 'fa-clock'}`}></i>
                    </button>
                  )}
                  {onWhatsApp && (
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => onWhatsApp(appointment)}
                      title="WhatsApp"
                    >
                      <i className="fab fa-whatsapp"></i>
                    </button>
                  )}
                  {onCancel && (
                    <button 
                      className="btn btn-outline-danger"
                      onClick={() => onCancel(appointment.id)}
                      title="Cancelar"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="timeline-details mt-2">
          <div className="fw-bold text-dark">{appointment.client_name}</div>
          <small className="text-muted">
            {service?.name}
            {appointment.notes && ` • ${appointment.notes}`}
          </small>
          {barber && (
            <div className="mt-1">
              <small className="text-muted">
                <i className="fas fa-user me-1"></i>
                {barber.name}
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
