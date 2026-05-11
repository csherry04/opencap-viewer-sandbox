const isDemoMode = process.env.VUE_APP_UI_DEMO === 'true'

const now = '2026-05-07T10:00:00Z'

function qrDataUrl(label) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
      <rect width="240" height="240" fill="#fff"/>
      <rect x="24" y="24" width="56" height="56" fill="#111"/>
      <rect x="160" y="24" width="56" height="56" fill="#111"/>
      <rect x="24" y="160" width="56" height="56" fill="#111"/>
      <g fill="#111">
        <rect x="104" y="104" width="16" height="16"/>
        <rect x="128" y="104" width="16" height="16"/>
        <rect x="152" y="104" width="16" height="16"/>
        <rect x="104" y="128" width="16" height="16"/>
        <rect x="144" y="128" width="16" height="16"/>
        <rect x="176" y="128" width="16" height="16"/>
        <rect x="96" y="160" width="16" height="16"/>
        <rect x="128" y="168" width="16" height="16"/>
        <rect x="160" y="160" width="16" height="16"/>
        <rect x="192" y="184" width="16" height="16"/>
      </g>
      <text x="120" y="228" text-anchor="middle" fill="#333" font-family="Arial" font-size="12">${label}</text>
    </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const demoMot = `Coordinates
version=1
nRows=8
nColumns=4
inDegrees=yes
endheader
time hip_flexion_r knee_angle_r ankle_angle_r
0.00 12 8 -4
0.10 16 18 -8
0.20 24 36 -12
0.30 20 42 -10
0.40 10 24 -6
0.50 4 10 -2
0.60 8 14 -3
0.70 12 8 -4
`

const subjects = [
  {
    id: 'demo-subject-1',
    name: 'Demo Subject',
    display_name: 'Demo Subject (72 Kg, 1.75 m, 1992)',
    weight: 72,
    height: 1.75,
    birth_year: 1992,
    sex_at_birth: 'woman',
    gender: 'woman',
    subject_tags: ['unimpaired'],
    subject_tags_display: ['Unimpaired'],
    created_at: now,
    trashed: false
  },
  {
    id: 'demo-subject-2',
    name: 'Return To Sport',
    display_name: 'Return To Sport (80 Kg, 1.82 m, 1988)',
    weight: 80,
    height: 1.82,
    birth_year: 1988,
    sex_at_birth: 'man',
    gender: 'man',
    subject_tags: ['athlete'],
    subject_tags_display: ['Athlete'],
    created_at: '2026-05-06T14:00:00Z',
    trashed: false
  }
]

const sessions = [
  {
    id: 'demo-session-1',
    sessionName: 'Demo gait session',
    meta: { sessionName: 'Demo gait session' },
    name: 'Demo Subject',
    subject: 'demo-subject-1',
    subject_id: 'demo-subject-1',
    subject_name: 'Demo Subject',
    user: 'demo-user-id',
    created_at: now,
    trials_count: 3,
    isMono: false,
    public: false,
    trashed: false,
    qrcode: qrDataUrl('demo-session-1'),
    trials: [
      { id: 'demo-trial-calibration', name: 'calibration', status: 'done', trashed: false, results: [] },
      { id: 'demo-trial-neutral', name: 'neutral', status: 'done', trashed: false, results: [] },
      {
        id: 'demo-trial-walk-1',
        name: 'walk_01',
        status: 'done',
        trashed: false,
        results: [
          { tag: 'ik_results', media: '/demo/ik_results.mot' },
          { tag: 'visualizerTransforms-json', media: '/demo/visualizer.json' }
        ]
      }
    ]
  },
  {
    id: 'demo-session-mono',
    sessionName: 'Monocular UI check',
    meta: { sessionName: 'Monocular UI check' },
    name: 'Return To Sport',
    subject: 'demo-subject-2',
    subject_id: 'demo-subject-2',
    subject_name: 'Return To Sport',
    user: 'demo-user-id',
    created_at: '2026-05-06T14:00:00Z',
    trials_count: 2,
    isMono: true,
    public: false,
    trashed: false,
    qrcode: qrDataUrl('demo-session-mono'),
    trials: [
      { id: 'demo-trial-neutral-mono', name: 'neutral', status: 'done', trashed: false, results: [] },
      { id: 'demo-trial-squat-1', name: 'squat_01', status: 'done', trashed: false, results: [{ tag: 'ik_results', media: '/demo/ik_results.mot' }] }
    ]
  }
]

let sessionCounter = 3
let subjectCounter = 3
let trialCounter = 10

function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

function ok(config, data, status = 200) {
  return Promise.resolve({
    data: clone(data),
    status,
    statusText: 'OK',
    headers: {},
    config
  })
}

function notFound(config) {
  return Promise.reject({
    response: {
      status: 404,
      data: { detail: 'Demo fixture not found' }
    },
    config
  })
}

