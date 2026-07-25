import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useAuditStore = create()(persist((set) => ({ company: {}, workflows: [], components: [] }), { name: 'mf_labs_audit' }));
