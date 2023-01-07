require('dotenv').config()
const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
} = require('@bot-whatsapp/bot')
const axios = require('axios');
const WsProvider = require('@bot-whatsapp/provider/baileys')
const DBProvider = require('@bot-whatsapp/database/mock')

/**
 * https://api-74xis.strapidemo.com/admin
 * Conexion API Strapi
 * @returns 
 */
const menuAPI = async () => {
  setTimeout(() => Promise.resolve([{body:'Pabellon'},{body:'Empanadas'},{body:'Cocido'}]),500) 
}

const flujoCash = addKeyword('efectivo').addAnswer('Ok te espero con los billetes')
const flujosOnline = addKeyword('online').addAnswer(['Te envio el link','https://buy.stripe.com/14kcPBaYQe7M12g8ww'])

const flujoPedido = addKeyword(['pedido','pedir'])
.addAnswer('¿Como quieres pagar en *efectivo* o *online*?', null, null,[flujoCash, flujosOnline])

const conversacionPrincipal = addKeyword(['hola','ole','buenas'],)
.addAnswer('Bienvenido al restaurante *La cuchara de palo 🙌*')
.addAnswer(`El menu del día es el siguiente`, null, async (_,{flowDynamic}) => {
  const data = await menuAPI()
  flowDynamic(data)
})
.addAnswer('👉 Si deseas ordenar escribe *pedir*', {delay:1500}, null,[flujoPedido])

const main = async () => {
  const adapterDB = new DBProvider()
  const adapterFlow = createFlow([conversacionPrincipal])
  const adapterProvider = createProvider(WsProvider)

  createBot(
      {
          flow: adapterFlow,
          provider: adapterProvider,
          database: adapterDB,
      }
  )

}

main()