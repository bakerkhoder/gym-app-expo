// StorageService - isolates all AsyncStorage operations
import AsyncStorage from '@react-native-async-storage/async-storage';

const MEMBERS_KEY = '@gym_members';

export const storageService = {
  async getMembers() {
    try {
      const json = await AsyncStorage.getItem(MEMBERS_KEY);
      return json ? JSON.parse(json) : [];
    } catch (e) {
      console.error('storageService.getMembers error:', e);
      return [];
    }
  },

  async saveMembers(members) {
    try {
      await AsyncStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
    } catch (e) {
      console.error('storageService.saveMembers error:', e);
    }
  },

  async addMember(member) {
    const members = await this.getMembers();
    members.push(member);
    await this.saveMembers(members);
  },

  async updateMember(id, updates) {
    const members = await this.getMembers();
    const idx = members.findIndex(m => m.id === id);
    if (idx !== -1) {
      members[idx] = { ...members[idx], ...updates };
      await this.saveMembers(members);
    }
  },

  async deleteMember(id) {
    const members = await this.getMembers();
    const filtered = members.filter(m => m.id !== id);
    await this.saveMembers(filtered);
  },
};
