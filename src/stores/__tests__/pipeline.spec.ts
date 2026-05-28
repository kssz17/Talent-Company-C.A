import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePipelineStore } from '../pipeline'
import { useAuthStore } from '../auth'

describe('usePipelineStore', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    const auth = useAuthStore()
    auth.devLogin('admin')
    // setActiveJob() carga los datos mock de j1; sin esto applications[] queda vacío
    await usePipelineStore().setActiveJob('j1')
  })

  it('setActiveJob loads mock applications', () => {
    const store = usePipelineStore()
    expect(store.applications.length).toBeGreaterThan(0)
  })

  it('stagesForJob returns sorted stages for active job', () => {
    const store = usePipelineStore()
    store.setActiveJob('j1')
    const stages = store.stagesForJob
    expect(stages.length).toBeGreaterThan(0)
    for (let i = 1; i < stages.length; i++) {
      expect(stages[i].order).toBeGreaterThan(stages[i - 1].order)
    }
  })

  it('applicationsByStage groups correctly', () => {
    const store = usePipelineStore()
    store.setActiveJob('j1')
    const map = store.applicationsByStage
    let total = 0
    map.forEach(apps => { total += apps.length })
    const activeApps = store.applications.filter(a => a.job_id === 'j1' && a.status === 'active').length
    expect(total).toBe(activeApps)
  })

  it('moveApplication changes stage_id', async () => {
    const store = usePipelineStore()
    store.setActiveJob('j1')
    const app = store.applications[0]
    const newStageId = store.stagesForJob.find(s => s.id !== app.stage_id)?.id ?? app.stage_id
    await store.moveApplication(app.id, newStageId)
    expect(store.getApplicationById(app.id)?.stage_id).toBe(newStageId)
  })

  it('moveApplication adds an activity entry', async () => {
    const store = usePipelineStore()
    store.setActiveJob('j1')
    const app = store.applications[0]
    const initialActivities = (app.activities ?? []).length
    const newStageId = store.stagesForJob.find(s => s.id !== app.stage_id)?.id ?? app.stage_id
    await store.moveApplication(app.id, newStageId)
    const updated = store.getApplicationById(app.id)
    expect((updated?.activities ?? []).length).toBe(initialActivities + 1)
  })

  it('addEvaluation appends to application evaluations', async () => {
    const store = usePipelineStore()
    const app = store.applications[0]
    const before = (app.evaluations ?? []).length
    await store.addEvaluation(app.id, 4, 'Good candidate')
    const updated = store.getApplicationById(app.id)
    expect((updated?.evaluations ?? []).length).toBe(before + 1)
    expect(updated?.evaluations?.at(-1)?.notes).toBe('Good candidate')
    expect(updated?.evaluations?.at(-1)?.score).toBe(4)
  })

  it('rejectApplication sets status to rejected', async () => {
    const store = usePipelineStore()
    const app = store.applications[0]
    await store.rejectApplication(app.id)
    expect(store.getApplicationById(app.id)?.status).toBe('rejected')
  })
})