function findSession(id) {
  return sessions.find(session => session.id === id) || sessions[0]
}

function findTrial(id) {
  for (const session of sessions) {
    const trial = session.trials.find(item => item.id === id)
    if (trial) return trial
  }
  return null
}

function handleSessionRoute(config, path) {
  const match = path.match(/^\/sessions\/([^/]+)\/([^/]*)?\/?$/)
  if (!match) return null

  const session = findSession(match[1])
  const action = match[2] || ''

  if (!action) return ok(config, session)
  if (action === 'new_subject') {
    const next = createSession({ isMono: session.isMono, subject: session.subject })
    return ok(config, [next])
  }
  if (action === 'get_qr') return ok(config, { qr: qrDataUrl(session.id) })
  if (action === 'get_n_calibrated_cameras') return ok(config, { data: session.isMono ? 1 : 2 })
  if (action === 'status') {
    return ok(config, {
      status: 'done',
      n_cameras_connected: session.isMono ? 1 : 2,
      n_videos_uploaded: session.isMono ? 1 : 2,
      session
    })
  }
  if (action === 'calibration_img') return ok(config, { status: 'done', imgs: [] })
  if (action === 'neutral_img') return ok(config, { status: 'done', imgs: [] })
  if (action === 'set_metadata' || action === 'set_subject' || action === 'get_session_settings') return ok(config, session)
  if (action === 'record') {
    const name = config.params?.name || 'trial'
    const trial = { id: `demo-trial-${trialCounter++}`, name, status: 'done', trashed: false, results: [] }
    session.trials.push(trial)
    session.trials_count = session.trials.filter(item => item.name !== 'calibration').length
    return ok(config, trial)
  }
  if (action === 'rename') {
    session.sessionName = config.data?.sessionNewName || JSON.parse(config.data || '{}').sessionNewName || session.sessionName
    session.meta = { ...(session.meta || {}), sessionName: session.sessionName }
    return ok(config, { data: session })
  }
  if (action === 'trash') {
    session.trashed = true
    return ok(config, session)
  }
  if (action === 'restore') {
    session.trashed = false
    return ok(config, session)
  }
  if (action === 'permanent_remove') return ok(config, {})
  if (action === 'download' || action === 'async-download') return ok(config, { task_id: 'demo-download-task' })

  return ok(config, session)
}

function createSession({ isMono = false, subject = 'demo-subject-1' } = {}) {
  const subjectData = subjects.find(item => item.id === subject) || subjects[0]
  const session = {
    id: `demo-session-${sessionCounter++}`,
    sessionName: isMono ? 'New monocular demo' : 'New multi-phone demo',
    meta: { sessionName: isMono ? 'New monocular demo' : 'New multi-phone demo' },
    name: subjectData.name,
    subject: subjectData.id,
    subject_id: subjectData.id,
    subject_name: subjectData.name,
    user: 'demo-user-id',
    created_at: new Date().toISOString(),
    trials_count: 0,
    isMono,
    public: false,
    trashed: false,
    qrcode: qrDataUrl(`demo-session-${sessionCounter}`),
    trials: []
  }
  sessions.unshift(session)
  return session
}

function parseBody(data) {
  if (!data) return {}
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch (e) {
      return {}
    }
  }
  return data
}

