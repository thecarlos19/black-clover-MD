import cheerio from 'cheerio'
import axios from 'axios'
import qs from 'querystring'

/**
 * Descargar imágenes de sekaikomik
 * @param {string} url 
 * @returns {Promise<string[]>}
 */
async function sekaikomikDl(url) {
  try {
    const { data: html } = await axios.get(url)
    const $ = cheerio.load(html)
    let scripts = $('script')
      .map((i, el) => $(el).html())
      .get()
      .filter(v => /wp-content/i.test(v))

    if (!scripts.length) return []

    // Buscar array de imágenes sin usar eval
    const imagesMatch = scripts[0].match(/"images":\s*(\[[^\]]+\])/)
    if (!imagesMatch) return []

    const images = JSON.parse(imagesMatch[1])
    return images.map(img => encodeURI(img))
  } catch (err) {
    console.error('sekaikomikDl error:', err)
    return []
  }
}

/**
 * Descargar video de Facebook
 * @param {string} url 
 * @returns {Promise<object>}
 */
async function facebookDl(url) {
  try {
    const { data: html, headers } = await axios.get('https://fdownloader.net/')
    const $ = cheerio.load(html)
    const token = $('input[name="__RequestVerificationToken"]').attr('value')
    const cookie = headers['set-cookie']?.join('; ') || ''

    const res = await axios.post(
      'https://fdownloader.net/api/ajaxSearch',
      qs.stringify({ __RequestVerificationToken: token, q: url }),
      {
        headers: {
          cookie,
          'content-type': 'application/x-www-form-urlencoded',
          referer: 'https://fdownloader.net/'
        }
      }
    )

    const $$ = cheerio.load(res.data.data)
    const result = {}
    $$('.button.is-success.is-small.download-link-fb').each(function () {
      const quality = $$(this).attr('title')?.split(' ')[1]
      const link = $$(this).attr('href')
      if (quality && link) result[quality] = link
    })

    return result
  } catch (err) {
    console.error('facebookDl error:', err)
    return {}
  }
}

/**
 * Stalk usuario TikTok por urlebird
 * @param {string} user
 * @returns {Promise<object>}
 */
async function tiktokStalk(user) {
  try {
    const { data: html } = await axios.get(`https://urlebird.com/user/${user}/`)
    const $ = cheerio.load(html)

    return {
      pp_user: $('div.col-md-auto.justify-content-center.text-center > img').attr('src') || '',
      name: $('h1.user').text().trim() || '',
      username: $('div.content > h5').text().trim() || '',
      followers: $('div.col-7.col-md-auto.text-truncate').text().trim().split(' ')[1] || '0',
      following: $('div.col-auto.d-none.d-sm-block.text-truncate').text().trim().split(' ')[1] || '0',
      description: $('div.content > p').text().trim() || ''
    }
  } catch (err) {
    console.error('tiktokStalk error:', err)
    return {}
  }
}

/**
 * Stalk usuario Instagram via dumpor
 * @param {string} username 
 * @returns {Promise<object>}
 */
async function igStalk(username) {
  try {
    username = username.replace(/^@/, '')
    const { data: html } = await axios.get(`https://dumpor.com/v/${username}`)
    const $$ = cheerio.load(html)

    const name = $$('div.user__title > a > h1').text().trim()
    const Uname = $$('div.user__title > h4').text().trim()
    const description = $$('div.user__info-desc').text().trim()
    const profilePic = $$('div.user__img').attr('style')?.replace(/background-image:\s*url\('(.+)'\);?/, '$1') || ''

    const list = $$('ul.list > li.list__item')
    const posts = parseInt(list.eq(0).text().replace(/\D/g, ''), 10) || 0
    const followers = parseInt(list.eq(1).text().replace(/\D/g, ''), 10) || 0
    const following = parseInt(list.eq(2).text().replace(/\D/g, ''), 10) || 0

    const row = $$('#user-page > div.container > div > div > div:nth-child(1) > div > a')
    const postsH = row.eq(0).text().replace(/Posts/i, '').trim()
    const followersH = row.eq(2).text().replace(/Followers/i, '').trim()
    const followingH = row.eq(3).text().replace(/Following/i, '').trim()

    return {
      name, username: Uname, description,
      postsH, posts, followersH, followers,
      followingH, following, profilePic
    }
  } catch (err) {
    console.error('igStalk error:', err)
    return {}
  }
}

export {
  sekaikomikDl,
  facebookDl,
  tiktokStalk,
  igStalk
}