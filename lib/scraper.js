import cheerio from 'cheerio'
import axios from 'axios'
import qs from 'querystring'

/**
 * Descargar imágenes de sekaikomik
 */
async function sekaikomikDl(url) {
  try {
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const $ = cheerio.load(html)

    const scripts = $('script')
      .map((_, el) => $(el).html())
      .get()
      .filter(v => v && /wp-content/i.test(v))

    if (!scripts.length) return []

    const match = scripts[0]?.match(/"images"\s*:\s*(\[[\s\S]*?\])/)
    if (!match) return []

    let images = []
    try {
      images = JSON.parse(match[1])
    } catch {
      return []
    }

    return images
      .filter(Boolean)
      .map(img => encodeURI(img))

  } catch (err) {
    console.error('sekaikomikDl error:', err.message)
    return []
  }
}

/**
 * Descargar video de Facebook
 */
async function facebookDl(url) {
  try {
    const { data: html, headers } = await axios.get('https://fdownloader.net/', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const $ = cheerio.load(html)

    const token = $('input[name="__RequestVerificationToken"]').val()
    const cookie = headers['set-cookie']?.join('; ') || ''

    if (!token) return {}

    const res = await axios.post(
      'https://fdownloader.net/api/ajaxSearch',
      qs.stringify({ __RequestVerificationToken: token, q: url }),
      {
        headers: {
          cookie,
          'content-type': 'application/x-www-form-urlencoded',
          referer: 'https://fdownloader.net/',
          'User-Agent': 'Mozilla/5.0'
        }
      }
    )

    const $$ = cheerio.load(res.data?.data || '')

    const result = {}

    $$('.button.is-success.is-small.download-link-fb').each((_, el) => {
      const el$ = $$(el)

      const title = el$.attr('title') || ''
      const link = el$.attr('href')

      const quality = title.split(' ')[1] || title

      if (quality && link) result[quality] = link
    })

    return result

  } catch (err) {
    console.error('facebookDl error:', err.message)
    return {}
  }
}

/**
 * Stalk TikTok
 */
async function tiktokStalk(user) {
  try {
    const { data: html } = await axios.get(
      `https://urlebird.com/user/${user}/`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )

    const $ = cheerio.load(html)

    const followersText = $('div.col-7.col-md-auto.text-truncate').text().trim()
    const followingText = $('div.col-auto.d-none.d-sm-block.text-truncate').text().trim()

    return {
      pp_user: $('div.col-md-auto.justify-content-center.text-center img').attr('src') || '',
      name: $('h1.user').text().trim() || '',
      username: $('div.content > h5').text().trim() || '',
      followers: followersText.split(' ')[1] || '0',
      following: followingText.split(' ')[1] || '0',
      description: $('div.content > p').text().trim() || ''
    }

  } catch (err) {
    console.error('tiktokStalk error:', err.message)
    return {}
  }
}

/**
 * Stalk Instagram
 */
async function igStalk(username) {
  try {
    username = username.replace(/^@/, '')

    const { data: html } = await axios.get(`https://dumpor.com/v/${username}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const $ = cheerio.load(html)

    const name = $('div.user__title h1').text().trim()
    const Uname = $('div.user__title h4').text().trim()
    const description = $('div.user__info-desc').text().trim()

    const style = $('div.user__img').attr('style') || ''
    const profilePic = style.match(/url\(['"]?(.*?)['"]?\)/)?.[1] || ''

    const list = $('ul.list > li.list__item')

    const posts = parseInt(list.eq(0).text().replace(/\D/g, '')) || 0
    const followers = parseInt(list.eq(1).text().replace(/\D/g, '')) || 0
    const following = parseInt(list.eq(2).text().replace(/\D/g, '')) || 0

    return {
      name,
      username: Uname,
      description,
      posts,
      followers,
      following,
      profilePic
    }

  } catch (err) {
    console.error('igStalk error:', err.message)
    return {}
  }
}

export {
  sekaikomikDl,
  facebookDl,
  tiktokStalk,
  igStalk
}