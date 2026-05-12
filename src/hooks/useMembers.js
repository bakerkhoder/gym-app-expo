// useMembers - custom hook for member state management
import { useState, useEffect, useCallback } from 'react';
import { memberService } from '../services/memberService';
import { notificationService } from '../services/nnotificationService';

export function useMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    const data = await memberService.getAllMembers();
    setMembers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const addMember = async (memberData) => {
    const newMember = await memberService.addMember(memberData);
    if (newMember.isPaymentDue) {
      await notificationService.schedulePaymentDueNotification(newMember);
    }
    await loadMembers();
    return newMember;
  };

  const markAsPaid = async (id) => {
    const updated = await memberService.markAsPaid(id);
    await loadMembers();
    return updated;
  };

  const removeMember = async (id) => {
    await memberService.removeMember(id);
    await loadMembers();
  };

  const getMemberById = async (id) => {
    return await memberService.getMemberById(id);
  };

  // Stats
  const totalMembers = members.length;
  const dueMembers = members.filter(m => m.isPaymentDue).length;
  const activeMembers = members.filter(m => !m.isPaymentDue).length;

  return {
    members,
    loading,
    addMember,
    markAsPaid,
    removeMember,
    getMemberById,
    stats: { totalMembers, dueMembers, activeMembers },
    refresh: loadMembers,
  };
}
