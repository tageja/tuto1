import { Backend } from './backend';

export const StudentProfilesApi = {
	async create(input: { fullName: string; grade: string; yearOfBirth?: string; notes?: string }) {
		return Backend.create('studentProfiles', input as any);
	},
	async listForGuardian() {
		return Backend.list('studentProfiles');
	},
};


