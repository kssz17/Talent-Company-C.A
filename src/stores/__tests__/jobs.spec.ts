import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useJobsStore } from '../jobs'

describe('useJobsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('loads mock jobs on init', () => {
    const store = useJobsStore()
    expect(store.jobs.length).toBeGreaterThan(0)
  })

  it('getById returns the correct job', () => {
    const store = useJobsStore()
    const first = store.jobs[0]
    expect(store.getById(first.id)).toEqual(first)
  })

  it('getById returns null for unknown id', () => {
    const store = useJobsStore()
    expect(store.getById('nonexistent')).toBeNull()
  })

  it('filters by search term', () => {
    const store = useJobsStore()
    store.filters.search = 'Vue'
    expect(store.filtered.every(j => j.title.toLowerCase().includes('vue'))).toBe(true)
  })

  it('filters by status', () => {
    const store = useJobsStore()
    store.filters.status = 'draft'
    expect(store.filtered.every(j => j.status === 'draft')).toBe(true)
  })

  it('create adds a new job at the start', async () => {
    const store = useJobsStore()
    const initialCount = store.jobs.length
    await store.create({
      title: 'Test Job',
      department_id: null,
      description: 'desc',
      requirements: '',
      status: 'draft',
      type: 'full-time',
      work_mode: 'remote',
      location: 'Remote',
      salary_min: null,
      salary_max: null,
      template_id: null,
      created_by: 'u1',
      published_at: null,
      closed_at: null,
    })
    expect(store.jobs.length).toBe(initialCount + 1)
    expect(store.jobs[0].title).toBe('Test Job')
  })

  it('update patches existing job fields', async () => {
    const store = useJobsStore()
    const id = store.jobs[0].id
    await store.update(id, { title: 'Updated Title' })
    expect(store.getById(id)?.title).toBe('Updated Title')
  })

  it('changeStatus to published sets published_at', async () => {
    const store = useJobsStore()
    const draftJob = store.jobs.find(j => j.status === 'draft')!
    await store.changeStatus(draftJob.id, 'published')
    expect(store.getById(draftJob.id)?.status).toBe('published')
    expect(store.getById(draftJob.id)?.published_at).not.toBeNull()
  })

  it('remove deletes the job', async () => {
    const store = useJobsStore()
    const id = store.jobs[0].id
    await store.remove(id)
    expect(store.getById(id)).toBeNull()
  })

  it('totalByStatus counts correctly', () => {
    const store = useJobsStore()
    const published = store.jobs.filter(j => j.status === 'published').length
    expect(store.totalByStatus.published).toBe(published)
  })
})
