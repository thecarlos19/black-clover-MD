const handler = async (m, { args }) => {
  if (!global.batallas || !global.batallas[m.sender]) {
    return m.reply('❌ No estás en batalla')
  }

  let accion = args[0]
  if (!accion) return m.reply('❌ Acción inválida')

  return global.batallas[m.sender].turno(accion)
}

handler.command = ['turno']
export default handler