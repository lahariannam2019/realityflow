'use client';

import React, { useState, useEffect } from 'react';
import { StaffProfile } from '@/lib/types';
import { UserCheck, UserX, ChevronDown, Check, Loader2 } from 'lucide-react';

interface SalespersonAssignerProps {
  currentStaffId?: string | null;
  assignedStaff?: StaffProfile | null;
  onAssign: (staffId: string | null) => Promise<void>;
  disabled?: boolean;
}

export default function SalespersonAssigner({
  currentStaffId,
  assignedStaff,
  onAssign,
  disabled,
}: SalespersonAssignerProps) {
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadStaff() {
      try {
        setLoading(true);
        const res = await fetch('/api/staff');
        const data = await res.json();
        if (data.success && Array.isArray(data.staff)) {
          setStaffList(data.staff);
        }
      } catch (err) {
        console.error('Failed to load staff list', err);
      } finally {
        setLoading(false);
      }
    }
    loadStaff();
  }, []);

  const handleSelect = async (staffId: string | null) => {
    if (disabled || updating) return;
    try {
      setUpdating(true);
      await onAssign(staffId);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to assign salesperson', err);
    } finally {
      setUpdating(false);
    }
  };

  const activeStaff =
    assignedStaff || (currentStaffId ? staffList.find((s) => s.id === currentStaffId) : null);

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
        Assigned Salesperson
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || updating}
        className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-left transition-all cursor-pointer disabled:opacity-60"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
            {activeStaff ? (
              activeStaff.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
            ) : (
              <UserX className="w-3.5 h-3.5 text-stone-400" />
            )}
          </div>
          <div className="truncate">
            <span className="block text-xs font-bold text-stone-900 truncate">
              {activeStaff ? activeStaff.full_name : 'Unassigned'}
            </span>
            <span className="block text-[10px] text-stone-500 capitalize">
              {activeStaff ? activeStaff.role : 'Click to assign agent'}
            </span>
          </div>
        </div>

        {updating ? (
          <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-xl z-30 py-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95">
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-stone-50 text-xs transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <UserX className="w-4 h-4 text-stone-400" />
              <span className="text-stone-600 italic">Unassigned</span>
            </div>
            {!currentStaffId && <Check className="w-3.5 h-3.5 text-amber-600" />}
          </button>

          <div className="border-t border-stone-100 my-1" />

          {staffList.map((staff) => {
            const isSelected = currentStaffId === staff.id;
            return (
              <button
                key={staff.id}
                type="button"
                onClick={() => handleSelect(staff.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-stone-50 text-xs transition-colors cursor-pointer ${
                  isSelected ? 'bg-amber-50/70 font-semibold' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-[10px] text-stone-700">
                    {staff.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <span className="block text-stone-900">{staff.full_name}</span>
                    <span className="block text-[10px] text-stone-400 capitalize">{staff.role}</span>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
