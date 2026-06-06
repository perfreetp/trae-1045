import { ref } from 'vue'
import { enforcementOfficers as initialOfficers } from '@/mock'

export const officersStore = ref([...initialOfficers])

export const addOfficer = (officer) => {
  const newId = Math.max(...officersStore.value.map(o => o.id), 0) + 1
  officersStore.value.push({ ...officer, id: newId })
}

export const updateOfficer = (id, updates) => {
  const index = officersStore.value.findIndex(o => o.id === id)
  if (index !== -1) {
    officersStore.value[index] = { ...officersStore.value[index], ...updates }
  }
}

export const getOfficers = () => officersStore.value
