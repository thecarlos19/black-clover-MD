// Código creado x The Carlos 👑
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'

const colorifyai = {
  baseHeaders: {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'sec-ch-ua-platform': '"Android"',
    'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    'sec-ch-ua-mobile': '?1',
    'theme-version': '83EmcUoQTUv50LhNx0VrdcK8rcGexcP35FcZDcpgWsAXEyO4xqL5shCY6sFIWB2Q',
    'fp': 'ce5c3d02ca3f6126691dc3f031bf8696',
    'origin': 'https://colorifyai.art',
    'sec-fetch-site': 'same-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://colorifyai.art/',
    'accept-language': 'en-SG,en;q=0.9,id-ID;q=0.8,id;q=0.7,en-US;q=0.6',
    'priority': 'u=1, i'
  },
  baseUrl: 'https://api.colorifyai.art',
  imageBaseUrl: 'https://temp.colorifyai.art',
  
  async uploadImage(imagePath) {
    const data = new FormData()
    data.append('file', fs.createReadStream(imagePath))
    data.append('fn_name', 'demo-auto-coloring')
    data.append('request_from', '10')
    data.append('origin_from', '6d3782f244d64cf8')

    const { data: response } = await axios.post(`${this.baseUrl}/aitools/upload-img`, data, {
      headers: {
        ...this.baseHeaders,
        'fp1': 'o6Mwa5XX5Un1ErcZHeaPw/Vx9akkKttB1H5u+IyolDFz4IZQaNmueXYbgLo93OFc',
        'x-code': Date.now().toString(),
        'x-guide': 'IiwOF4ammzJHUX/J61hjo/n6td0itKczUIRls3wBSa5BUgImXX6bhCpeFBVhC3BdA8Elw3rPoWZIr9kiHeq1wbCT9FL4xZA3aLV01dNM69meuQzfUWR90nDp/Zp45SWHg7QJkcToY6lDB+WPjjwrWNLte6wPipRYxQ+X78jAkuo='
      }
    })
    return response
  },

  async createTask(imagePath, prompt = "(masterpiece), best quality", useGhibliStyle = true) {
    const lora = useGhibliStyle ? ["ghibli_style_offset:0.8"] : []
    const { data } = await axios.post(`${this.baseUrl}/aitools/of/create`, {
      fn_name: "demo-auto-coloring",
      call_type: 3,
      input: {
        source_image: imagePath,
        prompt,
        request_from: 10,
        lora
      },
      request_from: 10,
      origin_from: "6d3782f244d64cf8"
    }, {
      headers: {
        ...this.baseHeaders,
        'Content-Type': 'application/json',
        'fp1': 'TepQNTen0uDhLJ1z3LD/u+tD90vX7RDQpiPcqGy521zeTvgS6h/JUcLY0pFJUoDQ',
        'x-code': Date.now().toString(),
        'x-guide': 'Vtn8hbYI0x1w6BpTTkxrU1qK4Y/LPcOA2JNUSS6+UFk4uRXPLIL3x+ws40hmnqhSy1l4bxjM61KMRfaENnIsSJ7YCOlyKlL3/gvBQPVbBZi02c89yStvrnCvpRblyCy/vnX8ifY6rrhJJAJ2kdgw0pa5SZKOEA7UaDCdaroELzg='
      }
    })
    return data
  },

  async checkStatus(taskId) {
    const { data } = await axios.post(`${this.baseUrl}/aitools/of/check-status`, {
      task_id: taskId,
      fn_name: "demo-auto-coloring",
      call_type: 3,
      request_from: 10,
      origin_from: "6d3782f244d64cf8"
    }, {
      headers: {
        ...this.baseHeaders,
        'Content-Type': 'application/json',
        'fp1': 'pqRqSazlVNrkwA0D4OH9Q9+VNfnQidPWxDZkHLohBzg7CRVY8Z4DuMSnl1LldC8I',
        'x-code': Date.now().toString(),
        'x-guide': 'qLTaK9uy0jedbN7EO3gSm0zgKF+5OTZ5UL3BleB1ksqhkteHSWqpnZBSCIHo9finX7Qlz4I8oAFEB1wyClNgwlbbuzuEGBezjibch0EUhhrRUW8OSLInN5+DrOouCj2ppoq2YM90NLfKdqCazLKx17gm6ykG3YOYSpQDBGETDAM='
      }
    })
    return data
  },

  getImageUrl(imagePath) {
    return `${this.imageBaseUrl}/${imagePath}`
  },

  async create(imagePath, prompt = "(masterpiece), best quality", useGhibliStyle = true, maxAttempts = 30) {
    const uploadResult = await this.uploadImage(imagePath)
    if (uploadResult.code !== 200) throw new Error('Upload failed: ' + uploadResult.message)
    
    const uploadedImagePath = uploadResult.data.path
    const taskResult = await this.createTask(uploadedImagePath, prompt, useGhibliStyle)
    if (taskResult.code !== 200) throw new Error('Task creation failed: ' + taskResult.message)
    
    const taskId = taskResult.data.task_id
    let attempts = 0
    
    while (attempts < maxAttempts) {
      const statusResult = await this.checkStatus(taskId)
      if (statusResult.code !== 200) throw new Error('Status check failed: ' + statusResult.message)

      if (statusResult.data.status === 2) {
        const resultImagePath = statusResult.data.result_image
        return {
          success: true,
          imageUrl: this.getImageUrl(resultImagePath),
          imagePath: resultImagePath,
          taskId,
          ghibliStyle: useGhibliStyle
        }
      }

      attempts++
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
    
    throw new Error('\`ᴛɪᴇᴍᴘᴏ ᴅᴇ ᴇsᴘᴇʀᴀ ᴀɢᴏᴛᴀᴅᴏ\`')
  }
}

let handler = async (m, { conn, command }) => {
  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''

    if (!mime.startsWith('image/')) return m.reply('*\`ʏ ʟᴀ ɪᴍᴀɢᴇɴ, ᴘᴀʀᴀ ᴄᴏɴᴠᴇʀᴛɪʀ ᴇɴ ᴀɴɪᴍᴇ\`*')

    m.reply('Wait...')

    const media = await q.download()
    const tempPath = `./tmp/${Date.now()}.jpg`
    fs.writeFileSync(tempPath, media)

    const useGhibli = command === 'toghibli'
    const result = await colorifyai.create(tempPath, "(masterpiece), best quality", useGhibli)

    fs.unlinkSync(tempPath)

    await conn.sendMessage(m.chat, {
      image: { url: result.imageUrl },
    }, { quoted: m })

  } catch (e) {
    m.reply(e.message)
  }
}

handler.help = ['toanime', 'toghibli']
handler.command = ['toanime', 'toghibli']
handler.tags = ['ai']

export default handler