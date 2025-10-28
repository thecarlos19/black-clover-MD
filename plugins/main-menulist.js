const handler = async (m, { conn }) => {  

  const sections = [  
    {  
      title: '🎃 Menú list ♱',  
      rows: [  
        { title: '🕸️ Męñü2', id: '.menú2', description: 'Ĕxplørą todos los hęchizos y cømandøs del bø†' },  
        { title: '💀 Cødę', id: '.code', description: 'Hęrrąmientas y cødigos mąlditøs' },  
        { title: '🧛‍♂️ Męnü RPG', id: '.menurpg', description: 'Åventūras y cømåndøs RPG ţerrøríficos' },  
        { title: '👑 Øwner', id: '.owner', description: 'Cøntáctø dęl ądmînïstrådør dęl bø†' },  
        { title: '📡 Êstädø', id: '.estado', description: 'Mïrå ęl ęstädø åctuål dęl bø†' },  
        { title: '🎵 Plåy', id: '.play', description: 'Ręprødúcę músîcå dęspuės dę Hålłøwęęn 🎧' },  
        { title: '⚙️ Ênãble', id: '.enable', description: 'Åctîvå functîønęs ęspęcíålęs dęl bø†' },  
        { title: '💡 Øn', id: '.on', description: 'Êncíéndę módøs y funcîønęs ęn łînéå' }  
      ]  
    }  
  ]  

  const msg = {  
    viewOnceMessage: {  
      message: {  
        messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },  
        interactiveMessage: {  
          body: {   
            text: `*Błąçk - Cløvęr Bø†* ☣️

Bïęnvęnïdø ąl męñú ęmbrųjądø dę Hålłøwęęn:

- 🕸️ Ęxplørą tødøs løs hęchîzøs y cømåndøs  
- 💀 Cønvîërtę ën ël męjór süb-bø†s  
- 🧛‍♂️ Åventúråtę ën ël męñú RPG øscürø y dîvęrtîdø  

Şęlęcçïøną üñą òpciøn:`   
          },  
          footer: { text: '𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 ☘︎ | ⚔️🥷 Ėdïçïón Glïtch Hålløwęęn' },  
          header: {  
            type: 'IMAGE',  
            imageUrl: 'https://i.imgur.com/3fJ1P1b.png',  
            title: ' Męñú Bląçk Cløvęr 🥷🏻'  
          },  
          nativeFlowMessage: {  
            buttons: [  
              {  
                name: 'single_select',  
                buttonParamsJson: JSON.stringify({  
                  title: '📂 Ęlïģîř òpcïøn',  
                  sections  
                })  
              }  
            ]  
          }  
        }  
      }  
    }  
  }  

  await conn.relayMessage(m.chat, msg.viewOnceMessage.message, {})  
  m.react('✅')  
}  

handler.command = ['menulist',]  
handler.tags = ['grupos']  
handler.group = true  

export default handler