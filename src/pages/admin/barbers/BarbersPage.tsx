import React, { useState } from 'react';
import { Plus, Edit, Trash2, Clock, User, Mail, Phone, Camera, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useBarbers } from '@/hooks/api/useBarbers';
import { useServices } from '@/hooks/api/useServices';
import { BarberForm } from '@/components/forms/BarberForm';
import { ScheduleModal } from '@/components/forms/ScheduleModal';
import { toast } from 'sonner';

interface Barber {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  photo?: string;
  specialties: string[];
  commission: number;
  isActive: boolean;
  schedule: {
    monday: { isWorking: boolean; startTime: string; endTime: string; lunchStart: string; lunchEnd: string };
    tuesday: { isWorking: boolean; startTime: string; endTime: string; lunchStart: string; lunchEnd: string };
    wednesday: { isWorking: boolean; startTime: string; endTime: string; lunchStart: string; lunchEnd: string };
    thursday: { isWorking: boolean; startTime: string; endTime: string; lunchStart: string; lunchEnd: string };
    friday: { isWorking: boolean; startTime: string; endTime: string; lunchStart: string; lunchEnd: string };
    saturday: { isWorking: boolean; startTime: string; endTime: string; lunchStart: string; lunchEnd: string };
    sunday: { isWorking: boolean; startTime: string; endTime: string; lunchStart: string; lunchEnd: string };
  };
  createdAt: string;
  updatedAt: string;
}

export default function BarbersPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedBarberForSchedule, setSelectedBarberForSchedule] = useState<Barber | null>(null);

  const { data: barbers, isLoading, error, createBarber, updateBarber, deleteBarber } = useBarbers();
  const { data: services } = useServices();

  const handleCreateBarber = async (barberData: Omit<Barber, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createBarber(barberData);
      toast.success('Barbeiro criado com sucesso!');
      setShowForm(false);
    } catch (error) {
      toast.error('Erro ao criar barbeiro');
    }
  };

  const handleUpdateBarber = async (id: string, barberData: Partial<Barber>) => {
    try {
      await updateBarber(id, barberData);
      toast.success('Barbeiro atualizado com sucesso!');
      setEditingBarber(null);
    } catch (error) {
      toast.error('Erro ao atualizar barbeiro');
    }
  };

  const handleDeleteBarber = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este barbeiro?')) {
      try {
        await deleteBarber(id);
        toast.success('Barbeiro excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir barbeiro');
      }
    }
  };

  const handleToggleStatus = async (barber: Barber) => {
    await handleUpdateBarber(barber.id, { isActive: !barber.isActive });
  };

  const handleOpenScheduleModal = (barber: Barber) => {
    setSelectedBarberForSchedule(barber);
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = async (barberId: string, schedule: Barber['schedule']) => {
    try {
      await updateBarber(barberId, { schedule });
      toast.success('Horários atualizados com sucesso!');
      setShowScheduleModal(false);
    } catch (error) {
      toast.error('Erro ao atualizar horários');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erro ao carregar barbeiros: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Barbeiros</h1>
          <p className="text-muted-foreground">Gerencie os profissionais da barbearia</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Barbeiro
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{barbers?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">
                  {barbers?.filter(b => b.isActive).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <X className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Inativos</p>
                <p className="text-2xl font-bold">
                  {barbers?.filter(b => !b.isActive).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barbers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers?.map((barber) => (
          <Card key={barber.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={barber.photo} alt={barber.name} />
                    <AvatarFallback>
                      {barber.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{barber.name}</CardTitle>
                    <Badge variant={barber.isActive ? 'default' : 'secondary'}>
                      {barber.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingBarber(barber)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBarber(barber.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                {barber.email && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    {barber.email}
                  </div>
                )}
                {barber.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    {barber.phone}
                  </div>
                )}
              </div>

              {/* Specialties */}
              {barber.specialties.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Especialidades</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {barber.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {services?.find(s => s.id === specialty)?.name || specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Commission */}
              <div>
                <Label className="text-sm font-medium">Comissão</Label>
                <p className="text-sm text-muted-foreground">{barber.commission}%</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenScheduleModal(barber)}
                  className="flex-1"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Horários
                </Button>
                <Button
                  variant={barber.isActive ? "destructive" : "default"}
                  size="sm"
                  onClick={() => handleToggleStatus(barber)}
                  className="flex-1"
                >
                  {barber.isActive ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Form Modal */}
      <Dialog open={showForm || !!editingBarber} onOpenChange={(open) => {
        if (!open) {
          setShowForm(false);
          setEditingBarber(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBarber ? 'Editar Barbeiro' : 'Novo Barbeiro'}
            </DialogTitle>
          </DialogHeader>
          <BarberForm
            barber={editingBarber}
            services={services || []}
            onSubmit={editingBarber ? 
              (data) => handleUpdateBarber(editingBarber.id, data) :
              handleCreateBarber
            }
            onCancel={() => {
              setShowForm(false);
              setEditingBarber(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Schedule Modal */}
      {showScheduleModal && selectedBarberForSchedule && (
        <ScheduleModal
          barber={selectedBarberForSchedule}
          onSave={(schedule) => handleSaveSchedule(selectedBarberForSchedule.id, schedule)}
          onClose={() => setShowScheduleModal(false)}
        />
      )}
    </div>
  );
}

