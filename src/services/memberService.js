// MemberService - handles all member business logic
import { storageService } from './storageService';
import { isPaymentDue, daysRemaining, getDueDate, formatDate, todayISO } from '../utils/dateUtils';

export const memberService = {
  /**
   * Add a new member
   */
  async addMember(memberData) {
    const newMember = {
      id: `member_${Date.now()}`,
      name: memberData.name,
      phone: memberData.phone,
      subscriptionStartDate: memberData.subscriptionStartDate || todayISO(),
      lastPaidDate: memberData.subscriptionStartDate || todayISO(),
      isPaid: true,
      notes: memberData.notes || ''
    };

    await storageService.addMember(newMember);
    return newMember;
  },

  /**
   * Get all members with calculated status
   */
  async getAllMembers() {
    const members = await storageService.getMembers();

    return members.map(member => ({
      ...member,
      isPaymentDue: isPaymentDue(member.lastPaidDate),
      daysRemaining: daysRemaining(member.lastPaidDate),
      dueDate: getDueDate(member.lastPaidDate),
      status: member.isPaymentDue ? 'overdue' : 'active'
    }));
  },

  /**
   * Mark member as paid (resets payment cycle)
   */
  async markAsPaid(id) {
    const members = await storageService.getMembers();
    const memberIndex = members.findIndex(m => m.id === id);

    if (memberIndex !== -1) {
      members[memberIndex] = {
        ...members[memberIndex],
        lastPaidDate: todayISO(),
        isPaid: true
      };

      await storageService.saveMembers(members);
      return members[memberIndex];
    }

    return null;
  },

  /**
   * Remove a member
   */
  async removeMember(id) {
    await storageService.deleteMember(id);
  },

  /**
   * Get member by ID
   */
  async getMemberById(id) {
    const members = await storageService.getMembers();
    return members.find(m => m.id === id) || null;
  }
};
