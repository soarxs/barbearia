import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Calendar, Clock, User, Phone, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

function Agendamentos() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services:service_id(name, price),
          barbers:barber_id(name)
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('pt-BR', { month: 'long' });
    const year = date.getFullYear();
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    
    return {
      weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
      date: `${day} de ${month} de ${year}`
    };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmado':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelado':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pendente':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const viewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-3 text-muted">Carregando agendamentos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Histórico de Agendamentos</h2>
            <span className="badge bg-primary">{appointments.length} agendamentos</span>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-5">
              <Calendar className="w-16 h-16 text-muted mx-auto mb-3" />
              <h4 className="text-muted">Nenhum agendamento encontrado</h4>
              <p className="text-muted">Os agendamentos aparecerão aqui quando forem criados.</p>
            </div>
          ) : (
            <div className="row">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="col-12 col-md-6 col-lg-4 mb-4">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-2">
                          {getStatusIcon(appointment.status)}
                          <span className={`badge ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => viewAppointment(appointment)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <div>
                            <div className="fw-semibold text-sm">
                              {formatDate(appointment.date).weekday}
                            </div>
                            <div className="text-muted small">
                              {formatDate(appointment.date).date}
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-sm">{appointment.time}</span>
                        </div>

                        <div className="d-flex align-items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-primary" />
                          <span className="text-sm">{appointment.services?.name || 'Serviço'}</span>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          <span className="text-sm">{appointment.barbers?.name || 'Barbeiro'}</span>
                        </div>
                      </div>

                      <div className="border-top pt-3">
                        <div className="d-flex align-items-center gap-2">
                          <Phone className="w-4 h-4 text-muted" />
                          <span className="text-muted small">{appointment.client_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Visualização */}
      {showModal && selectedAppointment && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalhes do Agendamento</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Cliente</label>
                      <p className="mb-0">{selectedAppointment.client_name}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Telefone</label>
                      <p className="mb-0">{selectedAppointment.client_phone}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Serviço</label>
                      <p className="mb-0">{selectedAppointment.services?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Barbeiro</label>
                      <p className="mb-0">{selectedAppointment.barbers?.name || 'N/A'}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Data</label>
                      <p className="mb-0">
                        {formatDate(selectedAppointment.date).weekday}, {formatDate(selectedAppointment.date).date}
                      </p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Horário</label>
                      <p className="mb-0">{selectedAppointment.time}</p>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Status</label>
                  <div className="d-flex align-items-center gap-2">
                    {getStatusIcon(selectedAppointment.status)}
                    <span className={`badge ${getStatusColor(selectedAppointment.status)}`}>
                      {selectedAppointment.status}
                    </span>
                  </div>
                </div>
                {selectedAppointment.notes && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Observações</label>
                    <p className="mb-0">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Agendamentos;
