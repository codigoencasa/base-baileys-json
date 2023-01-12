const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
} = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const delay = (ms) => new Promise((res) => setTimeout(res, ms))

/***
* Simular peticion async http 1.5 segundos
*/
const fakeHTTPMenu = async () => {
  console.log('⚡ Server request!')
  await delay(1500)
  console.log('⚡ Server return!')
  return Promise.resolve([{ body: 'Arepas' }, { body: 'Empanadas' }])
}

/***
* Simular peticion async http 0.5 segundos
*/
const fakeHTTPPayment = async () => {
  const link = `https://www.buymeacoffee.com/leifermendez?t=${Date.now()}`
  console.log('⚡ Server request!')
  await delay(500)
  console.log('⚡ Server return!')
  return Promise.resolve([
      { body: `Puedes hacer un *pago* en el siguiente link: ${link}` },
  ])
}

const flujoCash = addKeyword('efectivo').addAnswer(
  'Ok te espero con los billetes'
)
const flujosOnline = addKeyword('online').addAnswer(
  ['Te envio el link'],
  null,
  async (_, { flowDynamic }) => {
      const link = await fakeHTTPPayment()
      return flowDynamic(link)
  }
)

const flujoPedido = addKeyword(['pedido', 'pedir']).addAnswer(
  '¿Como quieres pagar en *efectivo* o *online*?',
  null,
  null,
  [flujoCash, flujosOnline]
)

const conversacionPrincipal = addKeyword(['hola', 'ole', 'buenas'])
  .addAnswer('Bienvenido al restaurante *La cuchara de palo 🙌*')
  .addAnswer(
      `El menu del día es el siguiente`,
      null,
      async (_, { flowDynamic }) => {
          const menu = await fakeHTTPMenu()
          return flowDynamic(menu)
      }
  )
  .addAnswer('👉 Si deseas ordenar escribe *pedir*', { delay: 1500 }, null, [
      flujoPedido,
  ])

const main = async () => {
  const adapterDB = new MockAdapter()
  const adapterFlow = createFlow([conversacionPrincipal])
  const adapterProvider = createProvider(BaileysProvider)

  createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
  })

  QRPortalWeb()
}

main()
