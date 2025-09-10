import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { promises as fs } from 'fs'
import { promisify } from 'util'
import { google } from 'googleapis'
import EventEmitter from 'events'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCOPES = ['https://www.googleapis.com/auth/drive']
const TOKEN_PATH = join(__dirname, '..', 'token.json')

class GoogleAuth extends EventEmitter {
  constructor(port = 3000) {
    super()
    this.port = port
    this.oAuth2Client = null
  }

  async authorize(credentials) {
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web
    this.oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris ? redirect_uris[0] : `http://localhost:${this.port}`
    )

    try {
      const tokenStr = await fs.readFile(TOKEN_PATH, 'utf8')
      const token = JSON.parse(tokenStr)
      this.oAuth2Client.setCredentials(token)
    } catch {
      const authUrl = this.oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
      })
      this.emit('auth', authUrl)

      const code = await promisify(this.once).bind(this)('token')
      const { tokens } = await this.oAuth2Client.getToken(code)
      this.oAuth2Client.setCredentials(tokens)
      await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2))
    }

    return this.oAuth2Client
  }

  token(code) {
    this.emit('token', code)
  }
}

class GoogleDrive extends GoogleAuth {
  constructor(port = 3000) {
    super(port)
    this.drive = null
  }

  async init(credentials) {
    const auth = await this.authorize(credentials)
    this.drive = google.drive({ version: 'v3', auth })
  }

  async getFolderID(name) {
    const res = await this.drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${name}'`,
      fields: 'files(id, name)'
    })
    return res.data.files?.[0]?.id || null
  }

  async infoFile(fileId) {
    const res = await this.drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, modifiedTime'
    })
    return res.data
  }

  async folderList(folderId) {
    const res = await this.drive.files.list({
      q: `'${folderId}' in parents`,
      fields: 'files(id, name, mimeType)'
    })
    return res.data.files
  }

  async downloadFile(fileId) {
    const res = await this.drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    )
    return Buffer.from(res.data)
  }

  async uploadFile({ name, mimeType, body, parents = [] }) {
    const res = await this.drive.files.create({
      requestBody: { name, mimeType, parents },
      media: { mimeType, body },
      fields: 'id, name'
    })
    return res.data
  }
}

export { GoogleAuth, GoogleDrive }