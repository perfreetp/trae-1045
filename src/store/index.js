import { ref, watch } from 'vue'
import { enforcementOfficers as initialOfficers } from '@/mock'
import { saveToStorage, loadFromStorage } from '@/utils/storage'

const STORAGE_KEY = 'law_enforcement_officers'

const storedOfficers = loadFromStorage(STORAGE_KEY)
export const officersStore = ref(storedOfficers && storedOfficers.length > 0 ? storedOfficers : [...initialOfficers])

watch(officersStore, (newVal) => {
  saveToStorage(STORAGE_KEY, newVal)
}, { deep: true })

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
