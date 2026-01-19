import React, { useState } from 'react';
import { useAdminData } from '../../hooks/useAdminData';

const RoomManagement = () => {
  const { rooms, setRooms } = useAdminData();
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    room_type: '',
    capacity: 0,
    is_lab: false,
    building: '',
    floor: '',
    equipment: []
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleEquipmentChange = (equipment) => {
    setFormData(prev => {
      const currentEquipment = prev.equipment || [];
      const isSelected = currentEquipment.includes(equipment);

      const newEquipment = isSelected
        ? currentEquipment.filter(e => e !== equipment)
        : [...currentEquipment, equipment];

      return {
        ...prev,
        equipment: newEquipment
      };
    });
  };

  const availableEquipment = [
    'Projector', 'Whiteboard', 'Sound System', 'Microphones',
    'Computers', 'Printer', 'Scanner', 'WiFi',
    'Oscilloscopes', 'Power Supplies', 'Multimeters', 'Function Generators'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if room name already exists
    const existingRoom = rooms.find(r =>
      r.name.toLowerCase() === formData.name.toLowerCase() &&
      r.id !== editingRoom?.id
    );

    if (existingRoom) {
      alert('A room with this name already exists!');
      return;
    }

    if (editingRoom) {
      // Update existing room
      setRooms(prev => prev.map(room =>
        room.id === editingRoom.id ? { ...formData, id: editingRoom.id } : room
      ));
    } else {
      // Add new room
      const newRoom = {
        ...formData,
        id: Date.now() // Simple ID generation for demo
      };
      setRooms(prev => [...prev, newRoom]);
    }

    // Reset form
    setFormData({
      name: '',
      room_type: '',
      capacity: 0,
      is_lab: false,
      building: '',
      floor: '',
      equipment: []
    });
    setShowForm(false);
    setEditingRoom(null);
  };

  const handleEdit = (room) => {
    setFormData(room);
    setEditingRoom(room);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this room? This may affect existing timetables.')) {
      setRooms(prev => prev.filter(room => room.id !== id));
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      room_type: '',
      capacity: 0,
      is_lab: false,
      building: '',
      floor: '',
      equipment: []
    });
    setShowForm(false);
    setEditingRoom(null);
  };

  const getRoomsByType = () => {
    return rooms.reduce((acc, room) => {
      const type = room.is_lab ? 'Labs' : 'Classrooms';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(room);
      return acc;
    }, {});
  };

  const roomsByType = getRoomsByType();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Room Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Room
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            {editingRoom ? 'Edit Room' : 'Add New Room'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., LH101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type *
                </label>
                <select
                  name="room_type"
                  value={formData.room_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Room Type</option>
                  <option value="Lecture Hall">Lecture Hall</option>
                  <option value="Classroom">Classroom</option>
                  <option value="Computer Lab">Computer Lab</option>
                  <option value="Electronics Lab">Electronics Lab</option>
                  <option value="Physics Lab">Physics Lab</option>
                  <option value="Chemistry Lab">Chemistry Lab</option>
                  <option value="Seminar Hall">Seminar Hall</option>
                  <option value="Auditorium">Auditorium</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Building
                </label>
                <input
                  type="text"
                  name="building"
                  value={formData.building}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Main Block"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor
                </label>
                <input
                  type="text"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1st Floor"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_lab"
                checked={formData.is_lab}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                This is a Laboratory
              </label>
            </div>

            {/* Equipment Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Equipment
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableEquipment.map(equipment => (
                  <label key={equipment} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.equipment?.includes(equipment) || false}
                      onChange={() => handleEquipmentChange(equipment)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{equipment}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {editingRoom ? 'Update Room' : 'Add Room'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rooms Display - Grouped by Type */}
      <div className="space-y-6">
        {Object.entries(roomsByType).map(([type, typeRooms]) => (
          <div key={type} className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mr-3 ${
                type === 'Labs' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {type}
              </span>
              {typeRooms.length} Room{typeRooms.length !== 1 ? 's' : ''}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeRooms.map((room) => (
                <div key={room.id} className={`p-4 rounded-md border ${
                  room.is_lab ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">{room.name}</h4>
                      <p className="text-sm text-gray-600">{room.room_type}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(room)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div><span className="font-medium">Capacity:</span> {room.capacity} students</div>
                    {room.building && <div><span className="font-medium">Building:</span> {room.building}</div>}
                    {room.floor && <div><span className="font-medium">Floor:</span> {room.floor}</div>}
                    {room.equipment && room.equipment.length > 0 && (
                      <div>
                        <span className="font-medium">Equipment:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {room.equipment.map((eq, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {eq}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {rooms.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🏫</div>
            <p className="text-lg">No rooms added yet.</p>
            <p className="text-sm">Click "Add Room" to create your first classroom or lab.</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {rooms.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Room Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Rooms:</span> {rooms.length}
            </div>
            <div>
              <span className="font-medium">Classrooms:</span> {rooms.filter(r => !r.is_lab).length}
            </div>
            <div>
              <span className="font-medium">Labs:</span> {rooms.filter(r => r.is_lab).length}
            </div>
            <div>
              <span className="font-medium">Total Capacity:</span> {rooms.reduce((sum, room) => sum + room.capacity, 0)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
