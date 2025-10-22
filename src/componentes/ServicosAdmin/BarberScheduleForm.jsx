import React, { useState, useEffect } from 'react';

function BarberScheduleForm({ barberId, currentSchedule, onSave, onCancel, saving }) {
  const [scheduleData, setScheduleData] = useState({
    monday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
    tuesday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
    wednesday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
    thursday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
    friday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
    saturday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
    sunday: { isWorking: false, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 }
  });

  useEffect(() => {
    if (currentSchedule) {
      setScheduleData({
        monday: currentSchedule.monday || scheduleData.monday,
        tuesday: currentSchedule.tuesday || scheduleData.tuesday,
        wednesday: currentSchedule.wednesday || scheduleData.wednesday,
        thursday: currentSchedule.thursday || scheduleData.thursday,
        friday: currentSchedule.friday || scheduleData.friday,
        saturday: currentSchedule.saturday || scheduleData.saturday,
        sunday: currentSchedule.sunday || scheduleData.sunday
      });
    }
  }, [currentSchedule]);

  const handleDayChange = (day, field, value) => {
    setScheduleData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    onSave(barberId, scheduleData);
  };

  const days = [
    { key: 'monday', name: 'Segunda-feira' },
    { key: 'tuesday', name: 'Terça-feira' },
    { key: 'wednesday', name: 'Quarta-feira' },
    { key: 'thursday', name: 'Quinta-feira' },
    { key: 'friday', name: 'Sexta-feira' },
    { key: 'saturday', name: 'Sábado' },
    { key: 'sunday', name: 'Domingo' }
  ];

  return (
    <div className="row">
      {days.map(day => (
        <div key={day.key} className="col-md-6 mb-3">
          <div className="card">
            <div className="card-header">
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id={`${day.key}-working`}
                  checked={scheduleData[day.key].isWorking}
                  onChange={(e) => handleDayChange(day.key, 'isWorking', e.target.checked)}
                />
                <label className="form-check-label fw-bold" htmlFor={`${day.key}-working`}>
                  {day.name}
                </label>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small">Início</label>
                  <input 
                    type="time" 
                    className="form-control form-control-sm" 
                    value={scheduleData[day.key].startTime}
                    onChange={(e) => handleDayChange(day.key, 'startTime', e.target.value)}
                    disabled={!scheduleData[day.key].isWorking}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small">Fim</label>
                  <input 
                    type="time" 
                    className="form-control form-control-sm" 
                    value={scheduleData[day.key].endTime}
                    onChange={(e) => handleDayChange(day.key, 'endTime', e.target.value)}
                    disabled={!scheduleData[day.key].isWorking}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small">Almoço Início</label>
                  <input 
                    type="time" 
                    className="form-control form-control-sm" 
                    value={scheduleData[day.key].lunchStart}
                    onChange={(e) => handleDayChange(day.key, 'lunchStart', e.target.value)}
                    disabled={!scheduleData[day.key].isWorking}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small">Almoço Fim</label>
                  <input 
                    type="time" 
                    className="form-control form-control-sm" 
                    value={scheduleData[day.key].lunchEnd}
                    onChange={(e) => handleDayChange(day.key, 'lunchEnd', e.target.value)}
                    disabled={!scheduleData[day.key].isWorking}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="col-12 mt-3">
        <div className="d-flex gap-2">
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Salvando...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                Salvar Horários
              </>
            )}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default BarberScheduleForm;