function demoAdapter(config) {
  const url = new URL(config.url || '/', 'http://demo.local')
  const path = url.pathname
  const method = String(config.method || 'get').toLowerCase()

  if (path === '/demo/ik_results.mot') return ok(config, demoMot)
  if (path === '/demo/visualizer.json') return ok(config, { time: [] })

  if (path === '/login/') {
    return ok(config, {
      token: 'demo-token',
      user_id: 'demo-user-id',
      institutional_use: 'research',
      otp_challenge_sent: true
    })
  }
  if (path === '/verify/') return ok(config, {})
  if (path === '/check-otp-verified/') return ok(config, { otp_verified: true })
  if (path === '/reset-otp-challenge/') return ok(config, {})
  if (path === '/register/') return ok(config, {})
  if (path === '/get_user_info/') {
    return ok(config, {
      username: 'demo',
      first_name: 'Demo',
      last_name: 'User',
      email: 'demo@example.com',
      institution: 'OpenCap UI Demo',
      profession: 'Designer',
      country: 'United States',
      reason: 'UI review',
      website: '',
      newsletter: false,
      profile_picture: null
    })
  }
  if (path === '/update_profile/' || path === '/update_profile_picture/' || path === '/delete-account/') return ok(config, {})
  if (path === '/reset-password/' || path.startsWith('/new-password/')) return ok(config, {})

  if (path === '/sessions/new/') {
    const isMono = url.searchParams.get('isMono') === 'true'
    return ok(config, [createSession({ isMono })])
  }
  if (path === '/sessions/valid/') {
    const body = parseBody(config.data)
    const includeTrashed = !!body.include_trashed
    const visible = sessions.filter(session => includeTrashed || !session.trashed)
    return ok(config, { sessions: visible, total: visible.length })
  }
  if (path === '/sessions/search_sessions/') {
    const text = String(url.searchParams.get('text') || '').toLowerCase()
    return ok(config, sessions.filter(session =>
      session.id.toLowerCase().includes(text) ||
      String(session.sessionName || '').toLowerCase().includes(text)
    ))
  }

  const sessionResponse = handleSessionRoute(config, path)
  if (sessionResponse) return sessionResponse

  if (path === '/subjects/') {
    if (method === 'post') {
      const body = parseBody(config.data)
      const subject = {
        id: `demo-subject-${subjectCounter++}`,
        created_at: new Date().toISOString(),
        trashed: false,
        display_name: `${body.name || 'New Subject'} (${body.weight || 70} Kg, ${body.height || 1.75} m, ${body.birth_year || 1990})`,
        ...body
      }
      subjects.unshift(subject)
      return ok(config, subject)
    }
    return ok(config, { subjects, total: subjects.length, length: subjects.length })
  }

  const subjectMatch = path.match(/^\/subjects\/([^/]+)\/?([^/]*)?\/?$/)
  if (subjectMatch) {
    const subject = subjects.find(item => item.id === subjectMatch[1]) || subjects[0]
    const action = subjectMatch[2] || ''
    if (method === 'put') {
      Object.assign(subject, parseBody(config.data))
      return ok(config, subject)
    }
    if (action === 'trash') subject.trashed = true
    if (action === 'restore') subject.trashed = false
    return ok(config, subject)
  }

  if (path.includes('/get_tags_subject/')) return ok(config, [{ tag: 'unimpaired' }])

  if (path === '/analysis-dashboards/') {
    return ok(config, [
      { id: 'demo-analysis-1', title: 'Squat' },
      { id: 'demo-analysis-2', title: 'Overground gait' }
    ])
  }
  if (path.match(/^\/analysis-dashboards\/[^/]+\/$/)) {
    return ok(config, { id: 'demo-analysis-1', title: 'Demo analysis dashboard' })
  }
  if (path.match(/^\/analysis-dashboards\/[^/]+\/data\/$/)) {
    return ok(config, {
      sessions,
      subjects,
      trials: sessions.flatMap(session => session.trials.map(trial => ({ ...trial, session_id: session.id }))),
      results: []
    })
  }
  if (path === '/analysis-functions/') return ok(config, [])
  if (path === '/analysis-results/states/' || path === '/analysis-results/pending/') return ok(config, {})

  const trialMatch = path.match(/^\/trials\/([^/]+)\/?([^/]*)?\/?$/)
  if (trialMatch) {
    const trial = findTrial(trialMatch[1])
    if (!trial) return notFound(config)
    const action = trialMatch[2] || ''
    if (!action) return ok(config, trial)
    if (action === 'rename') trial.name = parseBody(config.data).trialNewName || trial.name
    if (action === 'trash') trial.trashed = true
    if (action === 'restore') trial.trashed = false
    if (action === 'permanent_remove') return ok(config, {})
    return ok(config, { data: trial })
  }

  if (path.includes('/get_tags_trial/')) return ok(config, [])
  if (path.startsWith('/logs/') || path.startsWith('/analysis-result/')) return ok(config, {})

  return ok(config, {})
}

function installDemoApi(axios) {
  if (!isDemoMode) return
  axios.interceptors.request.use(config => ({
    ...config,
    adapter: demoAdapter
  }))
}

function setDemoAuthStorage() {
  localStorage.setItem('auth_token', 'demo-token')
  localStorage.setItem('auth_verified', 'true')
  localStorage.setItem('auth_user', 'demo')
  localStorage.setItem('auth_user_id', 'demo-user-id')
  localStorage.setItem('valid_till', new Date(Date.now() + 12 * 60 * 60 * 1000).toJSON())
  localStorage.setItem('institutional_use', 'research')
}

function seedDemoAuth(store) {
  if (!isDemoMode) return

  setDemoAuthStorage()

  store.commit('auth/setLoggedIn', {
    loggedIn: true,
    username: 'demo',
    user_id: 'demo-user-id'
  })
  store.commit('auth/setVerified', { verified: true })
  store.commit('data/setExistingSessions', clone(sessions))
  store.commit('data/setSubjects', clone(subjects))

  if (process.env.NODE_ENV === 'development') {
    console.info('[OpenCap UI demo] Real-equivalent demo URLs:', {
      sessions: '/sessions',
      neutral: '/demo-session-1/neutral',
      subjectDialog: '/subjects',
      session: '/session/demo-session-1',
      dashboard: '/dashboard/demo-session-1'
    })
  }
}

export {
  isDemoMode,
  installDemoApi,
  setDemoAuthStorage,
  seedDemoAuth
}
